import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtHelperService } from "../helper";

// class jwtHelperService {
//   constructor(){}
// }

export const AuthToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authToken = request.headers.authorization;
    // const dataClientDecode: any = jwt.decode();
  }
);