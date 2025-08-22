import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { tRPCRouter } from './trpc/trpc.router.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // cors
  const allowedOrigins: string[] = [];

  if (process.env.WEB_URL) {
    allowedOrigins.push(process.env.WEB_URL);
  }
  
  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:3000');
  }

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  const trpc = app.get(tRPCRouter);
  trpc.applyMiddleware(app);
  await app.listen(process.env.PORT ?? 3001); // process.env.PORT || 3000, process.env.PORT ?? 3000
}
bootstrap();

