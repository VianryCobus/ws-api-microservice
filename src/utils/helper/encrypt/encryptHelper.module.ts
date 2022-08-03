import { Global, Module } from "@nestjs/common";
import { EncryptHelperService } from "./encryptHelper.service";

@Global()
@Module({
  providers: [EncryptHelperService],
  exports: [EncryptHelperService]
})
export class EncryptHelperModule {}