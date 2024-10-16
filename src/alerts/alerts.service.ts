import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { Token } from '../tokens/entities/token.entity';
import { Price } from '../prices/entities/price.entity';
import { EmailService } from 'src/email/email.service';
import { subHours } from 'date-fns';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { formatCurrency } from 'src/utils/format';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Alert)
    private alertsRepository: Repository<Alert>,
    @InjectRepository(Price)
    private pricesRepository: Repository<Price>,
    private emailService: EmailService,
  ) {}

  async create(alert: Alert) {
    await this.alertsRepository.save(alert);
  }

  async processTokenPriceAlert(token: Token) {
    const alerts = await this.alertsRepository.find({
      where: {
        token,
        isActive: true,
      },
      relations: ['token'],
    });

    const alertPromises = alerts.map(async (alert) => {
      const price = await this.pricesRepository.findOne({
        where: {
          token: {
            id: alert.token.id,
          },
        },
        order: {
          timestamp: 'DESC',
        },
      });

      if (price.price >= alert.targetPrice)
        await this.emailService.sendEmail(
          alert.email,
          `Price Alert: ${alert.token.symbol}`,
          `${alert.token.name} (${alert.token.symbol}) is reached $${formatCurrency(alert.targetPrice)}`,
        );

      alert.isActive = false;

      await this.alertsRepository.save(alert);
    });

    await Promise.all(alertPromises);
  }

  async processTokenPriceMovementAlert(token: Token) {
    const emailRecipient = this.configService.get(
      'PRICE_MOVEMENT_EMAIL_RECIPIENT',
    );
    if (!emailRecipient)
      return this.logger.error(
        'PRICE_MOVEMENT_EMAIL_RECIPIENT has not been set',
      );

    const percentageThreshold = +this.configService.get<number>(
      'PRICE_MOVEMENT_PERCENTAGE_THRESHOLD',
    );
    if (!percentageThreshold)
      return this.logger.error(
        'PRICE_MOVEMENT_PERCENTAGE_THRESHOLD has not been set',
      );

    const cooldownPeriod = +this.configService.get<number>(
      'PRICE_MOVEMENT_ALERT_COOLDOWN_PERIOD_MINUTE',
    );
    if (!cooldownPeriod)
      return this.logger.error(
        'PRICE_MOVEMENT_ALERT_COOLDOWN_PERIOD_MINUTE has not been set',
      );

    const isOnCooldownPeriod = await this.cacheManager.get(
      'price_movement_cooldown_period',
    );
    if (isOnCooldownPeriod) return;

    const currentPrice = await this.pricesRepository.findOne({
      where: {
        token,
      },
      order: {
        timestamp: 'DESC',
      },
    });
    if (!currentPrice) return;

    const oneHourAgo = subHours(new Date(), 1);

    const oneHourAgoPrice = await this.pricesRepository.findOne({
      where: {
        token,
        timestamp: LessThanOrEqual(oneHourAgo),
      },
      order: {
        timestamp: 'DESC',
      },
    });
    if (!oneHourAgoPrice) return;

    const percentageChange =
      (currentPrice.price - oneHourAgoPrice.price) / oneHourAgoPrice.price;
    const absPercentageChange = Math.abs(percentageChange);

    if (absPercentageChange >= percentageThreshold) {
      const direction = percentageChange > 0 ? 'increased' : 'decreased';
      const message = `${token.symbol} price ${direction} by ${absPercentageChange.toFixed(2)}% in the last hour (from $${formatCurrency(oneHourAgoPrice.price)} to $${formatCurrency(currentPrice.price)})`;

      await this.emailService.sendEmail(
        emailRecipient,
        `Price Alert: ${token.symbol}`,
        message,
      );

      await this.cacheManager.set(
        'price_movement_cooldown_period',
        true,
        cooldownPeriod * 60,
      );
    }
  }
}
