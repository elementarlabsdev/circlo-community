import { Role } from '../entities/role.entity';

export const ROLE_REPOSITORY = 'RoleRepository';

export interface RoleRepositoryInterface {
  findAll(): Promise<Role[]>;
  findById(id: string): Promise<Role | null>;
  findByType(type: string): Promise<Role | null>;
  create(data: { name: string; type: string; parentId?: string | null }): Promise<Role>;
  update(id: string, data: { name?: string; type?: string; parentId?: string | null }): Promise<Role>;
  delete(id: string): Promise<void>;
}
