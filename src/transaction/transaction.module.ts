import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent, Balance, Currency, Transaction, User, Wallet } from 'src/models';
import { HistoryBalanceConsumer } from 'src/queue';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
require ("dotenv").config();

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Wallet,
      Currency,
      Agent,
      Transaction,
      Balance
    ]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      }
    }),
    BullModule.registerQueue({
      name: 'ws-queue',
    }),
  ],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    HistoryBalanceConsumer
  ],
})
export class TransactionModule {}
