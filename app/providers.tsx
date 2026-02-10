"use client";

import { ReactNode } from 'react';
import { TRPCProvider } from "@/trpc/client";

interface TRPCReactProviderProps {
  children: ReactNode;
}

export default function Providers({ children }: TRPCReactProviderProps) {
  return (
    <TRPCProvider>
      {children}
    </TRPCProvider>
  );
}
