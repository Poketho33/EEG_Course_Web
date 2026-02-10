import 'server-only'

import { trpc, HydrateClient } from '../trpc/server';
import { ClientGreeting } from '@/app/ClientGreeting';

export default async function Home() {
  await trpc.hello.getMessage.prefetch({ text: 'World' });

  return (
    <HydrateClient>
      <div>...</div>
      <ClientGreeting />
    </HydrateClient>
  );
}
