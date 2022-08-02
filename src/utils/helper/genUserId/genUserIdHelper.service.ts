import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Currency, User } from 'src/models';
import { Repository } from 'typeorm';
// import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GenerateUserIdService {
  private userId:String;
  constructor(
    // private prisma: PrismaService
    @InjectRepository(Currency) private currenciesRepository: Repository<Currency>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ){}
  async index(curr) {
    const getcurr = await this.currenciesRepository.findOne({
      relations: {
        agents: true,
      },
      where: {
        code: curr
      }
    });
    const agentId = getcurr.agents[0];
  //   const getcurr = await this.prisma.currency.findUnique({
  //     where : {
  //       code: curr,
  //     },
  //     select: {
  //       agents : {
  //         select: {
  //           agentId:true,
  //         }
  //       }
  //     }
  //   });
  //   const agentId = getcurr.agents[0].agentId;
    const getUser = await this.usersRepository.findOne({
      where: {
        agent: agentId,
      },
      order: {
        createdAt: "DESC",
      },
      // select: {
      //   id: true,
      // }
    });
  //   const getUser = await this.prisma.user.findFirst({
  //     where : {
  //       agentId: agentId
  //     },
  //     select: {
  //       id: true,
  //     },
  //     orderBy: {
  //       createdAt: 'desc',
  //     },
  //     take: 1
  //   });
    // this.userId = `${curr}${getUser.id + 1}`;
    // return this.userId;
    return getUser;

  //   return `hi this is from generate user id helper ${this.userId}`;
  }

}