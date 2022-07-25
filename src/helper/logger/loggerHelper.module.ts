import { Global, Module } from "@nestjs/common";
import { LoggerHelperService } from "./loggerHelper.service";

@Global()
@Module({
  providers: [LoggerHelperService],
  exports: [LoggerHelperService],
})
export class LoggerHelperModule {}