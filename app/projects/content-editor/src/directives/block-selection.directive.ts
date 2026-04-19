import { Directive, ElementRef, NgZone, OnDestroy, Renderer2, inject, input, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CONTENT_BUILDER, ContentBuilderComponent } from '@elementar-uix/components/content-editor';

/**
 * Directive to enable mouse-drag selection of child blocks inside a container.
 *
 * Behavior:
 * - Drag can be started only from an area that is NOT inside a block (matched by `blockSelector`).
 * - While dragging, the directive creates a dynamic selection rectangle element with the
 *   class `selectionAreaClass` (default: `ngs-textContent-builder-selection-area`).
 * - Any block that intersects the selection rectangle receives `selectedClass` (default: `is-selected`).
 *   When the block leaves the selection area, the class is removed.
 */
@Directive({
  selector: '[ngsBlockSelection]',
  host: {
    '(mousedown)': 'onMouseDown($event)'
  }
})
export class BlockSelectionDirective implements OnDestroy {
  private document = inject(DOCUMENT);
  private contentBuilder = inject<ContentBuilderComponent>(CONTENT_BUILDER);

  /** CSS selector for selectable blocks. Defaults to `.block`. */
  blockSelector = input<string>('.block-content');

  /** CSS class applied to the dynamic selection rectangle element. */
  selectionAreaClass = input<string>('ngs-content-builder-selection-area');

  /**
   * List of CSS class names to ignore when starting selection.
   * If the mousedown target or any of its ancestors (via closest) contains any of
   * these classes, the selection will NOT start. Class names can be provided with
   * or without leading dot (e.g., 'toolbar-button' or '.toolbar-button').
   */
  ignoreClasses = input<string[]>(['.block-controls']);

  /** Optional: If true, the host element will be forced to `position: relative` for proper overlaying. */
  ensureRelativePosition = input<boolean>(true);

  /** Enable step auto-scrolling when pointer reaches the bottom edge threshold during selection. */
  enableEdgeAutoScroll = input<boolean>(true);
  /** Backward compatibility: legacy flag; if false, edge auto-scroll is disabled. */
  autoScrollEnabled = input<boolean>(true);

  /** CSS selector for custom scroll container inside the host; defaults to host when null. */
  autoScrollContainerSelector = input<string | null>('.editor-scrollable-element');

  /** Threshold in percent of container height to trigger scroll when pointer is within this bottom band (e.g., 10). */
  edgeThresholdPercent = input<number>(10);
  /** Backward compatibility (unused): legacy px threshold input. */
  autoScrollEdgeThreshold = input<number>(32);

  /** Scroll step in percent of container height to shift per trigger (e.g., 5). */
  scrollStepPercent = input<number>(5);
  /** Backward compatibility (unused): legacy max speed per frame. */
  autoScrollMaxSpeed = input<number>(24);

  private elRef = inject(ElementRef) as ElementRef<HTMLElement>;
  private renderer = inject(Renderer2);
  private ngZone = inject(NgZone);

  private host: HTMLElement = this.elRef.nativeElement;
  private selectionEl: HTMLElement | null = null;

  private isDragging = signal(false);
  private startX = signal(0);
  private startY = signal(0);
  private lastPointerX = signal(0);
  private lastPointerY = signal(0);

  private moveUnlisten: (() => void) | null = null;
  private upUnlisten: (() => void) | null = null;
  // Track only blockIds we toggled via drag selection to avoid interfering with other selection sources
  private selectedSet = new Set<string>();

  // Auto-scroll state
  private scrollRafId: number | null = null;
  private scrollContainerEl: HTMLElement | null = null;
  private scrollUnlisten: (() => void) | null = null;
  private prevScrollLeft = 0;
  private prevScrollTop = 0;
  private startScrollLeft = 0;
  private startScrollTop = 0;

  ngOnDestroy(): void {
    this.cleanupDrag(true);
  }

