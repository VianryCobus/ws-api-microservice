import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtHelperService } from "./jwt.service";

@Global()
@Module({
  imports: [
    JwtModule.register({}),
  ],
  providers: [JwtHelperService],
  exports: [JwtHelperService],
})
export class JwtHelperModule {}