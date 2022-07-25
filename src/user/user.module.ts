import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent, Balance, Currency, User, Wallet } from 'src/models';
import { HistoryBalanceConsumer } from 'src/queue';
import { UserController } from './user.controller';
import { UserService } from './user.service';
require("dotenv").config();

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Wallet,
      Currency,
      Agent,
      Balance,
    ]),
    // BullModule.forRoot({
    //   redis: {
    //     host: process.env.REDIS_HOST,
    //     port: Number(process.env.REDIS_PORT),
    //   }
    // }),
    // BullModule.registerQueue({
    //   name: 'ws-queue',
    // }),
  ],
  providers: [
    UserService,
    // HistoryBalanceConsumer
  ],
  exports: [
    UserService,
  ],
  controllers: [UserController]
})
export class UserModule {}
