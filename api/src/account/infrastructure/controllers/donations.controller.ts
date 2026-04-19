import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { Request } from '@/common/domain/interfaces/interfaces';
import { ListMyDonationLinksUseCase } from '@/account/application/use-cases/donations/list-my-donation-links.use-case';
import { CreateDonationLinkUseCase } from '@/account/application/use-cases/donations/create-donation-link.use-case';
import { UpdateDonationLinkUseCase } from '@/account/application/use-cases/donations/update-donation-link.use-case';
import { DeleteDonationLinkUseCase } from '@/account/application/use-cases/donations/delete-donation-link.use-case';
import { CreateDonationLinkDto, UpdateDonationLinkDto } from '@/account/application/dtos/donation-link.dto';
import { ReorderDto } from '@/account/application/dtos/reorder.dto';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { BatchSaveDonationLinksUseCase } from '@/account/application/use-cases/donations/batch-save-donation-links.use-case';

@Controller('studio/account/donations')
@UseGuards(AuthGuard)
export class DonationsController {
  constructor(
    private readonly listMyUc: ListMyDonationLinksUseCase,
    private readonly createUc: CreateDonationLinkUseCase,
    private readonly updateUc: UpdateDonationLinkUseCase,
    private readonly deleteUc: DeleteDonationLinkUseCase,
    private readonly prisma: PrismaService,
    private readonly batchSaveUc: BatchSaveDonationLinksUseCase,
  ) {}

  @Get()
  async list(@Req() request: Request) {
    return this.listMyUc.execute(request);
  }

  @Post()
  async create(@Req() request: Request, @Body() dto: CreateDonationLinkDto) {
    return this.createUc.execute(request, dto);
  }

  @Patch(':id')
  async update(@Req() request: Request, @Param('id') id: string, @Body() dto: UpdateDonationLinkDto) {
    return this.updateUc.execute(request, id, dto);
  }

  @Delete(':id')
  async remove(@Req() request: Request, @Param('id') id: string) {
    return this.deleteUc.execute(request, id);
  }

  @Post('reorder')
  async reorder(@Req() request: Request, @Body() body: ReorderDto) {
    const userId = request.user.id;
    const ids = body.items.map((i) => i.id);
    // validate ownership
    const owned = await this.prisma.donationLink.count({ where: { id: { in: ids }, userId } });
    if (owned !== ids.length) return { updated: 0 };
    await this.prisma.$transaction(
      body.items.map((it) =>
        this.prisma.donationLink.update({ where: { id: it.id }, data: { position: it.position } }),
      ),
    );
    return { updated: body.items.length };
  }

  @Post('batch')
  async batch(@Req() request: Request, @Body() body: { items: { id?: string; url: string }[] }) {
    return this.batchSaveUc.execute(request, body.items || []);
  }
}
