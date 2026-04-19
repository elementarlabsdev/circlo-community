import { Directive, ElementRef, output, inject } from '@angular/core';

/**
 * Adds classes when the host element or any of its descendants has focus.
 * - is-focus: when the host element itself is focused
 * - is-focus-within: when the host element or any of its descendants is focused
 */
@Directive({
  selector: '[ngsFocusWithin]',
  host: {
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusOut()',
    '[class.is-focus]': 'selfFocus',
    '[class.is-focus-within]': 'focusWithin',
  }
})
export class FocusWithinDirective {
  private el = inject(ElementRef<HTMLElement>);

  // State flags bound to host classes
  protected focusWithin = false;
  protected selfFocus = false;
  private blurTimeout: number | null = null;

  // Outputs to notify about state changes
  readonly focusWithinChange = output<boolean>();
  readonly selfFocusChange = output<boolean>();

  onFocusIn(event: FocusEvent) {
    // If focus moves within, set focusWithin.
    this.focusWithin = true;
    this.focusWithinChange.emit(true);
    // Determine if the target is the host itself
    const isSelf = event.target === this.el.nativeElement;
    this.selfFocus = isSelf as boolean;
    this.selfFocusChange.emit(isSelf as boolean);
    // Cancel any pending blur resolution
    if (this.blurTimeout !== null) {
      clearTimeout(this.blurTimeout);
      this.blurTimeout = null;
    }
  }

  onFocusOut() {
    // Use micro delay to allow focus to move to another descendant
    if (this.blurTimeout !== null) {
      clearTimeout(this.blurTimeout);
    }
    this.blurTimeout = window.setTimeout(() => {
      const root = this.el.nativeElement;
      const active = document.activeElement as Element | null;
      const stillInside = !!active && (active === root || root.contains(active));
      if (this.focusWithin !== stillInside) {
        this.focusWithin = stillInside;
        this.focusWithinChange.emit(stillInside);
      } else {
        this.focusWithin = stillInside;
      }
      const isSelf = !!active && active === root;
      if (this.selfFocus !== isSelf) {
        this.selfFocus = isSelf;
        this.selfFocusChange.emit(isSelf);
      } else {
        this.selfFocus = isSelf;
      }
    }, 0);
  }
}
