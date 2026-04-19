import { Complaint } from '@/complaints/domain/entities/complaint.entity';

export const COMPLAINT_REPOSITORY = 'ComplaintRepository';

export type ComplaintListParams = {
  skip?: number;
  take?: number;
  targetType?: string;
  reason?: string;
};

export interface ComplaintRepository {
  create(entity: Complaint): Promise<Complaint>;
  findById(id: string): Promise<Complaint | null>;
  findMany(params: ComplaintListParams): Promise<Complaint[]>;
  existsByReporterAndTarget(
    reporterId: string,
    targetType: string,
    targetId: string,
  ): Promise<boolean>;
  findAnonymousDuplicate(
    targetType: string,
    targetId: string,
    reporterIp: string,
  ): Promise<Complaint | null>;
  delete(id: string): Promise<void>;
}
