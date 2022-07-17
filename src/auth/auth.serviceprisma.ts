import { ForbiddenException, HttpCode, HttpStatus, Injectable, Res } from "@nestjs/common";
import { User, Transaction, Wallet} from '@prisma/client';
// import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto, SignUpDto } from "./dto";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { GenerateUserIdService } from "src/helper/genUserId/genUserIdHelper.service";
import { HttpService } from "@nestjs/axios";
// import { HitProviderService } from "src/helper/hitProvider/hitProviderHelper.service";

@Injectable()
export class AuthServicePrisma {
  constructor(
    // private prisma: PrismaService,
    // private genUserIdService: GenerateUserIdService
    // private readonly httpService: HttpService,
    // private hitProviderService: HitProviderService
  ) {}
  async signin(dto: AuthDto) {
    // // find the user by email
    // const user = await this.prisma.user.findUnique({
    //   where: {
    //     userId: dto.userid,
    //   },
    //   select: {
    //     userId: true,
    //     hash: true,
    //     agentId: true,
    //     agent: {
    //       select: {
    //         apiKey: true,
    //       }
    //     }
    //   }
    // });
    // // if user does not exist throw exception
    // if (!user) throw new ForbiddenException('Credentials incorrect, please check the user id')
    // // compare password
    // const pwMatches = await argon.verify(user.hash,dto.password,)
    // // if password incorrect throw exception
    // if (!pwMatches) throw new ForbiddenException('Credentials incorrect')
    // // hit api provider
    // // const getProvider = await this.httpService.get('https://s-pi-spr.ww365.club/api/SportMember/UATAAMKHTEST1/Login?agentId=UATAAMKH&hash=77e5c2dc026ab8120d16938d8367b066');
    // const params = {
    //   apiKey: user.agent.apiKey,
    //   agentId: user.agentId,
    //   userId: user.userId,
    //   lang: dto.lang,
    //   se: dto.se,
    //   im: dto.im,
    //   ot: dto.ot,
    // };
    // const paramsJson = {
    //   commisiongroup: dto.commisiongroup,
    //   creditLimit: dto.creditLimit,
    //   suspended: dto.suspended,
    //   active: dto.active,
    //   firstname: dto.firstname,
    //   lastname: dto.lastname,
    //   phone: dto.phone,
    //   mobile: dto.mobile,
    //   minbet: dto.minbet,
    //   commisiongrphdp: dto.commisiongrphdp,
    //   commisiongrp1x2: dto.commisiongrp1x2,
    //   commisiongrpother: dto.commisiongrpother,
    //   commisionmixparlay3: dto.commisionmixparlay3,
    //   commisionmixparlay4: dto.commisionmixparlay4,
    //   commisionmixparlay5: dto.commisionmixparlay5,
    //   myposgrphdp: dto.myposgrphdp,
    //   myposgrp1x2: dto.myposgrp1x2,
    //   myposgrpothers: dto.myposgrpothers,
    //   myposgrpmixparlay: dto.myposgrpmixparlay,
    //   maxbetgrphdp: dto.maxbetgrphdp,
    //   maxpermatchgrphdp: dto.maxpermatchgrphdp,
    //   maxbetgrp1x2: dto.maxbetgrp1x2,
    //   maxpermatchgrp1x2: dto.maxpermatchgrp1x2,
    //   maxbetgrpmixparlay: dto.maxbetgrpmixparlay,
    //   maxpermatchgrpmixparlay: dto.maxpermatchgrpmixparlay,
    //   maxbetgrpothersodds: dto.maxbetgrpothersodds,
    //   maxpermatchgrpothersodds: dto.maxpermatchgrpothersodds,
    //   maxbetgrpspecial: dto.maxbetgrpspecial,
    //   maxpermatchgrpspecial: dto.maxpermatchgrpspecial,
    //   maxbetgrpbasketball: dto.maxbetgrpbasketball,
    //   maxpermatchgrpbasketball: dto.maxpermatchgrpbasketball,
    //   maxbetgrpotherssport: dto.maxbetgrpotherssport,
    //   maxpermatchgrpotherssport: dto.maxpermatchgrpotherssport,
    // }
    // const hitProvider = await this.hitProviderService.login(params,paramsJson);
    // // send back the user
    // delete user.hash;
    // delete user.agent;
    // return {
    //   status: true,
    //   msg: 'signed in',
    //   data: user,
    //   loginUrl: hitProvider,
    // }
  }

  async signup(dto: SignUpDto) {
    // Generate the password hash
    const hash = await argon.hash(dto.password);
    // save the new user in the db
    // try {
    //   // get agentId from currency value
    //   const currency = await this.prisma.currency.findUnique({
    //     where: {
    //       code: dto.currency
    //     },
    //     include : { agents: true },
    //   });
    //   if (!currency) throw new ForbiddenException('Currency code is wrong, please check again');
    //   const agentId:string = currency.agents[0].agentId;

    //   // // generate User Id
    //   // const genId = await this.genUserIdService.index('MMK');
    //   // return {
    //   //   data:genId
    //   // }
    //   const userIdUpper = dto.userid.toUpperCase()
    //   const user = await this.prisma.user.create({
    //     data: {
    //       userId: userIdUpper,
    //       hash,
    //       agentId: agentId,
    //       wallet: {
    //         create: {
    //           name: `${currency.name}-${agentId}`,
    //           balance: 0,
    //         }
    //       }
    //     },
    //   });
  
    //   delete user.hash;
    //   // return the saved user
    //   return {
    //     status: true,
    //     msg: 'signed up successfully',
    //     data: user
    //   }
    // } catch(error) {
    //   if (error instanceof PrismaClientKnownRequestError) {
    //     if (error.code === 'P2002') {
    //       throw new ForbiddenException(
    //         'Credentials taken, User id has been used',
    //       );
    //     }
    //   }
    //   throw error;
    // }
  }
}