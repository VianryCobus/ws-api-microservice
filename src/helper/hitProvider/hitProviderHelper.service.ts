import { Injectable } from "@nestjs/common";
import axios from "axios";
// import { PrismaService } from "src/prisma/prisma.service";
require("dotenv").config();

@Injectable()
export class HitProviderService {
  private logFromProvider = require('../../utils/log/logFromProvider');
  private md5 = require('md5');
  // constructor(private prismaService: PrismaService){}
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
    const Hash = this.md5(`${apiKey}agentid=${agentId}&userid=${agentId}${userId}`);
    let Url: string = `${process.env.WS_URL}/SportMember/${agentId}${userId}/Login?agentId=${agentId}&hash=${Hash}`;
    for(const p in objAddParams) {
      objAddParams[p].value ? Url += `&${objAddParams[p].key}=${objAddParams[p].value}` : false;
    };
    this.logFromProvider.debug({
      message: {
        type: 'Hit Provider API get login',
        params: {
          hashOrigin: `${apiKey}agentid=${agentId}&userid=${agentId}${userId}`,
          hash: Hash,
          Url: Url,
        }
      }
    });
    const postProvider = await axios.post(Url,paramsJson);
    this.logFromProvider.debug({
      message: {
        type: 'Return Hit Provider API get login',
        params: postProvider.data,
      }
    });
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
    this.logFromProvider.debug({
      message: {
        type: 'Hit Provider API account logout',
        params: {
          hashOrigin,
          Hash,
          Url,
        }
      }
    });
    const getProvider = await axios.get(Url);
    this.logFromProvider.debug({
      message: {
        type: 'Return Hit Provider API account logout',
        params: getProvider.data
      }
    });
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
}