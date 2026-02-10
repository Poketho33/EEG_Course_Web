"use client";

import Link from "next/link";
import Image from "next/image";

export default function Header() {

  // side bar
  return (
    <aside className="min-h-screen sticky top-0 w-[250px] bg-background shadow-md px-4 py-4 border-r-2 border-gray-900">
      <nav className="h-full flex flex-col justify-between items-start">
        <Link href="/" className="text-xl font-bold text-foreground hover:text-blue-600 transition-colors">
          EEG Analysis
        </Link>
        <Link href="/courses" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
          Courses
        </Link>

        <Image
          src="https://www.unige.ch/cdn/themes/unige2016/img/unige-logo.svg"
          alt="Université de Genève logo svg"
          width={150}
          height={80}
          className="p-4 self-center"
        >
        </Image>
      </nav>
    </aside>
  );
}