  onMouseDown(ev: MouseEvent) {
    // Only left button
    if (ev.button !== 0) return;

    const targetEl = ev.target as HTMLElement | null;

    // Ignore clicks on elements that should not start selection (by class or closest)
    if (this.isInIgnoredArea(targetEl)) {
      return;
    }

    // If click is inside a selectable block, do not start selection
    if (targetEl?.closest(this.blockSelector())) {
      return;
    }

    // Start dragging
    const { clientX, clientY } = ev;
    this.startX.set(clientX);
    this.startY.set(clientY);
    this.lastPointerX.set(clientX);
    this.lastPointerY.set(clientY);
    this.isDragging.set(true);

    if (this.ensureRelativePosition()) {
      const style = this.document.defaultView ? this.document.defaultView.getComputedStyle(this.host) : null;
      if (style && style.position === 'static') {
        this.renderer.setStyle(this.host, 'position', 'relative');
      }
    }

    // Disable text selection while dragging
    this.renderer.setStyle(this.document.body, 'user-select', 'none');

    // Create selection rectangle element
    this.createSelectionElement();
    this.updateSelectionElement(clientX, clientY);

    // Listen on document for move/up during drag for robustness
    this.ngZone.runOutsideAngular(() => {
      this.moveUnlisten = this.renderer.listen('document', 'mousemove', (e: MouseEvent) => this.onMouseMove(e));
      this.upUnlisten = this.renderer.listen('document', 'mouseup', (e: MouseEvent) => this.onMouseUp(e));
    });

    // Resolve scroll container and initialize scroll anchors (independent of auto-scroll flags)
    this.resolveScrollContainer();
    const container = this.scrollContainerEl || this.host;
    if (container) {
      // Initialize previous and start scroll positions
      this.prevScrollTop = container.scrollTop;
      this.prevScrollLeft = container.scrollLeft;
      this.startScrollTop = container.scrollTop;
      this.startScrollLeft = container.scrollLeft;
      // Listen container scroll to keep geometry in sync with scrolling (without moving logical pointer)
      this.ngZone.runOutsideAngular(() => {
        this.scrollUnlisten = this.renderer.listen(container, 'scroll', () => {
          if (!this.isDragging()) return;
          this.prevScrollTop = container.scrollTop;
          this.prevScrollLeft = container.scrollLeft;
          this.updateSelectionElement(this.lastPointerX(), this.lastPointerY());
          this.updateBlocksSelection();
        });
      });
    }

    ev.preventDefault();
    ev.stopPropagation();
  }

  private onMouseMove(ev: MouseEvent) {
    if (!this.isDragging()) return;
    // Update logical pointer first
    this.lastPointerX.set(ev.clientX);
    this.lastPointerY.set(ev.clientY);

    // Perform step auto-scroll if pointer is near the bottom edge of the scroll container
    this.stepAutoScrollIfNeeded(ev.clientY);

    // After any scrolling, update selection geometry and affected blocks using logical pointer
    this.updateSelectionElement(this.lastPointerX(), this.lastPointerY());
    this.updateBlocksSelection();
  }

  private onMouseUp(_: MouseEvent) {
    if (!this.isDragging()) return;
    this.updateBlocksSelection();
    this.cleanupDrag(false);
  }

  private resolveScrollContainer() {
    const selector = this.autoScrollContainerSelector();
    let baseEl: HTMLElement | null = null;
    if (selector) {
      baseEl = this.host.closest(selector) as HTMLElement | null;
    }
    // Determine effective scrollable container
    const candidate = baseEl || this.host;
    this.scrollContainerEl = this.findEffectiveScrollable(candidate) || this.host;
  }

  private findEffectiveScrollable(root: HTMLElement): HTMLElement | null {
    // If root itself scrolls, use it
    if (this.isElementScrollable(root)) return root;

    // 1) Try to find a scrollable descendant (depth-limited BFS)
    const queue: HTMLElement[] = Array.from(root.children) as HTMLElement[];
    let hops = 0;
    const MAX_HOPS = 1000; // safety
    while (queue.length && hops < MAX_HOPS) {
      const el = queue.shift()!;
      hops++;
      if (!(el instanceof HTMLElement)) continue;
      if (this.isElementScrollable(el)) return el;
      queue.push(...Array.from(el.children) as HTMLElement[]);
    }

    // 2) Try to find a scrollable ancestor up to the host
    let parent: HTMLElement | null = root.parentElement;
    while (parent && parent !== this.host.parentElement) {
      if (this.isElementScrollable(parent)) return parent;
      if (parent === this.host) break;
      parent = parent.parentElement;
    }

    return null;
  }

