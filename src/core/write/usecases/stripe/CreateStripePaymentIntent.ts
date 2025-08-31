import { inject, injectable } from 'inversify';
import { UserIdentity } from '../../domain/entities/UserIdentity';
import { Usecase } from '../../domain/models/Usecase';
import { Identifiers } from '../../../Identifiers';
import { StripePaymentGateway } from '../../../../adapters/gateways/stripe/StripePaymentGateway';
import { StripeCustomerRepository } from '../../../../adapters/repositories/stripe/PostgresStripeCustomerRepository';

export interface CreateStripePaymentIntentInput {
  user: UserIdentity;
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}

export interface CreateStripePaymentIntentOutput {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

@injectable()
export class CreateStripePaymentIntent implements Usecase<CreateStripePaymentIntentInput, CreateStripePaymentIntentOutput> {
  constructor(
    @inject(Identifiers.stripePaymentGateway)
    private readonly stripePaymentGateway: StripePaymentGateway,
    @inject(Identifiers.stripeCustomerRepository)
    private readonly stripeCustomerRepository: StripeCustomerRepository,
  ) {}

  async execute(input: CreateStripePaymentIntentInput): Promise<CreateStripePaymentIntentOutput> {
    const { user, amount, currency = 'eur', metadata } = input;

    // Get or create Stripe customer
    let stripeCustomer = await this.stripeCustomerRepository.findByUserId(user.id);
    
    const customerId = stripeCustomer?.stripeCustomerId;

    // Create payment intent
    const paymentIntentData = await this.stripePaymentGateway.createPaymentIntent(
      amount,
      currency,
      customerId,
      metadata
    );

    return {
      paymentIntentId: paymentIntentData.id,
      clientSecret: paymentIntentData.clientSecret,
      amount: paymentIntentData.amount,
      currency: paymentIntentData.currency,
      status: paymentIntentData.status,
    };
  }
}
