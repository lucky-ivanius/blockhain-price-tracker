import { IsInt, IsString } from 'class-validator';

export class CreateTokenDto {
  @IsString()
  symbol: string;

  @IsString()
  name: string;

  @IsInt()
  chainId: number;

  @IsString()
  tokenAddress: string;
}
