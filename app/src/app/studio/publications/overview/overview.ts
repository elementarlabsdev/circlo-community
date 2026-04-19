import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PUBLICATION_EDIT_ROOT } from '@/studio/publications/types';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { Icon } from '@ngstarter/components/icon';
import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { ProgressBar } from '@ngstarter/components/progress-bar';
import { EmptyState, EmptyStateContent } from '@ngstarter/components/empty-state';
import { Card, CardContent, CardHeader } from '@ngstarter/components/card';
import { Chip, ChipListbox } from '@ngstarter/components/chips';
import type { EditComponent } from '../edit/edit.component';
import findRecursive from '@/_utils/find-recursive';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
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
  private readonly editRoot = inject<EditComponent>(PUBLICATION_EDIT_ROOT);
  readonly publication = computed(() => this.editRoot.publication());
  readonly qualityScore = computed(() => this.publication()?.qualityScore);
  readonly licenseName = computed(() => {
    const pub = this.publication();
    const licenseTypes = this.editRoot.licenseTypes();
    if (!pub || !licenseTypes.length) return null;

    const license = findRecursive<any>(
      licenseTypes,
      (_: any) => _.id === pub.licenseTypeId
    );
    return license ? license.name : pub.licenseTypeId;
  });
}
