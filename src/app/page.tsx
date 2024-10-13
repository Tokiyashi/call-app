import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen gap-5 flex-col items-center justify-start p-24 ">
      <h1 className="text-3xl font-bold bg-primary p-10 rounded-2xl">
        Здарова олух
      </h1>

      <Link href="/meet">
        <Button>Начать пиздеть</Button>
      </Link>
    </div>
  );
}
