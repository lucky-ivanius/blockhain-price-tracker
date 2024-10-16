import { Module } from '@nestjs/common';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';

@Module({
  providers: [TokensService],
  controllers: [TokensController],
  exports: [TokensService],
  imports: [TypeOrmModule.forFeature([Token])],
})
export class TokensModule {}
