import { IsNotEmpty, IsString, Length } from "class-validator";

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  userid: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(3,3)
  currency: string;
}