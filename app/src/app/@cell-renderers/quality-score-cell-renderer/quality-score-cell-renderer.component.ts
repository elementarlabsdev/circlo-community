import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter-ui/components/data-view';
import { DecimalPipe } from '@angular/common';
import { QualityScore } from '@/@model/interfaces';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-quality-score-cell-renderer',
  standalone: true,
  imports: [
    DecimalPipe
  ],
  templateUrl: './quality-score-cell-renderer.component.html',
  styleUrl: './quality-score-cell-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QualityScoreCellRendererComponent implements DataViewCellRenderer {
  private readonly translate = inject(TranslocoService);

  element = input<any>();
  columnDef = input<any>();
  fieldData = input.required<number | QualityScore | null>();

  score = computed(() => {
    const data = this.fieldData();
    if (data === null || data === undefined) return null;
    if (typeof data === 'number') return data;
    return data.overallScore ?? null;
  });

  description = computed(() => {
    const score = this.score();
    if (score === null) return '';
    if (score >= 80) return this.translate.translate('admin.comments.quality.excellent');
    if (score >= 50) return this.translate.translate('admin.comments.quality.good');
    if (score >= 30) return this.translate.translate('admin.comments.quality.average');
    return this.translate.translate('admin.comments.quality.poor');
  });

  indicatorColor = computed(() => {
    const score = this.score();
    if (score === null) return 'transparent';
    if (score >= 80) return '#22c55e'; // green-500
    if (score >= 50) return '#eab308'; // yellow-500
    if (score >= 30) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  });
}
