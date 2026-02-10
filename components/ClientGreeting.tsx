'use client';

import { trpc } from '../trpc/client';

export function ClientGreeting() {
  const {data: greeting, isLoading} = trpc.hello.getMessage.useQuery({ text: "World" });

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{greeting?.greeting}</div>;
}