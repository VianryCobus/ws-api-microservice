import { ForbiddenException, HttpCode, HttpStatus, Injectable, Res, UseGuards } from "@nestjs/common";
import { AuthDto, LogoutDto, SignUpClientDto, SignUpDto } from "./dto";
import * as bcrypt from 'bcrypt';
import { GenerateUserIdService } from "src/utils/helper/genUserId/genUserIdHelper.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Agent, Client, Currency, User, Wallet } from "src/models";
import { EncryptService, HitProviderService } from "src/utils/helper";
import { UserService } from "src/user/user.service";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Currency) private currenciesRepository: Repository<Currency>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Wallet) private walletsRepository: Repository<Wallet>,
    @InjectRepository(Agent) private agentsRepository: Repository<Agent>,
    @InjectRepository(Client) private clientsRepository: Repository<Client>,
    private genUserIdService: GenerateUserIdService,
    private userService: UserService,
    // private readonly httpService: HttpService,
    private hitProviderService: HitProviderService,
    private encryptService: EncryptService,
    private jwt: JwtService,
  ) {}

  async signin(dto: AuthDto) {
    // return this.decodeToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVQVRBQU1LSCIsImFwaUtleSI6IjlmZUV1MGs3d3JxVHVjck9FN1VoIn0.HIOOpDwLvZyyBi5S0sRCw7isIJj6MW-0b17D3ipGUZk');
    // return this.signToken('UATAAMKH','9feEu0k7wrqTucrOE7Uh');
    // find the user by userId
    const user = await this.usersRepository.findOne({
      relations: {
        agent: true,
      },
      where: {
        userId: dto.userid,
      }
    });
    // if user doesn't exist throw exception
    if (!user) throw new ForbiddenException('Credentials incorrect, please check the user id');
    // compare password
    const pwMatches = await bcrypt.compare(dto.password,user.hash)
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
    // hit provider in order to hit provider endpoint
    let responseToUser: any;
    const hitProvider = await this.hitProviderService.login(params,paramsJson);
    // send back the user
    if(hitProvider.status){
      responseToUser = {
        status: true,
        msg: 'signed in',
        data: user.userId,
        loginUrl: hitProvider,
      }
    } else {
      responseToUser = {
        status: true,
        msg: hitProvider.message,
        data: user.userId,
        loginUrl: null,
      }
    }
    return responseToUser;
  }

  async signup(dto: SignUpDto, headers) {
    // Generate the password hash
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(dto.password, salt);
    // save the new user in the DB
    try {
      const dataAgentDecode: any = await this.decodeToken(headers.authorization);

      // get agentId instansce
      const agent = await this.agentsRepository.findOne({
        where: {
          agentId: dataAgentDecode.sub,
          apiKey: dataAgentDecode.apiKey,
        },
        relations: {
          currency: true,
        }
      });

      if(!agent) throw new ForbiddenException(`Token isn't valid`)

      const agentId: string = agent.agentId
      const userIdUpper = dto.userid.toUpperCase();
      // check user id is exist
      const userExist = await this.userService.getOneUserByUserId(userIdUpper);
      if (userExist) throw new ForbiddenException('Credentials already exist'); 
      // const userIdUpper = dto.userid
      const newUser = await this.usersRepository.create({
        userId: userIdUpper,
        userAgentId: `${agentId}${userIdUpper}`,
        hash,
        agent,
      });
      const newWallet = await this.walletsRepository.create({
        name: `${agent.currency.name}-${agentId}`,
        balance: 0,
      })
      // this is make relation with cascade join
      newUser.wallet = newWallet;
      // return await this.genUserIdService.index(dto.currency);
      // action save
      const userSaved = await this.usersRepository.save(newUser);
      let returnData;
      if (userSaved) {
        returnData = {
          status: true,
          msg: 'signed up successfully',
          data: {
            userid: userSaved.userId,
          },
        }
      } else {
        returnData = {
          status: false,
          msg: 'signed up failed',
        }
      }
      return returnData;
    } catch (error) {
      if (error.code === '23505') throw new ForbiddenException('Credentials taken, User id has been used')
      // handle error
      throw error;
    }
  }

  async signout(dto: LogoutDto) {
    // find the user by userId
    const user = await this.usersRepository.findOne({
      relations: {
        agent: true,
      },
      where: {
        userId: dto.userId
      }
    });
    // if user doesn't exist throw exception
    if (!user) throw new ForbiddenException('Credentials incorrect, please check the userId');
    // hit provider in order to hit provider endpoint
    const params = {
      apiKey: user.agent.apiKey,
      agentId: user.agent.agentId,
      userId: user.userId,
    };
    let responseToUser: Object;
    const hitProvider: any = await this.hitProviderService.logout(params);
    if(hitProvider){
      responseToUser = {
        status: true,
        msg: 'signed out',
        data: user.userId,
      }
    } else {
      responseToUser = {
        status: false,
        msg: 'failed signed out',
        data: user.userId,
      }
    }
    return responseToUser;
  }

  async signupClient(dto: SignUpClientDto) {
    try {
      // username, password, code
      // check if username is exist
      const checkClient = await this.clientsRepository.findOne({
        where: {
          username: dto.username,
        }
      });
      if (checkClient) throw new ForbiddenException('Username is already exist');
      const newClient = await this.clientsRepository.create({
        username: dto.username,
        password: dto.password,
        code: dto.code,
      });
      await this.clientsRepository.save(newClient);

    } catch (error) {
      throw error;
    }
  }

  async signToken(agentId: string, apiKey: string): Promise<{ access_token: string }> {
    const payload = {
      sub: agentId,
      apiKey,
    }
    const token = await this.jwt.signAsync(payload, {
      // expiresIn: '1m',
      secret: 'tes',
    });

    return {
      access_token: token,
    }
  }

  async decodeToken(token) {
    const headerAuth: string = token.replace('Bearer ','');
    const objFromToken = await this.jwt.decode(headerAuth);
    return objFromToken;
  }
}