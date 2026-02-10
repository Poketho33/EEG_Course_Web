import 'server-only';

import { initTRPC, TRPCError } from '@trpc/server';
import { auth } from '@/lib/auth';
import { headers } from "next/headers";

// Context is called for every request
export async function createTRPCContext() {
  "use server";
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return {
    user: session?.user,
  };
}

const t = initTRPC.context<typeof createTRPCContext>().create();

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }
  return next({ ctx: { user: ctx.user } });
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
