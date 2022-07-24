import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from 'src/models/agent.entity';
import { Currency } from 'src/models/currency.entity';
import { Balance } from 'src/models/historyBalance.entity';
import { Transaction } from 'src/models/transaction.entity';
import { User } from 'src/models/user.entity';
import { Wallet } from 'src/models/wallet.entity';
import { HistoryBalanceConsumer } from 'src/queue/historyBalance.consumer';
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
