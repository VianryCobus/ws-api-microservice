import { Injectable } from "@nestjs/common";
import logFromProvider from '../../log/logFromProvider';

@Injectable()
export class LoggerHelperService {
  private logFromProvider = logFromProvider;
  debugLog(type: string,params: any){
    return this.logFromProvider.debug({
      message: {
        type,
        params,
      }
    });
  }
}