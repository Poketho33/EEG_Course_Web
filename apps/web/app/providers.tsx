"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode, useMemo } from 'react';
import { trpc } from '../lib/client';
import { httpBatchLink } from '@trpc/client';
import { Session } from 'next-auth';

interface TRPCReactProviderProps {
  children: ReactNode;
  session: Session | null;
}

function TRPCProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [queryClient] = useState(() => new QueryClient());

  const trpcClient = useMemo(() => {
    return trpc.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_API_URL}/trpc`,
          headers() {
            const authHeader = session?.apiAccessToken
              ? { Authorization: `Bearer ${session.apiAccessToken}` } : {};
            return authHeader;
          },
        }),
      ],
    });
  }, [session?.apiAccessToken]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default function Providers({ children, session }: TRPCReactProviderProps) {
  return (
    <SessionProvider session={session}>
      <TRPCProvider>{children}</TRPCProvider>
    </SessionProvider>
  );
}
