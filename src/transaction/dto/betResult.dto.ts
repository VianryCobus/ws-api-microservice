import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min} from "class-validator";

export class BetResultDto {
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
  @Max(9999999999999999.9999)
  @IsOptional()
  wAmt: number;
  
  @IsString()
  @IsOptional()
  // @IsNotEmpty()
  odds: string;

  @IsNumber({
    maxDecimalPlaces: 4
  })
  @Min(-9999999999999999.9999)
  @Max(9999999999999999.9999)
  @IsOptional()
  commPerc: number;

  @IsNumber({
    maxDecimalPlaces: 4
  })
  @Min(-9999999999999999.9999)
  @Max(9999999999999999.9999)
  @IsOptional()
  comm: number;

  @IsNumber({
    maxDecimalPlaces: 4
  })
  @Min(-9999999999999999.9999)
  @Max(9999999999999999.9999)
  @IsOptional()
  payout: number;

  @IsNumber({
    maxDecimalPlaces: 4
  })
  @Min(-9999999999999999.9999)
  @IsOptional()
  creditDeducted: number;

  @IsNumber()
  @IsOptional()
  // @IsNotEmpty()
  winloss: number;

  @IsNumber()
  @IsOptional()
  // @IsNotEmpty()
  status: number;
}