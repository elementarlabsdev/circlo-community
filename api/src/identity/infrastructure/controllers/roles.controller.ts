import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ROLE_REPOSITORY,
  RoleRepositoryInterface,
} from '../../domain/repositories/role-repository.interface';
import { AuthGuard } from '../guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { RoleDataTableService } from '@/platform/application/services/datatable/role-data-table.service';

@Controller('admin/roles')
@UseGuards(AuthGuard, AbilitiesGuard)
export class RolesController {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepositoryInterface,
    private readonly roleDataTable: RoleDataTableService,
  ) {}

  @Get()
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async findAll() {
    return this.roleRepository.findAll();
  }

  @Post('table')
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async table(@Body() body: any) {
    return this.roleDataTable.query(body);
  }

  @Get(':id')
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async findOne(@Param('id') id: string) {
    return this.roleRepository.findById(id);
  }

  @Post()
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async create(
    @Body() data: { name: string; type: string; parentId?: string | null },
  ) {
    return this.roleRepository.create(data);
  }

  @Patch(':id')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async update(
    @Param('id') id: string,
    @Body() data: { name?: string; type?: string; parentId?: string | null },
  ) {
    return this.roleRepository.update(id, data);
  }

  @Delete(':id')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async remove(@Param('id') id: string) {
    return this.roleRepository.delete(id);
  }
}
