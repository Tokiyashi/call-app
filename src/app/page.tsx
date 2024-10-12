import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-24 bg-slate-100">
      <h1 className="text-3xl font-bold bg-violet-300 p-10 rounded-2xl">
        Здарова олух
      </h1>
      <Link href="/meet">Начать пиздеть</Link>
    </div>
  );
}
