import { router, publicProcedure, protectedProcedure } from '../trpc.js';
import { z } from 'zod';

export const helloRouter = router({
  getMessage: publicProcedure
  .input(z.object({ name: z.string().min(1) }))
  .query(({ ctx, input }) => {
    if (ctx.user) {
      return { message: `Hello ${ctx.user.email}!` };
    }
    return { message: `Hello ${input.name}!` };
  }),
});
