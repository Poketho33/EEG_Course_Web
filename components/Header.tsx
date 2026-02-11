"use client";

import Link from "next/link";
import Image from "next/image";
import headerData from "./header.json";

export default function Header() {
  const header = headerData.header;

  return (
    <aside className="min-h-screen sticky top-0 w-[250px] bg-background shadow-md px-4 py-4 border-r-2 border-gray-900">
      <nav className="h-full flex flex-col justify-between items-start">
        <Link
          href="/"
          className="text-xl font-bold text-foreground hover:text-secondary transition-colors"
        >
          EEG Analysis
        </Link>

        <ul className="w-full">
          {header.map((item) => (
            <li key={item.label} className="mb-4 relative">
              <Link
                href={item.path}
                className="opacity-80 text-sm hover:text-secondary transition-colors"
              >
                {item.label}
              </Link>

              {/* <span className="absolute top-3 right-0 w-[65%] bg-gray-600 h-[1px]"></span> */}

              {item.children && (
                <ul className="flex flex-col ml-2 mt-1 gap-1">
                  {item.children.map((child) => (
                    <li key={child.label}>
                      <Link
                        href={child.path}
                        className="text-md text-foreground hover:text-secondary transition-colors"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        <Image
          src="https://www.unige.ch/cdn/themes/unige2016/img/unige-logo.svg"
          alt="Université de Genève logo svg"
          width={150}
          height={80}
          className="p-4 self-center"
        />
      </nav>
    </aside>
  );
}

