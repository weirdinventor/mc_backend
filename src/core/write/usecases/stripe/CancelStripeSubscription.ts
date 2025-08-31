import { inject, injectable } from 'inversify';
import { Usecase } from '../../domain/models/Usecase';
import { Identifiers } from '../../../Identifiers';
import { StripePaymentGateway } from '../../../../adapters/gateways/stripe/StripePaymentGateway';
import { StripeSubscriptionRepository } from '../../../../adapters/repositories/stripe/PostgresStripeSubscriptionRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { UserIdentity } from '../../domain/entities/UserIdentity';

export interface CancelStripeSubscriptionInput {
  user: UserIdentity;
  subscriptionId: string;
}

export interface CancelStripeSubscriptionOutput {
  subscriptionId: string;
  status: string;
  currentPeriodEnd?: Date;
}

@injectable()
export class CancelStripeSubscription implements Usecase<CancelStripeSubscriptionInput, CancelStripeSubscriptionOutput> {
  constructor(
    @inject(Identifiers.stripePaymentGateway)
    private readonly stripePaymentGateway: StripePaymentGateway,
    @inject(Identifiers.stripeSubscriptionRepository)
    private readonly stripeSubscriptionRepository: StripeSubscriptionRepository,
    @inject(Identifiers.userRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: CancelStripeSubscriptionInput): Promise<CancelStripeSubscriptionOutput> {
    const { user, subscriptionId } = input;

    // Vérifier l'appartenance de la subscription au user
    const sub = await this.stripeSubscriptionRepository.findByStripeSubscriptionId(subscriptionId);
    if (!sub || sub.userId !== user.id) {
      throw new Error('Subscription not found or access denied');
    }

    // Annuler sur Stripe
    const canceled = await this.stripePaymentGateway.cancelSubscription(subscriptionId);

    // Mettre à jour la DB
    await this.stripeSubscriptionRepository.updateByStripeSubscriptionId(subscriptionId, {
      status: canceled.status,
      canceledAt: new Date(),
      currentPeriodEnd: canceled.currentPeriodEnd,
    });

    // Si annulation immédiate -> enlever l'abonnement de l'utilisateur
    if (canceled.status === 'canceled') {
      const userModel = await this.userRepository.getById(user.id);
      if (userModel) {
        userModel.updateSubscriptionStatus(false);
        await this.userRepository.save(userModel);
      }
    }

    return {
      subscriptionId,
      status: canceled.status,
      currentPeriodEnd: canceled.currentPeriodEnd,
    };
  }
}
