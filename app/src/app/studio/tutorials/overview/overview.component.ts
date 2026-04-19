import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TUTORIAL_EDIT_ROOT } from '@/studio/tutorials/types';

@Component({
  imports: [
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent {
  protected readonly root = inject<any>(TUTORIAL_EDIT_ROOT);
}
