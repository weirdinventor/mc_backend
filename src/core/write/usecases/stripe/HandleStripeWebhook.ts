import { inject, injectable } from 'inversify';
import { Usecase } from '../../domain/models/Usecase';
import { Identifiers } from '../../../Identifiers';
import { StripePaymentGateway } from '../../../../adapters/gateways/stripe/StripePaymentGateway';
import { StripeSubscriptionRepository } from '../../../../adapters/repositories/stripe/PostgresStripeSubscriptionRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import Stripe from 'stripe';

export interface HandleStripeWebhookInput {
  payload: string;
  signature: string;
}

export interface HandleStripeWebhookOutput {
  processed: boolean;
  eventType: string;
}

@injectable()
export class HandleStripeWebhook implements Usecase<HandleStripeWebhookInput, HandleStripeWebhookOutput> {
  constructor(
    @inject(Identifiers.stripePaymentGateway)
    private readonly stripePaymentGateway: StripePaymentGateway,
    @inject(Identifiers.stripeSubscriptionRepository)
    private readonly stripeSubscriptionRepository: StripeSubscriptionRepository,
    @inject(Identifiers.userRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: HandleStripeWebhookInput): Promise<HandleStripeWebhookOutput> {
    const { payload, signature } = input;

    // Verify webhook signature
    const event = await this.stripePaymentGateway.handleWebhook(payload, signature);

    console.log(`[Stripe Webhook] Processing event: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return {
      processed: true,
      eventType: event.type,
    };
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const stripeSubscription = await this.stripeSubscriptionRepository.findByStripeSubscriptionId(subscription.id);
    
    if (!stripeSubscription) {
      console.log(`[Stripe Webhook] Subscription ${subscription.id} not found in database`);
      return;
    }

    // Pour obtenir les périodes correctes, on utilise la facture
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    let currentPeriodStart = new Date(subscription.created * 1000);
    let currentPeriodEnd = new Date(subscription.created * 1000);

    if (invoice) {
      currentPeriodStart = new Date(invoice.period_start * 1000);
      currentPeriodEnd = new Date(invoice.period_end * 1000);
    }

    // Update subscription status
    await this.stripeSubscriptionRepository.updateByStripeSubscriptionId(subscription.id, {
      status: subscription.status,
      currentPeriodStart,
      currentPeriodEnd,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : undefined,
    });

    // Update user subscription status
    const user = await this.userRepository.getById(stripeSubscription.userId);
    if (user) {
      const isActive = subscription.status === 'active';
      user.updateSubscriptionStatus(isActive);
      await this.userRepository.save(user);
      
      console.log(`[Stripe Webhook] Updated user ${stripeSubscription.userId} subscription status to ${isActive}`);
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const stripeSubscription = await this.stripeSubscriptionRepository.findByStripeSubscriptionId(subscription.id);
    
    if (!stripeSubscription) {
      console.log(`[Stripe Webhook] Subscription ${subscription.id} not found in database`);
      return;
    }

    // Update subscription status
    await this.stripeSubscriptionRepository.updateByStripeSubscriptionId(subscription.id, {
      status: 'canceled',
      canceledAt: new Date(),
    });

    // Update user subscription status
    const user = await this.userRepository.getById(stripeSubscription.userId);
    if (user) {
      user.updateSubscriptionStatus(false);
      await this.userRepository.save(user);
      
      console.log(`[Stripe Webhook] Canceled subscription for user ${stripeSubscription.userId}`);
    }
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = (invoice as any).subscription;
    if (!subscriptionId) return;

    const stripeSubscription = await this.stripeSubscriptionRepository.findByStripeSubscriptionId(subscriptionId as string);
    
    if (!stripeSubscription) {
      console.log(`[Stripe Webhook] Subscription ${subscriptionId} not found in database`);
      return;
    }

    console.log(`[Stripe Webhook] Payment succeeded for subscription ${subscriptionId}`);
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = (invoice as any).subscription;
    if (!subscriptionId) return;

    const stripeSubscription = await this.stripeSubscriptionRepository.findByStripeSubscriptionId(subscriptionId as string);
    
    if (!stripeSubscription) {
      console.log(`[Stripe Webhook] Subscription ${subscriptionId} not found in database`);
      return;
    }

    console.log(`[Stripe Webhook] Payment failed for subscription ${subscriptionId}`);
    
    // Could implement retry logic or notification here
  }
}
