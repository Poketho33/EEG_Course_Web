import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from '@repo/trpc';
import type { AppRouter } from '@repo/trpc';
import { INestApplication, Injectable } from '@nestjs/common';
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request } from "express";

interface UserPayload {
  id: string;
  email: string;
}

@Injectable()
export class tRPCRouter {
  private readonly router: AppRouter;

  constructor() {
    this.router = appRouter;
  }

  applyMiddleware(app: INestApplication) {
    app.use(
      '/trpc',
      trpcExpress.createExpressMiddleware({
        router: this.router,
        createContext: ({ req }: { req: Request }) => {
          const authHeader = req.headers.authorization;
          let user: UserPayload | null = null;

          if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            try {
              const decoded = jwt.verify(token, process.env.API_JWT_SECRET!) as JwtPayload;
              if (typeof decoded === "object") {
                user = { id: decoded.id as string, email: decoded.email as string };
              }
            } catch {
              user = null;
            }
          }
        
          return { user };
        },
      }),
    );
  }
}


