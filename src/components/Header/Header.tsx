import Image from "next/image";
import logo from "@/public/logo.png";
import Link from "next/link";
export default function Header() {
  return (
    <div className="flex p-5 gap-5 align-center bg-red justify-between">
      <Link href="/">
        <Image src={logo} height={100} alt="logo" />
      </Link>
      <div className="flex items-center">Тут имя пользователя будет</div>
    </div>
  );
}
