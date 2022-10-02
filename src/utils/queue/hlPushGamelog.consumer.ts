import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { HitProviderService, LoggerHelperService } from "../helper";

@Processor('ws-queue')
export class HappyLuckPushGamelogConsumer {
  constructor(
    private hitProviderService: HitProviderService,
    private loggerHelperService: LoggerHelperService,
  ){}

  @Process('hpl-gamelog-job')
  async hplGamelogJob(job: Job<unknown>){
    // collect data to variable
    let val: any = job.data;
    // build params object
    const params = {
      username: val.username,
      userid: val.userid,
      trans_games: val.trans_games,
      datetime: new Date(new Date().setHours(new Date().getHours() + 8)),
      bet: val.bet,
      win: val.win,
      lose: val.lose,
      payout: val.payout,
      detail: val.detail,
      game_code: val.game_code,
      balance: val.balance,
    }
    let push;
    if(val.curr_code === "MMK000"){
      // const push gamelog MMK000
      push = await this.hitProviderService.pushGamelogHlMmk000(params);
    } else if(val.curr_code === "CNY"){
      // const push gamelog CNY
      push = await this.hitProviderService.pushGamelogHlCny(params);
    }
    if(push.status){
      this.loggerHelperService.debugLog(
        `log save action (add) Happy Luck Push Gamelog job from queue redis key : ws-queue / hpl-trans-job`,
        val
      );
    } else {
      this.loggerHelperService.debugLog(
        `log FAILED save Happy Luck Push Gamelog job from queue redis key : ws-queue / hpl-trans-job`,
        val
      );
    }
  }
}