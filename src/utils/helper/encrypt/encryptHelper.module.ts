import { Global, Module } from "@nestjs/common";
import { EncryptService } from "./encryptHelper.service";

@Global()
@Module({
  providers: [EncryptService],
  exports: [EncryptService]
})
export class EncryptModule {}