import { Controller, Get, Param } from '@nestjs/common';
import { PricesService } from './prices.service';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

export class GetPricesParam {
  symbol: string;
}

@Controller('prices')
@ApiTags('price')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Get(':symbol')
  @ApiParam({
    name: 'symbol',
    schema: {
      type: 'string',
    },
  })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
          },
          price: {
            type: 'number',
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Token not found',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        error: {
          type: 'string',
          example: 'Not found',
        },
        statusCode: {
          type: 'number',
          example: 404,
        },
      },
    },
  })
  async getPrices(@Param() param: GetPricesParam) {
    const prices = await this.pricesService.getPrices(param.symbol);

    return prices;
  }
}
