import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateAccountProviderDto {
  @IsString()
  @IsNotEmpty()
  userid: string;

  @IsString()
  @IsOptional()
  commisiongroup: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  creditLimit: number;

  @IsBoolean()
  @IsOptional()
  suspended: boolean;

  @IsBoolean()
  @IsOptional()
  active: boolean;

  @IsString()
  @IsOptional()
  firstname: string;

  @IsString()
  @IsOptional()
  lastname: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  @IsOptional()
  mobile: string;

  @IsNumber()
  @IsOptional()
  minbet: number;

  @IsNumber()
  @IsOptional()
  commisiongrphdp: number;

  @IsNumber()
  @IsOptional()
  commisiongrp1x2: number;

  @IsNumber()
  @IsOptional()
  commisiongrpothers: number;

  @IsNumber()
  @IsOptional()
  commisionmixparlay3: number;

  @IsNumber()
  @IsOptional()
  commisionmixparlay4: number;

  @IsNumber()
  @IsOptional()
  commisionmixparlay5: number;

  @IsNumber()
  @IsOptional()
  myposgrphdp: number;

  @IsNumber()
  @IsOptional()
  myposgrp1x2: number;

  @IsNumber()
  @IsOptional()
  myposgrpothers: number;

  @IsNumber()
  @IsOptional()
  myposgrpmixparlay: number;

  @IsNumber()
  @IsOptional()
  maxbetgrphdp: number;

  @IsNumber()
  @IsOptional()
  maxpermatchgrphdp: number;

  @IsNumber()
  @IsOptional()
  maxbetgrp1x2: number;

  @IsNumber()
  @IsOptional()
  maxpermatchgrp1x2: number;

  @IsNumber()
  @IsOptional()
  maxbetgrpmixparlay: number;

  @IsNumber()
  @IsOptional()
  maxpermatchgrpmixparlay: number;

  @IsNumber()
  @IsOptional()
  maxbetgrpothersodds: number;

  @IsNumber()
  @IsOptional()
  maxpermatchgrpothersodds: number;

  @IsNumber()
  @IsOptional()
  maxbetgrpspecial: number;

  @IsNumber()
  @IsOptional()
  maxpermatchgrpspecial: number;

  @IsNumber()
  @IsOptional()
  maxbetgrpbasketball: number;

  @IsNumber()
  @IsOptional()
  maxpermatchgrpbasketball: number;

  @IsNumber()
  @IsOptional()
  maxbetgrpotherssport: number;

  @IsNumber()
  @IsOptional()
  maxpermatchgrpotherssport: number;
}