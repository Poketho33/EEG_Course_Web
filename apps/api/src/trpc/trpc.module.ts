import { Module, INestApplication } from '@nestjs/common';
import { tRPCRouter } from './trpc.router.js';

@Module({
  providers: [tRPCRouter],
  exports: [tRPCRouter],
})
export class tRPCModule {
  constructor(private readonly trpcRouter: tRPCRouter) {}

  async applyMiddleware(app: INestApplication) {
    this.trpcRouter.applyMiddleware(app);
  }
}
