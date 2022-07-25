import { Body, Controller, Get, Query } from '@nestjs/common';
import { BalanceDto } from './dto';
import { UserService } from './user.service';

@Controller('provider')
export class UserController {
  constructor(private userService: UserService){}

  @Get('bal')
  getbalance(@Query() dto: BalanceDto){
    return this.userService.getbalance(dto)
  }

}
