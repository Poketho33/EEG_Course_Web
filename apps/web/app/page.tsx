import { trpc, HydrateClient } from '../trpc/server';
import { ClientGreeting } from '../components/ClientGreeting';

export default async function Home() {
  void trpc.hello.getMessage.prefetch({ text: "World" });

  return (
    <HydrateClient>
      <div>...</div>
      <ClientGreeting />
    </HydrateClient>
  );
}
