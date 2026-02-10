import 'server-only';

import { createHydrationHelpers } from '@trpc/react-query/rsc';
import { cache } from 'react';
import { createCallerFactory, createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';

export const getQueryClient = cache(makeQueryClient);

const caller = createCallerFactory(appRouter)(createTRPCContext);

type HydrationHelpers = ReturnType<typeof createHydrationHelpers<typeof appRouter>>;

const helpers: HydrationHelpers = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient,
);

export const trpc: HydrationHelpers['trpc'] = helpers.trpc;
export const HydrateClient: HydrationHelpers['HydrateClient'] = helpers.HydrateClient;


