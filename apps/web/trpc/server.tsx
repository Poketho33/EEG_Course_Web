import 'server-only'; // <-- ensure this file cannot be imported from the client
import { createHydrationHelpers } from '@trpc/react-query/rsc';
import { cache } from 'react';
import { createCallerFactory, createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';

// IMPORTANT: Create a stable getter for the query client
export const getQueryClient = cache(makeQueryClient);

const caller = createCallerFactory(appRouter)(createTRPCContext);

// Explicitly capture the helper type
type HydrationHelpers = ReturnType<typeof createHydrationHelpers<typeof appRouter>>;

const helpers: HydrationHelpers = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient,
);

// ✅ Give the exports explicit stable types
export const trpc: HydrationHelpers['trpc'] = helpers.trpc;
export const HydrateClient: HydrationHelpers['HydrateClient'] = helpers.HydrateClient;


