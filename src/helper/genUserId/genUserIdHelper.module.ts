import { Global, Module } from '@nestjs/common';
import { GenerateUserIdService } from './genUserIdHelper.service';

@Global()
@Module({
  providers: [GenerateUserIdService],
  exports: [GenerateUserIdService],
})
export class GenerateUserIdModule {}
