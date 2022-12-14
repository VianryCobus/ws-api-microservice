import { IsNotEmpty, IsString } from "class-validator";

export class BalanceDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}