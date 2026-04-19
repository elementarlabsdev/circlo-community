export const COMMENTS_REPOSITORY = 'COMMENTS_REPOSITORY';

import { Comment } from '../entities/comment.entity';

export interface CommentsRepositoryInterface {
  findAllByPublicationId(publicationId: string): Promise<Comment[]>;
  findAllByLessonId(lessonId: string): Promise<Comment[]>;
  findRepliesOf(commentId: string): Promise<Comment[]>;
  findByIdOrFail(id: string): Promise<Comment>;
  createRoot(
    publicationId: string,
    content: string,
    authorId: string,
  ): Promise<Comment>;
  createRootForLesson(
    lessonId: string,
    content: string,
    authorId: string,
  ): Promise<Comment>;
  incrementPublicationComments(
    publicationId: string,
    delta: number,
  ): Promise<void>;
  incrementLessonComments(lessonId: string, delta: number): Promise<void>;
  incrementTutorialComments(tutorialId: string, delta: number): Promise<void>;
  deleteById(id: string): Promise<void>;
  createReply(
    respondingTo: Comment,
    content: string,
    authorId: string,
  ): Promise<Comment>;
  updateRepliesCount(commentId: string, delta: number): Promise<void>;
  setHidden(id: string, hidden: boolean): Promise<void>;
}
