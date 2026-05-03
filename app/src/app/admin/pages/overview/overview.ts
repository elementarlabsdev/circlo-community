import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ADMIN_PAGE_EDIT_ROOT, Edit } from '@/admin/pages/edit/edit';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { Icon } from '@ngstarter-ui/components/icon';
import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';
import { EmptyState, EmptyStateContent } from '@ngstarter-ui/components/empty-state';
import { Card, CardContent, CardHeader } from '@ngstarter-ui/components/card';
import { Chip, ChipListbox } from '@ngstarter-ui/components/chips';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-overview',
  imports: [
    TimeAgoPipe,
    Icon,
    PercentPipe,
    DecimalPipe,
    ProgressBar,
    EmptyState,
    EmptyStateContent,
    Card,
    CardContent,
    CardHeader,
    Chip,
    ChipListbox,
    DatePipe,
    TranslocoPipe
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Overview {
  private readonly editRoot = inject<Edit>(ADMIN_PAGE_EDIT_ROOT);
  readonly page = computed(() => this.editRoot.page());
  readonly qualityScore = computed(() => this.page()?.qualityScore);
}
