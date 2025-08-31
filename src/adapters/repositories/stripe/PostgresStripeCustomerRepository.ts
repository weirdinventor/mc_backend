import { EntityManager, Repository } from 'typeorm';
import { injectable } from 'inversify';
import { StripeCustomerEntity } from '../entities/StripeCustomerEntity';

export interface StripeCustomerRepository {
  create(data: {
    userId: string;
    stripeCustomerId: string;
    email: string;
    name?: string;
  }): Promise<StripeCustomerEntity>;
  
  findByUserId(userId: string): Promise<StripeCustomerEntity | null>;
  findByStripeCustomerId(stripeCustomerId: string): Promise<StripeCustomerEntity | null>;
  update(id: string, data: Partial<StripeCustomerEntity>): Promise<void>;
  delete(id: string): Promise<void>;
}

@injectable()
export class PostgresStripeCustomerRepository implements StripeCustomerRepository {
  private repository: Repository<StripeCustomerEntity>;

  constructor(entityManager: EntityManager) {
    this.repository = entityManager.getRepository(StripeCustomerEntity);
  }

  async create(data: {
    userId: string;
    stripeCustomerId: string;
    email: string;
    name?: string;
  }): Promise<StripeCustomerEntity> {
    const customer = this.repository.create(data);
    return await this.repository.save(customer);
  }

  async findByUserId(userId: string): Promise<StripeCustomerEntity | null> {
    return await this.repository.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<StripeCustomerEntity | null> {
    return await this.repository.findOne({
      where: { stripeCustomerId },
      relations: ['user'],
    });
  }

  async update(id: string, data: Partial<StripeCustomerEntity>): Promise<void> {
    await this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
