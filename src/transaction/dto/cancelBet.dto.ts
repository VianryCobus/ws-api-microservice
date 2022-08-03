import { IsIn, IsNegative, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CancelBetDto {
  @IsString()
  @IsOptional()
  // @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsOptional()
  // @IsNotEmpty()
  transId: number;

  @IsString()
  @IsOptional()
  // @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  // @IsNotEmpty()
  sDate: string;

  @IsNumber({
    maxDecimalPlaces: 4
  })
  @Min(-9999999999999999.9999)
  @Max(9999999999999999.9999)
  @IsOptional()
  // @IsNotEmpty()
  bAmt: number;

  @IsNumber({
    maxDecimalPlaces: 4
  })
  @Min(-9999999999999999.9999)
  @Max(-1)
  @IsOptional()
  // @IsNotEmpty()
  // @IsNegative()
  payout: number;

  @IsString()
  @IsOptional()
  // @IsNotEmpty()
  ip: string;

  @IsString()
  @IsOptional()
  // @IsNotEmpty()
  odds: string;

  @IsString()
  @IsOptional()
  // @IsNotEmpty()
  // @IsIn([
  //   'HDP',
  //   'OU'
  // ])
  game: string;

  // @IsIn([
  //   1,
  //   0
  // ])
  @IsNumber()
  @IsOptional()
  source: number;

  // @IsIn([
  //   -1,
  //   0,
  //   1,
  //   4,
  //   5
  // ])
  @IsNumber()
  @IsOptional()
  status: number;
}