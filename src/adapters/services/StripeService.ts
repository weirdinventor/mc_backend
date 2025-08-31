import Stripe from 'stripe';
import { injectable } from 'inversify';

@injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.NODE_ENV === 'production' 
      ? process.env.STRIPE_SECRET_KEY_PROD 
      : process.env.STRIPE_SECRET_KEY_TEST;

    if (!secretKey) {
      throw new Error('Stripe secret key is not configured');
    }

    this.stripe = new Stripe(secretKey);
  }

  getStripeInstance(): Stripe {
    return this.stripe;
  }

  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    return await this.stripe.customers.create({
      email,
      name,
    });
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    return await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
  }

  async createSubscription(
    customerId: string, 
    priceId: string, 
    metadata?: Record<string, string>
  ): Promise<Stripe.Subscription> {
    console.log('[StripeService] Creating subscription with immediate payment attempt');
    
    // Créer la subscription avec paiement immédiat
    return await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete', // Permet de récupérer le PaymentIntent si échec
      collection_method: 'charge_automatically',
      payment_settings: { 
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription' 
      },
      expand: ['latest_invoice.payment_intent'],
      metadata,
    });
  }

  // Nouvelle méthode pour créer une subscription avec trial puis paiement immédiat
  async createSubscriptionWithImmediatePayment(
    customerId: string, 
    priceId: string, 
    metadata?: Record<string, string>
  ): Promise<Stripe.Subscription> {
    console.log('[StripeService] Creating subscription with immediate billing');
    
    // Étape 1: Créer subscription avec trial court
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_end: Math.floor(Date.now() / 1000) + 60, // Trial de 1 minute
      payment_behavior: 'allow_incomplete',
      collection_method: 'charge_automatically',
      payment_settings: { 
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription' 
      },
      expand: ['latest_invoice.payment_intent'],
      metadata,
    });

    // Étape 2: Terminer le trial immédiatement pour déclencher la facturation
    console.log('[StripeService] Ending trial to trigger immediate billing');
    const updatedSubscription = await this.stripe.subscriptions.update(subscription.id, {
      trial_end: 'now',
      expand: ['latest_invoice.payment_intent'],
    });

    return updatedSubscription;
  }

  async createSetupIntent(
    customerId: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.SetupIntent> {
    console.log('[StripeService] Creating SetupIntent for customer:', customerId);
    return await this.stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata,
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'eur',
    customerId?: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency,
      customer: customerId,
      metadata,
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.cancel(subscriptionId, {
      expand: ['latest_invoice'],
    });
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice'],
    });
  }

  async getCustomerSubscriptions(customerId: string): Promise<Stripe.ApiList<Stripe.Subscription>> {
    console.log('[StripeService] Getting subscriptions for customer:', customerId);
    return await this.stripe.subscriptions.list({
      customer: customerId,
      expand: ['data.latest_invoice', 'data.items.data.price'],
      limit: 100, // Récupère jusqu'à 100 subscriptions
    });
  }

  async constructEvent(payload: string | Buffer, signature: string): Promise<Stripe.Event> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret is not configured');
    }

    console.log('[StripeService] Constructing event with:', {
      payloadType: typeof payload,
      isBuffer: Buffer.isBuffer(payload),
      payloadLength: payload ? payload.length : 0,
      webhookSecretPresent: !!webhookSecret,
      signaturePresent: !!signature
    });

    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  // Méthode utilitaire pour récupérer les périodes d'une subscription
  async getSubscriptionWithPeriods(subscriptionId: string): Promise<{
    subscription: Stripe.Subscription;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  }> {
    const subscription = await this.getSubscription(subscriptionId);
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    
    let currentPeriodStart = new Date(subscription.created * 1000);
    let currentPeriodEnd = new Date(subscription.created * 1000);

    if (invoice) {
      currentPeriodStart = new Date(invoice.period_start * 1000);
      currentPeriodEnd = new Date(invoice.period_end * 1000);
    }

    return {
      subscription,
      currentPeriodStart,
      currentPeriodEnd,
    };
  }
}
