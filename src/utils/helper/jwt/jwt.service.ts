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
    }
    const token = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_SECRET_KEY'),
    });
    return {
      access_token: token,
    }
  }

  async decodeToken(token) {
    const headerAuth: string = token.replace('Bearer ','');
    const objFromToken: any = await this.jwt.decode(headerAuth);
    return {
      headerAuth,
      objFromToken
    }
  }
}