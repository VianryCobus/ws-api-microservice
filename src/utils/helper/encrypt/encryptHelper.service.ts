import { Injectable } from "@nestjs/common";

@Injectable()
export class EncryptHelperService {
  private md5 = require('md5');
  constructor(){}
  async encryptDecryptMd5(
    action,
    params,
  ) {
    let returnData: string;
    if(action == 'encrypt'){
      
    }
    return returnData;
  }
}