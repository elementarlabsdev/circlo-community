import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { Request } from '@/common/domain/interfaces/interfaces';

type BatchItem = { id?: string; url: string };

@Injectable()
export class BatchSaveDonationLinksUseCase {
  constructor(private readonly prisma: PrismaService) {}

  private detect(urlStr: string): { title: string; platform: string | null } {
    try {
      const { hostname } = new URL(urlStr);
      const host = hostname.toLowerCase();
      const map: Record<string, { title: string; platform: string }> = {
        'patreon.com': { title: 'Patreon', platform: 'patreon' },
        'boosty.to': { title: 'Boosty', platform: 'boosty' },
        'buymeacoffee.com': { title: 'Buy Me A Coffee', platform: 'bmac' },
        'ko-fi.com': { title: 'Ko-fi', platform: 'ko-fi' },
        'donationalerts.com': { title: 'DonationAlerts', platform: 'donationalerts' },
        'paypal.me': { title: 'PayPal', platform: 'paypal' },
        'paypal.com': { title: 'PayPal', platform: 'paypal' },
        'tinkoff.ru': { title: 'Tinkoff', platform: 'tinkoff' },
        'yoomoney.ru': { title: 'YooMoney', platform: 'yoomoney' },
        'yoomoney.com': { title: 'YooMoney', platform: 'yoomoney' },
        'qiwi.com': { title: 'QIWI', platform: 'qiwi' },
      };
      const found = Object.keys(map).find((h) => host === h || host.endsWith('.' + h));
      if (found) return map[found];
      const base = host.replace(/^www\./, '');
      return { title: base, platform: base };
    } catch {
      return { title: 'Donation', platform: null };
    }
  }

  async execute(request: Request, items: BatchItem[]) {
    const userId = request.user.id;
    if (!Array.isArray(items)) throw new BadRequestException('items must be array');

    // normalize input
    const normalized = items.map((it) => ({ id: it.id, url: it.url?.trim() })).filter((it) => !!it.url);

    // Ensure ownership for all with ids
    const ids = normalized.filter((i) => i.id).map((i) => i.id!)
    if (ids.length) {
      const count = await this.prisma.donationLink.count({ where: { id: { in: ids }, userId } });
      if (count !== ids.length) throw new ForbiddenException('Not allowed');
    }

    // Upsert all and collect ids in the provided order
    const processed: { id: string }[] = [];
    await this.prisma.$transaction(async (tx) => {
      // Load existing user links
      const existing = await tx.donationLink.findMany({ where: { userId }, select: { id: true } });
      const existingIds = new Set<string>(existing.map((e) => e.id));

      // Delete links that are not present in the incoming list
      const incomingIds = new Set(normalized.filter((i) => i.id).map((i) => i.id!));
      const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
      if (toDelete.length) {
        await tx.donationLink.deleteMany({ where: { userId, id: { in: toDelete } } });
      }

      // Upsert in the order of the provided list
      // Compute a safe base position greater than any existing one to avoid unique conflicts on create
      const max = await tx.donationLink.aggregate({ where: { userId }, _max: { position: true } });
      let createOffset = (max._max.position ?? -1) + 1;
      for (const it of normalized) {
        const detected = this.detect(it.url!);
        if (it.id) {
          const updated = await tx.donationLink.update({
            where: { id: it.id },
            data: { url: it.url!, title: detected.title, platform: detected.platform ?? undefined },
            select: { id: true },
          });
          processed.push(updated);
        } else {
          // create with temporary unique position above current range to avoid unique constraint
          const created = await tx.donationLink.create({
            data: {
              userId,
              url: it.url!,
              title: detected.title,
              platform: detected.platform ?? undefined,
              position: createOffset++, // unique safe value
            },
            select: { id: true },
          });
          processed.push(created);
        }
      }

      // Phase 1: assign temp unique positions to all processed to avoid conflicts
      for (let i = 0; i < processed.length; i++) {
        await tx.donationLink.update({ where: { id: processed[i].id }, data: { position: 100000 + i } });
      }
      // Phase 2: set final positions sequentially according to provided order
      for (let i = 0; i < processed.length; i++) {
        await tx.donationLink.update({ where: { id: processed[i].id }, data: { position: i } });
      }
    });

    // Return full list after save
    return this.prisma.donationLink.findMany({ where: { userId }, orderBy: { position: 'asc' } });
  }
}
