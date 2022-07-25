import { InjectQueue } from '@nestjs/bull';
import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { LoggerHelperService } from 'src/helper';
import { Agent, Currency, Transaction, User, Wallet } from 'src/models';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { BetResultDto, CancelBetDto, PlaceBetDto, RollbackBetResultDto } from './dto';

@Injectable()
export class TransactionService {
  private logger: Logger;
  constructor(
    @InjectRepository(Currency) private currenciesRepository: Repository<Currency>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Wallet) private walletsRepository: Repository<Wallet>,
    @InjectRepository(Agent) private agentsRepository: Repository<Agent>,
    @InjectRepository(Transaction) private transactionsRepository: Repository<Transaction>,
    @InjectQueue('ws-queue') private queue:Queue,
    private userService: UserService,
    private loggerHelperService: LoggerHelperService,
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
      // get balance from wallet and count that
      const beforeBalance = Number(user.wallet.balance);
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

      // // add to queue in order to record balance history
      await this.queue.add('balance-history-job',{
        walletId: updatedWallet.id,
        balance: checkBalance.afterBalance,
        transaction: transactionSaved,
      },{
        removeOnComplete: true,
      });

      this.logger.debug({
        message: 'Hit API place bet [Success Place Bet]',
        params: dto,
      });
      await this.loggerHelperService.debugLog(
        'Hit API place bet [Success Place Bet]',
        {
          data: {
            userId: user.userId,
            beforeBalance,
            afterBalance: checkBalance.afterBalance,
          },
          status: 1,
          message: "",
        }
      );

      // return success params
      return {
        data: {
          userId: user.userId,
          beforeBalance: beforeBalance,
          afterBalance: checkBalance.afterBalance,
        },
        status: 1,
        message: "",
      };
    } catch(error) {
      if (error.code === '23505') {
        await this.loggerHelperService.debugLog(
          'Hit API place bet [Duplicate Trans Id]',
          {
            transId: dto.transId,
          },
        );
        throw new ForbiddenException(`Duplicate Trans Id, transId : ${dto.transId}`)
      }
      // handle error
      throw error;
    }
  }

  async betResult(dto: BetResultDto[]){
    this.logger.debug({
      message: 'Hit API bet result',
      params: dto,
    });
    await this.loggerHelperService.debugLog(
      'Hit API bet result',
      dto,
    );
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
            // get balance from wallet and count that
            const beforeBalance = Number(user.wallet.balance);
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
              });
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
      if (error.code === '23505') {
        await this.loggerHelperService.debugLog(
          `Hit API bet result [Duplicate Trans Id]`,
          ''
        );
        throw new ForbiddenException('Duplicate Trans Id');
      }
      await this.loggerHelperService.debugLog(
        `Hit API bet result [Error from catch]`,
        error
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
            // get balance from wallet and count that
            const beforeBalance = Number(user.wallet.balance);
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
      if (error.code === '23505') {
        await this.loggerHelperService.debugLog(
          `Hit API rollback bet result [Duplicate Trans Id]`,
          ''
        );
        throw new ForbiddenException('Duplicate Trans Id');
      }
      await this.loggerHelperService.debugLog(
        'Hit API rollback bet result [Error from catch]',
        error,
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
            // get balance from wallet and count that
            const beforeBalance = Number(user.wallet.balance);
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
      if (error.code === '23505') {
        await this.loggerHelperService.debugLog(
          `Hit API cancel bet [Duplicate Trans Id]`,
          ''
        );
        throw new ForbiddenException('Duplicate Trans Id');
      }
      await this.loggerHelperService.debugLog(
        'Hit API cancel bet [Error from catch]',
        error,
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

  checkBalance(before: number,payout: number){
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

}
