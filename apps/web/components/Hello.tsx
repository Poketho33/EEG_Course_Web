'use client';

import { trpc } from '../lib/client';

interface HelloClientProps {
  name?: string;
}

export default function HelloClient({ name = 'World' }: HelloClientProps) {
  const { data: publicData, isLoading: isLoadingPublic } = trpc.hello.getMessage.useQuery({ name });

  if (isLoadingPublic) return <div>Loading...</div>;

  return( 
    <div className='text-black'>
      <p>From the API: {publicData?.message}</p>
    </div>
  );
}
