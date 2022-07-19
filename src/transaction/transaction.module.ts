import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from 'src/models/agent.entity';
import { Currency } from 'src/models/currency.entity';
import { Transaction } from 'src/models/transaction.entity';
import { User } from 'src/models/user.entity';
import { Wallet } from 'src/models/wallet.entity';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Wallet,
      Currency,
      Agent,
      Transaction
    ]),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
