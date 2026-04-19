import { Setting } from '../entities/setting.entity';

export const SETTING_REPOSITORY = 'SettingRepository';

export interface SettingsRepositoryInterface {
  findByName<T>(name: string): Promise<Setting<T> | null>;
  has(name: string): Promise<boolean>;
  create(name: string, category: string, value: any): Promise<any>;
  findAll(category?: string): Promise<any[]>;
  findOneByName(name: string): Promise<any>;
  findValueByName<T = any>(name: string, defaultValue?: any): Promise<T | any>;
  findAllFlatten(category?: string): Promise<Record<string, any>>;
  save(values: { [prop: string]: any }, category?: string): Promise<void>;
}
