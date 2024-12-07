import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen gap-5 flex-col items-center justify-start p-24 ">
      <h1 className="text-3xl mb-7 font-bold">Привет!!!</h1>

      <Link href="/login">
        <Button>Авторизоваться</Button>
      </Link>

      <Link href="/meet">
        <Button>Начать звонок</Button>
      </Link>
    </div>
  );
}
