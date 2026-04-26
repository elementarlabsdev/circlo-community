import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { FileStorageService } from '@/platform/application/services/file-storage.service';

@Injectable()
export class DeleteStudioMediaUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorage: FileStorageService,
  ) {}

  async execute(userId: string, ids: string[]) {
    const validIds = Array.isArray(ids) ? ids.filter(Boolean) : [];
    if (!validIds.length) {
      return { deletedIds: [], skippedIds: [], message: 'ids is required' };
    }

    // only items owned by the user
    const items = await this.prisma.mediaItem.findMany({
      where: { id: { in: validIds }, uploadedBy: { id: userId } },
      select: { id: true },
    });
    const ownedIds = new Set<string>(items.map((i) => i.id));
    const toDelete = [...ownedIds];
    const skipped = validIds.filter((id) => !ownedIds.has(id));

    const deletedIds: string[] = [];
    const failedIds: string[] = [];
    for (const id of toDelete) {
      try {
        await this.fileStorage.delete(id);
        deletedIds.push(id);
      } catch {
        failedIds.push(id);
      }
    }

    return { deletedIds, skippedIds: skipped, failedIds };
  }
}
