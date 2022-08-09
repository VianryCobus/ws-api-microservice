import { IsIn, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class ClientSignUpDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  // @IsString()
  // @IsNotEmpty()
  // username: string;

  @IsString()
  @IsOptional()
  game_id: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([
    'IDR',
    'VND',
    'MMK',
    'USD'
  ])
  currency: string;

}