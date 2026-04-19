import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { Request } from '@/common/domain/interfaces/interfaces';

@Injectable()
export class DeleteDonationLinkUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(request: Request, id: string) {
    const link = await this.prisma.donationLink.findUnique({ where: { id } });
    if (!link) throw new NotFoundException('Donation link not found');
    if (link.userId !== request.user.id) throw new ForbiddenException();

    // delete and then normalize positions
    await this.prisma.$transaction(async (tx) => {
      await tx.donationLink.delete({ where: { id } });
      const rest = await tx.donationLink.findMany({
        where: { userId: request.user.id },
        orderBy: { position: 'asc' },
      });
      await Promise.all(
        rest
          .map((item, idx) =>
            item.position !== idx
              ? tx.donationLink.update({
                  where: { id: item.id },
                  data: { position: idx },
                })
              : null,
          )
          .filter(Boolean) as any,
      );
    });

    return { id };
  }
}
