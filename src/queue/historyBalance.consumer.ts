import { Process, Processor } from "@nestjs/bull";
import { InjectRepository } from "@nestjs/typeorm";
import { Job } from "bull";
import { Balance } from "src/models/historyBalance.entity";
import { Wallet } from "src/models/wallet.entity";
import { Repository } from "typeorm";

@Processor('ws-queue')
export class HistoryBalanceConsumer {
  private logFromProvider = require('../utils/log/logFromProvider');
  constructor(
    @InjectRepository(Balance) private balancesRepository: Repository<Balance>,
    @InjectRepository(Wallet) private walletsRepository: Repository<Wallet>,
  ){}

  @Process('balance-history-job')
  async balanceHistoryJob(job: Job<unknown>) {
    let val: any = job.data;

    // get wallet
    const wallet = await this.walletsRepository.findOne({
      where: {
        id: val.walletId,
      }
    });
    // mapping object new history balance
    const newBalanceHistory = await this.balancesRepository.create({
      wallet,
      balance: val.balance,
      transaction: val.transaction
    });
    // save new balance history
    const balanceHistorySaved = await this.balancesRepository.save(newBalanceHistory);
    
    if(balanceHistorySaved) {
      this.logFromProvider.debug({
        message: {
          type: `Log save history balance from queue redis key : ws-queue / balance-history-job`,
          params: val,
        }
      })
    }
  }

}