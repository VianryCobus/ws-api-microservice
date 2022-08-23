import { Body, Controller, Get, HttpCode, HttpStatus, ParseArrayPipe, Post, Query, Render, Req, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { BalanceDto } from 'src/user/dto';
import { JwtHelperService } from 'src/utils/helper';
import { validationSeamless, validationSeamlessArray } from 'src/utils/pipe';
import { Http } from 'winston/lib/winston/transports';
import { BetResultDto, CancelBetDto, GetDetailTrxViewDto, PlaceBetDto, RollbackBetResultDto } from './dto';
import { TransactionService } from './transaction.service';

@Controller('provider')
export class TransactionController {
  constructor(
    private transactionService: TransactionService,
    private jwtHelperService: JwtHelperService
  ){}

  @Post('bet')
  @HttpCode(200)
  placeBet(@Body(new validationSeamless('placeBet')) dto: PlaceBetDto) {
    return this.transactionService.placeBet(dto);
  }

  @Post('betresult')
  @HttpCode(200)
  betResult(@Body(new ParseArrayPipe(
    { 
      items: BetResultDto,
      whitelist: true,
    }
  )) dto: BetResultDto[]) {
    return this.transactionService.betResult(dto);
  }

  @Post('rollback')
  @HttpCode(200)
  rollbackBetResult(@Body(new ParseArrayPipe(
    { 
      items:RollbackBetResultDto,
      whitelist: true,
    }
  )) dto: RollbackBetResultDto[]) {
    return this.transactionService.rollbackBetResult(dto);
  }

  @Post('betcancel')
  @HttpCode(200)
  cancelBet(@Body(new ParseArrayPipe(
    {
      items:CancelBetDto,
      whitelist: true,
    }
  )) dto: CancelBetDto[]) {
    return this.transactionService.cancelBet(dto);
  }

  @Get('getDetailTrx')
  @HttpCode(200)
  @Render('transactions/index')
  async getDetailTrx(@Query(new ValidationPipe()) dto: GetDetailTrxViewDto){
    const decodeId = await this.jwtHelperService.decodeTicketBetId(dto.ticketBetId);
    if(!decodeId.status)
    throw new UnauthorizedException(`Token isn't valid`);
    const ticketBetId = await this.transactionService.getDetailTrxViews(decodeId.objFromToken.sub);
    return {
      ticketBetId
    }
  }

  @Post('check')
  async check(@Body() req){
    console.log("from transaction controller ====");
    console.log(req);
    const dateOrigin = new Date();
    console.log(dateOrigin);
    const dateTimezone = new Date().setHours(new Date().getHours() + 8);
    return {
      // req: req,
      // dateOrigin: dateOrigin,
      // dateTimezone: new Date(dateTimezone)
      status: "success",
      message: "data added succesfully",
    }
  }

}
