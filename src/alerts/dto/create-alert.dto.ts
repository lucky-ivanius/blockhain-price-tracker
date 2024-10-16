import { IsDecimal, IsEmail, IsString } from 'class-validator';

export class CreateAlertDto {
  @IsString()
  symbol: string;

  @IsDecimal()
  targetPrice: number;

  @IsEmail()
  email: string;
}
