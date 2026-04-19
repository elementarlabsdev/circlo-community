import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { Request } from '@/common/domain/interfaces/interfaces';
import { UpdateDonationLinkDto } from '@/account/application/dtos/donation-link.dto';

@Injectable()
export class UpdateDonationLinkUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(request: Request, id: string, dto: UpdateDonationLinkDto) {
    const link = await this.prisma.donationLink.findUnique({ where: { id } });
    if (!link) throw new NotFoundException('Donation link not found');
    if (link.userId !== request.user.id) throw new ForbiddenException();
    return this.prisma.donationLink.update({ where: { id }, data: dto });
  }
}
