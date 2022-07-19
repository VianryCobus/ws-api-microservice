import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Agent } from 'http';
import { Currency } from 'src/models/currency.entity';
import { User } from 'src/models/user.entity';
import { Wallet } from 'src/models/wallet.entity';
import { Repository } from 'typeorm';
import { BalanceDto } from './dto/balance.dto';
const logFromProvider = require('../utils/log/logFromProvider');

@Injectable()
export class UserService {
  logger: Logger;
  constructor(
    @InjectRepository(Currency) private currenciesRepository: Repository<Currency>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Wallet) private walletsRepository: Repository<Wallet>,
    @InjectRepository(Agent) private agentsRepository: Repository<Agent>,
  ){
    this.logger = new Logger();
  }
  async getbalance(dto: BalanceDto){
    this.logger.debug({message: 'Hit API get balance',params: dto,});
    logFromProvider.debug({
      message: {
        type: 'Hit API get balance',
        params: dto,
      }
    });
    // find user balance with userId
    const balance = await this.usersRepository.findOne({
      relations: {
        wallet: true,
      },
      where: {
        userId: dto.userId,
      }
    });
    // if user and balance does not exist throw exception
    let returnData;
    if (!balance) {
      logFromProvider.debug({
        message: {
          type: 'Hit API get balance [balance does not exist]',
          params: dto,
        }
      });
      returnData = {
        status: "0",
        data: {},
        message: "882",
      }
    } else {
      returnData = {
        status: "1",
        data: {
          CurrentCredit: Number(balance.wallet.balance).toFixed(2),
        },
        message: null,
      }
    }
    this.logger.debug({message: 'Return API get balance',params: returnData,});
    logFromProvider.debug({
      message: {
        type: 'Return API get balance',
        params: returnData,
      }
    });
    return returnData;
  }
}
