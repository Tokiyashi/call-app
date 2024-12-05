"use client";

import { MdEmojiEmotions } from "react-icons/md";
import SpeakerCard from "@/components/SpeakerCard/SpeakerCard";
import { db } from "@/db/main";
import { IoIosCall } from "react-icons/io";
import { IoMicOffSharp } from "react-icons/io5";
import { IoVideocamOff } from "react-icons/io5";

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
import { Button } from "@/components/ui/button";

export default function Page() {
  const [remoteStream] = useState<MediaStream | null>(null);
  const myCamRef = useRef<HTMLVideoElement>(null);
  const remoteCamRef = useRef<HTMLVideoElement>(null);
  const [pc, setPC] = useState<RTCPeerConnection>();
  // const [shownCam, setShownCam] = useState(false);

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

  const init = async () => {
    const newPC = new RTCPeerConnection(servers);
    setPC(newPC);
    const res = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    res?.getTracks().forEach((track) => {
      pc?.addTrack(track, res);
    });

    myCamRef.current!.srcObject = res;
    // setShownCam(true);
  };

  useEffect(() => {
    init();
  }, []);

  const handleShareCam = async () => {
    // const res = await navigator.mediaDevices.getUserMedia({
    //   video: true,
    //   audio: true,
    // });
    // res?.getTracks().forEach((track) => {
    //   pc?.addTrack(track, res);
    // });
    // myCamRef.current!.srcObject = res;
    // setShownCam(true);
  };

  const handleCall = async () => {
    const callDoc = await doc(db, "calls", callId.toString());

    const offerCandidates = collection(callDoc, "offerCandidates");

    const answerCandidates = collection(callDoc, "answerCandidates");

    if (pc)
      pc.onicecandidate = (event) => {
        if (event.candidate) addDoc(offerCandidates, event.candidate.toJSON());
      };

    const offerDescription = await pc?.createOffer();
    await pc?.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription?.sdp,
      type: offerDescription?.type,
    };

    await setDoc(callDoc, { offer });
    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!pc?.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc?.setRemoteDescription(answerDescription);
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
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

      pc.onconnectionstatechange = () => {
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
    <div className="flex w-full h-full gap-5">
      <div className="flex w-full h-full flex-col">
        <div className="w-full h-full max-w-full justify-between gap-10">
          <div className="rounded-xl relative h-5/6 overflow-hidden flex justify-center items-end">
            <video
              autoPlay
              playsInline
              className="rounded-md w-full"
              ref={myCamRef}
              muted
            />
            <div className="absolute top-10 right-5">
              <SpeakerCard remoteCamRef={remoteCamRef} />
            </div>
          </div>
          <div className="flex h-24 mt-5 p-4 gap-4 items-center justify-center bg-white rounded-lg">
            <Button variant="destructive" className="p-6">
              <IoIosCall />
            </Button>
            <Button className="bg-slate-200 p-6 ">
              <IoVideocamOff />
            </Button>
            <Button className="bg-slate-200 p-6 ">
              <IoMicOffSharp />
            </Button>
            {/* <IoVideocam /> */}
            <Button className="bg-slate-200 p-6 ">
              <MdEmojiEmotions />
            </Button>
            <Button className="p-6" onClick={handleCall}>
              Создать звонок
            </Button>
            <Button className="p-6" onClick={() => answerCall()}>
              Принять звонок
            </Button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-10 w-1/3">чатик</div>
    </div>
  );
}
