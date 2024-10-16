import { Body, Controller, Post } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { TokensService } from 'src/tokens/tokens.service';
import { Alert } from './entities/alert.entity';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('alerts')
@ApiTags('alert')
export class AlertsController {
  constructor(
    private readonly alertsService: AlertsService,
    private readonly tokensService: TokensService,
  ) {}

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', example: 'ETH' },
        targetPrice: { type: 'string', example: '100' },
        email: { type: 'string', example: 'abc@email.com' },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Alert created',
  })
  @ApiBadRequestResponse({
    description: 'Bad request error',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        error: {
          type: 'string',
          example: 'Bad request',
        },
        statusCode: {
          type: 'number',
          example: 400,
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
  async createAlert(@Body() dto: CreateAlertDto) {
    const token = await this.tokensService.findBySymbol(dto.symbol);

    const alert = new Alert();
    alert.token = token;
    alert.targetPrice = dto.targetPrice;
    alert.email = dto.email;
    alert.createdAt = new Date();

    await this.alertsService.create(alert);
  }
}
