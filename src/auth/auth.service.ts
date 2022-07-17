import { ForbiddenException, HttpCode, HttpStatus, Injectable, Res } from "@nestjs/common";
import { AuthDto, SignUpDto } from "./dto";
import * as argon from 'argon2';
import { GenerateUserIdService } from "src/helper/genUserId/genUserIdHelper.service";
import { HttpService } from "@nestjs/axios";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Currency } from "src/models/currency.entity";
import { User } from "src/models/user.entity";
import { Wallet } from "src/models/wallet.entity";
import { Agent } from "src/models/agent.entity";
import { HitProviderService } from "src/helper/hitProvider/hitProviderHelper.service";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Currency) private currenciesRepository: Repository<Currency>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Wallet) private walletsRepository: Repository<Wallet>,
    @InjectRepository(Agent) private agentsRepository: Repository<Agent>,
    // private genUserIdService: GenerateUserIdService
    // private readonly httpService: HttpService,
    private hitProviderService: HitProviderService
  ) {}

  async signin(dto: AuthDto) {
    // find the user by email
    const user = await this.usersRepository.findOne({
      relations: {
        agent: true,
      },
      where: {
        userId: dto.userid,
      }
    });
    // if user doesn't exist throw exception
    if (!user) throw new ForbiddenException('Credentials incorrect, please check the user id')
    // compare password
    const pwMatches = await argon.verify(user.hash,dto.password)
    // if password incorrect throw exception
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect')
    // hit api provider
    const params = {
      apiKey: user.agent.apiKey,
      agentId: user.agent.agentId,
      userId: user.userId,
      lang: dto.lang,
      se: dto.se,
      im: dto.im,
      ot: dto.ot,
    };
    const paramsJson = {
      commisiongroup: dto.commisiongroup,
      creditLimit: dto.creditLimit,
      suspended: dto.suspended,
      active: dto.active,
      firstname: dto.firstname,
      lastname: dto.lastname,
      phone: dto.phone,
      mobile: dto.mobile,
      minbet: dto.minbet,
      commisiongrphdp: dto.commisiongrphdp,
      commisiongrp1x2: dto.commisiongrp1x2,
      commisiongrpother: dto.commisiongrpother,
      commisionmixparlay3: dto.commisionmixparlay3,
      commisionmixparlay4: dto.commisionmixparlay4,
      commisionmixparlay5: dto.commisionmixparlay5,
      myposgrphdp: dto.myposgrphdp,
      myposgrp1x2: dto.myposgrp1x2,
      myposgrpothers: dto.myposgrpothers,
      myposgrpmixparlay: dto.myposgrpmixparlay,
      maxbetgrphdp: dto.maxbetgrphdp,
      maxpermatchgrphdp: dto.maxpermatchgrphdp,
      maxbetgrp1x2: dto.maxbetgrp1x2,
      maxpermatchgrp1x2: dto.maxpermatchgrp1x2,
      maxbetgrpmixparlay: dto.maxbetgrpmixparlay,
      maxpermatchgrpmixparlay: dto.maxpermatchgrpmixparlay,
      maxbetgrpothersodds: dto.maxbetgrpothersodds,
      maxpermatchgrpothersodds: dto.maxpermatchgrpothersodds,
      maxbetgrpspecial: dto.maxbetgrpspecial,
      maxpermatchgrpspecial: dto.maxpermatchgrpspecial,
      maxbetgrpbasketball: dto.maxbetgrpbasketball,
      maxpermatchgrpbasketball: dto.maxpermatchgrpbasketball,
      maxbetgrpotherssport: dto.maxbetgrpotherssport,
      maxpermatchgrpotherssport: dto.maxpermatchgrpotherssport,
    }
    const hitProvider = await this.hitProviderService.login(params,paramsJson);
    // send back the user

    return {
      status: true,
      msg: 'signed in',
      data: user.userId,
      loginUrl: hitProvider,
    }
  }

  async signup(dto: SignUpDto) {
    // Generate the password hash
    const hash = await argon.hash(dto.password);
    // save the new user in the DB
    try {
      // get agentId from currency value
      const currency = await this.currenciesRepository.findOne({
        relations: {
          agents: true,
        },
        where: {
          code: dto.currency,
        }
      });
      if (!currency) throw new ForbiddenException('Currency code is wrong, please check again');
      const agentId: string = currency.agents[0].agentId;
      // get agentId instansce
      const agent = await this.agentsRepository.findOneBy({
        agentId: agentId,
      });
      const userIdUpper = dto.userid.toUpperCase()
      const newUser = await this.usersRepository.create({
        userId: userIdUpper,
        hash,
        agent, 
      });
      const newWallet = await this.walletsRepository.create({
        name: `${currency.name}-${agentId}`,
        balance: 0,
      })
      newUser.wallet = newWallet;
      const userSaved = await this.usersRepository.save(newUser);
      return {
        status: true,
        msg: 'signed up successfully',
        data: {
          userid: userSaved.userId,
        },
      }
    } catch (error) {
      if (error.code === '23505') throw new ForbiddenException('Credentials taken, User id has been used')
      // handle error
      throw error;
    }
  }
}