import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import session from 'express-session';
import { PrismaClientExceptionFilter } from '@/platform/infrastructure/prisma-client-exception/prisma-client-exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const env = configService.get('ENV');

  app.useLogger(
    env === 'production' ? ['warn', 'error'] : ['debug', 'log', 'verbose'],
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  // Enable DI in class-validator constraints
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.use(
    session({
      secret: 'my-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  app.setGlobalPrefix('api/v1');
  app.enableCors();
  app.use(
    express.json({
      limit: '1024mb',
      verify: (req: any, res, buf) => {
        if (req.originalUrl && req.originalUrl.includes('/payments/webhook')) {
          req.rawBody = buf;
        }
      },
    }),
  );
  app.use(express.urlencoded({ limit: '1024mb', extended: true }));
  app.use(cookieParser());
  app.use('/public', express.static(join(__dirname, '../..', 'public')));

  const config = new DocumentBuilder()
    .setTitle('Circlo example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
}
bootstrap();
