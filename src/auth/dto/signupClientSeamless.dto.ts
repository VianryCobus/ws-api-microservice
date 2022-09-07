import { IsNotEmpty, IsString } from "class-validator";

export class SignUpClientSeamlessDto {
  @IsString()
  @IsNotEmpty()
  agent_id: string;

  @IsString()
  @IsNotEmpty()
  agent_name: string;

  @IsString()
  @IsNotEmpty()
  master_agent_id: string;

  @IsString()
  @IsNotEmpty()
  currency_code: string;
}