import { Body, Controller, HttpCode, Post, Request, ValidationPipe } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { ClientService } from "./client.service";
import { ClientAuthDto, ClientLoginAppDto, ClientSignUpDto } from "./dto";

@Controller('v1/client')
export class ClientController {
  constructor(
    private clientService: ClientService,
    private userService: UserService,
  ){}
  
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

  @Post('loginapp')
  @HttpCode(200)
  loginApp(@Body(new ValidationPipe()) dto: ClientLoginAppDto, @Request() req){
    return this.clientService.loginApp(dto,req.headers);
  }
}