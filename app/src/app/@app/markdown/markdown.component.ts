import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SafeHtmlPipe } from '@ngstarter-ui/components/core';

@Component({
  selector: 'ngs-markdown',
  exportAs: 'ngsMarkdown',
  standalone: true,
  imports: [
    SafeHtmlPipe
  ],
  templateUrl: './markdown.component.html',
  styleUrl: './markdown.component.scss',
  host: {
    'class': 'ngs-markdown'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownComponent {
  data = input.required<string>();
}
