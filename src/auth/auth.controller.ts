import { Body, Controller, Get, HttpCode, ParseIntPipe, Post, Req, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthDto, LogoutDto, SignUpClientDto, SignUpDto } from "./dto";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @UseGuards(AuthGuard('jwt'))
  @Post('signup')
  @HttpCode(200)
  signup(@Body() dto: SignUpDto, @Request() req) {
    return this.authService.signup(dto,req.headers);
  }

  @Post('signin')
  @HttpCode(200)
  signin(@Body() dto: AuthDto, @Request() req) {
    return this.authService.signin(dto,req.headers);
  }

  @Post('signupCLient')
  @HttpCode(200)
  signupClient(@Body() dto: SignUpClientDto, @Request() req) {
    return this.authService.signupClient(dto,req.headers);
  }

  @Get('signout')
  @HttpCode(200)
  signout(@Body() dto: LogoutDto) {
    return this.authService.signout(dto);
  }
}