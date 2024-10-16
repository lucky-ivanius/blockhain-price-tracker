import Moralis from 'moralis';

import { Injectable } from '@nestjs/common';
import { Token } from '../../tokens/entities/token.entity';
import { Price } from '../entities/price.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MoralisService {
  constructor(private configService: ConfigService) {
    this.init();
  }

  private async init() {
    try {
      await Moralis.start({
        apiKey: this.configService.get<string>('MORALIS_API_KEY'),
      });
    } catch (error) {}
  }

  public async getTokenPrices(tokens: Token[]): Promise<Price[]> {
    try {
      const response = await Moralis.EvmApi.token.getMultipleTokenPrices(
        {},
        {
          tokens: tokens.map(({ tokenAddress }) => ({ tokenAddress })),
        },
      );

      const prices = response.result.map((value, index) => {
        const price = new Price();
        price.token = tokens[index];
        price.price = value.usdPrice;
        price.timestamp = new Date();

        return price;
      });

      return prices;
    } catch (e) {
      return [];
    }
  }
}
