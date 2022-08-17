import { Body, Controller, HttpCode, Post, Request, UseFilters, ValidationPipe } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { AuthToken } from "src/utils/decorators";
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
  login(@Body(new ValidationPipe()) dto: ClientAuthDto, @AuthToken() authToken: any) {
    // console.log(req.connection.remoteAddress)
    // return this.clientService.login(dto,req.headers);
    return this.clientService.loginNew(dto,authToken);
  }

  @Post('register')
  @HttpCode(200)
  @UseFilters(ClientExceptionFilter)
  register(@Body(new ValidationPipe()) dto: ClientSignUpDto, @AuthToken() authToken: any) {
    return this.clientService.register(dto,authToken);
  }

  @Post('registerFunMode')
  @HttpCode(200)
  @UseFilters(ClientExceptionFilter)
  registerFunMode(@Body(new ValidationPipe()) dto: ClientSignUpDto, @AuthToken() authToken: any) {
    return this.clientService.registerFunMode(dto,authToken);
  }

  @Post('loginapp')
  @HttpCode(200)
  @UseFilters(ClientExceptionFilter)
  loginApp(@Body(new ValidationPipe()) dto: ClientLoginAppDto, @AuthToken() authToken: any){
    return this.clientService.loginApp(dto,authToken);
  }
}