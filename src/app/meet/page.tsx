import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import NewRoomButton from "./components/NewRoomButton";
import { collection, doc } from "firebase/firestore";
import { redirect } from "next/navigation";
import { db } from "@/db/main";

export default function Page() {
  const handleNewRoom = async () => {
    "use server";

    const calls = collection(db, "calls");
    const callDoc = doc(calls);
    console.log(callDoc.id);
    redirect("/meet/" + callDoc.id);
  };

  return (
    <div className="flex min-h-screen flex-col items-center gap-5 justify-start p-24 ">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold  p-10 rounded-2xl">
            шалапай тебе надо законектиться или создать?
          </h1>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <NewRoomButton action={handleNewRoom} />
            <Button variant="ghost">Bro законектиться к своим мужикам</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
