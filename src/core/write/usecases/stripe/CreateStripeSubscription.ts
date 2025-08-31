import { inject, injectable } from 'inversify';
import { UserIdentity } from '../../domain/entities/UserIdentity';
import { Usecase } from '../../domain/models/Usecase';
import { Identifiers } from '../../../Identifiers';
import { StripePaymentGateway } from '../../../../adapters/gateways/stripe/StripePaymentGateway';
import { StripeCustomerRepository } from '../../../../adapters/repositories/stripe/PostgresStripeCustomerRepository';
import { StripeSubscriptionRepository } from '../../../../adapters/repositories/stripe/PostgresStripeSubscriptionRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { ProfileRepository } from '../../domain/repositories/ProfileRepository';

export interface CreateStripeSubscriptionInput {
  user: UserIdentity;
  priceId: string;
  metadata?: Record<string, string>;
}

export interface CreateStripeSubscriptionOutput {
  subscriptionId: string;
  clientSecret: string;
  status: string;
}

@injectable()
export class CreateStripeSubscription implements Usecase<CreateStripeSubscriptionInput, CreateStripeSubscriptionOutput> {
  constructor(
    @inject(Identifiers.stripePaymentGateway)
    private readonly stripePaymentGateway: StripePaymentGateway,
    @inject(Identifiers.stripeCustomerRepository)
    private readonly stripeCustomerRepository: StripeCustomerRepository,
    @inject(Identifiers.stripeSubscriptionRepository)
    private readonly stripeSubscriptionRepository: StripeSubscriptionRepository,
    @inject(Identifiers.userRepository)
    private readonly userRepository: UserRepository,
    @inject(Identifiers.profileRepository)
    private readonly profileRepository: ProfileRepository,
  ) {}

  async execute(input: CreateStripeSubscriptionInput): Promise<CreateStripeSubscriptionOutput> {
    const { user, priceId, metadata } = input;

    // Get user details
    const userEntity = await this.userRepository.getById(user.id);
    if (!userEntity) {
      throw new Error('User not found');
    }

    // Check if user already has an active subscription
    const existingSubscription = await this.stripeSubscriptionRepository.findActiveByUserId(user.id);
    if (existingSubscription) {
      throw new Error('User already has an active subscription');
    }

    // Get or create Stripe customer
    let stripeCustomer = await this.stripeCustomerRepository.findByUserId(user.id);
    if (!stripeCustomer) {
      const profile = await this.profileRepository.getById(user.id);
      const customerData = await this.stripePaymentGateway.createCustomer(
        userEntity.props.email,
        profile.props.firstname + ' ' + profile.props.lastname
      );
      
      stripeCustomer = await this.stripeCustomerRepository.create({
        userId: user.id,
        stripeCustomerId: customerData.stripeCustomerId,
        email: customerData.email,
        name: customerData.name,
      });
    }

    // Create Stripe subscription (default_incomplete -> requires first payment)
    console.log('[CreateStripeSubscription] Creating subscription for customer:', stripeCustomer.stripeCustomerId);
    console.log('[CreateStripeSubscription] Price ID:', priceId);
    console.log('[CreateStripeSubscription] Metadata:', metadata);
    
    const subscriptionData = await this.stripePaymentGateway.createSubscription(
      stripeCustomer.stripeCustomerId,
      priceId,
      metadata
    );

    console.log('[CreateStripeSubscription] Stripe subscription data:', subscriptionData);

    // Save subscription to database
    await this.stripeSubscriptionRepository.create({
      userId: user.id,
      stripeCustomerId: stripeCustomer.stripeCustomerId,
      stripeSubscriptionId: subscriptionData.subscriptionId,
      priceId,
      status: subscriptionData.status,
      currentPeriodStart: subscriptionData.currentPeriodStart,
      currentPeriodEnd: subscriptionData.currentPeriodEnd,
      metadata: subscriptionData.metadata,
    });

    // Update user subscription status if subscription is active
    if (subscriptionData.status === 'active') {
      const userModel = await this.userRepository.getById(input.user.id);
      userModel.updateSubscriptionStatus(true);
      await this.userRepository.save(userModel);
    }

    const result = {
      subscriptionId: subscriptionData.subscriptionId,
      clientSecret: subscriptionData.clientSecret || '',
      status: subscriptionData.status,
    };

    console.log('[CreateStripeSubscription] Returning result:', result);
    return result;
  }
}
