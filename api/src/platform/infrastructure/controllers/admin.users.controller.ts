import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { UserDataTableService } from '@/platform/application/services/datatable/user-data-table.service';
import { AdminCreateUserUseCase } from '@/identity/application/use-cases/admin-create-user.use-case';
import { AdminUpdateUserUseCase } from '@/platform/application/use-cases/admin-update-user.use-case';
import { AdminDeleteUserUseCase } from '@/platform/application/use-cases/admin-delete-user.use-case';
import { AdminCreateUserDto } from '@/identity/application/dtos/admin-create-user.dto';
import { AdminUpdateUserDto } from '@/platform/application/dtos/admin-update-user.dto';
import { DataTableQueryDto } from '@/platform/application/dtos/datatable-dto';
import { ListRolesUseCase } from '@/platform/application/use-cases/list-roles.use-case';
import { AdminFindUserByIdUseCase } from '@/platform/application/use-cases/admin-find-user-by-id.use-case';

@Controller('platform/admin/users')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminUsersController {
  constructor(
    private readonly usersTable: UserDataTableService,
    private readonly adminCreateUser: AdminCreateUserUseCase,
    private readonly adminUpdateUser: AdminUpdateUserUseCase,
    private readonly adminDeleteUser: AdminDeleteUserUseCase,
    private readonly listRoles: ListRolesUseCase,
    private readonly findUserById: AdminFindUserByIdUseCase,
  ) {}

  @Post('table')
  @CheckAbilities([Action.Read, 'User'])
  async list(@Body() dto: DataTableQueryDto) {
    return await this.usersTable.query(dto);
  }

  // Roles list for selection
  @Get('roles')
  @CheckAbilities([Action.Read, 'User'])
  async roles() {
    return this.listRoles.execute();
  }

  // Get user by id
  @Get(':id')
  @CheckAbilities([Action.Read, 'User'])
  async findById(@Param('id') id: string) {
    return this.findUserById.execute(id);
  }

  // Create a new user
  @Post()
  @CheckAbilities([Action.Create, 'User'])
  async create(@Body() dto: AdminCreateUserDto) {
    return this.adminCreateUser.execute(dto);
  }

  // Update user
  @Put(':id')
  @CheckAbilities([Action.Update, 'User'])
  async update(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    return this.adminUpdateUser.execute(id, dto);
  }

  // Delete user
  @Delete(':id')
  @CheckAbilities([Action.Delete, 'User'])
  async delete(@Param('id') id: string) {
    return this.adminDeleteUser.execute(id);
  }
}
