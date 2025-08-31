import { injectable, inject } from 'inversify';
import Stripe from 'stripe';
import { 
  PaymentGateway, 
  StripeCustomerData, 
  StripeSubscriptionData, 
  PaymentIntentData 
} from '../../../core/write/domain/gateway/PaymentGateway';
import { StripeService } from '../../services/StripeService';
import { Identifiers } from '../../../core/Identifiers';

@injectable()
export class StripePaymentGateway implements PaymentGateway {
  constructor(
    @inject(Identifiers.stripeService)
    private readonly stripeService: StripeService
  ) {}

  async createCustomer(email: string, name?: string): Promise<StripeCustomerData> {
    const customer = await this.stripeService.createCustomer(email, name);
    
    return {
      id: customer.id,
      email: customer.email!,
      name: customer.name || undefined,
      stripeCustomerId: customer.id,
    };
  }

  async createSubscription(
    customerId: string, 
    priceId: string, 
    metadata?: Record<string, string>
  ): Promise<StripeSubscriptionData> {
    console.log('[StripePaymentGateway] Creating subscription for customer:', customerId);
    
    // Vérifier d'abord si le customer a une méthode de paiement par défaut
    const customer = await this.stripeService.getCustomer(customerId);
    
    if (!customer.default_source && !customer.invoice_settings?.default_payment_method) {
      console.log('[StripePaymentGateway] No default payment method, creating SetupIntent first');
      
      // Créer d'abord une subscription en mode setup
      const subscription = await this.stripeService.createSubscription(customerId, priceId, metadata);
      
      console.log('[StripePaymentGateway] Subscription created:', {
        id: subscription.id,
        status: subscription.status,
        hasLatestInvoice: !!subscription.latest_invoice
      });
      
      return await this.buildSubscriptionResponse(subscription, customerId, metadata);
    } else {
      console.log('[StripePaymentGateway] Customer has payment method, creating with immediate payment');
      
      // Le customer a déjà une méthode de paiement, utiliser le paiement immédiat
      const subscription = await this.stripeService.createSubscriptionWithImmediatePayment(customerId, priceId, metadata);
      
      console.log('[StripePaymentGateway] Subscription with immediate payment created:', {
        id: subscription.id,
        status: subscription.status,
        hasLatestInvoice: !!subscription.latest_invoice
      });
      
      return await this.buildSubscriptionResponse(subscription, customerId, metadata);
    }
  }

  private async buildSubscriptionResponse(
    subscription: any, 
    customerId: string, 
    metadata?: Record<string, string>
  ): Promise<StripeSubscriptionData> {
    
    // Pour obtenir les périodes, nous devons récupérer la dernière facture
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    let currentPeriodStart = new Date(subscription.created * 1000);
    let currentPeriodEnd = new Date(subscription.created * 1000);

    if (invoice) {
      console.log('[StripePaymentGateway] Invoice found:', {
        id: invoice.id,
        hasPaymentIntent: !!(invoice as any).payment_intent
      });
      currentPeriodStart = new Date(invoice.period_start * 1000);
      currentPeriodEnd = new Date(invoice.period_end * 1000);
    } else {
      console.log('[StripePaymentGateway] No invoice found in subscription');
    }
    
    // Try getting client secret from expanded latest_invoice.payment_intent
    const paymentIntent = (invoice && (invoice as any).payment_intent) as Stripe.PaymentIntent | undefined;
    let clientSecret = paymentIntent?.client_secret;
    
    console.log('[StripePaymentGateway] PaymentIntent details:', {
      hasPaymentIntent: !!paymentIntent,
      paymentIntentId: paymentIntent?.id,
      clientSecret: clientSecret ? 'PRESENT' : 'MISSING',
      clientSecretLength: clientSecret?.length || 0
    });

    // Fallback: Si pas de PaymentIntent, créer un SetupIntent pour collecter le moyen de paiement
    if (!clientSecret && subscription.status === 'incomplete') {
      console.log('[StripePaymentGateway] No PaymentIntent found, creating SetupIntent as fallback');
      const setupIntent = await this.stripeService.createSetupIntent(customerId, {
        ...metadata,
        subscription_id: subscription.id,
      });
      clientSecret = setupIntent.client_secret;
      console.log('[StripePaymentGateway] SetupIntent created with client_secret:', clientSecret ? 'PRESENT' : 'STILL_MISSING');
    }
    
    return {
      id: subscription.id,
      customerId: subscription.customer as string,
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart,
      currentPeriodEnd,
      priceId: subscription.items.data[0].price.id,
      metadata: subscription.metadata || {},
      clientSecret,
    };
  }

  async createPaymentIntent(
    amount: number, 
    currency: string = 'eur', 
    customerId?: string, 
    metadata?: Record<string, string>
  ): Promise<PaymentIntentData> {
    const paymentIntent = await this.stripeService.createPaymentIntent(amount, currency, customerId, metadata);
    
    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert back from cents
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret!,
      customerId: (paymentIntent.customer as string) || undefined,
      metadata: paymentIntent.metadata || {},
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<StripeSubscriptionData> {
    const subscription = await this.stripeService.cancelSubscription(subscriptionId);
    
    // Pour les subscriptions annulées, on utilise la facture pour obtenir les périodes
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    let currentPeriodStart = new Date(subscription.created * 1000);
    let currentPeriodEnd = new Date(subscription.created * 1000);

    if (invoice) {
      currentPeriodStart = new Date(invoice.period_start * 1000);
      currentPeriodEnd = new Date(invoice.period_end * 1000);
    }
    
    return {
      id: subscription.id,
      customerId: subscription.customer as string,
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart,
      currentPeriodEnd,
      priceId: subscription.items.data[0].price.id,
      metadata: subscription.metadata || {},
    };
  }

  async getSubscriptionStatus(subscriptionId: string): Promise<StripeSubscriptionData> {
    const { subscription, currentPeriodStart, currentPeriodEnd } = 
      await this.stripeService.getSubscriptionWithPeriods(subscriptionId);
    
    return {
      id: subscription.id,
      customerId: subscription.customer as string,
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart,
      currentPeriodEnd,
      priceId: subscription.items.data[0].price.id,
      metadata: subscription.metadata || {},
    };
  }

  async getCustomerSubscriptions(customerId: string): Promise<StripeSubscriptionData[]> {
    console.log('[StripePaymentGateway] Getting subscriptions for customer:', customerId);
    
    const subscriptions = await this.stripeService.getCustomerSubscriptions(customerId);
    
    return subscriptions.data.map(subscription => {
      // Calculer les dates de période depuis l'abonnement
      let currentPeriodStart = new Date(subscription.created * 1000);
      let currentPeriodEnd = new Date(subscription.created * 1000);

      // Pour les subscriptions actives, utiliser les propriétés current_period_*
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        // Pour les subscriptions actives, Stripe expose current_period_start et current_period_end
        const sub = subscription as any; // Cast pour accéder aux propriétés
        if (sub.current_period_start && sub.current_period_end) {
          currentPeriodStart = new Date(sub.current_period_start * 1000);
          currentPeriodEnd = new Date(sub.current_period_end * 1000);
        }
      }
      
      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodStart,
        currentPeriodEnd,
        priceId: subscription.items.data[0]?.price.id || '',
        metadata: subscription.metadata || {},
      };
    });
  }

  async handleWebhook(payload: string | Buffer, signature: string): Promise<Stripe.Event> {
    return await this.stripeService.constructEvent(payload, signature);
  }
}
