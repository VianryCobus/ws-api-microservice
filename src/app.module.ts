import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
// import { PrismaModule } from './prisma/prisma.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionModule } from './transaction/transaction.module';
import { EncryptModule, GenerateUserIdModule, HitProviderModule, JwtHelperModule, LoggerHelperModule } from './utils/helper';
import { LoggerMiddleware } from './utils/middleware';
import { ClientModule } from './client/client.module';
import ormConfigPostgres from 'ormconfig_postgres';
import mysqlHlConfig from 'ormconfig_mysql_hl';
import mysqlCobsConfig from 'ormconfig_mysql_local';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(ormConfigPostgres),
    TypeOrmModule.forRoot(mysqlHlConfig),
    // TypeOrmModule.forRoot(mysqlCobsConfig),
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.POSTGRES_HOST,
    //   port: parseInt(<string>process.env.POSTGRES_PORT),
    //   username: process.env.POSTGRES_USERNAME,
    //   password: process.env.POSTGRES_PASSWORD,
    //   database: process.env.POSTGRES_DATABASE,
    //   // autoLoadEntities: true,
    //   entities: ['dist/src/models/**/*.entity.js'],
    //   synchronize: true,
    //   migrations: [
    //     'dist/src/db/migrations/*.js'
    //   ],
    //   logging: true,
    //   logger: 'file',
    //   cli: {
    //     migrationsDir: 'src/db/migrations'
    //   }
    // }),
    UserModule,
    AuthModule,
    ClientModule,
    // PrismaModule,
    EncryptModule,
    GenerateUserIdModule,
    HitProviderModule,
    TransactionModule,
    LoggerHelperModule,
    JwtHelperModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.
      apply(LoggerMiddleware)
        .exclude(
          { path: 'api/provider/bal', method: RequestMethod.GET },
          { path: 'api/provider/joker/getbalance', method: RequestMethod.POST },
          { path: 'api/provider/joker/singleedp', method: RequestMethod.POST },
        )
        .forRoutes('provider','v1/client')
  }
}
