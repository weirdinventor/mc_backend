export interface PaymentGateway {
  createCustomer(email: string, name?: string): Promise<any>;
  createSubscription(customerId: string, priceId: string, metadata?: Record<string, string>): Promise<any>;
  createPaymentIntent(amount: number, currency?: string, customerId?: string, metadata?: Record<string, string>): Promise<any>;
  cancelSubscription(subscriptionId: string): Promise<any>;
  getSubscriptionStatus(subscriptionId: string): Promise<any>;
  getCustomerSubscriptions(customerId: string): Promise<StripeSubscriptionData[]>;
  handleWebhook(payload: string | Buffer, signature: string): Promise<any>;
}

export interface StripeCustomerData {
  id: string;
  email: string;
  name?: string;
  stripeCustomerId: string;
}

export interface StripeSubscriptionData {
  id: string;
  customerId: string;
  subscriptionId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  priceId: string;
  metadata?: Record<string, string>;
  // Expose the client secret of the initial invoice payment intent when available
  clientSecret?: string;
}

export interface PaymentIntentData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
  customerId?: string;
  metadata?: Record<string, string>;
}
