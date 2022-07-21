import { IsNotEmpty, IsNumber, IsString, Max, Min} from "class-validator";

export class BetResultDto {
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
  wAmt: number;
  
  @IsString()
  @IsNotEmpty()
  odds: string;

  @IsNumber({
    maxDecimalPlaces: 4
  })
  @Min(-9999999999999999.9999)
  @Max(9999999999999999.9999)
  commPerc: number;

  @IsNumber({
    maxDecimalPlaces: 4
  })
  @Min(-9999999999999999.9999)
  @Max(9999999999999999.9999)
  comm: number;

  @IsNumber({
    maxDecimalPlaces: 4
  })
  @Min(-9999999999999999.9999)
  @Max(9999999999999999.9999)
  payout: number;

  @IsNumber({
    maxDecimalPlaces: 4
  })
  @Min(-9999999999999999.9999)
  @Max(9999999999999999.9999)
  creditDeducted: number;

  @IsNumber()
  @IsNotEmpty()
  winloss: number;

  @IsNumber()
  @IsNotEmpty()
  status: number;
}