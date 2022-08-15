import { ForbiddenException, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { Agent, Client, Config, Currency, HistoryLogin, User, Wallet } from "src/models";
import { UserService } from "src/user/user.service";
import * as bcrypt from 'bcrypt';
import { EncryptService, GenerateUserIdService, HitProviderService, JwtHelperService } from "src/utils/helper";
import { DataSource, Repository } from "typeorm";
import { ClientAuthDto, ClientLoginAppDto, ClientSignUpDto } from "./dto";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

@Injectable()
export class ClientService {
  private geoip = require('geoip-lite');
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Currency) private currenciesRepository: Repository<Currency>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Wallet) private walletsRepository: Repository<Wallet>,
    @InjectRepository(Agent) private agentsRepository: Repository<Agent>,
    @InjectRepository(Client) private clientsRepository: Repository<Client>,
    @InjectRepository(Config) private configsRepository: Repository<Config>,
    @InjectRepository(HistoryLogin) private historyLoginsRepository: Repository<HistoryLogin>,
    @InjectQueue('ws-queue') private queue:Queue,
    private genUserIdService: GenerateUserIdService,
    private userService: UserService,
    private hitProviderService: HitProviderService,
    private encryptService: EncryptService,
    private jwtHelperService: JwtHelperService,
  ){}

  // Old Login function
  async login(dto: ClientAuthDto, headers) {
    // check game id
    await this.checkGameId(dto.game_id);
    // check ip location
    let langGame: string = 'en'; 
    try {
      const locationIp = this.geoip.lookup(dto.ip);
      if(locationIp.country == 'CN')
        langGame = 'zh-cn';
      else if(locationIp.country == 'ID')
        langGame = 'id-id';
      else if(locationIp.country == 'TH')
        langGame = 'th-th';
      else if(locationIp.country == 'VN')
        langGame = 'vi-vn';
    } catch (error) {
      throw new UnauthorizedException('Please provide the correct ip format');
    }

    // decode request headers
    const dataClientDecode: any = await this.jwtHelperService.decodeToken(headers.authorization);

    if(!dataClientDecode.status) throw new UnauthorizedException(`Please provide the correct Client token`);

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
          username: dto.username,
        }
      }
    });
    // return client;
    // check if the client token is correct
    if (!client) throw new UnauthorizedException(`Token or username isn't exist`);
    
    // find the user by userId and clientToken
    const user = await this.decideRealOrFunUser(
      dto.username,
      dto.fun_mode,
    );
    // compare password
    const pwMatches = await bcrypt.compare(dto.password,user.hash)
    // if password incorrect throw exception
    if (!pwMatches) throw new UnauthorizedException('Credentials incorrect')
    // hit api provider
    const params = {
      apiKey: user.client.agent.apiKey,
      agentId: user.client.agent.agentId,
      userId: user.userId,
      // lang: dto.lang,
      lang: langGame,
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
      // responseToUser = {
      //   status: true,
      //   msg: 'signed in',
      //   data: user.userId,
      //   loginUrl: hitProvider,
      // }
      responseToUser = {
        code: 0,
        url: hitProvider.loginUrl,
      }

      // add to queue in order to record login history
      await this.queue.add('login-history-job',{
        ip: dto.ip,
      },{
        removeOnComplete: true,
        delay: 3000,
      });
    } else {
      // responseToUser = {
      //   status: true,
      //   msg: hitProvider.message,
      //   data: user.userId,
      //   loginUrl: null,
      // }
      responseToUser = {
        code: 1,
        message: hitProvider.message,
      }
    }
    return responseToUser;
  }

  async loginNew(dto: ClientAuthDto, headers) {
    if(!dto.fun_mode){
      dto.fun_mode = 0;
    }
    // check game id
    await this.checkGameId(dto.game_id);
    // get client token
    const findClient = await this.findTheClient(headers.authorization);

    // if token isn't suitable with client account throw forbidden
    if(!findClient) throw new UnauthorizedException(`Token isn't valid`)

    if(findClient.autoRegis) {
      // check user id is exist
      const userIdUpper = dto.username.toUpperCase();
      if(dto.fun_mode === 0){
        const userExist = await this.checkUserExist(dto.username,userIdUpper);
        // REGISTER PLAYER
        if(!userExist) {
          // Generate the password hash
          const salt = await bcrypt.genSalt();
          const hash = await bcrypt.hash(dto.password, salt);
          // save the new user in the DB
          try {
            const client = await this.findTheClient(headers.authorization);
            const agentId: string = client.agent.agentId
            const userIdUpper = dto.username.toUpperCase();

            // create account REAL MODE
            const newUser = await this.usersRepository.create({
              userId: `${client.code}${userIdUpper}`,
              userAgentId: `${agentId}${client.code}${userIdUpper}`,
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
            // action save
            const userSaved = await this.usersRepository.save(newUser);

            let returnData;
            if (userSaved) {
              // returnData = {
              //   status: true,
              //   msg: 'signed up successfully',
              //   data: {
              //     username: dto.username,
              //     userid: userSaved.userId,
              //     useridFun: userSavedFun.userId,
              //   },
              // }
            } else {
              // returnData = {
              //   status: false,
              //   msg: 'signed up failed',
              // }
              throw new HttpException('signed up failed',HttpStatus.BAD_REQUEST)
            }
            // return returnData;
          } catch (error) {
            if (error.code === '23505') throw new HttpException('Credentials taken, User id has been used',HttpStatus.BAD_REQUEST)
            // handle error
            throw error;
          }
        }
      }
    }

    // LOGIN PLAYER
    // check ip location
    let langGame: string = 'en'; 
    try {
      const locationIp = this.geoip.lookup(dto.ip);
      if(locationIp.country == 'CN')
        langGame = 'zh-cn';
      else if(locationIp.country == 'ID')
        langGame = 'id-id';
      else if(locationIp.country == 'TH')
        langGame = 'th-th';
      else if(locationIp.country == 'VN')
        langGame = 'vi-vn';
    } catch (error) {
      throw new UnauthorizedException('Please provide the correct ip format');
    }
    // decode request headers
    const dataClientDecode: any = await this.jwtHelperService.decodeToken(headers.authorization);

    if(!dataClientDecode.status) throw new UnauthorizedException(`Please provide the correct Client token`);

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
          username: dto.username,
        }
      }
    });
    // return client;
    // check if the client token is correct
    if (!client) throw new UnauthorizedException(`Token or username isn't exist`);
    
    // find the user by userId and clientToken
    const user = await this.decideRealOrFunUser(
      dto.username,
      dto.fun_mode,
    );
    // compare password
    // this condition only running in REAL MODE
    if(dto.fun_mode === 0){
      // const pwMatches = await bcrypt.compare(dto.password,user.hash)
      // // if password incorrect throw exception
      // if (!pwMatches) throw new UnauthorizedException('Credentials incorrect')
    }
    // hit api provider
    const params = {
      apiKey: user.client.agent.apiKey,
      agentId: user.client.agent.agentId,
      userId: user.userId,
      // lang: dto.lang,
      lang: langGame,
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
      // responseToUser = {
      //   status: true,
      //   msg: 'signed in',
      //   data: user.userId,
      //   loginUrl: hitProvider,
      // }
      responseToUser = {
        code: 0,
        url: hitProvider.loginUrl,
      }
      // add to queue in order to record login history
      await this.queue.add('login-history-job',{
        ip: dto.ip,
      },{
        removeOnComplete: true,
        delay: 3000,
      });
    } else {
      // responseToUser = {
      //   status: true,
      //   msg: hitProvider.message,
      //   data: user.userId,
      //   loginUrl: null,
      // }
      responseToUser = {
        code: 1,
        message: hitProvider.message,
      }
    }
    return responseToUser;
  }

  async register(dto: ClientSignUpDto, headers) {
    // check game id
    await this.checkGameId(dto.game_id);
    // Generate the password hash
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(dto.password, salt);
    // save the new user in the DB
    try {
      const dataClientDecode: any = await this.jwtHelperService.decodeToken(headers.authorization);

      if(!dataClientDecode.status) throw new UnauthorizedException(`Please provide the correct Client token`);

      // find the client
      const client = await this.clientsRepository.findOne({
        relations: {
          agent: {
            currency: true,
          }
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

      // if token isn't suitable with client account throw forbidden
      if(!client) throw new UnauthorizedException(`Token isn't valid`)

      // if currency code isn't suuitable with dto currency, throw forbidden
      if(client.agent.currency.code != dto.currency) throw new UnauthorizedException(`Currency isn't suitable with agent currency`)

      const agentId: string = client.agent.agentId
      const userIdUpper = dto.username.toUpperCase();
      // check user id is exist
      const userExist = await this.checkUserExist(dto.username,userIdUpper);
      if(userExist) throw new UnauthorizedException('Credentials already exist');
      // const userIdUpper = dto.userid

      // create account REAL MODE
      const newUser = await this.usersRepository.create({
        userId: `${client.code}${userIdUpper}`,
        userAgentId: `${agentId}${client.code}${userIdUpper}`,
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
      // action save
      const userSaved = await this.usersRepository.save(newUser);

      let returnData;
      if (userSaved) {
        // returnData = {
        //   status: true,
        //   msg: 'signed up successfully',
        //   data: {
        //     username: dto.username,
        //     userid: userSaved.userId,
        //     useridFun: userSavedFun.userId,
        //   },
        // }
        returnData = {
          code: 0,
          msg: 'signed up successfully'
        }
      } else {
        // returnData = {
        //   status: false,
        //   msg: 'signed up failed',
        // }
        throw new HttpException('signed up failed',HttpStatus.BAD_REQUEST)
      }
      return returnData;
    } catch (error) {
      if (error.code === '23505') throw new HttpException('Credentials taken, User id has been used',HttpStatus.BAD_REQUEST)
      // handle error
      throw error;
    }
  }

  async registerFunMode(dto: ClientSignUpDto, headers) {
    // check game id
    await this.checkGameId(dto.game_id);
    // Generate the password hash
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(dto.password, salt);
    // save the new user in the DB
    try {
      const dataClientDecode: any = await this.jwtHelperService.decodeToken(headers.authorization);

      if(!dataClientDecode.status) throw new UnauthorizedException(`Please provide the correct Client token`);

      // find the client
      const client = await this.clientsRepository.findOne({
        relations: {
          agent: {
            currency: true,
          }
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

      // if token isn't suitable with client account throw forbidden
      if(!client) throw new UnauthorizedException(`Token isn't valid`)

      // if currency code isn't suuitable with dto currency, throw forbidden
      if(client.agent.currency.code != dto.currency) throw new UnauthorizedException(`Currency isn't suitable with agent currency`)

      const agentId: string = client.agent.agentId
      const userIdUpper = dto.username.toUpperCase();
      // check user id is exist
      const userExist = await this.checkUserFunModeExist(dto.username,userIdUpper);
      if(userExist) throw new UnauthorizedException('Credentials already exist');
      // const userIdUpper = dto.userid

      // create account FUN MODE
      const newUserFun = await this.usersRepository.create({
        userId: `F_${client.code}${userIdUpper}`,
        userAgentId: `${agentId}F_${client.code}${userIdUpper}`,
        hash,
        username: dto.username,
        client,
        mode: 1
      });
      const newWalletFun = await this.walletsRepository.create({
        name: `${client.agent.currency.name}-${agentId}`,
        balance: 100,
      })
      // this is make relation with cascade join
      newUserFun.wallet = newWalletFun;
      // action save
      const userSavedFun = await this.usersRepository.save(newUserFun);

      let returnData;
      if (userSavedFun) {
        // returnData = {
        //   status: true,
        //   msg: 'signed up successfully',
        //   data: {
        //     username: dto.username,
        //     userid: userSaved.userId,
        //     useridFun: userSavedFun.userId,
        //   },
        // }
        returnData = {
          code: 0,
          msg: 'signed up successfully'
        }
      } else {
        // returnData = {
        //   status: false,
        //   msg: 'signed up failed',
        // }
        throw new HttpException('signed up failed',HttpStatus.BAD_REQUEST)
      }
      return returnData;
    } catch (error) {
      if (error.code === '23505') throw new HttpException('Credentials taken, User id has been used',HttpStatus.BAD_REQUEST)
      // handle error
      throw error;
    }
  }

  async loginApp(dto: ClientLoginAppDto, headers) {
    // check game id
    await this.checkGameId(dto.game_id);
    // check user id is exist
    const userIdUpper = dto.username.toUpperCase();
    if(dto.fun_mode === 0){
      const userExist = await this.checkUserExist(dto.username,userIdUpper);
      console.log(userExist);
      // REGISTER PLAYER
      if(!userExist) {
        // Generate the password hash
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash('ws-sport', salt);
        // save the new user in the DB
        try {
          const dataClientDecode: any = await this.jwtHelperService.decodeToken(headers.authorization);

          if(!dataClientDecode.status) throw new UnauthorizedException(`Please provide the correct Client token`);

          // find the client
          const client = await this.clientsRepository.findOne({
            relations: {
              agent: {
                currency: true,
              }
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

          // if token isn't suitable with client account throw forbidden
          if(!client) throw new UnauthorizedException(`Token isn't valid`)

          const agentId: string = client.agent.agentId
          const userIdUpper = dto.username.toUpperCase();

          // create account REAL MODE
          const newUser = await this.usersRepository.create({
            userId: `${client.code}${userIdUpper}`,
            userAgentId: `${agentId}${client.code}${userIdUpper}`,
            hash,
            username: dto.username,
            client,
            playerToken: dto.token,
          });
          const newWallet = await this.walletsRepository.create({
            name: `${client.agent.currency.name}-${agentId}`,
            balance: 0,
          })
          // this is make relation with cascade join
          newUser.wallet = newWallet;
          // action save
          const userSaved = await this.usersRepository.save(newUser);

          let returnData;
          if (userSaved) {
            // returnData = {
            //   status: true,
            //   msg: 'signed up successfully',
            //   data: {
            //     username: dto.username,
            //     userid: userSaved.userId,
            //     useridFun: userSavedFun.userId,
            //   },
            // }
          } else {
            // returnData = {
            //   status: false,
            //   msg: 'signed up failed',
            // }
            throw new HttpException('signed up failed',HttpStatus.BAD_REQUEST)
          }
          // return returnData;
        } catch (error) {
          if (error.code === '23505') throw new HttpException('Credentials taken, User id has been used',HttpStatus.BAD_REQUEST)
          // handle error
          throw error;
        }
      }
    }

    // LOGIN PLAYER
    // check ip location
    let langGame: string = 'en'; 
    try {
      const locationIp = this.geoip.lookup(dto.ip);
      if(locationIp.country == 'CN')
        langGame = 'zh-cn';
      else if(locationIp.country == 'ID')
        langGame = 'id-id';
      else if(locationIp.country == 'TH')
        langGame = 'th-th';
      else if(locationIp.country == 'VN')
        langGame = 'vi-vn';
    } catch (error) {
      throw new UnauthorizedException('Please provide the correct ip format');
    }
    // decode request headers
    const dataClientDecode: any = await this.jwtHelperService.decodeToken(headers.authorization);

    if(!dataClientDecode.status) throw new UnauthorizedException(`Please provide the correct Client token`);

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
          username: dto.username,
        }
      }
    });
    // return client;
    // check if the client token is correct
    if (!client) throw new UnauthorizedException(`Token or username isn't exist`);
    
    // find the user by userId and clientToken
    const user = await this.decideRealOrFunUser(
      dto.username,
      dto.fun_mode,
    );
    // if player Token incorrect throw exception
    // this condition only running in REAL MODE
    if(dto.fun_mode === 0){
      if (dto.token != user.playerToken) throw new UnauthorizedException('Credentials incorrect')
    }
    // hit api provider
    const params = {
      apiKey: user.client.agent.apiKey,
      agentId: user.client.agent.agentId,
      userId: user.userId,
      // lang: dto.lang,
      lang: langGame,
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
      // responseToUser = {
      //   status: true,
      //   msg: 'signed in',
      //   data: user.userId,
      //   loginUrl: hitProvider,
      // }
      responseToUser = {
        code: 0,
        url: hitProvider.loginUrl,
      }
      // add to queue in order to record login history
      await this.queue.add('login-history-job',{
        ip: dto.ip,
      },{
        removeOnComplete: true,
        delay: 3000,
      });
    } else {
      // responseToUser = {
      //   status: true,
      //   msg: hitProvider.message,
      //   data: user.userId,
      //   loginUrl: null,
      // }
      responseToUser = {
        code: 1,
        message: hitProvider.message,
      }
    }
    return responseToUser;
  }

  async checkGameId(gameIdInput: string) {
    let gameId: string = "WS001";
    if(gameIdInput) {
      gameId = gameIdInput;
      // check gameId on config
      const checkConfig = await this.configsRepository.findOne({
        where: {
          gameId
        }
      });
      if(!checkConfig) throw new UnauthorizedException(`Please provide the correct Game id`);
    }
  }

  async checkUserExist(username: string, userIdUpper: string) {
    const userExist = await this.userService.getOneUserByUsernameAndUserId(username,userIdUpper);
    if (userExist) return true;
    return false;
  }
  
  async checkUserFunModeExist(username: string, userIdUpper: string) {
    const userExist = await this.userService.getOneUserByUsernameAndUserIdFunMode(username,userIdUpper);
    if (userExist) return true;
    return false;
  }

  async findTheClient(token: string) {
    const dataClientDecode: any = await this.jwtHelperService.decodeToken(token);
    if(!dataClientDecode.status) throw new UnauthorizedException(`Please provide the correct Client token`);

    // find the client
    const client = await this.clientsRepository.findOne({
      relations: {
        agent: {
          currency: true,
        }
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
    return client;
  }

  async decideRealOrFunUser(
    username: string, 
    funMode: number,
  ) {
    let user: any;
    if(funMode === 0) {
      user = await this.usersRepository.findOne({
        relations: {
          client: {
            agent: true,
          }
        },
        where: {
          username: username,
          mode: funMode,
        }
      });
      // if user doesn't exist throw exception
      if (!user) throw new UnauthorizedException('Credentials incorrect, please check the user id or mode options');
    } else if(funMode === 1) {
      user = await this.dataSource
        .createQueryBuilder(User,"user")
        .innerJoinAndSelect(Client,"client","user.clientId = client.id")
        .innerJoinAndSelect(Agent,"agent","client.agentId = agent.id")
        .where("user.mode = :mode", { mode: funMode })
        .orderBy("RANDOM()")
        .getRawOne();
      // if user fun mode doesn't exist
      if (!user) throw new UnauthorizedException(`Fun Mode user isn't exist`)
      user = {
        userId: user.user_userId,
        client : {
          agent : {
            apiKey: user.agent_apiKey,
            agentId: user.agent_agentId,
          }
        }
      }
    } else {
      // if fun mode doesn't exist
      throw new UnauthorizedException(`Fun Mode isn't detect`)
    }
    return user;
  }
}