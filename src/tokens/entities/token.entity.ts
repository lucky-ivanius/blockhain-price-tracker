import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Alert } from '../../alerts/entities/alert.entity';
import { Price } from '../../prices/entities/price.entity';

@Entity({ name: 'tokens' })
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 10, unique: true })
  symbol: string;

  @Column({ length: 100 })
  name: string;

  @Column()
  chainId: number;

  @Column({ length: 100 })
  tokenAddress: string;

  @OneToMany(() => Price, (price) => price.token)
  prices: Price[];

  @OneToMany(() => Alert, (alert) => alert.token)
  alerts: Alert[];
}
