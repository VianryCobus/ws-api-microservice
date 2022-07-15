import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TransactionModule } from './transaction/transaction.module';
import { PrismaModule } from './prisma/prisma.module';
import { GenerateUserIdModule } from './helper/genUserId/genUserIdHelper.module';
import { HitProviderModule } from './helper/hitProvider/hitProviderHelper.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule, 
    AuthModule, 
    TransactionModule, 
    PrismaModule, 
    GenerateUserIdModule,
    HitProviderModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
