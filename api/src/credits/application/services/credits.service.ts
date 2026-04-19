import { Injectable } from '@nestjs/common';
import { CreditsRepository } from '@/credits/infrastructure/persistence/credits-prisma.repository';

@Injectable()
export class CreditsService {
  private readonly CONVERSION_RATE = 10; // 1 USD = 10 Credits

  constructor(private readonly repository: CreditsRepository) {}

  async addCreditsFromPayment(userId: string, amountUsd: number, paymentId: string) {
    const creditsAmount = Math.floor(amountUsd * this.CONVERSION_RATE);

    // Check if a transaction with this paymentId already exists to ensure idempotency
    const existingTransaction = await this.repository.findByPaymentId(paymentId);
    if (existingTransaction) {
      return existingTransaction;
    }

    return await this.repository.createTransaction({
      userId,
      amount: creditsAmount,
      type: 'purchase',
      details: {
        paymentId,
        amountUsd,
        conversionRate: this.CONVERSION_RATE,
      },
    });
  }

  async getUserTransactions(userId: string) {
    return await this.repository.findByUserId(userId);
  }

  async getAllTransactions(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const items = await this.repository.findAll({ skip, take: limit });
    const total = await this.repository.countAll();

    return {
      items,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async manualAdjust(userId: string, amount: number, reason: string) {
    return await this.repository.createTransaction({
      userId,
      amount,
      type: 'manual',
      details: {
        reason,
      },
    });
  }
}
