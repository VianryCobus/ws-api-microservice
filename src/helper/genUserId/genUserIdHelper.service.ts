import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GenerateUserIdService {
  private userId:String;
  constructor(
    private prisma: PrismaService
  ){}
  async index(curr) {
    const getcurr = await this.prisma.currency.findUnique({
      where : {
        code: curr,
      },
      select: {
        agents : {
          select: {
            agentId:true,
          }
        }
      }
    });
    const agentId = getcurr.agents[0].agentId;

    const getUser = await this.prisma.user.findFirst({
      where : {
        agentId: agentId
      },
      select: {
        id: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1
    });
    this.userId = `${curr}${getUser.id + 1}`;

    return `hi this is from generate user id helper ${this.userId}`;
  }

}