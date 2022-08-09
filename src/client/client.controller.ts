import { Body, Controller, HttpCode, Post, Request, ValidationPipe } from "@nestjs/common";
import { ClientService } from "./client.service";
import { ClientAuthDto, ClientSignUpDto } from "./dto";

@Controller('v1/client')
export class ClientController {
  constructor(private clientService: ClientService){}
  
  @Post('login')
  @HttpCode(200)
  login(@Body(new ValidationPipe()) dto: ClientAuthDto, @Request() req) {
    // console.log(req.connection.remoteAddress)
    return this.clientService.login(dto,req.headers);
  }

  @Post('register')
  @HttpCode(200)
  register(@Body(new ValidationPipe()) dto: ClientSignUpDto, @Request() req) {
    return this.clientService.register(dto,req.headers);
  }
}