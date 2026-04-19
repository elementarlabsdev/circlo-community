import { Injectable } from '@nestjs/common';
import { Setting } from '../../domain/entities/setting.entity';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { SettingsRepositoryInterface } from '@/settings/domain/repositores/settings-repository.interface';

@Injectable()
export class SettingRepository implements SettingsRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async has(name: string): Promise<boolean> {
    const count = await this.prisma.setting.count({
      where: { name },
    });
    return count > 0;
  }

  async create(name: string, category: string, value: any) {
    return this.prisma.setting.create({
      data: {
        name,
        category,
        data: { value },
      },
    });
  }

  async findAll(category: string = '') {
    if (category) {
      return this.prisma.setting.findMany({
        where: { category },
      });
    }
    return this.prisma.setting.findMany();
  }

  async findOneByName(name: string) {
    return this.prisma.setting.findUniqueOrThrow({
      where: { name },
    });
  }

  async findValueByName(name: string, defaultValue: any = null) {
    const setting = await this.prisma.setting.findUnique({
      where: { name },
    });

    if (setting) {
      return (setting.data as any)['value'];
    }

    return defaultValue;
  }

  async findAllFlatten(category: string = '') {
    const settings = await this.findAll(category);
    const result = new Map<string, any>();
    settings.forEach((setting: any) => {
      result.set(setting.name, setting.data['value'] ?? '');
    });
    return Object.fromEntries(result.entries());
  }

  async save(values: { [prop: string]: any }, category: string = 'general') {
    for (const name in values) {
      // eslint-disable-next-line no-await-in-loop
      await this.prisma.setting.upsert({
        where: { name },
        update: {
          data: { value: values[name] },
          category
        },
        create: {
          name,
          category,
          data: { value: values[name] }
        }
      });
    }
  }

  async findByName<T>(name: string): Promise<Setting<T> | null> {
    const settingFromDb = await this.prisma.setting.findUnique({
      where: { name },
    });

    if (!settingFromDb) {
      return null;
    }

    return new Setting(settingFromDb.name, settingFromDb.data as T);
  }
}
