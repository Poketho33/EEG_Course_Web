import { z } from 'zod';
import { createTRPCRouter, procedure } from '../init';

export const helloRouter = createTRPCRouter({
  getMessage: procedure
    .input(
      z.object({
        text: z.string().min(1),
      }),
    )
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}!`,
      };
    }),
});