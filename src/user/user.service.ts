import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { LoggerHelperService } from 'src/utils/helper';
import { Agent, Currency, User, Wallet } from 'src/models';
import { Repository } from 'typeorm';
import { BalanceDto } from './dto';

@Injectable()
export class UserService {
  private logger: Logger;
  constructor(
    @InjectRepository(Currency) private currenciesRepository: Repository<Currency>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Wallet) private walletsRepository: Repository<Wallet>,
    @InjectRepository(Agent) private agentsRepository: Repository<Agent>,
    // @InjectQueue('ws-queue') private queue:Queue,
    private loggerHelperService: LoggerHelperService,
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
    // this.loggerHelperService.debugLog(
    //   'Hit API get balance',
    //   dto,
    // );

    // find user balance with userId
    const balance = await this.getOneUserByAgentUserId(dto.userId);
    // if user and balance does not exist throw exception
    let returnData;
    if (!balance) {
      returnData = {
        status: "0",
        data: {},
        message: "882",
      }
      this.loggerHelperService.debugLog(
        'Hit API get balance [balance does not exist]',
        dto,
      );
    } else {
      returnData = {
        status: "1",
        data: {
          CurrentCredit: Number(balance.wallet.balance).toFixed(4),
        },
        message: null,
      }
      // this.logger.debug({message: 'Return API get balance',params: returnData,});
      // this.loggerHelperService.debugLog(
      //   'Return API get balance',
      //   returnData,
      // );
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
          agent: true,
        }
      });
      return user;
    } catch (err) {
      throw err;
    }
  }

  // get user by userId
  getOneUserByUserId(userId: string): Promise<User> {
    try {
      const user = this.usersRepository.findOne({
        where: {
          userId: userId,
        },
        relations: {
          wallet: true,
          agent: true,
        }
      });
      return user;
    } catch (err) {
      throw err;
    }
  }
}
