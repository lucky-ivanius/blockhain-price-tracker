import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTokenDto } from './dto/create-token.dto';
import { Token } from './entities/token.entity';
import { TokensService } from './tokens.service';

@Controller('tokens')
@ApiTags('token')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get()
  @ApiOkResponse({
    description: 'List of tokens',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          symbol: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          chainId: {
            type: 'number',
          },
          tokenAddress: {
            type: 'string',
          },
        },
      },
    },
  })
  async findAll(): Promise<Token[]> {
    return this.tokensService.findAll();
  }

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
        chainId: {
          type: 'number',
        },
        tokenAddress: {
          type: 'string',
        },
      },
      required: ['symbol', 'name', 'chainId', 'tokenAddress'],
    },
  })
  @ApiCreatedResponse({
    description: 'Token created',
  })
  @ApiBadRequestResponse({
    description: 'Token already exists',
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
  async create(@Body() dto: CreateTokenDto) {
    const token = new Token();

    token.symbol = dto.symbol;
    token.name = dto.name;
    token.chainId = dto.chainId;
    token.tokenAddress = dto.tokenAddress;

    await this.tokensService.create(token);
  }
}
