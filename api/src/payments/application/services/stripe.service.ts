import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SettingsService } from '@/settings/application/services/settings.service';

@Injectable()
export class StripeService {
  private stripeInstance: Stripe | null = null;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
  ) {}

  private async getStripeClient(): Promise<Stripe> {
    const apiKey = await this.settingsService.findValueByName('stripeSecretKey');

    if (!apiKey) {
      this.logger.error('stripeSecretKey is not defined in the settings');
      throw new Error('STRIPE_NOT_CONFIGURED');
    }

    // Use SDK default pinned API version or configure a stable explicit version if required
    return new Stripe(apiKey);
  }

  async createConnectAccount(email: string, userId: string) {
    const stripe = await this.getStripeClient();
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      metadata: { userId },
    });
    return account;
  }

  async createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
    const stripe = await this.getStripeClient();
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
    return accountLink;
  }

  async createLoginLink(accountId: string) {
    const stripe = await this.getStripeClient();
    return await stripe.accounts.createLoginLink(accountId);
  }

  async createCheckoutSession(params: {
    amount: number;
    currency: string;
    name: string;
    successUrl: string;
    cancelUrl: string;
    connectedAccountId?: string;
    metadata: any;
    applicationFeeAmount?: number;
    allowPayWhatYouWant?: boolean;
    minAmount?: number;
    mode?: Stripe.Checkout.SessionCreateParams.Mode;
    subscription_data?: any;
  }) {
    const stripe = await this.getStripeClient();

    const line_items: any[] = [];

    if (params.allowPayWhatYouWant) {
      line_items.push({
        price_data: {
          currency: params.currency,
          product_data: {
            name: params.name,
          },
          // For PWYW we can use a variable price or just a standard price if UI handles the input
          // But Stripe Checkout supports 'price_data.unit_amount'
          // If we want actual PWYW in Checkout, we should use 'adjustable_quantity' or separate prices.
          // However, the common way for "Pay What You Want" where user enters amount BEFORE checkout:
          unit_amount: Math.round(params.amount * 100),
          recurring:
            params.mode === 'subscription' ? { interval: 'month' } : undefined,
        },
        quantity: 1,
      });
    } else {
      line_items.push({
        price_data: {
          currency: params.currency,
          product_data: {
            name: params.name,
          },
          unit_amount: Math.round(params.amount * 100),
          recurring:
            params.mode === 'subscription' ? { interval: 'month' } : undefined,
        },
        quantity: 1,
      });
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items,
      mode: params.mode || 'payment',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
      subscription_data: params.subscription_data,
    };

    if (params.connectedAccountId) {
      sessionParams.payment_intent_data = {
        application_fee_amount: params.applicationFeeAmount,
        transfer_data: {
          destination: params.connectedAccountId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return session;
  }

  async retrieveAccount(accountId: string) {
    const stripe = await this.getStripeClient();
    return await stripe.accounts.retrieve(accountId);
  }

  async retrieveCheckoutSession(sessionId: string) {
    const stripe = await this.getStripeClient();
    return await stripe.checkout.sessions.retrieve(sessionId);
  }

  async cancelSubscription(subscriptionId: string) {
    const stripe = await this.getStripeClient();
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  async deleteSubscription(subscriptionId: string) {
    const stripe = await this.getStripeClient();
    return await stripe.subscriptions.cancel(subscriptionId);
  }

  async retrieveSubscription(subscriptionId: string) {
    const stripe = await this.getStripeClient();
    return await stripe.subscriptions.retrieve(subscriptionId);
  }

  async constructEvent(payload: string | Buffer, sig: string, secret: string) {
    const stripe = await this.getStripeClient();
    return stripe.webhooks.constructEvent(payload, sig, secret);
  }
}
