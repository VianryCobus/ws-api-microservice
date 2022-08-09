import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { JwtHelperService } from "../helper";

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtHelperService: JwtHelperService,
  ){}
  async canActivate(context: ExecutionContext): Promise<boolean> {
  // async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;

    // decode request headers
    const dataClientDecode: any = await this.jwtHelperService.decodeToken(auth);

    console.log(dataClientDecode);

    if(!dataClientDecode.status) throw new ForbiddenException(`Please provide the correct token`);
    
    return dataClientDecode;
  }
}