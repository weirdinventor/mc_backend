import { inject, injectable } from 'inversify';
import { Usecase } from '../../domain/models/Usecase';
import { Identifiers } from '../../../Identifiers';
import { StripePaymentGateway } from '../../../../adapters/gateways/stripe/StripePaymentGateway';
import { StripeSubscriptionRepository } from '../../../../adapters/repositories/stripe/PostgresStripeSubscriptionRepository';
import { UserIdentity } from '../../domain/entities/UserIdentity';

export interface GetStripeSubscriptionInput {
  user: UserIdentity;
  subscriptionId: string;
}

export interface GetStripeSubscriptionOutput {
  subscriptionId: string;
  status: string;
  priceId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  metadata?: Record<string, string>;
}

@injectable()
export class GetStripeSubscription implements Usecase<GetStripeSubscriptionInput, GetStripeSubscriptionOutput> {
  constructor(
    @inject(Identifiers.stripePaymentGateway)
    private readonly stripePaymentGateway: StripePaymentGateway,
    @inject(Identifiers.stripeSubscriptionRepository)
    private readonly stripeSubscriptionRepository: StripeSubscriptionRepository,
  ) {}

  async execute(input: GetStripeSubscriptionInput): Promise<GetStripeSubscriptionOutput> {
    const { user, subscriptionId } = input;

    // Vérifier que la subscription appartient au user
    const sub = await this.stripeSubscriptionRepository.findByStripeSubscriptionId(subscriptionId);
    if (!sub || sub.userId !== user.id) {
      throw new Error('Subscription not found or access denied');
    }

    const data = await this.stripePaymentGateway.getSubscriptionStatus(subscriptionId);

    return {
      subscriptionId: data.subscriptionId,
      status: data.status,
      priceId: data.priceId,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      metadata: (data.metadata || {}) as Record<string, string>,
    };
  }
}
