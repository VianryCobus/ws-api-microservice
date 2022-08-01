import { Process, Processor } from "@nestjs/bull";
import { InjectRepository } from "@nestjs/typeorm";
import { Job } from "bull";
import { Balance } from "src/models/historyBalance.entity";
import { Wallet } from "src/models/wallet.entity";
import { Repository } from "typeorm";
import logFromProvider from "../log/logFromProvider";

@Processor('ws-queue')
export class HistoryBalanceConsumer {
  private logFromProvider = logFromProvider;
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
    // mapping new object history balance
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
    } else {
      this.logFromProvider.debug({
        message: {
          type: `Log FAILED save history balance from queue redis key : ws-queue / balance-history-job`,
          params: val,
        }
      })
    }
  }

}