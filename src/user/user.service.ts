import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectDataSource, InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { LoggerHelperService } from 'src/utils/helper';
import { Agent, Currency, User, Wallet } from 'src/models';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { BalanceDto } from './dto';
import { HistoryBalancePlayersMysqlHL, MasterPlayersMysqlHl } from 'src/models/models_hl';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';

@Injectable()
export class UserService {
  private logger: Logger;
  constructor(
    // === @InjectConnection has deprecated
    // @InjectConnection('mysqlHlConnection') private dataSourceMysqlHl: DataSource,
    @InjectDataSource('mysqlHlConnection') private dataSourceMysqlHl: DataSource,
    @InjectDataSource() private dataSourcePostgresql: DataSource,

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
      // variable declaration
      let balancePlayer: Number = balance.wallet.balance;
      if(balance.client.username == "HL" && balance.mode === 0) {
        const balanceHl = await this.getbalancehl(balance.username);
        return {
          status: "1",
          data: {
            CurrentCredit: parseFloat(Number(balanceHl.balance).toFixed(4)),
          },
          message: null,
        };
      }

      returnData = {
        status: "1",
        data: {
          CurrentCredit: parseFloat(Number(balancePlayer).toFixed(4)),
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

  // MYSQL HAPPY LUCK
  async getbalancehl(username: string){
    try {
      const player = await this.dataSourceMysqlHl.getRepository(MasterPlayersMysqlHl).findOne({
        where: {
          username_players: username,
        }
      });
      const historyBalance = await this.dataSourceMysqlHl.getRepository(HistoryBalancePlayersMysqlHL).findOne({
        where: {
          players_id: player.id_players,
        },
        order: {
          // datetime_balance_players: "DESC",
          id_history_balance_players: "DESC",
        }
      });
      return {
        balance: historyBalance.current_balance_players,
        players_id: player.id_players,
        username_players: player.username_players,
        userid_players: player.userid_players,
      };
    } catch (error) {
      this.loggerHelperService.debugLog(
        'Hit API get balance [balance client HL not found]',
        {
          error
        },
      );
      return {
        status: "0",
        data: {},
        message: "882",
      }
    }
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
          client: {
            agent: {
              currency: true,
            },
          }
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
          client: {
            agent: true,
          }
        }
      });
      return user;
    } catch (err) {
      throw err;
    }
  }

  // get user REAL MODE by username and userid (username upper)
  getOneUserByUsernameAndUserId(
    username: string,
    userId: string,
  ): Promise<User> {
    try {
      const user = this.usersRepository.findOne({
        where: [
          {username, mode: 0},
          {userId, mode: 0}
        ],
        relations: {
          wallet: true,
          client: {
            agent: true,
          }
        }
      });
      // const user = this.dataSourcePostgresql.getRepository(User)
      //   .createQueryBuilder("user")
      //   .where("user.username = :username", { username })
      //   .orWhere("user.userId = :userId", { userId })
      //   .andWhere("user.mode = :mode", { mode: funMode })
      //   .getOne();
      return user;
    } catch (error) {
      throw error;
    }
  }

  // get user FUN MODE by username and userid (username upper)
  getOneUserByUsernameAndUserIdFunMode(
    username: string,
    userId: string,
  ): Promise<User> {
    try {
      const user = this.usersRepository.findOne({
        where: [
          {username, mode: 1},
          {userId, mode: 1}
        ],
        relations: {
          wallet: true,
          client: {
            agent: true,
          }
        }
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  // get compare password
  async passCompare(passwordHash: string, passwordOrigin: string) {
    const compare = await bcrypt.compare(passwordOrigin,passwordHash);
    return compare;
  }

  // get encrypt password
  async passHashing(password: string) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password,salt);
    return {
      hash
    };
  }

  // ==== JOKER ====
  async getbalanceJoker(req){
    let returnData;
    const data = JSON.parse(req.message);
    const userId: string = data.userId;
    // find user balance with userId
    const balance = await this.getOneUserByAgentUserId(userId);
    
    if (!balance) {
      returnData = {
        status: "1000",
        desc: "Invalid user id",
      }
      return returnData;
    }
    // variable declaration
    let balancePlayer: Number = balance.wallet.balance;

    returnData = {
      status: "0000",
      userId: "wsidrtes01",
      balance: parseFloat(Number(balancePlayer).toFixed(3)),
      balanceTs: null,
    }
    return returnData;
  }

  async placeBetJoker(req){
    const data = JSON.parse(req.message);
    const userId: string = data.txns[0].userId;
    const bet: number = data.txns[0].betAmount;
    let returnData;
    // find user balance with userId
    const balance = await this.getOneUserByAgentUserId(userId);
    if (!balance) {
      returnData = {
        status: "1000",
        desc: "Invalid user id",
      }
      return returnData;
    }
    // variable declaration
    let balancePlayer: number = balance.wallet.balance;
    const deduct: number = balancePlayer - bet;
    if(deduct < 0) {
      returnData = {
        status: "1018",
        desc: "Not enough balance",
      }
    }

    // create new wallet object
    const updatedWallet = await this.walletsRepository.findOne({
      where: {
        id: balance.wallet.id,
      }
    });
    updatedWallet.balance = deduct;

    // save new wallet data
    const walletSaved = await this.walletsRepository.save(updatedWallet);

    if(!walletSaved) {
      returnData = {
        status: "9999",
        desc: "Fail / Unknown Error",
      }
    } else {
      returnData = {
        status: "0000",
        balance: parseFloat(Number(deduct).toFixed(3)),
        balanceTs: null,
      }
    }
    return returnData;
  }

  async settleJoker(req){
    const data = JSON.parse(req.message);
    const userId: string = data.txns[0].userId;
    const win: number = data.txns[0].winAmount;
    let returnData;
    // find user balance with userId
    const balance = await this.getOneUserByAgentUserId(userId);
    if (!balance) {
      returnData = {
        status: "1000",
        desc: "Invalid user id",
      }
      return returnData;
    }
    // variable declaration
    let balancePlayer: number = balance.wallet.balance;
    const add: number = Number(balancePlayer) + Number(win);

    // create new wallet object
    const updatedWallet = await this.walletsRepository.findOne({
      where: {
        id: balance.wallet.id,
      }
    });
    updatedWallet.balance = add;

    // save new wallet data
    const walletSaved = await this.walletsRepository.save(updatedWallet);
    
    if(!walletSaved) {
      returnData = {
        status: "9999",
        desc: "Fail / Unknown Error",
      }
    } else {
      returnData = {
        status: "0000",
        balance: parseFloat(Number(add).toFixed(3)),
        balanceTs: null,
      }
    }
    return returnData;
  }

  async cancelBetJoker(req){
    const data = JSON.parse(req.message);
    const userId: string = data.txns[0].userId;
    let returnData;
    // find user balance with userId
    const balance = await this.getOneUserByAgentUserId(userId);
    if (!balance) {
      returnData = {
        status: "1000",
        desc: "Invalid user id",
      }
      return returnData;
    }
    // variable declaration
    let balancePlayer: Number = balance.wallet.balance;

    // if user and balance does not exist throw exception
    if (!balance) {
      returnData = {
        status: "9999",
        desc: "Fail / Unknown Error",
      }
    } else {
      returnData = {
        status: "0000",
        balance: parseFloat(Number(balancePlayer).toFixed(3)),
        balanceTs: null,
      }
    }
    return returnData;
  }

  async giveJoker(req){
    const data = JSON.parse(req.message);
    const userId: string = data.txns[0].userId;
    const win: number = data.txns[0].amount;
    let returnData;
    // find user balance with userId
    const balance = await this.getOneUserByAgentUserId(userId);
    if (!balance) {
      returnData = {
        status: "1000",
        desc: "Invalid user id",
      }
      return returnData;
    }
    // variable declaration
    let balancePlayer: number = balance.wallet.balance;
    const add: number = Number(balancePlayer) + Number(win);

    // create new wallet object
    const updatedWallet = await this.walletsRepository.findOne({
      where: {
        id: balance.wallet.id,
      }
    });
    updatedWallet.balance = add;

    // save new wallet data
    const walletSaved = await this.walletsRepository.save(updatedWallet);
    
    if(!walletSaved) {
      returnData = {
        status: "9999",
        desc: "Fail / Unknown Error",
      }
    } else {
      returnData = {
        status: "0000",
        balance: parseFloat(Number(add).toFixed(3)),
        balanceTs: null,
      }
    }
    return returnData;
  }

  async withdrawJoker(req){
    const data = JSON.parse(req.message);
    const userId: string = data.txns[0].userId;
    const withdraw: number = data.txns[0].amount;
    let returnData;
    // find user balance with userId
    const balance = await this.getOneUserByAgentUserId(userId);
    if (!balance) {
      returnData = {
        status: "1000",
        desc: "Invalid user id",
      }
      return returnData;
    }
    // variable declaration
    let balancePlayer: number = balance.wallet.balance;
    const deduct: number = balancePlayer - withdraw;
    if(deduct < 0) {
      returnData = {
        status: "1018",
        desc: "Not enough balance",
      }
    }

    // create new wallet object
    const updatedWallet = await this.walletsRepository.findOne({
      where: {
        id: balance.wallet.id,
      }
    });
    updatedWallet.balance = deduct;

    // save new wallet data
    const walletSaved = await this.walletsRepository.save(updatedWallet);

    if(!walletSaved) {
      returnData = {
        status: "9999",
        desc: "Fail / Unknown Error",
      }
    } else {
      returnData = {
        status: "0000",
        balance: parseFloat(Number(deduct).toFixed(3)),
        balanceTs: null,
      }
    }
    return returnData;
  }

  async depositJoker(req){
    const data = JSON.parse(req.message);
    const userId: string = data.txns[0].userId;
    const depo: number = data.txns[0].amount;
    let returnData;
    // find user balance with userId
    const balance = await this.getOneUserByAgentUserId(userId);
    if (!balance) {
      returnData = {
        status: "1000",
        desc: "Invalid user id",
      }
      return returnData;
    }
    // variable declaration
    let balancePlayer: number = balance.wallet.balance;
    const add: number = Number(balancePlayer) + Number(depo);

    // create new wallet object
    const updatedWallet = await this.walletsRepository.findOne({
      where: {
        id: balance.wallet.id,
      }
    });
    updatedWallet.balance = add;

    // save new wallet data
    const walletSaved = await this.walletsRepository.save(updatedWallet);
    
    if(!walletSaved) {
      returnData = {
        status: "9999",
        desc: "Fail / Unknown Error",
      }
    } else {
      returnData = {
        status: "0000",
        balance: parseFloat(Number(add).toFixed(3)),
        balanceTs: null,
      }
    }
    return returnData;
  }
}
