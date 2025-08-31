import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from './UserEntity';
import { StripeCustomerEntity } from './StripeCustomerEntity';

@Entity('stripe_payment_intents')
export class StripePaymentIntentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'stripe_customer_id', type: 'varchar', nullable: true })
  stripeCustomerId?: string;

  @Column({ name: 'stripe_payment_intent_id', type: 'varchar', unique: true })
  stripePaymentIntentId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', default: 'eur' })
  currency: string;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ name: 'client_secret', type: 'varchar' })
  clientSecret: string;

  @Column({ type: 'varchar', nullable: true })
  purpose?: string; // 'subscription' | 'module_purchase' | 'other'

  @Column({ name: 'module_id', type: 'varchar', nullable: true })
  moduleId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => StripeCustomerEntity, { eager: false })
  @JoinColumn({ name: 'stripe_customer_id', referencedColumnName: 'stripeCustomerId' })
  customer?: StripeCustomerEntity;
}
