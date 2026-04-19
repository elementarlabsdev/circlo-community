import { booleanAttribute, Component, computed, inject, input, output } from '@angular/core';
import { Dicebear } from '@ngstarter/components/avatar';
import {
  CommentEditorBubbleMenu,
  CommentEditorCommandBlockquoteDirective,
  CommentEditorCommandBoldDirective,
  CommentEditorCommandBulletListDirective,
  CommentEditorCommandCodeBlockDirective,
  CommentEditorCommandCodeDirective,
  CommentEditorCommandDirective,
  CommentEditorCommandEditLinkDirective,
  CommentEditorCommandImageDirective,
  CommentEditorCommandItalicDirective,
  CommentEditorCommandLinkDirective,
  CommentEditorCommandOrderedListDirective,
  CommentEditorCommandStrikeDirective,
  CommentEditorCommandToggleToolbarDirective,
  CommentEditorCommandUnsetLinkDirective,
  CommentEditorCommandYoutubeDirective,
  CommentEditor as NgsCommentEditor,
  CommentEditorDivider,
  CommentEditorToolbar
} from '@ngstarter/components/comment-editor';
import { AppStore } from '@store/app.store';
import { LoginDto } from '@model/interfaces';
import { ApiService } from '@services/api.service';
import { EnvironmentService } from '@ngstarter/components/core';
import { Button } from '@ngstarter/components/button';
import { Tooltip } from '@ngstarter/components/tooltip';
import { Icon } from '@ngstarter/components/icon';
import {
  CommentEditorFooterBar
} from '@ngstarter/components/comment-editor';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { LoginGuardComponent } from '@app/login-guard/login-guard.component';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-comment-editor',
  imports: [
    Dicebear,
    NgsCommentEditor,
    CommentEditorDivider,
    CommentEditorFooterBar,
    CommentEditorToolbar,
    CommentEditorBubbleMenu,
    Button,
    CommentEditorCommandBoldDirective,
    Tooltip,
    CommentEditorCommandItalicDirective,
    CommentEditorCommandStrikeDirective,
    CommentEditorCommandBulletListDirective,
    CommentEditorCommandOrderedListDirective,
    CommentEditorCommandBlockquoteDirective,
    CommentEditorCommandCodeBlockDirective,
    CommentEditorCommandImageDirective,
    CommentEditorCommandYoutubeDirective,
    CommentEditorCommandDirective,
    CommentEditorCommandToggleToolbarDirective,
    Icon,
    CommentEditorCommandEditLinkDirective,
    CommentEditorCommandUnsetLinkDirective,
    CommentEditorCommandLinkDirective,
    CommentEditorCommandCodeDirective,
    ImageProxyPipe,
    LoginGuardComponent,
    TranslocoPipe,
  ],
  templateUrl: './comment-editor.component.html',
  styleUrl: './comment-editor.component.scss'
})
export class CommentEditorComponent {
  private _api = inject(ApiService);
  private _env = inject(EnvironmentService);
  appStore = inject(AppStore);

  isReply = input(false, {
    transform: booleanAttribute
  });

  readonly sent = output<string>();
  readonly canceled = output<void>();

  profile = computed<LoginDto | null>(() => {
    return this.appStore.profile();
  });
  isLogged = computed<boolean>(() => {
    return this.appStore.isLogged();
  });
  imageUploadFn = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('image', file);
      this._api
        .post(`upload/comment/image`, formData)
        .subscribe((res: any) => {
          resolve(this._env.getValue('apiHost') + res.url);
        }, (error: any) => {
          reject(error);
        }, () => {
          reject('Upload Error');
        })
      ;
    });
  }

  onSent(comment: string): void {
    this.sent.emit(comment);
  }

  onCanceled(): void {
    this.canceled.emit();
  }
}
