import { injectable } from 'inversify';
import { Body, Delete, Get, JsonController, Param, Post, Req, Res, UseBefore } from 'routing-controllers';
import { Response } from 'express';
import { AuthenticatedRequest } from '../../config/AuthenticatedRequest';
import { AuthenticationMiddleware } from '../../middlewares/AuthenticationMiddleware';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { UserRepository } from '../../../core/write/domain/repositories/UserRepository';
import { Identifiers } from '../../../core/Identifiers';
import { inject } from 'inversify';
import { PaymentGateway } from '../../../core/write/domain/gateway/PaymentGateway';
import { StripeCustomerRepository } from '../../../adapters/repositories/stripe/PostgresStripeCustomerRepository';
import { ProfileRepository } from '../../../core/write/domain/repositories/ProfileRepository';

export class CreateSubscriptionCommand {
  @IsString()
  priceId: string;

  @IsOptional()
  metadata?: Record<string, string>;
}

export class ConfirmSubscriptionCommand {
  @IsString()
  subscriptionId: string;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}

export class CreatePaymentIntentCommand {
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  metadata?: Record<string, string>;
}

@JsonController('/stripe')
@injectable()
export class StripeController {
  constructor(
    @inject(Identifiers.stripePaymentGateway) private stripePaymentGateway: PaymentGateway,
    @inject(Identifiers.userRepository) private userRepository: UserRepository,
    @inject(Identifiers.stripeCustomerRepository) private stripeCustomerRepository: StripeCustomerRepository,
    @inject(Identifiers.profileRepository) private profileRepository: ProfileRepository,
  ) {}

