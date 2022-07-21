import { Body, Controller, Get, ParseArrayPipe, Post } from '@nestjs/common';
import { BetResultDto, PlaceBetDto } from './dto';
import { TransactionService } from './transaction.service';

@Controller('provider')
export class TransactionController {
  constructor(private transactionService: TransactionService){}

  @Post('bet')
  placebet(@Body() dto: PlaceBetDto) {
    return this.transactionService.placebet(dto);
  }

  @Post('betresult')
  betresult(@Body(new ParseArrayPipe({ items: BetResultDto})) dto: BetResultDto[]) {
    return this.transactionService.betresult(dto);
  }

  @Post('rollback')
  rollbackBetResult() {
    return this.transactionService.rollbackBetResult();
  }

}
