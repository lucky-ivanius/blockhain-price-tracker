import { Module } from '@nestjs/common';
import { MoralisService } from './moralis.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MoralisService],
  exports: [MoralisService],
})
export class MoralisModule {}
