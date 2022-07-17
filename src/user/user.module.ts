import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from 'src/models/agent.entity';
import { Currency } from 'src/models/currency.entity';
import { User } from 'src/models/user.entity';
import { Wallet } from 'src/models/wallet.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Wallet,
      Currency,
      Agent,
    ]),
  ],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
