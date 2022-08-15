import { Process, Processor } from "@nestjs/bull";
import { InjectDataSource } from "@nestjs/typeorm";
import { Job } from "bull";
import { HistoryBalancePlayersMysqlHL } from "src/models/models_hl";
// import { HistoryBalancePlayersMysqlLocal } from "src/models/models_mysqlLocal";
import { DataSource } from "typeorm";
import { LoggerHelperService } from "../helper";

@Processor('ws-queue')
export class TransactionHappyLuckConsumer {
  constructor(
    // @InjectDataSource('mysqlLocalConnection') private datasourceMysqlLocal: DataSource,
    @InjectDataSource('mysqlHlConnection') private datasourceMysqlHl: DataSource,
    private loggerHelperService: LoggerHelperService,
  ){}

  @Process('hpl-trans-job')
  async hplTransactionJob(job: Job<unknown>){
    // collect data to variable
    let val: any = job.data;

    const newHplTransJob = await this.datasourceMysqlHl.createQueryBuilder()
      .insert()
      .into(HistoryBalancePlayersMysqlHL)
      .values({
        players_id: val.players_id,
        transactions_types_id: val.transactions_types_id,
        no_transactions: `${val.ticketBetId}-${val.transId}`,
        aggregator_id: val.aggregator_id,
        amount_balance_players: val.amount_balance_players,
        current_balance_players: val.current_balance_players,
        note_balance_players: '0',
        datetime_balance_players: new Date(),
      })
      .execute();

    if(newHplTransJob){
      this.loggerHelperService.debugLog(
        `log save action (add) Happy Luck transaction job from queue redis key : ws-queue / hpl-trans-job`,
        val,
      );
    } else {
      this.loggerHelperService.debugLog(
        `log FAILED save Happy Luck tranasction from queue redis key : ws-queue / hpl-trans-job`,
        val,
      );
    }
  }
}