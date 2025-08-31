import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from './UserEntity';
import { StripeCustomerEntity } from './StripeCustomerEntity';

@Entity('stripe_subscriptions')
export class StripeSubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'stripe_customer_id', type: 'varchar' })
  stripeCustomerId: string;

  @Column({ name: 'stripe_subscription_id', type: 'varchar', unique: true })
  stripeSubscriptionId: string;

  @Column({ name: 'price_id', type: 'varchar' })
  priceId: string;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ name: 'current_period_start', type: 'timestamp' })
  currentPeriodStart: Date;

  @Column({ name: 'current_period_end', type: 'timestamp' })
  currentPeriodEnd: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount?: number;

  @Column({ type: 'varchar', default: 'eur' })
  currency: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'canceled_at', type: 'timestamp', nullable: true })
  canceledAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => StripeCustomerEntity, { eager: false })
  @JoinColumn({ name: 'stripe_customer_id', referencedColumnName: 'stripeCustomerId' })
  customer: StripeCustomerEntity;
}
