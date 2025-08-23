import { initTRPC } from '@trpc/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';

// Context is called for every request
export async function createTRPCContext() {
  const session = await getServerSession(authOptions);

  return {
    session,                   // full NextAuth session
    userId: session?.user?.id, // shortcut
    user: session?.user,
  };
}

const t = initTRPC.context<typeof createTRPCContext>().create();

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new Error("Not authenticated");
  }
  return next({ ctx: { user: ctx.session.user } });
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
