import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './entities/token.entity';

export interface HourlyPrice {
  timestamp: string;
  price: number;
}

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);

  constructor(
    @InjectRepository(Token)
    private tokensRepository: Repository<Token>,
  ) {}

  async findAll(): Promise<Token[]> {
    return this.tokensRepository.find();
  }

  async create(token: Token) {
    const existingToken = await this.tokensRepository.findOneBy({
      symbol: token.symbol,
    });
    if (existingToken)
      throw new BadRequestException('Token symbol already exists');

    await this.tokensRepository.save(token);
  }

  async findBySymbol(symbol: string): Promise<Token> {
    const token = await this.tokensRepository.findOne({ where: { symbol } });
    if (!token)
      throw new NotFoundException(
        `Token with symbol '${symbol}' was not found`,
      );

    return token;
  }
}
