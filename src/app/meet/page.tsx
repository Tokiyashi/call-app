"use client";

import { db } from "@/db/main";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  const [remoteStream] = useState<MediaStream | null>(null);
  const [callId, setCallId] = useState("");
  const myCamRef = useRef<HTMLVideoElement>(null);
  const remoteCamRef = useRef<HTMLVideoElement>(null);
  // const [pc, setPC] = useState<RTCPeerConnection>();

  const servers = {
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };
  const pc = new RTCPeerConnection(servers);
  // useEffect(() => {
  //   setPC(new RTCPeerConnection(servers));
  // }, []);

  const handleShareCam = async () => {
    const res = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    res?.getTracks().forEach((track) => {
      pc.addTrack(track, res);
    });

    // pc.ontrack = (event) => {
    //   console.log("ontrack");

    //   event.streams[0].getTracks().forEach((track) => {
    //     remoteStream?.addTrack(track);
    //     console.log("WIDOSSS");
    //   });
    //   remoteCamRef.current!.srcObject = event.streams[0];
    // };

    myCamRef.current!.srcObject = res;
  };

  const handleCall = async () => {
    const callsCollection = collection(db, "calls");
    const callDoc = doc(callsCollection);
    console.log(callDoc.id);
    setCallId(callDoc.id);

    const offerCandidates = collection(callDoc, "offerCandidates");

    const answerCandidates = collection(callDoc, "answerCandidates");

    pc.onicecandidate = (event) => {
      if (event.candidate) addDoc(offerCandidates, event.candidate.toJSON());
      // if (event.candidate) offerCandidates.add(event.candidate.toJSON());
    };

    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(callDoc, { offer });
    // await callDoc.set({ offer });
    onSnapshot(callDoc, (snapshot) => {
      // callDoc.onSnapshot((snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      // answerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });
  };

  const answerCall = async () => {
    const callRef = collection(db, "calls");
    const callDoc = await doc(callRef, callId);

    const answerCandidates = collection(callDoc, "answerCandidates");
    const offerCandidates = collection(callDoc, "offerCandidates");

    pc.onicecandidate = (event) => {
      if (event.candidate) addDoc(answerCandidates, event.candidate.toJSON());
    };

    const callData = (await getDoc(callDoc)).data();
    console.log(callData);

    const offerDescription = callData?.offer;

    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await updateDoc(callDoc, { answer });

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  };

  useEffect(() => {
    pc.ontrack = (event) => {
      console.log("WIDOSSS");

      event.streams[0].getTracks().forEach((track) => {
        remoteStream?.addTrack(track);
        remoteCamRef.current!.srcObject = remoteStream;
        console.log("WIDOSSS");
      });
      console.log(event.streams);
      console.log(pc);

      remoteCamRef.current!.srcObject = event.streams[0];
    };
  }, []);

  return (
    <div className="w-full h-screen flex gap-10 p-12">
      <div className="bg-purple-400 rounded-xl w-1/2 h-1/3 flex justify-center items-end">
        <video
          autoPlay
          playsInline
          className="rounded h-full w-full"
          ref={myCamRef}
        />
        <button
          onClick={handleShareCam}
          className="bg-blue-500 absolute hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Дать свою камеру
        </button>
      </div>
      <div className="bg-purple-400 rounded-xl w-1/2 h-1/3">
        <video
          autoPlay
          playsInline
          className="rounded h-full w-full"
          ref={remoteCamRef}
        />
      </div>

      <div>
        <button
          onClick={handleCall}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {" "}
          Создать звонок{" "}
        </button>

        <div>
          <input
            value={callId}
            onChange={(e) => setCallId(e.target.value)}
            style={{ width: "200px" }}
            placeholder="Введи айдишник тут"
            type="text"
          />
          <button
            onClick={() => answerCall()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Принять звонок
          </button>
        </div>
      </div>
    </div>
  );
}
