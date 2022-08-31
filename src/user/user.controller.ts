import { Body, Controller, Get, Post, Query, Req, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { UpdateAccountProviderDto } from 'src/auth/dto';
import { validationSeamless } from 'src/utils/pipe';
import { BalanceDto } from './dto';
import { UserService } from './user.service';

@Controller('provider')
export class UserController {
  constructor(private userService: UserService){}

  @Get('bal')
  getbalance(@Query(new validationSeamless('getBalance')) dto: BalanceDto){
    return this.userService.getbalance(dto)
  }

  @Post('updateAcc')
  updateAcc(@Body(new ValidationPipe()) dto: UpdateAccountProviderDto, @Req() req: Request) {
    return 'update Acc';
  }

  @Get('balHl')
  getbalancehl(@Query() query) {
    return this.userService.getbalancehl(query.username);
  }

  @Get('passCompare')
  getPassDecrypt(@Query() query) {
    return this.userService.passCompare(query.passwordHash,query.passwordOrigin);
  }

  @Get('passHashing')
  getPassHashing(@Query() query) {
    return this.userService.passHashing(query.password);
  }

  // in order to test joker
  @Post('joker/getbalance')
  getbalancejoker(){
    return this.userService.getbalanceJoker();
  }

  @Post('joker/placebet')
  betjoker(@Req() req: Request){
    return this.userService.placeBetJoker(req.body);
  }

  @Post('joker/settle')
  settleJoker(@Req() req: Request){
    return this.userService.settleJoker(req.body);
  }

  @Post('joker/cancelbet')
  cancelBetJoker(@Req() req: Request){
    return this.userService.cancelBetJoker();
  }

  // bonus win & // jackpot win
  @Post('joker/give')
  giveJoker(@Req() req: Request){
    return this.userService.giveJoker(req.body);
  }

  // withdraw
  @Post('joker/withdraw')
  withdrawJoker(@Req() req: Request){
    return this.userService.withdrawJoker(req.body);
  }

  // deposit
  @Post('joker/deposit')
  depositJoker(@Req() req: Request){
    return this.userService.depositJoker(req.body);
  }

}
