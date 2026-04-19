import {
  ComponentRef, createComponent,
  Directive,
  effect, ElementRef, EnvironmentInjector,
  inject, Injector,
  input,
  output,
  Type,
  untracked, ViewContainerRef,
} from '@angular/core';

type ComponentInputs = Record<string, any>;

@Directive({
  selector: '[appLessonBlockHost]'
})
export class LessonBlockHostDirective {
  readonly componentType = input.required<any>({ alias: 'appLessonBlockHost' });
  readonly componentInputs = input<ComponentInputs>();
  readonly activate = output<unknown>();
  readonly deactivate = output<unknown>();
  private readonly viewContainerRef = inject(ViewContainerRef);
  private componentRef: ComponentRef<unknown> | null = null;

  constructor() {
    effect((onCleanup) => {
      const componentType = this.componentType();

      onCleanup(() => {
        if (this.componentRef) {
          this.componentRef.destroy();
          this.componentRef = null;
        }
      });

      if (componentType) {
        this.componentRef = this.viewContainerRef.createComponent(componentType);
        this.applyInputs();
        this.activate.emit(this.componentRef.instance);
      }
    });

    effect(() => {
      this.componentInputs();
      untracked(() => this.applyInputs());
    });
  }

  private applyInputs(): void {
    if (!this.componentRef || !this.componentInputs) {
      return;
    }

    const inputs = this.componentInputs();

    if (inputs) {
      for (const [key, value] of Object.entries(inputs)) {
        this.componentRef.setInput(key, value);
      }
    }
  }
}
