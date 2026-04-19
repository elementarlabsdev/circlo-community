import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { CreateComplaintDto } from '@/complaints/application/dto/create-complaint.dto';
import { ComplaintsService } from '@/complaints/application/services/complaints.service';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { Request } from 'express';

@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaints: ComplaintsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateComplaintDto,
    @GetUser() user: User | undefined,
    @Req() req: Request,
  ) {
    const complaint = await this.complaints.create(dto, user, req.ip);
    return { complaint };
  }
}
