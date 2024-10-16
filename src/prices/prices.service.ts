import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { roundToNearestMinutes, startOfHour, subHours } from 'date-fns';
import { AlertsService } from 'src/alerts/alerts.service';
import { formatCurrency } from 'src/utils/format';
import { Between, Repository } from 'typeorm';
import { Token } from '../tokens/entities/token.entity';
import { Price } from './entities/price.entity';
import { MoralisService } from './services/moralis.service';

export interface TokenPrice {
  date: string;
  price: number;
}

@Injectable()
export class PricesService {
  private readonly logger = new Logger(PricesService.name);

  constructor(
    @InjectRepository(Price)
    private pricesRepository: Repository<Price>,
    @InjectRepository(Token)
    private tokensRepository: Repository<Token>,
    private moralisService: MoralisService,
    private alertsService: AlertsService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async fetchPrices() {
    this.logger.log('Fetching tokens price');
    const tokens = await this.tokensRepository.find();
    if (!tokens.length) return;

    const prices = await this.moralisService.getTokenPrices(tokens);

    await this.pricesRepository.save(prices);
    this.logger.log('Token prices updated');

    this.processPriceAlert(prices.map((price) => price.token));
  }

  async processPriceAlert(tokens: Token[]) {
    const alertPromises = tokens.map(async (token) => {
      this.alertsService.processTokenPriceAlert(token);
      this.alertsService.processTokenPriceMovementAlert(token);
    });

    await Promise.all(alertPromises);
  }

  async getPrices(symbol: string): Promise<TokenPrice[]> {
    const token = await this.tokensRepository.findOneBy({ symbol });
    if (!token)
      throw new NotFoundException(
        `Token with symbol '${symbol}' was not found`,
      );

    const now = new Date();
    const last24hr = startOfHour(subHours(now, 24));

    const prices = await this.pricesRepository.find({
      where: {
        token,
        timestamp: Between(last24hr, now),
      },
      order: {
        timestamp: 'DESC',
      },
    });

    const formattedPrices = prices.reduce((acc, price) => {
      const hourlyDate = startOfHour(price.timestamp);
      const currentTimestamp = roundToNearestMinutes(price.timestamp);
      if (+hourlyDate === +currentTimestamp) {
        acc.push({
          date: currentTimestamp.toISOString(),
          price: Number(formatCurrency(price.price)),
        });
        return acc;
      }

      return acc;
    }, [] as TokenPrice[]);

    return formattedPrices;
  }
}
