import { Body, Controller, HttpCode, Post, Request, UseFilters, ValidationPipe } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { ClientExceptionFilter } from "src/utils/exception";
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
  @UseFilters(ClientExceptionFilter)
  login(@Body(new ValidationPipe()) dto: ClientAuthDto, @Request() req) {
    // console.log(req.connection.remoteAddress)
    // return this.clientService.login(dto,req.headers);
    return this.clientService.loginNew(dto,req.headers);
  }

  @Post('register')
  @HttpCode(200)
  @UseFilters(ClientExceptionFilter)
  register(@Body(new ValidationPipe()) dto: ClientSignUpDto, @Request() req) {
    return this.clientService.register(dto,req.headers);
  }

  @Post('registerFunMode')
  @HttpCode(200)
  @UseFilters(ClientExceptionFilter)
  registerFunMode(@Body(new ValidationPipe()) dto: ClientSignUpDto, @Request() req) {
    return this.clientService.registerFunMode(dto,req.headers);
  }

  @Post('loginapp')
  @HttpCode(200)
  @UseFilters(ClientExceptionFilter)
  loginApp(@Body(new ValidationPipe()) dto: ClientLoginAppDto, @Request() req){
    return this.clientService.loginApp(dto,req.headers);
  }
}