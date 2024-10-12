"use client";

import { Button } from "@/components/ui/button";

interface NewRoomButtonProps {
  action: () => void;
}
export default function NewRoomButton({ action }: NewRoomButtonProps) {
  return <Button onClick={() => action()}>Bro создать звонок</Button>;
}
