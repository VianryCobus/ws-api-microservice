import { ArgumentMetadata, BadRequestException, UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join, resolve } from 'path';
import { AppModule } from './app.module';
// const hbs = require('hbs');

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
  app.setViewEngine('ejs');
  // app.setViewEngine('hbs');
  // hbs.registerHelper('ifCond', function(v1, v2, options) {
  //   if(v1 === v2) {
  //     return options.fn(this);
  //   }
  //   return options.inverse(this);
  // });

  const configService = app.get<ConfigService>(ConfigService);
  await app.listen(configService.get('PORT'));
}
bootstrap();
