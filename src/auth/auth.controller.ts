import { Body, Controller, Get, HttpCode, ParseIntPipe, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { AuthDto, LogoutDto, SignUpDto } from "./dto";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @UseGuards(AuthGuard('jwt'))
  @Post('signup')
  @HttpCode(200)
  signup(@Body() dto: SignUpDto, @Req() req: Request) {
    return this.authService.signup(dto,req.headers);
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