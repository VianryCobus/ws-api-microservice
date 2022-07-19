import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Agent } from 'src/models/agent.entity';
import { Currency } from 'src/models/currency.entity';
import { Transaction } from 'src/models/transaction.entity';
import { User } from 'src/models/user.entity';
import { Wallet } from 'src/models/wallet.entity';
import { Repository } from 'typeorm';
import { PlaceBetDto } from './dto';
const logFromProvider = require('../utils/log/logFromProvider');

@Injectable()
export class TransactionService {
  logger: Logger;
  constructor(
    @InjectRepository(Currency) private currenciesRepository: Repository<Currency>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Wallet) private walletsRepository: Repository<Wallet>,
    @InjectRepository(Agent) private agentsRepository: Repository<Agent>,
    @InjectRepository(Transaction) private transactionsRepository: Repository<Transaction>,
  ) {
    this.logger = new Logger();
  }
  async placebet(dto: PlaceBetDto){
    this.logger.debug({
      message: 'Hit API place bet',
      params: dto,
    });
    logFromProvider.debug({
      message: {
        type: 'Hit API place bet',
        params: dto,
      }
    });
    try {
      // find user with userId
      const user = await this.usersRepository.findOne({
        where: {
          userId: dto.userId,
        },
        relations: {
          wallet: true,
        }
      });
      // if user doesn't exists return status 0
      if (!user) {
        logFromProvider.debug({
          message: {
            type: 'Hit API place bet [user does not exist]',
            params: dto,
          }
        });
        return {
          status: "0",
          data: {},
          message: "882",
        }
      }
      // get balance from wallet and count that
      const beforeBalance = Number(user.wallet.balance);
      const payout = Number(dto.payout);
      // check balance on wallet, if insufficient, return status 0 and log that
      if (beforeBalance + payout < 0) {
        logFromProvider.debug({
          message: {
            type: 'Hit API place bet [Insufficient Balance]',
            params: {
              dto,
              balance: beforeBalance
            },
          }
        });
        return {
          status: "0",
          data: {},
          message: "571",
        }
      }
      // count it
      const afterBalance = beforeBalance + payout;

      // create new transaction object
      const newTransaction = await this.transactionsRepository.create({
        user,
        transId: String(dto.transId),
        ticketBetId: dto.id,
        sDate: dto.sDate,
        bAmt: dto.bAmt,
        payout: dto.payout,
        ip: dto.ip,
        odds: dto.odds,
        game: dto.game,
        source: dto.source,
        status: dto.status,
      });

      // create new wallet object
      const updatedWallet = await this.walletsRepository.findOne({
        where: {
          id: user.wallet.id,
        }
      });
      updatedWallet.balance = afterBalance;

      const transactionSaved = await this.transactionsRepository.save(newTransaction);

      if(!transactionSaved) {
        logFromProvider.debug({
          message: {
            type: 'Hit API place bet [Failed Save Transaction Data]',
            params: newTransaction,
          }
        });
        return {
          status: "0",
          data: {},
          message: "550",
        }
      }

      const walletSaved = await this.walletsRepository.save(updatedWallet);

      if(!walletSaved) {
        logFromProvider.debug({
          message: {
            type: 'Hit API place bet [Failed Save Wallet Data]',
            params: updatedWallet,
          }
        });
        return {
          status: "0",
          data: {},
          message: "550",
        }
      }

      this.logger.debug({
        message: 'Hit API place bet [Success Place Bet]',
        params: dto,
      });
      logFromProvider.debug({
        message: {
          type: 'Hit API place bet [Success Place Bet]',
          params: {
            data: {
              userId: user.userId,
              beforeBalance: beforeBalance,
              afterBalance: afterBalance,
            },
            status: 1,
            message: ""
          },
        }
      });

      // return success params
      return {
        data: {
          userId: user.userId,
          beforeBalance: beforeBalance,
          afterBalance: afterBalance,
        },
        status: 1,
        message: "",
      };
    } catch(error) {
      if (error.code === '23505') {
        logFromProvider.debug({
          message: {
            type: 'Hit API place bet [Duplicate Trans Id]',
            params: '',
          }
        });
        throw new ForbiddenException('Duplicate Trans Id')
      }
      // handle error
      throw error;
    }
  }
}
