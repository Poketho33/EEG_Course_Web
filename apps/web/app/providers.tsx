"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from 'react';
import { Session } from 'next-auth';
import { TRPCProvider } from "../trpc/client";

interface TRPCReactProviderProps {
  children: ReactNode;
  session: Session | null;
}

export default function Providers({ children, session }: TRPCReactProviderProps) {
  return (
    <SessionProvider session={session}>
      <TRPCProvider>{children}</TRPCProvider>
    </SessionProvider>
  );
}
