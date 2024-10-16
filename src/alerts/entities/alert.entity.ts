import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Token } from '../../tokens/entities/token.entity';

@Entity({ name: 'alerts' })
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Token, (token) => token.alerts)
  token: Token;

  @Column('decimal', { precision: 18, scale: 8 })
  targetPrice: number;

  @Column({ length: 100 })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  createdAt: Date;
}
