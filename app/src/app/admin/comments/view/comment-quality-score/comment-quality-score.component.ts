import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { QualityScore } from '@model/interfaces';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'admin-comment-quality-score',
  standalone: true,
  imports: [
    DecimalPipe
  ],
  templateUrl: './comment-quality-score.component.html',
  styleUrl: './comment-quality-score.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCommentQualityScoreComponent {
  private readonly translate = inject(TranslocoService);

  qualityScore = input.required<QualityScore | null | undefined>();

  score = computed(() => {
    return this.qualityScore()?.overallScore ?? null;
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
