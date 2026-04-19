import {
  Controller,
  Post,
  Get,
  Query,
  UseGuards,
  Req,
  Body,
  Param,
  Headers,
  RawBodyRequest,
  BadRequestException,
  ForbiddenException,
  Res,
} from '@nestjs/common';
import { StripeService } from '@/payments/application/services/stripe.service';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '@/settings/application/services/settings.service';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { CreditsService } from '@/credits/application/services/credits.service';
import { GetUserProfileUseCase } from '@/identity/application/use-cases/get-user-profile.use-case';
import { Request, Response } from 'express';
import { NotificationsManagerService } from '@/notifications/application/services/notifications.manager.service';
import { NotificationType } from '@/notifications/domain/model/notification.model';
import { PoliciesGuard } from '@/identity/infrastructure/guards/policies.guard';
import { CheckPolicies } from '@/common/infrastructure/decorators/check-policies.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
    private readonly creditsService: CreditsService,
    private readonly notificationsManager: NotificationsManagerService,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
  ) {}

  @UseGuards(AuthGuard, PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Create, 'Purchase'))
  @Post('checkout/account')
  async createAccountCheckout(@GetUser() user: User) {
    const profile = await this.getUserProfileUseCase.execute(user);
    const isActuallyPaid =
      user.hasPaidAccount ||
      (user.subscriptionExpiresAt && user.subscriptionExpiresAt > new Date());

    if (profile?.isPaid && isActuallyPaid) {
      throw new BadRequestException('You already have a paid account');
    }

    const isPaidAccountEnabledRaw = await this.settingsService.findValueByName(
      'monetizationPaidAccountEnabled',
      false,
    );
    const isPaidAccountEnabled =
      isPaidAccountEnabledRaw === 'true' || isPaidAccountEnabledRaw === true;

    if (!isPaidAccountEnabled) {
      throw new BadRequestException('Paid accounts are not enabled');
    }

    const price = await this.settingsService.findValueByName(
      'monetizationPaidAccountPrice',
      0,
    );

    if (price <= 0) {
      throw new BadRequestException('Invalid account price');
    }

    const appUrl = this.configService.get('FRONTEND_URL');

    const session = await this.stripeService.createCheckoutSession({
      amount: Number(price),
      currency: 'usd',
      name: 'Monthly Account Subscription',
      successUrl: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/checkout/cancel`,
      mode: 'subscription',
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
      metadata: {
        userId: user.id,
        type: 'account_subscription',
      },
    });

    await this.prisma.purchase.create({
      data: {
        userId: user.id,
        amount: Number(price),
        stripeSessionId: session.id,
        status: 'pending',
      },
    });

    return { url: session.url };
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Create, 'Purchase'))
  @Post('checkout/channel/:id')
  async createChannelCheckout(
    @GetUser() user: User,
    @Param('id') channelId: string,
  ) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { owner: true },
    });

    if (!channel || !channel.price) {
      throw new BadRequestException('Channel not found or has no price');
    }

    const appUrl = this.configService.get('FRONTEND_URL');
    const amount = Number(channel.price);

    const session = await this.stripeService.createCheckoutSession({
      amount: amount,
      currency: 'usd',
      name: channel.name || 'Channel Subscription',
      successUrl: `${appUrl}/channels/${channel.slug}?payment=success`,
      cancelUrl: `${appUrl}/channels/${channel.slug}?payment=cancel`,
      mode: 'subscription',
      metadata: {
        userId: user.id,
        channelId: channel.id,
        type: 'channel_subscription',
      },
    });

    await this.prisma.purchase.create({
      data: {
        userId: user.id,
        amount: amount,
        stripeSessionId: session.id,
        status: 'pending',
      },
    });

    return { url: session.url };
  }

  @UseGuards(AuthGuard)
  @Get('stripe-status')
  async getStripeStatus() {
    const apiKey =
      await this.settingsService.findValueByName('stripeSecretKey');

    return {
      isConfigured: !!apiKey,
    };
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Create, 'Purchase'))
  @Post('credits/checkout')
  async createCreditsCheckout(
    @GetUser() user: User,
    @Body('amount') amount: number, // amount in USD
  ) {
    if (!amount || amount < 1) {
      throw new BadRequestException('Minimum amount is 1 USD');
    }

    const frontendUrl = this.configService.get('FRONTEND_URL');

    try {
      const session = await this.stripeService.createCheckoutSession({
        amount: amount,
        currency: 'usd',
        name: `Buy Credits (${amount * 10} credits)`,
        successUrl: `${frontendUrl}/studio/credits?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${frontendUrl}/studio/credits?payment=cancel`,
        metadata: {
          userId: user.id,
          type: 'credits_purchase',
          usdAmount: amount.toString(),
        },
      });

      return { url: session.url };
    } catch (error) {
      if (error.message === 'STRIPE_NOT_CONFIGURED') {
        throw new BadRequestException('STRIPE_NOT_CONFIGURED');
      }
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Post('confirm-payment')
  async confirmPayment(@Body('sessionId') sessionId: string) {
    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }

    const session = await this.stripeService.retrieveCheckoutSession(sessionId);

    if (session.payment_status === 'paid') {
      await this.handleCheckoutSessionCompleted(session);
      return { success: true };
    }

    return { success: false, status: session.payment_status };
  }

  @UseGuards(AuthGuard)
  @Get('transactions')
  async getTransactions(
    @GetUser() user: User,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    const [purchases, credits, totalPurchases, totalCredits] =
      await Promise.all([
        this.prisma.purchase.findMany({
          where: { userId: user.id },
          include: {
            publication: { select: { title: true } },
            tutorial: { select: { title: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.creditTransaction.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.purchase.count({ where: { userId: user.id } }),
        this.prisma.creditTransaction.count({ where: { userId: user.id } }),
      ]);

    // Map into a unified format
    const allTransactions = [
      ...purchases.map((p) => ({
        id: p.id,
        date: p.createdAt,
        amount: Number(p.amount),
        currency: p.currency.toUpperCase(),
        status: p.status,
        type: p.publicationId
          ? 'PUBLICATION'
          : p.tutorialId
            ? 'TUTORIAL'
            : 'SUBSCRIPTION',
        name:
          p.publication?.title || p.tutorial?.title || 'Account Subscription',
      })),
      ...credits.map((c) => ({
        id: c.id,
        date: c.createdAt,
        amount: c.amount,
        currency: 'CREDITS',
        status: 'completed',
        type: 'CREDITS',
        name:
          (c.details as any)?.kind === 'credits_purchase'
            ? 'Credits Purchase'
            : (c.details as any)?.reason || 'Credits Transaction',
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    const total = totalPurchases + totalCredits;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = allTransactions.slice(
      startIndex,
      startIndex + limitNum,
    );

    return {
      items: paginatedItems,
      total,
    };
  }

  @UseGuards(AuthGuard)
  @Get('subscription/info')
  async getSubscriptionInfo(@GetUser() user: User) {
    if (!user.stripeSubscriptionId && !user.subscriptionExpiresAt) {
      return { hasActiveSubscription: false };
    }

    try {
      if (user.stripeSubscriptionId) {
        const subscription = (await this.stripeService.retrieveSubscription(
          user.stripeSubscriptionId,
        )) as any;

        return {
          hasActiveSubscription:
            subscription.status === 'active' ||
            subscription.status === 'trialing',
          status: subscription.status,
          currentPeriodEnd:
            subscription.current_period_end || subscription.ended_at
              ? new Date(
                  (subscription.current_period_end || subscription.ended_at) *
                    1000,
                )
              : user.subscriptionExpiresAt,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        };
      }

      return {
        hasActiveSubscription:
          user.hasPaidAccount ||
          (user.subscriptionExpiresAt &&
            user.subscriptionExpiresAt > new Date()),
        currentPeriodEnd: user.subscriptionExpiresAt,
      };
    } catch (error) {
      return {
        hasActiveSubscription:
          user.hasPaidAccount ||
          (user.subscriptionExpiresAt &&
            user.subscriptionExpiresAt > new Date()),
        currentPeriodEnd: user.subscriptionExpiresAt,
        error: error.message,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Post('subscription/cancel')
  async cancelSubscription(@GetUser() user: User) {
    if (!user.stripeSubscriptionId) {
      throw new BadRequestException('No active subscription found');
    }

    await this.stripeService.deleteSubscription(user.stripeSubscriptionId);

    // Update user locally for immediate UI update
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        hasPaidAccount: false,
        subscriptionExpiresAt: null,
        stripeSubscriptionId: null,
      },
    });

    return { success: true };
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    // Prefer secret from Settings first, fallback to env for backward compatibility
    const webhookSecret =
      (await this.settingsService.findValueByName('stripeWebhookSecret')) ||
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret is not configured');
    }

    // Raw body is required for signature verification
    const rawBody = (req as any).rawBody as Buffer | string | undefined;
    if (!rawBody) {
      throw new BadRequestException(
        'Stripe webhook requires raw body. Please configure raw body parser for this route.',
      );
    }

    let event;

    try {
      event = await this.stripeService.constructEvent(
        rawBody,
        sig,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await this.handleCheckoutSessionCompleted(session);
        break;
      case 'customer.subscription.deleted':
        const subscriptionDeleted = event.data.object;
        await this.handleSubscriptionDeleted(subscriptionDeleted);
        break;
      case 'account.updated':
        const account = event.data.object;
        await this.handleAccountUpdated(account);
        break;
    }

    return { received: true };
  }

  private async handleCheckoutSessionCompleted(session: any) {
    const { userId, publicationId, tutorialId, channelId, type, usdAmount } =
      session.metadata || {};

    // Helper to extract amount/currency safely
    const amountUsdFromSession = session.amount_total
      ? session.amount_total / 100
      : undefined;
    const currency = session.currency?.toUpperCase() || 'USD';

    if (type === 'credits_purchase') {
      const amountUsd = usdAmount
        ? parseFloat(usdAmount)
        : (amountUsdFromSession ?? 0);
      if (!userId || !amountUsd) return;
      await this.creditsService.addCreditsFromPayment(
        userId,
        amountUsd,
        session.id,
      );

      // Create notification for user (credits purchased)
      await this.notificationsManager.createOrUpdateNotification({
        userId,
        type: NotificationType.CREDITS_PURCHASED,
        additionalData: {
          kind: 'credits_purchase',
          amount: amountUsd,
          currency,
          paymentId: session.id,
        },
      });
      return;
    }

    // Complete legacy purchase and add notifications
    if (session.id) {
      try {
        await this.prisma.purchase.update({
          where: { stripeSessionId: session.id },
          data: { status: 'completed' },
        });

        if (
          (type === 'account_subscription' || type === 'channel_subscription') &&
          userId
        ) {
          // Retrieve subscription to get currentPeriodEnd
          const stripeSubscription =
            (await this.stripeService.retrieveSubscription(
              session.subscription as string,
            )) as any;

          if (type === 'account_subscription') {
            // Update user to paid account
            await this.prisma.user.update({
              where: { id: userId },
              data: {
                hasPaidAccount: true,
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                subscriptionExpiresAt: stripeSubscription.current_period_end
                  ? new Date(stripeSubscription.current_period_end * 1000)
                  : null,
              },
            });

            // Notify user about successful subscription payment
            await this.notificationsManager.createOrUpdateNotification({
              userId,
              type: NotificationType.SUBSCRIPTION_PURCHASED,
              additionalData: {
                kind: 'account_subscription',
                amount: amountUsdFromSession,
                currency,
                paymentId: session.id,
                subscriptionId: session.subscription,
              },
            });
          } else if (type === 'channel_subscription' && channelId) {
            const channel = await this.prisma.channel.findUnique({
              where: { id: channelId },
            });
            if (channel) {
              await this.prisma.subscription.upsert({
                where: {
                  followerId_targetId_targetType: {
                    followerId: userId,
                    targetId: channelId,
                    targetType: 'channel',
                  },
                },
                update: {},
                create: {
                  followerId: userId,
                  targetId: channelId,
                  targetType: 'channel',
                },
              });
              await this.prisma.channel.update({
                where: { id: channelId },
                data: { followersCount: { increment: 1 } },
              });

              // Notify buyer about successful purchase
              await this.notificationsManager.createOrUpdateNotification({
                userId,
                type: NotificationType.SUBSCRIPTION_PURCHASED,
                entity: { id: channelId, type: 'channel' },
                additionalData: {
                  kind: 'channel_subscription',
                  amount: amountUsdFromSession,
                  currency,
                  paymentId: session.id,
                  subscriptionId: session.subscription,
                },
              });
            }
          }
        }

        if (type === 'publication' && userId && publicationId) {
          // Notify buyer about successful purchase
          await this.notificationsManager.createOrUpdateNotification({
            userId,
            type: NotificationType.PUBLICATION_PURCHASED,
            entity: { id: publicationId, type: 'publication' },
            additionalData: {
              kind: 'publication_purchase',
              amount: amountUsdFromSession,
              currency,
              paymentId: session.id,
            },
          });
        }

        if (type === 'tutorial' && userId && tutorialId) {
          // Notify buyer about successful purchase
          await this.notificationsManager.createOrUpdateNotification({
            userId,
            type: NotificationType.TUTORIAL_PURCHASED,
            entity: { id: tutorialId, type: 'tutorial' },
            additionalData: {
              kind: 'tutorial_purchase',
              amount: amountUsdFromSession,
              currency,
              paymentId: session.id,
            },
          });
        }
      } catch (e) {
        // ignore if no purchase found for this session
      }
    }
  }

  private async handleAccountUpdated(account: any) {
    // Connect account logic removed
  }

  private async handleSubscriptionDeleted(subscription: any) {
    const userId = subscription.metadata?.userId;
    if (userId) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          hasPaidAccount: false,
          subscriptionExpiresAt: null,
        },
      });
    }
  }
}
