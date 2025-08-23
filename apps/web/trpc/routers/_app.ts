import { helloRouter } from "./hello.router";
import { userRouter } from "./user.router";
import { createTRPCRouter } from '../init';

export const appRouter = createTRPCRouter({
  hello: helloRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
