import { Body, Controller, Get, ParseArrayPipe, Post } from '@nestjs/common';
import { BetResultDto, CancelBetDto, PlaceBetDto, RollbackBetResultDto } from './dto';
import { TransactionService } from './transaction.service';

@Controller('provider')
export class TransactionController {
  constructor(private transactionService: TransactionService){}

  @Post('bet')
  placeBet(@Body() dto: PlaceBetDto) {
    return this.transactionService.placeBet(dto);
  }

  @Post('betresult')
  betResult(@Body(new ParseArrayPipe({ items: BetResultDto})) dto: BetResultDto[]) {
    return this.transactionService.betResult(dto);
  }

  @Post('rollback')
  rollbackBetResult(@Body(new ParseArrayPipe({ items:RollbackBetResultDto })) dto: RollbackBetResultDto[]) {
    return this.transactionService.rollbackBetResult(dto);
  }

  @Post('betcancel')
  cancelBet(@Body(new ParseArrayPipe({items:CancelBetDto })) dto: CancelBetDto[]) {
    return this.transactionService.cancelBet(dto);
  }

}
