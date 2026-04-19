import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { BookmarkListService } from '@/bookmarks/application/services/bookmark-list.service';
import { Request } from '@/common/domain/interfaces/interfaces';

@Controller('bookmarks')
@UseGuards(AuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarkList: BookmarkListService) {}

  @Get()
  async index(
    @Req() request: Request,
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number = 1,
  ) {
    return this.bookmarkList.pagination(request.user, pageNumber);
  }
}
