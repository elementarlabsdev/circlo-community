export const THREAD_STATUS_REPOSITORY = 'THREAD_STATUS_REPOSITORY';

import { ThreadStatus } from '../entities/thread-status.entity';

export interface ThreadStatusRepositoryInterface {
  findByIdOrFail(id: string): Promise<ThreadStatus>;
  findByType(type: string): Promise<ThreadStatus | null>;
  listAll(): Promise<ThreadStatus[]>;
}
