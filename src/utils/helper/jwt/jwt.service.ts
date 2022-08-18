import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtHelperService {
  constructor(
    private config: ConfigService,
    private jwt: JwtService
  ) {}

  async signToken(params,action): Promise<{ access_token: string }> {
    let payload: any;
    if(action == "clientKey"){
      payload = {
        sub: params.clientCode,
        name: params.clientUsername,
        agentId: params.agentId,
        agentApiKey: params.agentApiKey,
      }
    } else if(action == "trxDetailKey"){
      payload = {
        sub: params.ticketBetId,
      }
    }
    const token = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_SECRET_KEY'),
    });
    return {
      access_token: token,
    }
  }

  async decodeToken(token) {
    if(!token) {
      return {
        status: false,
        headerAuth: token,
        objFromToken: {},
      }
    }
    const separate: Array<string> = token.split(' ');
    if(separate[0] != 'Bearer'){
      return {
        status: false,
        headerAuth: token,
        objFromToken: {},
      }
    } else {
      const headerAuth: string = token.replace('Bearer ','');
      if(headerAuth == '' || headerAuth == 'Bearer') {
        return {
          status: false,
          headerAuth,
          objFromToken: {},
        }
      } else {
        try {
          let objFromToken: any = await this.jwt.decode(headerAuth);
          if(objFromToken == null){
            return {
              status: false,
              headerAuth,
              objFromToken: {},
            }
          }
          return {
            status: true,
            headerAuth,
            objFromToken
          }
        } catch (error) {
          return {
            status: false,
            headerAuth,
            objFromToken: {},
          }
        }
      }
    }
  }

  async decodeTicketBetId(token) {
    let objFromToken: any = await this.jwt.decode(token);
    if(objFromToken == null) {
      return {
        status: false,
        objFromToken: {},
      }
    }
    return {
      status: true,
      objFromToken,
    }
  }
}