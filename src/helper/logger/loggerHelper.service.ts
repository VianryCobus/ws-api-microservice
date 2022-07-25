import { Injectable } from "@nestjs/common";

@Injectable()
export class LoggerHelperService {
  private logFromProvider = require('../../utils/log/logFromProvider');
  debugLog(type: string,params: any){
    return this.logFromProvider.debug({
      message: {
        type,
        params,
      }
    });
  }
}