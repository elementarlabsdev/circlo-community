import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(
    private _jwt: JwtService,
    private _configService: ConfigService,
    private _prisma: PrismaService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization as string;

    if (authHeader) {
      const authToken = authHeader.split(' ')[1];

      if (authToken) {
        try {
          const decoded = this._jwt.verify(
            authToken,
            this._configService.get('JWT_SECRET'),
          );
          req['user'] = await this._prisma.user.findUnique({
            where: {
              id: decoded['id'],
            },
            include: {
              role: true,
            },
          });
        } catch {}
      }
    }

    next();
  }
}
