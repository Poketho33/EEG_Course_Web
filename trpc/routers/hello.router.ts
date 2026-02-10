import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';

export const helloRouter = createTRPCRouter({
  getMessage: baseProcedure
    .input(
      z.object({
        text: z.string().optional(), // optional text
      }),
    )
    .query(({ ctx, input }) => {
      const name =
        ctx.user?.email || input.text || "World"; // use logged-in user, input, or default

      return {
        greeting: `Hello ${name}!`,
      };
    }),
});