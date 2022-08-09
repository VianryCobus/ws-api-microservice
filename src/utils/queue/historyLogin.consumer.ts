import { Process, Processor } from "@nestjs/bull";
import { InjectRepository } from "@nestjs/typeorm";
import { Job } from "bull";
import { HistoryLogin } from "src/models";
import { Between, Repository } from "typeorm";
import { LoggerHelperService } from "../helper";

@Processor('ws-queue')
export class HistoryLoginConsumer {
  constructor(
    @InjectRepository(HistoryLogin) private historyLoginsRepository:Repository<HistoryLogin>,
    private loggerHelperService: LoggerHelperService,
  ){}

  @Process('login-history-job')
  async loginHistoryJob(job: Job<unknown>) {
    // collect data to variable
    let val: any = job.data;

    // get start day and end day
    const now = new Date().getTime();
    let startOfDay = new Date(now - (now % 86400000));
    let endDate = new Date(now - (now % 86400000) + 86400000);

    // get history login today
    const loginHistory = await this.historyLoginsRepository.findOne({
      where: {
        createdAt: Between(
          startOfDay,
          endDate
        ),
        ip: val.ip
      }
    });

    let statusSaved = {
      status: false,
      action: 'add',
    };

    if(!loginHistory) {
      // mapping new object history login
      const newLoginHistory = await this.historyLoginsRepository.create({
        ip: val.ip,
      });
      // save new login history
      const loginHistorySaved = await this.historyLoginsRepository.save(newLoginHistory);
      if(loginHistorySaved) {
        statusSaved.status = true;
      } else {
        statusSaved.status = false;
      }
    } else {
      loginHistory.ip = val.ip;
      const loginHistorySaved = await this.historyLoginsRepository.save(loginHistory);
      statusSaved.action = 'update';
      if(loginHistorySaved) {
        statusSaved.status = true;
      } else {
        statusSaved.status = false;
      }
    }

    if(statusSaved.status) {
      this.loggerHelperService.debugLog(
        `log save action (${statusSaved.action}) history login from queue redis key : ws-queue / login-history-job`,
        val,
      );
    } else {
      this.loggerHelperService.debugLog(
        `log FAILED save history login from queue redis key : ws-queue / login-history-job`,
        val,
      );
    }
  }
}