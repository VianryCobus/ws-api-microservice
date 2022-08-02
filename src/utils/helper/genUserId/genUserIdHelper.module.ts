import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency, User } from 'src/models';
import { GenerateUserIdService } from './genUserIdHelper.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Currency,
    ]),
  ],
  providers: [GenerateUserIdService],
  exports: [GenerateUserIdService],
})
export class GenerateUserIdModule {}
