import { Directive, inject, input } from '@angular/core';
import { ActionManager } from '@services/action-manager';

@Directive({
  selector: '[addComplaint]',
  host: {
    '(click)': 'onClick($event)'
  }
})
export class AddComplaintDirective {
  private actionManager = inject(ActionManager);

  targetId = input.required<string>();
  targetType = input.required<string>();
  reportedUrl = input<string>();

  protected onClick(event: MouseEvent): void {
    this.actionManager.action.emit({
      action: 'addComplaint',
      payload: {
        targetId: this.targetId(),
        targetType: this.targetType(),
        reportedUrl: this.reportedUrl() ?
          window.location.protocol + '//' + window.location.host + this.reportedUrl() :
          window.location.href
      }
    });
  }
}
