import { Injectable } from "@nestjs/common";
import axios from "axios";
// import { PrismaService } from "src/prisma/prisma.service";
import { LoggerHelperService } from "../logger/loggerHelper.service";
require("dotenv").config();

@Injectable()
export class HitProviderService {
  private md5 = require('md5');
  constructor(
    // private prismaService: PrismaService
    private loggerHelperService: LoggerHelperService,
  ){}
  async login(
    params,
    paramsJson
  ) {
    const objAddParams = {
      se: {
        key: 'se',
        value: params.se,
      },
      ot: {
        key: 'ot',
        value: params.ot,
      },
      im: {
        key: 'im',
        value: params.im,
      },
      lang: {
        key: 'lang',
        value: params.lang
      }
    };
    const apiKey: String = params.apiKey;
    const agentId: String = params.agentId;
    const userId: String = params.userId;
    const hashOrigin: String = `${apiKey}agentid=${agentId}&userid=${agentId}${userId}`;
    const Hash = this.md5(hashOrigin);
    let Url: string = `${process.env.WS_URL}/SportMember/${agentId}${userId}/Login?agentId=${agentId}&hash=${Hash}`;
    for(const p in objAddParams) {
      objAddParams[p].value ? Url += `&${objAddParams[p].key}=${objAddParams[p].value}` : false;
    };
    this.loggerHelperService.debugLog(
      'Hit Provider API get login',
      {
        hashOrigin,
        Hash,
        Url,
      }
    );
    const postProvider = await axios.post(Url,paramsJson);
    this.loggerHelperService.debugLog(
      'Return Hit Provider API get login',
      postProvider.data,
    );
    let responseProvider: any;
    switch(postProvider.data.status){
      case 'success':
        responseProvider = {
          status: true,
          loginUrl: postProvider.data.data.loginUrl,
        }
        break;
      case 'fail':
        responseProvider = {
          status: false,
          message: postProvider.data.message,
        }
        break;
      default:
    }
    return responseProvider;
  }

  async logout(params) {
    const apiKey: String = params.apiKey;
    const agentId: String = params.agentId;
    const userId: String = params.userId;
    const hashOrigin: String = `${apiKey}agentid=${agentId}&userid=${agentId}${userId}`;
    const Hash = this.md5(hashOrigin);
    let Url: string = `${process.env.WS_URL}/SportMember/${agentId}${userId}/Logout?agentId=${agentId}&hash=${Hash}`;
    this.loggerHelperService.debugLog(
      'Hit Provider API account logout',
      {
        hashOrigin,
        Hash,
        Url,
      }
    );
    const getProvider = await axios.get(Url);
    this.loggerHelperService.debugLog(
      'Return Hit Provider API account logout',
      getProvider.data
    );
    let responseProvider: Boolean;
    switch(getProvider.data.status){
      case 'success':
        responseProvider = true;
        break;
      case 'fail':
        responseProvider = false;
        break;
      default:
    }
    return responseProvider;
  }

  // fetch ticket detail transaction
  async ticket(params) {
    const ticketBetId: String = params.ticketBetId;
    const agentId: String = params.agentId;
    const apiKey: String = params.apiKey;
    const hashOrigin: String = `${apiKey}agentid=${agentId}`;
    const Hash = this.md5(hashOrigin);
    let Url: string = `${process.env.WS_URL}/SportAgent/${agentId}/Ticket?hash=${Hash}&ticketid=${ticketBetId}`;
    this.loggerHelperService.debugLog(
      'Hit Provider API fetch ticket details',
      {
        hashOrigin,
        Hash,
        Url,
      }
    );
    const getProvider = await axios.get(Url);
    this.loggerHelperService.debugLog(
      'Return Hit Provider API fetch ticket details',
      getProvider.data
    );
    let responseProvider: any;
    switch(getProvider.data.status){
      case 'success':
        responseProvider = {
          status: true,
          data: getProvider.data.data,
        };
        break;
      case 'fail':
        responseProvider = {
          status: false,
          data: getProvider.data.data,
        };
        break;
      default:
    }
    return responseProvider;
  }

  // fetch ticket parlay
  async ticketParlay(params) {
    const ticketBetId: String = params.ticketBetId;
    const agentId: String = params.agentId;
    const apiKey: String = params.apiKey;
    const hashOrigin: String = `${apiKey}agentid=${agentId}`;
    const Hash = this.md5(hashOrigin);
    let Url: string = `${process.env.WS_URL}/SportAgent/${agentId}/Parlay?hash=${Hash}&ticketid=${ticketBetId}`;
    this.loggerHelperService.debugLog(
      'Hit Provider API fetch ticket details parlay',
      {
        hashOrigin,
        Hash,
        Url,
      }
    );
    const getProvider = await axios.get(Url);
    this.loggerHelperService.debugLog(
      'Return Hit Provider API fetch ticket details parlay',
      getProvider.data
    );
    let responseProvider: any;
    switch(getProvider.data.status){
      case 'success':
        responseProvider = {
          status: true,
          data: getProvider.data.data,
        };
        break;
      case 'fail':
        responseProvider = {
          status: false,
          data: getProvider.data.data,
        };
        break;
      default:
    }
    return responseProvider;
  }
}