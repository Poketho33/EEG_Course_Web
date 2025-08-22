// import { initTRPC } from '@trpc/server';

// export const t = initTRPC.create({

// });

// export const router = t.router;
// export const publicProcedure = t.procedure;

import { initTRPC } from "@trpc/server";

export type Context = {
  user: { id: string; email: string } | null;
};

const t = initTRPC.context<Context>().create();
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new Error("Unauthorized");
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

