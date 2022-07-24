import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Agent } from 'http';
import { Currency } from 'src/models/currency.entity';
import { User } from 'src/models/user.entity';
import { Wallet } from 'src/models/wallet.entity';
import { Repository } from 'typeorm';
import { BalanceDto } from './dto/balance.dto';

@Injectable()
export class UserService {
  private logFromProvider = require('../utils/log/logFromProvider');
  logger: Logger;
  constructor(
    @InjectRepository(Currency) private currenciesRepository: Repository<Currency>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Wallet) private walletsRepository: Repository<Wallet>,
    @InjectRepository(Agent) private agentsRepository: Repository<Agent>,
    // @InjectQueue('ws-queue') private queue:Queue,
  ){
    this.logger = new Logger();
  }
  async getbalance(dto: BalanceDto){
    // add to queue
    // await this.queue.add('balance-history-job',{
    //   text:dto.userId
    // },{
    //   delay: 10000,
    //   removeOnComplete: true,
    // });

    // this.logger.debug({message: 'Hit API get balance',params: dto,});
    // this.logFromProvider.debug({
    //   message: {
    //     type: 'Hit API get balance',
    //     params: dto,
    //   }
    // });

    // find user balance with userId
    const balance = await this.usersRepository.findOne({
      relations: {
        wallet: true,
      },
      where: {
        userAgentId: dto.userId,
      }
    });
    // if user and balance does not exist throw exception
    let returnData;
    if (!balance) {
      returnData = {
        status: "0",
        data: {},
        message: "882",
      }
      // this.logFromProvider.debug({
      //   message: {
      //     type: 'Hit API get balance [balance does not exist]',
      //     params: dto,
      //   }
      // });
    } else {
      returnData = {
        status: "1",
        data: {
          CurrentCredit: Number(balance.wallet.balance).toFixed(4),
        },
        message: null,
      }
      // this.logger.debug({message: 'Return API get balance',params: returnData,});
      // this.logFromProvider.debug({
      //   message: {
      //     type: 'Return API get balance',
      //     params: returnData,
      //   }
      // });
    }
    return returnData;
  }

  // ==== function return promise

  // get user by agentUserId
  async getOneUserByAgentUserId(userAgentId: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({
        where: {
          userAgentId: userAgentId,
        },
        relations: {
          wallet: true,
        }
      });
      return user;
    } catch (err) {
      throw err;
    }
  }
}
