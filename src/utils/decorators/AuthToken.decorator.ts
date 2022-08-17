import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

export const AuthToken = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // check if token exist
    const authToken = request.headers.authorization;
    if(!authToken) {
      return {
        status: false,
        headerAuth: authToken,
        objFromToken: {},
      }
    }
    // check if token are Bearer Token
    const separate: Array<string> = authToken.split(' ');
    if(separate[0] != 'Bearer') {
      return {
        status: false,
        headerAuth: authToken,
        objFromToken: {},
      }
    }
    // check if after trim the bearer with space string, then it still have jwt token
    const headerAuth: string = authToken.replace('Bearer ','');
    if(headerAuth == '' || headerAuth == 'Bearer') {
      return {
        status: false,
        headerAuth,
        objFromToken: {},
      }
    }

    try {
      let objFromToken: any = await JwtService.prototype.decode(headerAuth);
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
);