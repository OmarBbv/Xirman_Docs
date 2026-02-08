import "./utils/instrument";
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['https://archive.xirman.az', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  const usersService = app.get(UsersService);
  await usersService.seedAdmin();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
