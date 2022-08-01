import { Global, Module } from "@nestjs/common";
import { HitProviderService } from "./hitProviderHelper.service";

@Global()
@Module({
  providers: [HitProviderService],
  exports: [HitProviderService]
})
export class HitProviderModule {}