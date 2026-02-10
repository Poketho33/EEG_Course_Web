import { helloRouter } from "./hello.router";
import { createTRPCRouter } from '../init';

export const appRouter = createTRPCRouter({
  hello: helloRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