  private isElementScrollable(el: HTMLElement): boolean {
    const style = this.document.defaultView ? this.document.defaultView.getComputedStyle(el) : null;
    if (!style) return false;
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;
    const canScrollY = (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') && (el.scrollHeight > el.clientHeight);
    const canScrollX = (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'overlay') && (el.scrollWidth > el.clientWidth);
    return canScrollX || canScrollY;
  }

  // Discrete step auto-scroll: when pointer reaches edge bands, scroll container by a small step.
  // - Bottom band: scroll down.
  // - Top band: scroll up.
  private stepAutoScrollIfNeeded(pointerClientY: number) {
    if (!this.isDragging()) return;
    if (!this.enableEdgeAutoScroll() || !this.autoScrollEnabled()) return;

    const container = this.scrollContainerEl || this.host;
    if (!container) return;

    // Only vertical scroll for now
    const rect = container.getBoundingClientRect();
    const height = rect.height;
    if (height <= 0) return;

    const thresholdPx = (this.edgeThresholdPercent() / 100) * height;

    // Edge bands
    const inBottomBand = pointerClientY >= (rect.bottom - thresholdPx);
    const inTopBand = pointerClientY <= (rect.top + thresholdPx);

    // Scroll bounds
    const maxScrollTop = container.scrollHeight - container.clientHeight;
    const canScrollDown = container.scrollTop < maxScrollTop;
    const canScrollUp = container.scrollTop > 0;

    const step = Math.max(1, Math.round((this.scrollStepPercent() / 100) * height));

    let didScroll = false;

    // Bottom band → scroll down
    if (inBottomBand && canScrollDown) {
      const newScrollTop = Math.min(maxScrollTop, container.scrollTop + step);
      if (newScrollTop !== container.scrollTop) {
        container.scrollTop = newScrollTop;
        this.prevScrollTop = newScrollTop;
        didScroll = true;
      }
    }

    // Top band → scroll up
    if (inTopBand && canScrollUp) {
      const newScrollTop = Math.max(0, container.scrollTop - step);
      if (newScrollTop !== container.scrollTop) {
        container.scrollTop = newScrollTop;
        this.prevScrollTop = newScrollTop;
        didScroll = true;
      }
    }

    if (didScroll) {
      // Update geometry right away to avoid waiting for the scroll event
      this.updateSelectionElement(this.lastPointerX(), this.lastPointerY());
      this.updateBlocksSelection();
    }
  }

  private createSelectionElement() {
    if (this.selectionEl) return;
    const sel = this.renderer.createElement('div');
    this.renderer.addClass(sel, this.selectionAreaClass());
    this.renderer.setStyle(sel, 'position', 'absolute');
    this.renderer.setStyle(sel, 'pointer-events', 'none');
    this.renderer.setStyle(sel, 'box-sizing', 'border-box');

    // this.renderer.setStyle(sel, 'border', '1px dashed rgba(0,0,0,0.4)');
    // this.renderer.setStyle(sel, 'background', 'rgba(0, 123, 255, 0.08)');

    this.renderer.appendChild(this.host, sel);
    this.selectionEl = sel;
  }

  private updateSelectionElement(currentX: number, currentY: number) {
    if (!this.selectionEl) return;

    const hostRect = this.host.getBoundingClientRect();

    // Adjust start point by the scroll delta so selection anchors to textContent position
    const container = this.scrollContainerEl || this.host;
    const scrollDx = container ? (container.scrollLeft - this.startScrollLeft) : 0;
    const scrollDy = container ? (container.scrollTop - this.startScrollTop) : 0;
    const adjStartX = this.startX() - scrollDx;
    const adjStartY = this.startY() - scrollDy;

    // Clamp the selection rectangle to the host container bounds (in viewport coords)
    const raw = new DOMRect(
      Math.min(adjStartX, currentX),
      Math.min(adjStartY, currentY),
      Math.abs(currentX - adjStartX),
      Math.abs(currentY - adjStartY)
    );
    const clamped = this.intersectRects(raw, hostRect);

    if (!clamped) {
      // Hide selection when outside of the container
      this.renderer.setStyle(this.selectionEl, 'display', 'none');
      this.renderer.setStyle(this.selectionEl, 'left', '0');
      this.renderer.setStyle(this.selectionEl, 'top', '0');
      this.renderer.setStyle(this.selectionEl, 'width', '0');
      this.renderer.setStyle(this.selectionEl, 'height', '0');
      return;
    }

    // Ensure the element is visible
    this.renderer.removeStyle(this.selectionEl, 'display');

    const left = clamped.left - hostRect.left;
    const top = clamped.top - hostRect.top;
    const width = clamped.width;
    const height = clamped.height;

    this.renderer.setStyle(this.selectionEl, 'left', left + 'px');
    this.renderer.setStyle(this.selectionEl, 'top', top + 'px');
    this.renderer.setStyle(this.selectionEl, 'width', width + 'px');
    this.renderer.setStyle(this.selectionEl, 'height', height + 'px');
  }

  private updateBlocksSelection() {
    const blocks = Array.from(this.host.querySelectorAll<HTMLElement>(this.blockSelector())) as HTMLElement[];
    const rect = this.getCurrentSelectionViewportRect();

    if (!rect) {
      // If there is no active selection area, unselect only blocks we previously selected via drag
      if (this.selectedSet.size) {
        const idsToUnselect = Array.from(this.selectedSet);
        this.ngZone.run(() => {
          for (const blockId of idsToUnselect) {
            try {
              this.contentBuilder.unselectBlock(blockId);
            } catch {
              // no-op: component API might guard internally
            }
            this.selectedSet.delete(blockId);
          }
        });
      }
      return;
    }

    const idsToSelect: string[] = [];
    const idsToUnselect: string[] = [];

    for (const contentEl of blocks) {
      const intersects = this.intersectsRect(rect, contentEl.getBoundingClientRect());
      // Find the closest container with data-block-id
      const blockEl = contentEl.closest('.block') as HTMLElement | null;
      const blockId = blockEl?.getAttribute('data-block-id') || '';

      if (!blockId) continue;

      const isSelectedNow = this.contentBuilder.isBlockSelected
        ? this.contentBuilder.isBlockSelected(blockId)
        : this.selectedSet.has(blockId);

      if (intersects && !isSelectedNow) {
        idsToSelect.push(blockId);
      } else if (!intersects && isSelectedNow && this.selectedSet.has(blockId)) {
        idsToUnselect.push(blockId);
      }
    }

    if (idsToSelect.length || idsToUnselect.length) {
      for (const id of idsToSelect) {
        this.contentBuilder.selectBlock(id);
        this.selectedSet.add(id);
      }
      for (const id of idsToUnselect) {
        this.contentBuilder.unselectBlock(id);
        this.selectedSet.delete(id);
      }
    }
  }

  private getCurrentSelectionViewportRect(): DOMRect | null {
    if (!this.isDragging()) return null;

    // Adjust start point by scroll delta to keep anchor in textContent coordinates
    const container = this.scrollContainerEl || this.host;
    const scrollDx = container ? (container.scrollLeft - this.startScrollLeft) : 0;
    const scrollDy = container ? (container.scrollTop - this.startScrollTop) : 0;
    const adjStartX = this.startX() - scrollDx;
    const adjStartY = this.startY() - scrollDy;

    // Raw selection rect in viewport coords
    const raw = new DOMRect(
      Math.min(adjStartX, this.lastPointerX()),
      Math.min(adjStartY, this.lastPointerY()),
      Math.abs(this.lastPointerX() - adjStartX),
      Math.abs(this.lastPointerY() - adjStartY)
    );

    // Clamp to host bounds
    const hostRect = this.host.getBoundingClientRect();
    const clamped = this.intersectRects(raw, hostRect);
    return clamped;
  }

  private isInIgnoredArea(target: HTMLElement | null): boolean {
    const list = this.ignoreClasses();
    if (!target || !Array.isArray(list) || list.length === 0) return false;
    const normalized = list
      .map(c => (c ?? '').toString().trim())
      .filter(Boolean)
      .map(c => c.startsWith('.') ? c.slice(1) : c);
    if (normalized.length === 0) return false;

    let el: HTMLElement | null = target;
    // Traverse up through ancestors to emulate "closest" semantics for class names
    while (el) {
      for (const cls of normalized) {
        if (el.classList && el.classList.contains(cls)) return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  private intersectsRect(a: DOMRect, b: DOMRect): boolean {
    return !(b.left > a.right ||
             b.right < a.left ||
             b.top > a.bottom ||
             b.bottom < a.top);
  }

  // Returns intersection of two viewport-rects or null if they don't intersect
  private intersectRects(a: DOMRect, b: DOMRect): DOMRect | null {
    const left = Math.max(a.left, b.left);
    const top = Math.max(a.top, b.top);
    const right = Math.min(a.right, b.right);
    const bottom = Math.min(a.bottom, b.bottom);
    const width = right - left;
    const height = bottom - top;
    if (width <= 0 || height <= 0) return null;
    return new DOMRect(left, top, width, height);
  }

  private cleanupDrag(force: boolean) {
    if (!this.isDragging() && !force) return;

    this.isDragging.set(false);
    this.lastPointerX.set(this.startX());
    this.lastPointerY.set(this.startY());

    if (this.moveUnlisten) { this.moveUnlisten(); this.moveUnlisten = null; }
    if (this.upUnlisten) { this.upUnlisten(); this.upUnlisten = null; }

    if (this.selectionEl) {
      this.renderer.removeChild(this.host, this.selectionEl);
      this.selectionEl = null;
    }

    // Stop auto-scroll loop
    if (this.scrollRafId != null) {
      cancelAnimationFrame(this.scrollRafId);
      this.scrollRafId = null;
    }
    this.scrollContainerEl = null;

    // Re-enable text selection
    this.renderer.removeStyle(this.document.body, 'user-select');
  }
}
