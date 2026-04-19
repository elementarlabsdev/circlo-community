import { Global, Module } from '@nestjs/common';
import { SameOriginAsHostConstraint } from './application/validators/is-same-origin-as-host.validator';
import { InitializeController } from './infrastructure/controllers/initialize.controller';
import { RecommendationController } from './infrastructure/controllers/recommendation.controller';
import { CapJsService } from './application/services/capjs.service';
import { ApiService } from './application/services/api.service';
import { HttpModule } from '@nestjs/axios';
import { EmbeddingService } from './application/services/embedding.service';
import { RecommendationService } from './application/services/recommendation.service';
import { FeaturedImageService } from './application/services/featured-image.service';
import { AvatarService } from './application/services/avatar.service';
import { LinkService } from './application/services/link.service';
import { RecaptchaService } from './application/services/recaptcha.service';
import { BullModule } from '@nestjs/bullmq';
import { RecommendationProcessor } from './application/queue-processors/recommendation.processor';
import { CaptchaValidationService } from '@/identity/application/services/captcha-validation.service';
import { MetaTagService } from '@/platform/application/services/meta-tag.service';
import { StudioMediaUploadValidator } from './infrastructure/validators/studio-media-upload.validator';
import { StudioMediaUploadPipe } from './infrastructure/validators/studio-media-upload.pipe';
import { ContentBlocksToTextConverter } from './application/services/content-blocks-to-text-converter.service';
import { MarkdownService } from './infrastructure/markdown/markdown.service';

@Global()
@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({
      name: 'recommendation-queue',
    }),
  ],
  controllers: [InitializeController, RecommendationController],
  providers: [
    SameOriginAsHostConstraint,
    CapJsService,
    ApiService,
    EmbeddingService,
    RecommendationService,
    FeaturedImageService,
    AvatarService,
    LinkService,
    RecaptchaService,
    RecommendationProcessor,
    CaptchaValidationService,
    MetaTagService,
    StudioMediaUploadValidator,
    StudioMediaUploadPipe,
    ContentBlocksToTextConverter,
    MarkdownService,
  ],
  exports: [
    SameOriginAsHostConstraint,
    CapJsService,
    ApiService,
    EmbeddingService,
    RecommendationService,
    FeaturedImageService,
    AvatarService,
    LinkService,
    RecaptchaService,
    BullModule,
    CaptchaValidationService,
    MetaTagService,
    StudioMediaUploadValidator,
    StudioMediaUploadPipe,
    ContentBlocksToTextConverter,
    MarkdownService,
  ],
})
export class CommonModule {}
