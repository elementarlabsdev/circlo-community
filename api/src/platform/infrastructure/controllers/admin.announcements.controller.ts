import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { AnnouncementDataTableService } from '@/platform/application/services/datatable/announcement-data-table.service';
import { DataTableQueryDto } from '@/platform/application/dtos/datatable-dto';
import { AdminAnnouncementDto } from '@/announcements/application/dtos/admin-announcement.dto';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Controller('platform/admin/announcements')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminAnnouncementsController {
  constructor(
    private readonly announcementsTable: AnnouncementDataTableService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('table')
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async list(@Body() dto: DataTableQueryDto) {
    return await this.announcementsTable.query(dto);
  }

  @Get(':id')
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async findById(@Param('id') id: string) {
    return this.prisma.announcement.findUnique({
      where: { id },
      include: {
        type: true,
        status: true,
      },
    });
  }

  @Post()
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async create(@Body() dto: AdminAnnouncementDto, @Req() req: any) {
    const status = await this.prisma.announcementStatus.findUnique({
      where: { type: dto.statusType },
    });
    const type = await this.prisma.announcementType.findUnique({
      where: { type: dto.typeType },
    });

    return this.prisma.announcement.create({
      data: {
        name: dto.name,
        content: dto.content,
        priority: dto.priority ?? 0,
        dismissable: dto.dismissable ?? true,
        requireManualDismiss: dto.requireManualDismiss ?? false,
        targetUrl: dto.targetUrl,
        actionText: dto.actionText,
        startAt: dto.startAt ? new Date(dto.startAt) : new Date(),
        endAt: dto.endAt ? new Date(dto.endAt) : null,
        status: { connect: { id: status.id } },
        type: { connect: { id: type.id } },
        createdBy: { connect: { id: req.user.id } },
      },
    });
  }

  @Put(':id')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async update(
    @Param('id') id: string,
    @Body() dto: AdminAnnouncementDto,
  ) {
    const status = await this.prisma.announcementStatus.findUnique({
      where: { type: dto.statusType },
    });
    const type = await this.prisma.announcementType.findUnique({
      where: { type: dto.typeType },
    });

    return this.prisma.announcement.update({
      where: { id },
      data: {
        name: dto.name,
        content: dto.content,
        priority: dto.priority ?? 0,
        dismissable: dto.dismissable ?? true,
        requireManualDismiss: dto.requireManualDismiss ?? false,
        targetUrl: dto.targetUrl,
        actionText: dto.actionText,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : null,
        status: { connect: { id: status.id } },
        type: { connect: { id: type.id } },
      },
    });
  }

  @Delete(':id')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async delete(@Param('id') id: string) {
    return this.prisma.announcement.delete({
      where: { id },
    });
  }

  @Get('meta/types')
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async getTypes() {
    return this.prisma.announcementType.findMany();
  }

  @Get('meta/statuses')
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async getStatuses() {
    return this.prisma.announcementStatus.findMany();
  }
}
