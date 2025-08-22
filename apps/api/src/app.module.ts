// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';

// @Module({
//   imports: [
//     ServeStaticModule.forRoot({
//       rootPath: join(__dirname, '../..', 'web', 'dist'),
//       exclude: ['/api/*'],
//     }),
//   ],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { tRPCModule } from './trpc/trpc.module.js';

@Module({
  imports: [tRPCModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
