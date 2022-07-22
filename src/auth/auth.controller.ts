import { Body, Controller, Get, HttpCode, ParseIntPipe, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto, LogoutDto, SignUpDto } from "./dto";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignUpDto) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  @HttpCode(200)
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }

  @Get('signout')
  @HttpCode(200)
  signout(@Body() dto: LogoutDto) {
    return this.authService.signout(dto);
  }
}