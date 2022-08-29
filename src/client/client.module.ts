import { BullModule } from "@nestjs/bull";
import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Agent, Client, Config, Currency, HistoryLogin, User, Wallet } from "src/models";
import { HistoryLoginConsumer } from "src/utils/queue";
import { ClientController } from "./client.controller";
import { ClientService } from "./client.service";

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Wallet,
      Currency,
      Agent,
      Client,
      HistoryLogin,
      Config,
    ]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD
      }
    }),
    BullModule.registerQueue({
      name: 'ws-queue',
    }),
    JwtModule.register({}),
  ],
  controllers: [ClientController],
  providers: [
    ClientService,
    HistoryLoginConsumer,
  ],
  exports: [
    ClientService,
  ],
})
export class ClientModule {}