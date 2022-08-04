import { Process, Processor } from "@nestjs/bull";
import { InjectRepository } from "@nestjs/typeorm";
import { Job } from "bull";
import { Transaction } from "src/models";
import { DetailTransaction } from "src/models/detailTransaction.entity";
import { Repository } from "typeorm";
import { HitProviderModule, HitProviderService } from "../helper";
import logFromProvider from "../log/logFromProvider";

@Processor('ws-queue')
export class DetailTransactionConsumer {
  private logFromProvider = logFromProvider;
  constructor(
    @InjectRepository(DetailTransaction) private detailTransactionsRepository: Repository<DetailTransaction>,
    @InjectRepository(Transaction) private transactionsRepository: Repository<Transaction>,
    private hitProviderService: HitProviderService,
  ){}

  @Process('detail-trx-job')
  async detailTrxJob(job: Job<unknown>) {
    let val: any = job.data;
    this.logFromProvider.debug({
      message: {
        type: `Log save detail transactions from queue redis key : ws-queue / detail-trx-job`,
        params: val
      }
    });
    // object data as an arguments that using for hit provider arguments
    const objData = {
      ticketBetId: val.ticketBetId,
      agentId: val.agentId,
      apiKey: val.apiKey,
    }
    // query to check bet parlay or normal bet
    const checkTransaction = await this.transactionsRepository.findOne({
      where: {
        ticketBetId: objData.ticketBetId,
      }
    });

    let hitProvider: any;
    let mode: string;
    if(checkTransaction.game == "PARLAY") {
      hitProvider = await this.hitProviderService.ticketParlay(objData);
      mode = "ticket details parlay";
    } else {
      hitProvider = await this.hitProviderService.ticket(objData);
      mode = "ticket details";
    }

    this.logFromProvider.debug({
      message: {
        type: `Log return data from hit (${mode}) from queue redis key : ws-queue / detail-trx-job`,
        params: hitProvider
      }
    });
    // if response from provider status is true
    if(hitProvider.status)
    {
      this.logFromProvider.debug({
        message: {
          type: `Log return data STATUS is TRUE from hit (${mode}) from queue redis key : ws-queue / detail-trx-job`,
          params: hitProvider
        }
      });
      // if provider return the ticket data
      for (const e of hitProvider.data){
        let statusSaved = {
          status: false,
          action: 'add',
        };
        // get game from transaction
        const checkTransactionData = await this.transactionsRepository.findOne({
          where: {
            ticketBetId: (e.pid) ? e.pid : e.id,
            ep: 'bet',
          }
        });
        const gameType: string = checkTransactionData.game;
        // check if ticket bet id is exist on detail transaction table
        let detailTransaction;
        if(gameType == "PARLAY") {
          detailTransaction = await this.detailTransactionsRepository.findOne({
            where: {
              sId: e.sid,
            }
          });
        } else {
          detailTransaction = await this.detailTransactionsRepository.findOne({
            where: {
              ticketBetId: e.id,
            }
          });
        }
        // if exist (update)
        if(detailTransaction) {
          // mapping new object detail transaction for update
          if(gameType != "PARLAY") {
            detailTransaction.sDate = e.sDate;
            detailTransaction.tDate = e.tDate;
            detailTransaction.aDate = e.aDate;
            detailTransaction.pDate = e.pDate;
            detailTransaction.tresult = e.tresult;
            detailTransaction.ip = e.ip;
            detailTransaction.isMobile = e.isMobile;
            detailTransaction.commision = e.commision;
          }
          detailTransaction.kDate = e.kDate;
          detailTransaction.user = e.user;
          detailTransaction.sport = e.sport;
          detailTransaction.league = e.league;
          detailTransaction.home = e.home;
          detailTransaction.away = e.away;
          detailTransaction.sport_en = e.sport_en;
          detailTransaction.league_en = e.league_en;
          detailTransaction.home_en = e.home_en;
          detailTransaction.away_en = e.away_en;
          detailTransaction.live = e.live;
          detailTransaction.homeScore = e.homeScore;
          detailTransaction.awayScore = e.awayScore;
          detailTransaction.status = e.status;
          detailTransaction.ft = e.ft;
          detailTransaction.oddsType = e.oddsType;
          detailTransaction.game = e.game;
          detailTransaction.info = e.info;
          detailTransaction.odds = e.odds;
          detailTransaction.side = e.side;
          detailTransaction.side_en = e.side_en;
          detailTransaction.othersgame = e.othersgame;
          detailTransaction.othersgame_en = e.othersgame_en;
          detailTransaction.bAmt = e.bamt;
          detailTransaction.wAmt = e.wamt;
          detailTransaction.tresult = e.tResult;
          detailTransaction.fhscore = e.fhscore;
          detailTransaction.ftscore = e.ftscore;
          detailTransaction.fg = e.fg;
          detailTransaction.lg = e.lg;

          const detailTransactionSaved = await this.detailTransactionsRepository.save(detailTransaction);

          statusSaved.action = 'update';
          if(detailTransactionSaved) {
            statusSaved.status = true;
          } else {
            statusSaved.status = false;
          }
        } else {
          // mapping new object detail transaction
          const newDetailTransaction = await this.detailTransactionsRepository.create({
            ticketBetId: (gameType == "PARLAY") ? e.pid : e.id,
            sId: (gameType == "PARLAY" ? e.sid : null),
            sDate: (gameType == "PARLAY" ? null : e.sDate),
            tDate: (gameType == "PARLAY" ? null : e.tDate),
            kDate: e.kDate,
            aDate: (gameType == "PARLAY" ? null : e.aDate),
            pDate: (gameType == "PARLAY" ? null : e.pDate),
            user: e.user,
            sport: e.sport,
            league: e.league,
            home: e.home,
            away: e.away,
            sport_en: e.sport_en,
            league_en: e.league_en,
            home_en: e.home_en,
            away_en: e.away_en,
            live: e.live,
            homeScore: e.homeScore,
            awayScore: e.awayScore,
            status: e.status,
            ft: e.ft,
            oddsType: e.oddsType,
            game: e.game,
            info: e.info,
            odds: e.odds,
            side: e.side,
            side_en: e.side_en,
            othersgame: e.othersgame,
            othersgame_en: e.othersgame_en,
            bAmt: (gameType == "PARLAY" ? null : e.bamt),
            wAmt: (gameType == "PARLAY" ? null : e.wamt),
            tresult: (gameType == "PARLAY" ? e.tResult : e.tresult),
            fhscore: e.fhscore,
            ftscore: e.ftscore,
            fg: e.fg,
            lg: e.lg,
            ip: (gameType == "PARLAY" ? null : e.ip),
            isMobile: (gameType == "PARLAY" ? null : e.isMobile),
            commision: (gameType == "PARLAY" ? null : e.commision),
          });

          // save new detail transaction
          const detailTransactionSaved = await this.detailTransactionsRepository.save(newDetailTransaction);

          if(detailTransactionSaved) {
            statusSaved.status = true;
          } else {
            statusSaved.status = false;
          }
        }

        if(statusSaved.status) {
          this.logFromProvider.debug({
            message: {
              type: `log save action (${statusSaved.action}) detail transaction from queue redis key : ws-queue / detail-trx-job`,
              params: hitProvider.data,
            }
          });
        } else {
          this.logFromProvider.debug({
            message: {
              type: `log FAILED save action (${statusSaved.action}) detail transaction from queue redis key : ws-queue / detail-trx-job`,
              params: hitProvider.data,
            }
          });
        }
      }
    } else {
      this.logFromProvider.debug({
        message: {
          type: `Log return status is FALSE from hit (${mode}) from queue redis key : ws-queue / detail-trx-job`,
          params: hitProvider
        }
      });
    }
  }
}