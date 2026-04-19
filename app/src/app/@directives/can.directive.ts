import { Directive, TemplateRef, ViewContainerRef, inject, OnDestroy, Pipe, PipeTransform, input, effect, untracked } from '@angular/core';
import { Ability } from '@casl/ability';

@Directive({
  selector: '[can]',
  standalone: true
})
export class CanDirective implements OnDestroy {
  private ability = inject(Ability);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  can = input.required<string>();
  subject = input<any>(undefined, { alias: 'canSubject' });
  else = input<TemplateRef<any> | null>(null, { alias: 'canElse' });

  private hasView = false;
  private hasElseView = false;
  private unsubscribe?: () => void;
  private readonly updateHandler = () => this.updateView();

  constructor() {
    this.unsubscribe = this.ability.on('update', this.updateHandler);

    effect(() => {
      this.can();
      this.subject();
      this.else();
      untracked(() => this.updateView());
    });
  }

  private updateView() {
    const isAllowed = this.ability.can(this.can(), this.subject());

    if (isAllowed) {
      if (!this.hasView) {
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
        this.hasElseView = false;
      }
    } else {
      const elseTemplate = this.else();
      if (elseTemplate) {
        if (!this.hasElseView) {
          this.viewContainer.clear();
          this.viewContainer.createEmbeddedView(elseTemplate);
          this.hasElseView = true;
          this.hasView = false;
        }
      } else {
        this.viewContainer.clear();
        this.hasView = false;
        this.hasElseView = false;
      }
    }
  }

  ngOnDestroy() {
    this.unsubscribe?.();
  }
}

@Pipe({
  name: 'can',
  standalone: true,
  pure: false,
})
export class CanPipe implements PipeTransform {
  private ability = inject(Ability);

  transform(subject: any, action: string): boolean {
    return this.ability.can(action, subject);
  }
}
