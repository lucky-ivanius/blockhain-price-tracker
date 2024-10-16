import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from 'src/email/email.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { Price } from '../prices/entities/price.entity';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { Alert } from './entities/alert.entity';

@Module({
  providers: [AlertsService],
  controllers: [AlertsController],
  exports: [AlertsService],
  imports: [
    TypeOrmModule.forFeature([Alert, Price]),
    TokensModule,
    EmailModule,
  ],
})
export class AlertsModule {}
