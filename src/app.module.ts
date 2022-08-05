import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
// import { PrismaModule } from './prisma/prisma.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormConfig from 'ormconfig';
import { TransactionModule } from './transaction/transaction.module';
import { EncryptModule, GenerateUserIdModule, HitProviderModule, JwtHelperModule, LoggerHelperModule } from './utils/helper';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(ormConfig),
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
export class AppModule {}
