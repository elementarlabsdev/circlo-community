import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Get,
  Patch,
  UploadedFile,
  UseInterceptors,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CreateImageDesignDto,
  UpdateImageDesignDto,
  UpdateImageDesignResultImageUrlDto,
} from '../../application/dtos/image-design.dto';
import { CreateImageDesignUseCase } from '../../application/use-cases/create-image-design.use-case';
import { UpdateImageDesignUseCase } from '../../application/use-cases/update-image-design.use-case';
import { UpdateImageDesignResultImageUrlUseCase } from '../../application/use-cases/update-image-design-result-image-url.use-case';
import { DeleteImageDesignUseCase } from '../../application/use-cases/delete-image-design.use-case';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import {
  IImageDesignRepository,
  IMAGE_DESIGN_REPOSITORY,
} from '../../domain/repositories/image-design.repository.interface';
import { Inject } from '@nestjs/common';
import { UPLOAD_FILE_PIPE_BUILDER } from '@/common/infrastructure/validators/profile-avatar-upload.pipe-builder';
import { FileStorageService } from '@/platform/application/services/file-storage.service';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Controller('studio/image-designs')
@UseGuards(AuthGuard)
export class StudioImageDesignController {
  constructor(
    private readonly createUseCase: CreateImageDesignUseCase,
    private readonly updateUseCase: UpdateImageDesignUseCase,
    private readonly updateResultImageUrlUseCase: UpdateImageDesignResultImageUrlUseCase,
    private readonly deleteUseCase: DeleteImageDesignUseCase,
    @Inject(IMAGE_DESIGN_REPOSITORY)
    private readonly coverRepository: IImageDesignRepository,
    private readonly fileStorage: FileStorageService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@GetUser() user: any, @Body() dto: CreateImageDesignDto) {
    const design = await this.createUseCase.execute(user.id, dto);
    return design.toPrimitives();
  }

  @Get()
  async findAll(@GetUser() user: any) {
    const designs = await this.coverRepository.findByUserId(user.id);
    return designs.map((d) => d.toPrimitives());
  }

  @Get(':id')
  async findOne(@GetUser() user: any, @Param('id') id: string) {
    const design = await this.coverRepository.findById(id);
    if (!design) {
      throw new NotFoundException();
    }

    if (design.userId !== user.id) {
      throw new ForbiddenException();
    }

    return design.toPrimitives();
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @GetUser() user: any,
    @Body() dto: UpdateImageDesignDto,
  ) {
    const design = await this.updateUseCase.execute(id, user.id, dto);
    return design.toPrimitives();
  }

  @Patch(':id/result-image')
  async updateResultImage(
    @Param('id') id: string,
    @GetUser() user: any,
    @Body() dto: UpdateImageDesignResultImageUrlDto,
  ) {
    const design = await this.updateResultImageUrlUseCase.execute(id, user.id, dto);
    return design.toPrimitives();
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @GetUser() user: any) {
    await this.deleteUseCase.execute(id, user.id);
    return { success: true };
  }

  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @GetUser() user: any,
    @UploadedFile(UPLOAD_FILE_PIPE_BUILDER) uploadedFile: Express.Multer.File,
  ) {
    const design = await this.prisma.imageDesign.findUnique({
      where: { id },
    });

    if (!design) {
      throw new NotFoundException();
    }

    if (design.userId !== user.id) {
      throw new ForbiddenException();
    }

    const file = await this.fileStorage.save(uploadedFile, user);
    await this.prisma.imageDesign.update({
      where: { id },
      data: {
        images: {
          connect: { id: file.id },
        },
      },
    });
    return {
      file,
    };
  }

  @Get(':id/images')
  async getImages(@GetUser() user: any, @Param('id') id: string) {
    const design = await this.prisma.imageDesign.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!design) {
      throw new NotFoundException();
    }

    if (design.userId !== user.id) {
      throw new ForbiddenException();
    }

    return design?.images || [];
  }
}
