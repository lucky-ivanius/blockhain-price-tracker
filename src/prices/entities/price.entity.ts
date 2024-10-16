import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Token } from '../../tokens/entities/token.entity';

@Entity({ name: 'prices' })
export class Price {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Token, (token) => token.prices)
  token: Token;

  @Column('decimal', { precision: 18, scale: 8 })
  price: number;

  @Column()
  timestamp: Date;
}
