import { ImageDesignEntity } from '../entities/image-design.entity';

export const IMAGE_DESIGN_REPOSITORY = 'IImageDesignRepository';

export interface IImageDesignRepository {
  save(design: ImageDesignEntity): Promise<void>;
  findById(id: string): Promise<ImageDesignEntity | null>;
  delete(id: string): Promise<void>;
  findByUserId(userId: string): Promise<ImageDesignEntity[]>;
}
