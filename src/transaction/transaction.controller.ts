import { Body, Controller, Get, HttpCode, HttpStatus, ParseArrayPipe, Post } from '@nestjs/common';
import { validationSeamless, validationSeamlessArray } from 'src/utils/pipe';
import { Http } from 'winston/lib/winston/transports';
import { BetResultDto, CancelBetDto, PlaceBetDto, RollbackBetResultDto } from './dto';
import { TransactionService } from './transaction.service';

@Controller('provider')
export class TransactionController {
  constructor(private transactionService: TransactionService){}

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

}
