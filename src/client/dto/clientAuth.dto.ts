import { IsBoolean, IsEmpty, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class ClientAuthDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  game_id: string;

  @IsString()
  @IsNotEmpty()
  ip: string;

  @IsString()
  @IsOptional()
  domain: string;

  @IsIn([
    0,
    1
  ])
  @IsNumber()
  @IsOptional()
  fun_mode: number;

  @IsIn([
    'en',
    'zh-cn',
    'id-id',
    'th-th',
    'vi-vn'
  ])
  @IsString()
  @IsOptional()
  lang: string;

  @IsIn(['1','0'])
  @IsString()
  @IsOptional()
  se: string;

  @IsIn(['1','0'])
  @IsString()
  @IsOptional()
  im: string;

  @IsIn(['1','2','3','4'])
  @IsString()
  @IsOptional()
  ot: string;

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