import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Never wildcard: admin routes carry bearer tokens, so a permissive CORS
  // policy would widen the attack surface for no benefit (architecture doc §8).
  app.enableCors({
    origin: (process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173').split(','),
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
