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

}
