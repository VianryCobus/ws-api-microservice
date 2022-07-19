import { Body, Controller, Get, Post } from '@nestjs/common';
import { PlaceBetDto } from './dto';
import { TransactionService } from './transaction.service';

@Controller('provider')
export class TransactionController {
  constructor(private transactionService: TransactionService){}

  @Post('bet')
  placebet(@Body() dto: PlaceBetDto) {
    return this.transactionService.placebet(dto);
  }
}
