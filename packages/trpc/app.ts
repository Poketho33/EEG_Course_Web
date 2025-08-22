import { router } from './trpc.js';
import { helloRouter } from './routers/hello.router.js';
import { userRouter } from './routers/addUser.router.js';

export const appRouter = router({
  hello: helloRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;