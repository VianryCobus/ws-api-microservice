import { Injectable, Logger } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
import { BalanceDto } from './dto/balance.dto';

@Injectable()
export class UserServicePrisma {
  logger: Logger;
  constructor(
    // private prisma: PrismaService,
  ){
    this.logger = new Logger();
  }
  async getbalance(dto: BalanceDto){
    this.logger.debug(dto);
    // const balance = await this.prisma.user.findUnique({
    //   where: {
    //     userId: dto.userid,
    //   },
    //   select: {
    //     wallet: {
    //       select: {
    //         balance: true,
    //       }
    //     }
    //   }
    // });
    // // if user and balance does not exist throw exception
    // if (!balance) {
    //   return {
    //     status: "0",
    //     data: {},
    //     message: "882"
    //   }
    // } else {
    //   return {
    //     status: "1",
    //     data: {
    //       "CurrentCredit": balance.wallet.balance.toFixed(2),
    //     }
    //   }
    // }
  }
}