  @UseBefore(AuthenticationMiddleware)
  @Post('/create-subscription')
  async createSubscription(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() body: CreateSubscriptionCommand,
  ) {
    try {
      console.log('[StripeController] Creating subscription for user:', req.identity.id);
      console.log('[StripeController] Request body:', body);
      
      // Get or create Stripe customer
      let stripeCustomer = await this.stripeCustomerRepository.findByUserId(req.identity.id);
      
      if (!stripeCustomer) {
        console.log('[StripeController] No Stripe customer found, creating one...');
        
        // Get user details
        const userEntity = await this.userRepository.getById(req.identity.id);
        const profile = await this.profileRepository.getById(req.identity.id);
        
        // Create Stripe customer
        const customerData = await this.stripePaymentGateway.createCustomer(
          userEntity.props.email,
          profile.props.firstname + ' ' + profile.props.lastname
        );
        
        // Save to database
        stripeCustomer = await this.stripeCustomerRepository.create({
          userId: req.identity.id,
          stripeCustomerId: customerData.stripeCustomerId,
          email: customerData.email,
          name: customerData.name,
        });
        
        console.log('[StripeController] Stripe customer created:', stripeCustomer.stripeCustomerId);
      } else {
        console.log('[StripeController] Using existing Stripe customer:', stripeCustomer.stripeCustomerId);
      }

      // Create subscription with Stripe customer ID
      const result = await this.stripePaymentGateway.createSubscription(
        stripeCustomer.stripeCustomerId,
        body.priceId,
        body.metadata
      );

      console.log('[StripeController] Subscription created successfully:', result);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('[StripeController] Create subscription error:', error);
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

    @UseBefore(AuthenticationMiddleware)
  @Post('/confirm-subscription')
  async confirmSubscription(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() body: ConfirmSubscriptionCommand,
  ) {
    try {
      console.log('[StripeController] Confirming subscription for user:', req.identity.id);
      console.log('[StripeController] Request body:', body);

      // Get the subscription status from Stripe
      const subscription = await this.stripePaymentGateway.getSubscriptionStatus(body.subscriptionId);
      
      console.log('[StripeController] Subscription status from Stripe:', subscription);

      if (subscription && (subscription.status === 'active' || subscription.status === 'incomplete')) {
        // Update user subscription status
        const userModel = await this.userRepository.getById(req.identity.id);
        userModel.updateSubscriptionStatus(true);
        await this.userRepository.save(userModel);

        console.log('[StripeController] User subscription status updated to active');
        
        return res.status(200).json({
          success: true,
          data: {
            subscriptionStatus: subscription.status,
            isSubscribed: true
          }
        });
      } else {
        console.log('[StripeController] Subscription not active, status:', subscription?.status);
        
        return res.status(400).json({
          success: false,
          error: `Subscription is not active. Status: ${subscription?.status}`
        });
      }
    } catch (error) {
      console.error('[StripeController] Confirm subscription error:', error);
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @UseBefore(AuthenticationMiddleware)
  @Post('/create-payment-intent')
  async createPaymentIntent(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() body: CreatePaymentIntentCommand,
  ) {
    try {
      const result = await this.stripePaymentGateway.createPaymentIntent(
        body.amount,
        body.currency,
        req.identity.id,
        body.metadata,
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('[StripeController] Create payment intent error:', error);
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

    @Post('/webhook')
  async handleWebhook(
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      const signature = req.headers['stripe-signature'];
      
      // Pour les webhooks Stripe, nous devons utiliser le raw body
      let payload;
      if (req.rawBody) {
        // Raw body stocké par notre middleware
        payload = req.rawBody;
      } else if (Buffer.isBuffer(req.body)) {
        // Body déjà en buffer (middleware raw)
        payload = req.body;
      } else {
        // Fallback - convertir en string
        payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }

      if (!signature) {
        console.error('[StripeController] Missing stripe-signature header');
        return res.status(400).json({
          success: false,
          error: 'Missing stripe-signature header',
        });
      }

      console.log('[StripeController] Webhook received:', {
        signature: signature ? 'present' : 'missing',
        payloadType: typeof payload,
        payloadLength: payload ? payload.length : 0,
        isBuffer: Buffer.isBuffer(payload)
      });

      const event = await this.stripePaymentGateway.handleWebhook(
        payload,
        signature,
      );

      console.log('[StripeController] Received webhook event:', event.type, event.id);

      // Gérer les différents types d'événements
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionEvent(event);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event);
          break;
        case 'setup_intent.succeeded':
          await this.handleSetupIntentSucceeded(event);
          break;
        case 'payment_intent.succeeded':
          console.log('[StripeController] Payment succeeded:', event.id);
          break;
        default:
          console.log('[StripeController] Unhandled event type:', event.type);
      }

      return res.status(200).json({
        success: true,
        data: { received: true, eventType: event.type },
      });
    } catch (error) {
      console.error('[StripeController] Webhook error:', error);
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Webhook validation failed',
      });
    }
  }

  private async handleSubscriptionEvent(event: any) {
    const subscription = event.data.object;
    console.log('[StripeController] Subscription event:', {
      id: subscription.id,
      status: subscription.status,
      customerId: subscription.customer,
    });

    // TODO: Mettre à jour le statut de l'utilisateur selon le statut de la subscription
    // Si subscription.status === 'active', mettre isSubscribed = true
    // Si subscription.status === 'canceled' ou 'incomplete_expired', mettre isSubscribed = false
  }

  private async handlePaymentSucceeded(event: any) {
    const invoice = event.data.object;
    console.log('[StripeController] Payment succeeded:', {
      id: invoice.id,
      subscriptionId: invoice.subscription,
      customerId: invoice.customer,
    });

    // TODO: Marquer l'utilisateur comme abonné si ce n'est pas déjà fait
  }

  private async handlePaymentFailed(event: any) {
    const invoice = event.data.object;
    console.log('[StripeController] Payment failed:', {
      id: invoice.id,
      subscriptionId: invoice.subscription,
      customerId: invoice.customer,
    });

    // TODO: Optionnellement, notifier l'utilisateur ou suspendre l'accès
  }

  private async handleSetupIntentSucceeded(event: any) {
    const setupIntent = event.data.object;
    console.log('[StripeController] SetupIntent succeeded:', {
      id: setupIntent.id,
      customerId: setupIntent.customer,
      paymentMethodId: setupIntent.payment_method,
    });

    // Chercher les subscriptions incomplètes pour ce customer et essayer de les activer
    if (setupIntent.customer && setupIntent.payment_method) {
      try {
        // TODO: Implémenter la logique pour activer les subscriptions incomplètes
        console.log('[StripeController] TODO: Activate incomplete subscriptions for customer:', setupIntent.customer);
      } catch (error) {
        console.error('[StripeController] Error activating subscriptions:', error);
      }
    }
  }

  @UseBefore(AuthenticationMiddleware)
  @Get('/subscriptions/:id')
  async getSubscription(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    try {
      const result = await this.stripePaymentGateway.getSubscriptionStatus(id);

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('[StripeController] Get subscription error:', error);
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @UseBefore(AuthenticationMiddleware)
  @Delete('/subscriptions/:id')
  async cancelSubscription(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    try {
      const result = await this.stripePaymentGateway.cancelSubscription(id);

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('[StripeController] Cancel subscription error:', error);
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @UseBefore(AuthenticationMiddleware)
  @Get('/subscription-status')
  async getSubscriptionStatus(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    try {
      console.log('[StripeController] Getting subscription status for user:', req.identity.id);
      
      // Find user's Stripe customer
      const stripeCustomer = await this.stripeCustomerRepository.findByUserId(req.identity.id);
      
      if (!stripeCustomer) {
        console.log('[StripeController] No Stripe customer found for user');
        return res.status(200).json({
          success: true,
          data: {
            hasActiveSubscription: false,
            subscriptions: [],
          },
        });
      }

      // Get customer's subscriptions from Stripe
      const subscriptions = await this.stripePaymentGateway.getCustomerSubscriptions(stripeCustomer.stripeCustomerId);
      
      console.log('[StripeController] Found subscriptions:', subscriptions);

      return res.status(200).json({
        success: true,
        data: {
          hasActiveSubscription: subscriptions.some(sub => sub.status === 'active'),
          subscriptions: subscriptions,
        },
      });
    } catch (error) {
      console.error('[StripeController] Get subscription status error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}
