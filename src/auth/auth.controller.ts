import { Body, Controller, Get, HttpCode, ParseIntPipe, Post, Req, Request, UseGuards, ValidationPipe } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TokenGuard } from "src/utils/guard";
import { AuthService } from "./auth.service";
import { AuthDto, LogoutDto, SignUpClientDto, SignUpDto } from "./dto";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @UseGuards(AuthGuard('jwt'))
  @Post('signup')
  @HttpCode(200)
  signup(@Body(new ValidationPipe()) dto: SignUpDto, @Request() req) {
    return this.authService.signup(dto,req.headers);
  }

  // @UseGuards(TokenGuard)
  @Post('signin')
  @HttpCode(200)
  signin(@Body(new ValidationPipe()) dto: AuthDto, @Request() req) {
    return this.authService.signin(dto,req.headers);
    // return this.authService.signin(dto,req);
  }

  @Post('signupCLient')
  @HttpCode(200)
  signupClient(@Body(new ValidationPipe()) dto: SignUpClientDto, @Request() req) {
    return this.authService.signupClient(dto,req.headers);
  }

  @Get('signout')
  @HttpCode(200)
  signout(@Body(new ValidationPipe()) dto: LogoutDto) {
    return this.authService.signout(dto);
  }
}