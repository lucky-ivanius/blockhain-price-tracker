import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsModule } from 'src/alerts/alerts.module';
import { Alert } from '../alerts/entities/alert.entity';
import { Token } from '../tokens/entities/token.entity';
import { Price } from './entities/price.entity';
import { PricesController } from './prices.controller';
import { PricesService } from './prices.service';
import { MoralisModule } from './services/moralis.module';

@Module({
  providers: [PricesService],
  controllers: [PricesController],
  imports: [
    MoralisModule,
    AlertsModule,
    TypeOrmModule.forFeature([Alert, Token, Price]),
  ],
})
export class PricesModule {}
