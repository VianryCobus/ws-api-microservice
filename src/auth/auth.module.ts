import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from 'src/models/agent.entity';
import { Currency } from 'src/models/currency.entity';
import { User } from 'src/models/user.entity';
import { Wallet } from 'src/models/wallet.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    // HttpModule,
    TypeOrmModule.forFeature([
      User,
      Wallet,
      Currency,
      Agent,
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
