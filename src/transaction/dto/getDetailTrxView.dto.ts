import { IsNotEmpty, IsString } from "class-validator";

export class GetDetailTrxViewDto {
  @IsString()
  @IsNotEmpty()
  ticketBetId: string;
}