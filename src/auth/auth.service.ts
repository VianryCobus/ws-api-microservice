import { ForbiddenException, HttpCode, HttpStatus, Injectable, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthDto, LogoutDto, SignUpClientDto, SignUpDto } from "./dto";
import * as bcrypt from 'bcrypt';
import { GenerateUserIdService } from "src/utils/helper/genUserId/genUserIdHelper.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Agent, Client, Currency, User, Wallet } from "src/models";
import { EncryptService, HitProviderService, JwtHelperService } from "src/utils/helper";
import { UserService } from "src/user/user.service";
import { ClientService } from "src/client/client.service";

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
    private jwtHelperService: JwtHelperService,
    private clientService: ClientService,
  ) {}

  async signin(dto: AuthDto, headers) {
    // decode request headers
    const dataClientDecode: any = await this.jwtHelperService.decodeToken(headers.authorization);

    if(!dataClientDecode.status) throw new ForbiddenException(`Please provide the correct Client token`);

    // find the client
    const client = await this.clientsRepository.findOne({
      relations: {
        agent: true,
        users: true,
      },
      where: {
        clientKey: dataClientDecode.headerAuth,
        code: dataClientDecode.objFromToken.sub,
        username: dataClientDecode.objFromToken.username,
        agent: {
          agentId: dataClientDecode.objFromToken.agentId,
          apiKey: dataClientDecode.objFromToken.agentApiKey,
        },
        users: {
          userId: dto.userid,
        }
      }
    });
    // return client;
    // check if the client token is correct
    if (!client) throw new ForbiddenException(`Token isn't valid`);
    
    // find the user by userId and clientToken
    const user = await this.usersRepository.findOne({
      relations: {
        client: {
          agent: true,
        }
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
      apiKey: user.client.agent.apiKey,
      agentId: user.client.agent.agentId,
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
      commisiongrpothers: dto.commisiongrpothers,
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
      const dataClientDecode: any = await this.jwtHelperService.decodeToken(headers.authorization);

      if(!dataClientDecode.status) throw new ForbiddenException(`Please provide the correct Client token`);

      // find the client
      const client = await this.clientsRepository.findOne({
        relations: {
          agent: true,
        },
        where: {
          clientKey: dataClientDecode.headerAuth,
          code: dataClientDecode.objFromToken.sub,
          username: dataClientDecode.objFromToken.username,
          agent: {
            agentId: dataClientDecode.objFromToken.agentId,
            apiKey: dataClientDecode.objFromToken.agentApiKey,
          }
        }
      });

      if(!client) throw new ForbiddenException(`Token isn't valid`)

      const agentId: string = client.agent.agentId
      const userIdUpper = dto.userid.toUpperCase();
      // check user id is exist
      const userExist = await this.userService.getOneUserByUserId(userIdUpper);
      if (userExist) throw new ForbiddenException('Credentials already exist'); 
      // const userIdUpper = dto.userid
      const newUser = await this.usersRepository.create({
        userId: `${client.code}${userIdUpper}`,
        userAgentId: `${agentId}${userIdUpper}`,
        hash,
        username: dto.username,
        client,
      });
      const newWallet = await this.walletsRepository.create({
        name: `${client.agent.currency.name}-${agentId}`,
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

  async signout(dto: LogoutDto, dataClientDecode: any) {
    if(!dataClientDecode.status) throw new ForbiddenException(`Please provide the correct client token`);

    // find the client
    const findClient = await this.clientService.findTheClient(dataClientDecode);

    // if token isn't suitable with client account throw forbidden
    if(!findClient) throw new UnauthorizedException(`Token isn't valid`)
    
    // find the user by userId
    const user = await this.usersRepository.findOne({
      relations: {
        client: {
          agent: true,
        },
      },
      where: {
        userId: dto.userId,
        client: {
          agent: {
            agentKey: findClient.agent.agentKey,
            agentId: findClient.agent.agentId,
            apiKey: findClient.agent.apiKey
          }
        }
      }
    });
    // if user doesn't exist throw exception
    if (!user) throw new ForbiddenException('Credentials incorrect, please check the client Token or userId');
    // hit provider in order to hit provider endpoint
    const params = {
      apiKey: user.client.agent.apiKey,
      agentId: user.client.agent.agentId,
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

  async signupClient(dto: SignUpClientDto, dataClientDecode: any) {
    try {
      if(!dataClientDecode.status) throw new ForbiddenException(`Please provide the correct agent token`);
      
      // find the agent
      const agent = await this.agentsRepository.findOne({
        where: {
          agentKey: dataClientDecode.headerAuth,
          agentId: dataClientDecode.objFromToken.sub,
          apiKey: dataClientDecode.objFromToken.apiKey,
        }
      });
      if (!agent) throw new ForbiddenException(`Token isn't valid!`);
      // username, password, code
      // check if username is exist
      const checkClient = await this.clientsRepository.findOne({
        relations: {
          agent: true,
        },
        where: {
          code: dto.code
        },
      });
      if (checkClient) throw new ForbiddenException(`Username or code is already exist`);
      // payload to encrypt jwt
      const payload = {
        clientCode: dto.code,
        clientUsername: dto.username,
        agentId: agent.agentId,
        agentApiKey: agent.apiKey,
      };
      const signToken = await this.jwtHelperService.signToken(payload,'clientKey');
      const newClient = await this.clientsRepository.create({
        username: dto.username,
        password: dto.password,
        code: dto.code,
        agent,
        clientKey: signToken.access_token,
        autoRegis: dto.autoregis,
      });
      await this.clientsRepository.save(newClient);
      return {
        status: true,
        msg: "Client Created!",
      }
    } catch (error) {
      throw error;
    }
  }
}