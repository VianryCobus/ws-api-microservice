import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from 'src/models/agent.entity';
import { Currency } from 'src/models/currency.entity';
import { Balance } from 'src/models/historyBalance.entity';
import { User } from 'src/models/user.entity';
import { Wallet } from 'src/models/wallet.entity';
import { HistoryBalanceConsumer } from 'src/queue/historyBalance.consumer';
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
