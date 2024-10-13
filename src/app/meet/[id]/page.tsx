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
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  const [remoteStream] = useState<MediaStream | null>(null);
  const myCamRef = useRef<HTMLVideoElement>(null);
  const remoteCamRef = useRef<HTMLVideoElement>(null);
  const [pc, setPC] = useState<RTCPeerConnection>();
  const [shownCam, setShownCam] = useState(false);

  const { id: callId } = useParams();

  const servers = {
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };
  useEffect(() => {
    setPC(new RTCPeerConnection(servers));
  }, []);

  const handleShareCam = async () => {
    const res = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    res?.getTracks().forEach((track) => {
      pc?.addTrack(track, res);
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
    setShownCam(true);
  };

  const handleCall = async () => {
    const callDoc = await doc(db, "calls", callId.toString());

    const offerCandidates = collection(callDoc, "offerCandidates");

    const answerCandidates = collection(callDoc, "answerCandidates");

    if (pc)
      pc.onicecandidate = (event) => {
        if (event.candidate) addDoc(offerCandidates, event.candidate.toJSON());
        // if (event.candidate) offerCandidates.add(event.candidate.toJSON());
      };

    const offerDescription = await pc?.createOffer();
    await pc?.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription?.sdp,
      type: offerDescription?.type,
    };

    await setDoc(callDoc, { offer });
    // await callDoc.set({ offer });
    onSnapshot(callDoc, (snapshot) => {
      // callDoc.onSnapshot((snapshot) => {
      const data = snapshot.data();
      if (!pc?.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc?.setRemoteDescription(answerDescription);
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      // answerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc?.addIceCandidate(candidate);
        }
      });
    });
  };

  const answerCall = async () => {
    const callRef = collection(db, "calls");
    const callDoc = await doc(callRef, callId.toString());

    const answerCandidates = collection(callDoc, "answerCandidates");
    const offerCandidates = collection(callDoc, "offerCandidates");

    if (pc)
      pc.onicecandidate = (event) => {
        if (event.candidate) addDoc(answerCandidates, event.candidate.toJSON());
      };

    const callData = (await getDoc(callDoc)).data();
    console.log(callData);

    const offerDescription = callData?.offer;

    await pc?.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc?.createAnswer();
    await pc?.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription?.type,
      sdp: answerDescription?.sdp,
    };

    await updateDoc(callDoc, { answer });

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          pc?.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  };

  useEffect(() => {
    const newPC = new RTCPeerConnection(servers);
    setPC(newPC);
  }, []);

  useEffect(() => {
    if (pc) {
      pc.ontrack = (event) => {
        console.log("WIDOSSS");

        event.streams[0].getTracks().forEach((track) => {
          remoteStream?.addTrack(track);
          remoteCamRef.current!.srcObject = remoteStream;
          console.log("WIDOSSS");
        });
        console.log(event.streams);
        console.log("pc", pc);

        remoteCamRef.current!.srcObject = event.streams[0];
      };

      pc.onconnectionstatechange = (event) => {
        if (pc.connectionState === "connected") {
          console.log("connected");
        }
        if (pc.connectionState === "disconnected") {
          console.log("disconnected");
        }
      };
    }
  }, [pc]);

  return (
    <div className="w-full h-screen flex gap-10 p-12">
      <div className="relative rounded-xl bg-black border-primary border-8 shadow-md h-1/3 flex justify-center items-end">
        <video
          autoPlay
          playsInline
          className="rounded-md h-full w-full"
          ref={myCamRef}
          muted
        />
        <div
          className="w-5/6 absolute p-4 flex justify-between bottom-5 rounded-xl"
          style={{ backgroundColor: "rgba(255,255,255, 0.5)" }}
        >
          <div className="text-3xl">Ты</div>
          {!shownCam && (
            <button
              onClick={handleShareCam}
              className="bg-blue-500  hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Дать свою камеру
            </button>
          )}

          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Вольнуть себе пиздак
          </button>
        </div>
      </div>
      {remoteCamRef.current?.srcObject && (
        <div className="relative rounded-xl bg-black border-primary border-8 shadow-md h-1/3 flex justify-center items-end">
          <video
            autoPlay
            playsInline
            className="rounded-md h-full w-full"
            ref={remoteCamRef}
          />
          <div className="absolute">Кент</div>
        </div>
      )}
      <div>
        <button
          onClick={handleCall}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Создать звонок
        </button>

        <div>
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
