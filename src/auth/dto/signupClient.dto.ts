import { IsIn, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SignUpClientDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsNotEmpty()
  @IsIn([0,1])
  autoregis: number;
}