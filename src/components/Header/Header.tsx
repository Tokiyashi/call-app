import Image from "next/image";
import logo from "@/public/logo.png";
export default function Header() {
  return (
    <header className="flex p-5 gap-5  align-center justify-between">
      <Image src={logo} height={100} alt="logo" />
      <div className="flex items-center">Тут имя пользователя будет</div>
    </header>
  );
}
