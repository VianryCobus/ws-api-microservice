import { InjectQueue } from '@nestjs/bull';
import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { JwtHelperService, LoggerHelperService } from 'src/utils/helper';
import { Agent, Currency, DetailTransaction, Transaction, User, Wallet } from 'src/models';
import { UserService } from 'src/user/user.service';
import { DataSource, Repository } from 'typeorm';
import { BetResultDto, CancelBetDto, GetDetailTrxViewDto, PlaceBetDto, RollbackBetResultDto } from './dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TransactionService {
  private logger: Logger;
  constructor(
    @InjectRepository(Currency) private currenciesRepository: Repository<Currency>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Wallet) private walletsRepository: Repository<Wallet>,
    @InjectRepository(Agent) private agentsRepository: Repository<Agent>,
    @InjectRepository(Transaction) private transactionsRepository: Repository<Transaction>,
    @InjectRepository(DetailTransaction) private detailTransaction: Repository<DetailTransaction>,
    @InjectQueue('ws-queue') private queue:Queue,
    private userService: UserService,
    private loggerHelperService: LoggerHelperService,
    private config: ConfigService,
    private jwtHelperService: JwtHelperService,
  ) {
    this.logger = new Logger();
  }
  async placeBet(dto: PlaceBetDto){
    this.logger.debug({
      message: 'Hit API place bet',
      params: dto,
    });
    await this.loggerHelperService.debugLog(
      'Hit Api place bet',
      dto
    );
    try {
      // find user with userId
      const user = await this.userService.getOneUserByAgentUserId(dto.userId);
      // if user doesn't exists return status 0
      if (!user) {
        await this.loggerHelperService.debugLog(
          'Hit API place bet [user does not exist]',
          dto
        );
        return {
          status: "0",
          data: {},
          message: "882",
        }
      }
      let beforeBalance: number;
      let balanceClientHl: any;
      if (user.client.username === "HL"){
        // if user are client Happy Luck
        balanceClientHl = await this.userService.getbalancehl(user.username);
        // console.log(balanceClientHl);
        beforeBalance = parseFloat(Number(balanceClientHl.balance).toFixed(4));
      } else {
        // get balance from wallet and count that
        beforeBalance = Number(user.wallet.balance);
      }

      const payout = Number(dto.payout);
      // check balance on wallet, if insufficient, return status 0 and log that
      const checkBalance = await this.checkBalance(beforeBalance,payout);
      if (!checkBalance.status) {
        await this.loggerHelperService.debugLog(
          'Hit API place bet [Insufficient Balance]',
          {
            dto,
            balance: beforeBalance,
          }
        );
        return {
          status: "0",
          data: {},
          message: "571",
        }
      }

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
        ep: 'bet'
      });

      // create new wallet object
      const updatedWallet = await this.walletsRepository.findOne({
        where: {
          id: user.wallet.id,
        }
      });
      updatedWallet.balance = checkBalance.afterBalance;

      // save new transaction data
      const transactionSaved = await this.transactionsRepository.save(newTransaction);

      if(!transactionSaved) {
        await this.loggerHelperService.debugLog(
          'Hit API place bet [Failed Save Transaction]',
          newTransaction
        );
        return {
          status: "0",
          data: {},
          message: "550",
        }
      }

      // save new wallet data
      const walletSaved = await this.walletsRepository.save(updatedWallet);

      if(!walletSaved) {
        // log that
        await this.loggerHelperService.debugLog(
          'Hit API place bet [Failed Save Wallet Data]',
          {
            beforeBalance,
            afterBalance: checkBalance.afterBalance,
            payout,
            updatedWallet,
          }
        );
        return {
          status: "0",
          data: {},
          message: "550",
        }
      }

      // add to queue in order to record balance history
      await this.queue.add('balance-history-job',{
        walletId: updatedWallet.id,
        balance: checkBalance.afterBalance,
        transaction: transactionSaved,
      },{
        removeOnComplete: true,
        delay: 3000,
      });

      // add to queue in order to retreive detail transaction job
      await this.queue.add('detail-trx-job', {
        ticketBetId: dto.id,
        agentId: user.client.agent.agentId,
        apiKey: user.client.agent.apiKey,
      },{
        removeOnComplete: true,
        delay: 5000,
      });

      if(user.client.username === "HL") {
        // add to queue in order to insert data to Happy Luck client database
        await this.queue.add('hpl-trans-job', {
          ticketBetId: dto.id,
          transId: dto.transId,
          amount_balance_players: dto.payout,
          current_balance_players: checkBalance.afterBalance,
          players_id: balanceClientHl.players_id,
          transactions_types_id: 3,
          aggregator_id: this.config.get('WS_SPORT_AGGREGATOR_ID'),
          note_balance_players: 'bet',
        },{
          removeOnComplete: true,
        });

        // build jwt trx detail key
        const buildJwtTrxDetail = await this.jwtHelperService.signToken({
          ticketBetId: dto.id
        },'trxDetailKey');

        // add to queue in order to push data to gamelog Happy Luck client
        await this.queue.add('hpl-gamelog-job',{
          username: balanceClientHl.username_players,
          userid: balanceClientHl.userid_players,
          trans_games: dto.id,
          bet: dto.bAmt,
          win: 0,
          lose: dto.bAmt,
          payout: 0,
          detail: `Status: Bet <button class="btn btn-block btn-success" onclick="window.open('${this.config.get('WS_SPORT_CC_URL')}/api/provider/getDetailTrx?ticketBetId=${buildJwtTrxDetail.access_token}','_blank','toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400')">Detail</button>`,
          game_code: 'WS001',
          balance: checkBalance.afterBalance,
        },{
          removeOnComplete: true,
        });
      }

      this.logger.debug({
        message: 'Hit API place bet [Success Place Bet]',
        params: dto,
      });

      const objSuccess = {
        data: {
          userId: user.userId,
          beforeBalance,
          afterBalance: checkBalance.afterBalance,
        },
        status: 1,
        message: "",
      };

      await this.loggerHelperService.debugLog(
        'Hit API place bet [Success Place Bet]',
        objSuccess,
      );

      // return success params
      return objSuccess;
    } catch(error) {
      console.log(error);
      // if (error.code === '23505') {
      //   await this.loggerHelperService.debugLog(
      //     'Hit API place bet [Duplicate Trans Id]',
      //     {
      //       transId: dto.transId,
      //     },
      //   );
      //   throw new ForbiddenException(`Duplicate Trans Id, transId : ${dto.transId}`)
      // }
      // // handle error
      // throw error;

      await this.loggerHelperService.debugLog(
        'Hit API place bet [Failed Place Bet, Error from catch]',
        {
          error
        },
      );
      return {
        status: "0",
        data: {},
        message: "550",
      }
    }
  }

  async betResult(dto: BetResultDto[]){
    this.logger.debug({
      message: 'Hit API bet result',
      params: dto,
    });
    // await this.loggerHelperService.debugLog(
    //   'Hit API bet result',
    //   dto,
    // );
    try {
      for (const e of dto) {
        // find transaction with ticket bet Id
        const transaction = await this.getOneTrxByTicketBetId(e.id);
        // if trx id isn't exist throw error
        if(!transaction) {
          await this.loggerHelperService.debugLog(
            `Hit API bet result [ticket (BET id) : ${e.id} isn't exist]`,
            e,
          );
          // handle error
          return {
            status: "0",
            data: {},
            message: "550"
          }
        } else {
          // find user with userId
          const user = await this.userService.getOneUserByAgentUserId(e.userId);
          // if user doesn't exists return status 0
          if (!user) {
            await this.loggerHelperService.debugLog(
              `Hit API bet result [userId : ${e.userId} isn't exist]`,
              e,
            );
            // handle error
            return {
              status: "0",
              data: {},
              message: "550"
            }
          } else {
            let beforeBalance: number;
            let balanceClientHl: any;
            if(user.client.username === "HL"){
              // if user are client Happy Luck
              balanceClientHl = await this.userService.getbalancehl(user.username);
              beforeBalance = parseFloat(Number(balanceClientHl.balance).toFixed(4));
            } else {
              // get balance from wallet and count that
              beforeBalance = Number(user.wallet.balance);
            }
            const payout = Number(e.payout);
            // check balance on wallet, if insufficient, return status 0 and log that
            const checkBalance = await this.checkBalance(beforeBalance,payout);
            if (!checkBalance.status) {
              await this.loggerHelperService.debugLog(
                `Hit API bet result [Insufficient Balance when process transId : ${e.transId}]`,
                {
                  beforeBalance,
                  payout
                }
              );
              // handle error
              return {
                status: "0",
                data: {},
                message: "571"
              }
            } else {
              // mapping new data
              const newTransaction = await this.transactionsRepository.create({
                user,
                transId: String(e.transId),
                ticketBetId: e.id,
                sDate: e.sDate,
                bAmt: e.bAmt,
                odds: e.odds,
                commPerc: e.commPerc,
                comm: e.comm,
                payout: e.payout,
                creditDeducted: e.creditDeducted,
                winloss: e.winloss,
                status: e.status,
                ep: 'betresult'
              });
              // save data transaction
              const transactionSaved = await this.transactionsRepository.save(newTransaction);

              if(!transactionSaved) {
                await this.loggerHelperService.debugLog(
                  `Hit API bet result [Failed Save transaction Data, transId : ${e.transId}]`,
                  transaction,
                );
                // handle error
                return {
                  status: "0",
                  data: {},
                  message: "550"
                }
              }
              
              // create new wallet object
              const updatedWallet = await this.walletsRepository.findOne({
                where: {
                  id: user.wallet.id,
                }
              });
              updatedWallet.balance = checkBalance.afterBalance;

              const walletSaved = await this.walletsRepository.save(updatedWallet);

              if(!walletSaved) {
                await this.loggerHelperService.debugLog(
                  `Hit API bet result [Failed Save wallet Balance], transId : ${e.transId}`,
                  {
                    beforeBalance,
                    afterBalance: checkBalance.afterBalance,
                    payout,
                    updatedWallet,
                  }
                );
                // handle error
                return {
                  status: "0",
                  data: {},
                  message: "550"
                }
              }

              // add to queue in order to record balance history
              await this.queue.add('balance-history-job',{
                walletId: updatedWallet.id,
                balance: checkBalance.afterBalance,
                transaction: transactionSaved,
              },{
                removeOnComplete: true,
                delay: 3000,
              });

              // add to queue in order to retreive detail transaction job
              await this.queue.add('detail-trx-job', {
                ticketBetId: transaction.ticketBetId,
                agentId: user.client.agent.agentId,
                apiKey: user.client.agent.apiKey,
              },{
                removeOnComplete: true,
                delay: 5000,
              });

              // if user from client Happy Luck
              if(user.client.username === "HL") {
                // add to queue in order to insert data to Happy Luck client database
                await this.queue.add('hpl-trans-job', {
                  ticketBetId: e.id,
                  transId: e.transId,
                  amount_balance_players: e.payout,
                  current_balance_players: checkBalance.afterBalance,
                  players_id: balanceClientHl.players_id,
                  transactions_types_id: 4,
                  aggregator_id: this.config.get('WS_SPORT_AGGREGATOR_ID'),
                  note_balance_players: 'betresult',
                },{
                  removeOnComplete: true,
                });

                // build jwt trx detail key
                const buildJwtTrxDetail = await this.jwtHelperService.signToken({
                  ticketBetId: e.id
                },'trxDetailKey');

                // determine win and lose
                let gamelogWin: number = 0;
                let gamelogLose: number = e.creditDeducted;
                switch(e.winloss){
                  case 1:
                  case 2:
                  case 3:
                  case 4:
                    gamelogWin = e.payout - e.creditDeducted;
                    break;
                  case 0:
                    gamelogLose = e.creditDeducted
                    break;
                  default:
                    gamelogWin = 0;
                    gamelogLose = e.creditDeducted;
                }

                // add to queue in order to push data to gamelog Happy Luck client
                await this.queue.add('hpl-gamelog-job',{
                  username: balanceClientHl.username_players,
                  userid: balanceClientHl.userid_players,
                  trans_games: e.id,
                  bet: e.bAmt,
                  win: gamelogWin,
                  lose: gamelogLose,
                  payout: e.payout,
                  detail: `Status: Bet Result <button class="btn btn-block btn-success" onclick="window.open('${this.config.get('WS_SPORT_CC_URL')}/api/provider/getDetailTrx?ticketBetId=${buildJwtTrxDetail.access_token}','_blank','toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400')">Detail</button>`,
                  game_code: 'WS001',
                  balance: checkBalance.afterBalance,
                },{
                  removeOnComplete: true,
                });
              }

            }
          }
        }
      };
      await this.loggerHelperService.debugLog(
        `Hit API bet result [Success Bet Result]`,
        dto,
      );
      return {
        status: 1,
        message: "",
      }
    } catch(error) {
      console.log(error);
      // if (error.code === '23505') {
      //   await this.loggerHelperService.debugLog(
      //     `Hit API bet result [Duplicate Trans Id]`,
      //     ''
      //   );
      //   throw new ForbiddenException('Duplicate Trans Id');
      // }
      await this.loggerHelperService.debugLog(
        `Hit API bet result [Failed Bet Result, Error from catch]`,
        {
          error
        }
      );
      // handle error
      return {
        status: "0",
        data: {},
        message: "550"
      }
    }
  }

  async rollbackBetResult(dto: RollbackBetResultDto[]){
    this.logger.debug({
      message: 'Hit API rollback bet result',
      params: dto,
    });
    await this.loggerHelperService.debugLog(
      'Hit API rollback bet result',
      dto,
    );
    try {
      for (const e of dto) {
        // find transaction with ticket bet Id
        const transaction = await this.getOneTrxByTicketBetId(e.id);
        // if trx id isn't exist throw error
        if(!transaction) {
          await this.loggerHelperService.debugLog(
            `Hit API rollback bet result [ticket (BET id) : ${e.id} isn't exist ]`,
            e
          );
          // handle error
          return {
            status: "0",
            data: {},
            message: "550"
          }
        } else {
          // find user with userId
          const user = await this.userService.getOneUserByAgentUserId(e.userId);
          // if user doesn't exists return status 0
          if (!user) {
            await this.loggerHelperService.debugLog(
              `Hit API rollback bet result [userId : ${e.userId} isn't exist]`,
              e
            );
            // handle error
            return {
              status: "0",
              data: {},
              message: "550"
            }
          } else {
            let beforeBalance: number;
            let balanceClientHl: any;
            if(user.client.username === "HL"){
              // if user are client Happy Luck
              balanceClientHl = await this.userService.getbalancehl(user.username);
              beforeBalance = parseFloat(Number(balanceClientHl.balance).toFixed(4));
            } else {
              // get balance from wallet and count that
              beforeBalance = Number(user.wallet.balance);
            }
            const payout = Number(e.payout);
            // check balance on wallet, if insufficient, return status 0 and log that
            const checkBalance = await this.checkBalance(beforeBalance, payout);
            if (!checkBalance.status) {
              await this.loggerHelperService.debugLog(
                `Hit API rollback bet result [Insufficient Balance when process transId: ${e.transId}]`,
                {
                  beforeBalance,
                  payout
                }
              );
              // handle error
              return {
                status: "0",
                data: {},
                message: "571"
              }
            } else {
              // mapping new data
              const newTransaction = await this.transactionsRepository.create({
                user,
                transId: String(e.transId),
                ticketBetId: e.id,
                sDate: e.sDate,
                bAmt: e.bAmt,
                odds: e.odds,
                commPerc: e.commPerc,
                comm: e.comm,
                payout: e.payout,
                creditDeducted: e.creditDeducted,
                winloss: e.winloss,
                status: e.status,
                ep: 'rollback',
              });
              // save data transaction
              const transactionSaved = await this.transactionsRepository.save(newTransaction);

              if(!transactionSaved) {
                await this.loggerHelperService.debugLog(
                  `Hit API bet result [Failed Save transaction Data, transId : ${e.transId}]`,
                  transaction,
                );
                // handle error
                return {
                  status: "0",
                  data: {},
                  message: "550"
                }
              }

              // create new wallet object
              const updatedWallet = await this.walletsRepository.findOne({
                where: {
                  id: user.wallet.id,
                }
              });
              updatedWallet.balance = checkBalance.afterBalance;

              const walletSaved = await this.walletsRepository.save(updatedWallet);

              if(!walletSaved) {
                await this.loggerHelperService.debugLog(
                  `Hit API bet result [Failed Save wallet Balance], transId : ${e.transId}`,
                  {
                    beforeBalance,
                    afterBalance: checkBalance.afterBalance,
                    payout,
                    updatedWallet,
                  }
                );
                // handle error
                return {
                  status: "0",
                  data: {},
                  message: "550"
                }
              }

              // add to queue in order to record balance history
              await this.queue.add('balance-history-job',{
                walletId: updatedWallet.id,
                balance: checkBalance.afterBalance,
                transaction: transactionSaved,
              },{
                removeOnComplete: true,
              });

              // if user client Happy Luck
              if(user.client.username === "HL") {
                // add to queue in order to insert data to Happy Luck client database
                await this.queue.add('hpl-trans-job',{
                  ticketBetId: e.id,
                  transId: e.transId,
                  amount_balance_players: e.payout,
                  current_balance_players: checkBalance.afterBalance,
                  players_id: balanceClientHl.players_id,
                  transactions_types_id: 5,
                  aggregator_id: this.config.get('WS_SPORT_AGGREGATOR_ID'),
                  note_balance_players: 'rollbackbetresult',
                },{
                  removeOnComplete: true,
                })

                // build jwt trx detail key
                const buildJwtTrxDetail = await this.jwtHelperService.signToken({
                  ticketBetId: e.id
                },'trxDetailKey');

                // determine win and lose
                let gamelogWin: number = 0;
                let gamelogLose: number = e.creditDeducted;
                switch(e.winloss){
                  case 1:
                  case 2:
                  case 3:
                  case 4:
                    gamelogWin = e.payout - e.creditDeducted;
                    break;
                  case 0:
                    gamelogLose = e.creditDeducted
                    break;
                  default:
                    gamelogWin = 0;
                    gamelogLose = e.creditDeducted;
                }

                // add to queue in order to push data to gamelog Happy Luck client
                await this.queue.add('hpl-gamelog-job',{
                  username: balanceClientHl.username_players,
                  userid: balanceClientHl.userid_players,
                  trans_games: e.id,
                  bet: e.bAmt,
                  win: gamelogWin,
                  lose: gamelogLose,
                  payout: e.payout,
                  detail: `Status: Rollback Bet <button class="btn btn-block btn-success" onclick="window.open('${this.config.get('WS_SPORT_CC_URL')}/api/provider/getDetailTrx?ticketBetId=${buildJwtTrxDetail.access_token}','_blank','toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400')">Detail</button>`,
                  game_code: 'WS001',
                  balance: checkBalance.afterBalance,
                },{
                  removeOnComplete: true,
                });
              }

            }
          }
        }
      };
      await this.loggerHelperService.debugLog(
        `Hit API rollback bet result [Success Rollback Bet Result]`,
        dto,
      );
      return {
        status: 1,
        message: "",
      }
    } catch (error) {
      console.log(error);
      // if (error.code === '23505') {
      //   await this.loggerHelperService.debugLog(
      //     `Hit API rollback bet result [Duplicate Trans Id]`,
      //     ''
      //   );
      //   throw new ForbiddenException('Duplicate Trans Id');
      // }
      await this.loggerHelperService.debugLog(
        'Hit API rollback bet result [Failed Rollback bet result, Error from catch]',
        {
          error
        },
      );
      // handle error
      return {
        status: "0",
        data: {},
        message: "550"
      }
    }
  }

  async cancelBet(dto: CancelBetDto[]){
    this.logger.debug({
      message: 'Hit API cancel bet',
      params: dto,
    });
    await this.loggerHelperService.debugLog(
      'Hit API cancel bet',
      dto,
    );
    try {
      for (const e of dto) {
        // ==== find transaction with ticket bet Id
        const transaction = await this.getOneTrxByTicketBetId(e.id);
        // ==== if trx id isn't exist throw error
        // if(!transaction) {
        //   await this.loggerHelperService.debugLog(
        //     `Hit API cancel bet [ticket (BET id) : ${e.id} isn't exit]`,
        //     e
        //   );
        //   // handle error
        //   return {
        //     status: "0",
        //     data: {},
        //     message: "550"
        //   }
        // } else {
          // find user with userId
          const user = await this.userService.getOneUserByAgentUserId(e.userId);
          // if user doesn't exists return status 0
          if (!user) {
            await this.loggerHelperService.debugLog(
              `Hit API cancel bet [userId : ${e.userId} isn't exist]`,
              e
            );
            // handle error
            return {
              status: "0",
              data: {},
              message: "550"
            }
          } else {
            let beforeBalance: number;
            let balanceClientHl: any;
            if(user.client.username === "HL"){
              // if user are client Happy Luck
              balanceClientHl = await this.userService.getbalancehl(user.username);
              beforeBalance = parseFloat(Number(balanceClientHl.balance).toFixed(4));
            } else {
              // get balance from wallet and count that
              beforeBalance = Number(user.wallet.balance);
            }
            const payout = Number(e.payout);
            // check balance on wallet, if insufficient, return status 0 and log that
            const checkBalance = await this.checkBalance(beforeBalance, payout);
            if(!checkBalance.status) {
              await this.loggerHelperService.debugLog(
                `Hit API cancel bet [Insufficient Balance when process transId: ${e.transId}]`,
                {
                  beforeBalance,
                  payout
                }
              )
              // handle error
              return {
                status: "0",
                data: {},
                message: "571"
              }
            } else {
              // mapping new data
              const newTransaction = await this.transactionsRepository.create({
                user,
                transId: String(e.transId),
                ticketBetId: e.id,
                sDate: e.sDate,
                bAmt: e.bAmt,
                payout: e.payout,
                ip: e.ip,
                odds: e.odds,
                game: e.game,
                source: e.source,
                status: e.status,
                ep: 'betcancel',
              });
              // save data transaction
              const transactionSaved = await this.transactionsRepository.save(newTransaction);

              if(!transactionSaved) {
                await this.loggerHelperService.debugLog(
                  `Hit API cancel bet [Failed Save transaction Data, transId : ${e.transId}]`,
                  transaction,
                );
                // handle error
                return {
                  status: "0",
                  data: {},
                  message: "550"
                }
              }

              // create new wallet object
              const updatedWallet = await this.walletsRepository.findOne({
                where: {
                  id: user.wallet.id,
                }
              });
              updatedWallet.balance = checkBalance.afterBalance;

              const walletSaved = await this.walletsRepository.save(updatedWallet);

              if(!walletSaved) {
                await this.loggerHelperService.debugLog(
                  `Hit API cancel bet [Failed Save wallet Balance], transId : ${e.transId}`,
                  {
                    beforeBalance,
                    afterBalance: checkBalance.afterBalance,
                    payout,
                    updatedWallet,
                  }
                );
                // handle error
                return {
                  status: "0",
                  data: {},
                  message: "550"
                }
              }

              // add to queue in order to record balance history
              await this.queue.add('balance-history-job',{
                walletId: updatedWallet.id,
                balance: checkBalance.afterBalance,
                transaction: transactionSaved,
              },{
                removeOnComplete: true,
              });

              // if user from client Happy Luck
              if(user.client.username === "HL") {
                // add to queue in order to insert data to Happy Luck client database
                await this.queue.add('hpl-trans-job',{
                  ticketBetId: e.id,
                  transId: e.transId,
                  amount_balance_players: e.payout,
                  current_balance_players: checkBalance.afterBalance,
                  players_id: balanceClientHl.players_id,
                  transactions_types_id: 5,
                  aggregator_id: this.config.get('WS_SPORT_AGGREGATOR_ID'),
                  note_balance_players: 'cancelbet',
                },{
                  removeOnComplete: true,
                })

                // build jwt trx detail key
                const buildJwtTrxDetail = await this.jwtHelperService.signToken({
                  ticketBetId: e.id
                },'trxDetailKey');

                // add to queue in order to push data to gamelog Happy Luck client
                await this.queue.add('hpl-gamelog-job',{
                  username: balanceClientHl.username_players,
                  userid: balanceClientHl.userid_players,
                  trans_games: e.id,
                  bet: e.bAmt,
                  win: 0,
                  lose: 0,
                  payout: e.payout,
                  detail: `Status: Cancel Bet <button class="btn btn-block btn-success" onclick="window.open('${this.config.get('WS_SPORT_CC_URL')}/api/provider/getDetailTrx?ticketBetId=${buildJwtTrxDetail.access_token}','_blank','toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400')">Detail</button>`,
                  game_code: 'WS001',
                  balance: checkBalance.afterBalance,
                },{
                  removeOnComplete: true,
                });

              }

            }
          }
        // }
      }
      await this.loggerHelperService.debugLog(
        `Hit API cancel bet [Success Cancel Bet]`,
        dto,
      );
      return {
        data: {},
        status: 1,
        message: "",
      }
    } catch (error) {
      console.log(error);
      // if (error.code === '23505') {
      //   await this.loggerHelperService.debugLog(
      //     `Hit API cancel bet [Duplicate Trans Id]`,
      //     ''
      //   );
      //   throw new ForbiddenException('Duplicate Trans Id');
      // }
      await this.loggerHelperService.debugLog(
        'Hit API cancel bet [Failed Cancel Bet, Error from catch]',
        {
          error
        },
      );
      // handle error
      return {
        status: "0",
        data: {},
        message: "550"
      }
    }
  }

  // ==== function return promise

  // get transaction by ticket bet Id
  async getOneTrxByTicketBetId(ticketBetId: string) : Promise<Transaction> {
    try {
      const transaction = await this.transactionsRepository.findOne({
        where: {
          ticketBetId,
          ep: 'bet',
        },
        relations: {
          user: true,
        }
      });
      return transaction;
    } catch (err) {
      throw err;
    }
  }

  private checkBalance(before: number,payout: number){
    if(isNaN(before) || isNaN(payout)) {
      return {
        status: false,
      }
    }
    if(before + payout < 0) {
      return {
        status: false,
      }
    }
    return {
      status: true,
      afterBalance: before + payout,
    }
  }

  // get detail transactions views
  async getDetailTrxViews(ticketBetId: string){
    const detailTrx = await this.detailTransaction.find({
      relations: {
        transactions: true,
      },
      where: {
        ticketBetId: ticketBetId,
        transactions: {
          ep: 'betresult',
        }
      }
    })
    return detailTrx;
  }

}
