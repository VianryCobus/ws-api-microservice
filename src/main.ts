import { ArgumentMetadata, BadRequestException, UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join, resolve } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app.useGlobalPipes(new ValidationPipe({
  //   whitelist: true,
  // }));
  app.setGlobalPrefix('api');

  // set view HBS code
  app.useStaticAssets(resolve('./src/public'));
  app.setBaseViewsDir(resolve('./src/views'));
  app.setViewEngine('hbs');

  const configService = app.get<ConfigService>(ConfigService);
  await app.listen(configService.get('PORT'));
}
bootstrap();
