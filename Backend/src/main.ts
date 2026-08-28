import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { getJwtConfiguration } from './auth/auth.config';

async function bootstrap(): Promise<void> {
  process.loadEnvFile();
  getJwtConfiguration();

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number.parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);
}

void bootstrap();
