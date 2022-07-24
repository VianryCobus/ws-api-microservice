import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
// import { PrismaModule } from './prisma/prisma.module';
import { GenerateUserIdModule } from './helper/genUserId/genUserIdHelper.module';
import { HitProviderModule } from './helper/hitProvider/hitProviderHelper.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormConfig from 'ormconfig';
import { User } from './models/user.entity';
import { Transaction } from './models/transaction.entity';
import { Wallet } from './models/wallet.entity';
import { Currency } from './models/currency.entity';
import { Agent } from './models/agent.entity';
import { TransactionController } from './transaction/transaction.controller';
import { TransactionService } from './transaction/transaction.service';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(ormConfig),
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.POSTGRES_HOST,
    //   port: parseInt(<string>process.env.POSTGRES_PORT),
    //   username: process.env.POSTGRES_USERNAME,
    //   password: process.env.POSTGRES_PASSWORD,
    //   database: process.env.POSTGRES_DATABASE,
    //   // autoLoadEntities: true,
    //   entities: ['dist/src/models/**/*.entity.js'],
    //   synchronize: true,
    //   migrations: [
    //     'dist/src/db/migrations/*.js'
    //   ],
    //   logging: true,
    //   logger: 'file',
    //   cli: {
    //     migrationsDir: 'src/db/migrations'
    //   }
    // }),
    UserModule,
    AuthModule,
    // PrismaModule,
    GenerateUserIdModule,
    HitProviderModule,
    TransactionModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
