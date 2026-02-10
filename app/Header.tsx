"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";

export default function Header() {
  const {
    data: session,
    isPending,
  } = authClient.useSession()

  return (
    <header className="w-full bg-white shadow-md py-4 px-8">
      <nav className="flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
          NextJS-TRPC Starter
        </Link>
        <div className="flex items-center space-x-4">
          {isPending ?
            (
              <div className="h-[30px] w-[30px] bg-background rounded-full"></div>
            ) :
            (session ? (
              <>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    {session.user?.image &&
                      <Image
                        src={session.user?.image}
                        width={30}
                        height={30}
                        alt="user profile icon"
                      />
                    }

                    {/* <div>{session.user?.email}</div> */}
                  </div>
                </div>
              </>
            ) : (
              <Link href="/login" className="border border-foreground text-white px-4 py-2 rounded-lg hover:bg-tertiary transition-all duration-300">
                Sign In
              </Link>
            )
            )}
        </div>
      </nav>
    </header>
  );
}
