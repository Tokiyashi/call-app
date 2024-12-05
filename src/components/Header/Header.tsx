import Image from "next/image";
import logo from "@/public/logo.png";
import Link from "next/link";
export default function Header() {
  return (
    <div className="flex p-5 gap-5 h-screen align-center flex-col bg-red justify-between">
      <div className="flex flex-col p-5 h-full rounded-2xl bg-primary">
        <Link href="/">
          <Image
            src={logo}
            className="bg-white p-1 rounded-2xl"
            height={100}
            alt="logo"
          />
        </Link>
        <div className="flex items-center"> имя </div>
      </div>
    </div>
  );
}
