import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Agent } from 'http';
import { Currency } from 'src/models/currency.entity';
import { User } from 'src/models/user.entity';
import { Wallet } from 'src/models/wallet.entity';
import { Repository } from 'typeorm';
import { BalanceDto } from './dto/balance.dto';

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
    this.logger.debug({
      message: 'Hit API get balance',
      params: dto,
    });
    const balance = await this.usersRepository.findOne({
      relations: {
        wallet: true,
      },
      where: {
        userId: dto.userid,
      }
    });
    // if user and balance does not exist throw exception
    if (!balance) {
      return {
        status: "0",
        data: {},
        message: "882",
      }
    } else {
      return {
        status: "1",
        data: {
          CurrentCredit: Number(balance.wallet.balance).toFixed(2),
        },
        message: null,
      }
    }
  }
}
