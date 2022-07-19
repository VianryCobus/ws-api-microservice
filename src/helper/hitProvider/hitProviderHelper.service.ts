import { Injectable } from "@nestjs/common";
import axios from "axios";
// import { PrismaService } from "src/prisma/prisma.service";
const logFromProvider = require('../../utils/log/logFromProvider');

@Injectable()
export class HitProviderService {
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
    let Url: string = `https://s-pi-spr.ww365.club/api/SportMember/${agentId}${userId}/Login?agentId=${agentId}&hash=${Hash}`;
    for(const p in objAddParams) {
      objAddParams[p].value ? Url += `&${objAddParams[p].key}=${objAddParams[p].value}` : false;
    };
    logFromProvider.debug({
      message: {
        type: 'Hit Provider API get login',
        params: {
          hashOrigin: `${apiKey}agentid=${agentId}&userid=${agentId}${userId}`,
          hash: Hash,
          Url: Url,
        }
      }
    });
    const getProvider = await axios.post(Url,paramsJson);
    logFromProvider.debug({
      message: {
        type: 'Return Hit Provider API get login',
        params: getProvider.data,
      }
    });
    let responseProvider: String;
    switch(getProvider.data.status){
      case 'success':
        responseProvider = getProvider.data.data.loginUrl;
        break;
      case 'fail':
        responseProvider = getProvider.data.message;
        break;
      default:
    }
    return responseProvider;
  }
}