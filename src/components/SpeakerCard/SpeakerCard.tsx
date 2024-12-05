"use client";

import { Card, CardContent, CardFooter } from "../ui/card";

interface SpeakerCardProps {
  remoteCamRef: React.RefObject<HTMLVideoElement>;
}

export default function SpeakerCard({ remoteCamRef }: SpeakerCardProps) {
  return (
    <Card className="relative bg-black border-primary border-2 flex justify-center items-end">
      <CardContent>
        <video
          autoPlay
          playsInline
          className="rounded-md h-full w-full"
          ref={remoteCamRef}
        />
      </CardContent>
      <CardFooter>Кент</CardFooter>
    </Card>
  );
}
