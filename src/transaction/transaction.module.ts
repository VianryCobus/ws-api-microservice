import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent, Balance, Currency, DetailTransaction, Transaction, User, Wallet } from 'src/models';
import { DetailTransactionConsumer, HappyLuckPushGamelogConsumer, HistoryBalanceConsumer, TransactionHappyLuckConsumer } from 'src/utils/queue';
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
      Balance,
      DetailTransaction,
    ]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD
      }
    }),
    BullModule.registerQueue({
      name: 'ws-queue',
    }),
  ],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    HistoryBalanceConsumer,
    DetailTransactionConsumer,
    TransactionHappyLuckConsumer,
    HappyLuckPushGamelogConsumer,
  ],
})
export class TransactionModule {}
