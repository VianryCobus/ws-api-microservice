import { IsDecimal, IsIn, IsNotEmpty, IsNumber, IsString, Max, Min } from "class-validator";

export class PlaceBetDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsNotEmpty()
  transId: number;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  sDate: string;

  @IsNumber({ 
    maxDecimalPlaces: 4
  })
  @Min(-9999999999999999.9999)
  @Max(9999999999999999.9999)
  @IsNotEmpty()
  bAmt: number;

  @IsNumber({
    maxDecimalPlaces: 4
  })
  @Min(-9999999999999999.9999)
  @Max(9999999999999999.9999)
  // @IsNotEmpty()
  payout: number;

  @IsString()
  // @IsNotEmpty()
  ip: string;

  @IsString()
  // @IsNotEmpty()
  odds: string;

  @IsString()
  // @IsNotEmpty()
  // @IsIn([
  //   'HDP',
  //   'OU'
  // ])
  game: string;

  @IsIn([
    1,
    0
  ])
  @IsNumber()
  source: number;

  @IsIn([
    -1,
    0,
    1,
    4,
    5
  ])
  @IsNumber()
  status: number;
}