import { EntityManager, Repository } from 'typeorm';
import { injectable } from 'inversify';
import { StripeSubscriptionEntity } from '../entities/StripeSubscriptionEntity';

export interface StripeSubscriptionRepository {
  create(data: {
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    priceId: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    amount?: number;
    currency?: string;
    metadata?: Record<string, any>;
  }): Promise<StripeSubscriptionEntity>;
  
  findByUserId(userId: string): Promise<StripeSubscriptionEntity[]>;
  findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<StripeSubscriptionEntity | null>;
  findActiveByUserId(userId: string): Promise<StripeSubscriptionEntity | null>;
  update(id: string, data: Partial<StripeSubscriptionEntity>): Promise<void>;
  updateByStripeSubscriptionId(stripeSubscriptionId: string, data: Partial<StripeSubscriptionEntity>): Promise<void>;
  delete(id: string): Promise<void>;
  getActiveSubscriptions(): Promise<StripeSubscriptionEntity[]>;
}

@injectable()
export class PostgresStripeSubscriptionRepository implements StripeSubscriptionRepository {
  private repository: Repository<StripeSubscriptionEntity>;

  constructor(entityManager: EntityManager) {
    this.repository = entityManager.getRepository(StripeSubscriptionEntity);
  }

  async create(data: {
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    priceId: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    amount?: number;
    currency?: string;
    metadata?: Record<string, any>;
  }): Promise<StripeSubscriptionEntity> {
    const subscription = this.repository.create({
      ...data,
      currency: data.currency || 'eur',
    });
    return await this.repository.save(subscription);
  }

  async findByUserId(userId: string): Promise<StripeSubscriptionEntity[]> {
    return await this.repository.find({
      where: { userId },
      relations: ['user', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<StripeSubscriptionEntity | null> {
    return await this.repository.findOne({
      where: { stripeSubscriptionId },
      relations: ['user', 'customer'],
    });
  }

  async findActiveByUserId(userId: string): Promise<StripeSubscriptionEntity | null> {
    return await this.repository.findOne({
      where: { 
        userId,
        status: 'active',
      },
      relations: ['user', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, data: Partial<StripeSubscriptionEntity>): Promise<void> {
    await this.repository.update(id, data);
  }

  async updateByStripeSubscriptionId(stripeSubscriptionId: string, data: Partial<StripeSubscriptionEntity>): Promise<void> {
    await this.repository.update({ stripeSubscriptionId }, data);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async getActiveSubscriptions(): Promise<StripeSubscriptionEntity[]> {
    return await this.repository.find({
      where: { status: 'active' },
      relations: ['user', 'customer'],
    });
  }
}
