import { InferSubjects } from '@casl/ability';
import { Publication } from '@/publications/domain/entities/publication.entity';
import { Tutorial } from '@/tutorials/domain/entities/tutorial.entity';
import { User } from '@/identity/domain/entities/user.entity';
import { TopicEntity } from '@/topics/domain/entities/topic.entity';
import { ChannelEntity } from '@/channels/domain/entities/channel.entity';
import { PageEntity } from '@/pages/domain/entities/page.entity';
import { Comment } from '@/comments/domain/entities/comment.entity';
import { Thread } from '@/threads/domain/entities/thread.entity';

export type Subject =
  | InferSubjects<
      | typeof Publication
      | typeof Tutorial
      | typeof User
      | typeof TopicEntity
      | typeof ChannelEntity
      | typeof PageEntity
      | typeof Comment
      | typeof Thread
    >
  | 'Publication'
  | 'Tutorial'
  | 'TopicEntity'
  | 'ChannelEntity'
  | 'PageEntity'
  | 'Comment'
  | 'Thread'
  | 'User'
  | 'Credits'
  | 'Stripe'
  | 'AdminPanel'
  | 'all'
  | any; // Needed to allow classes with private constructors in can()
