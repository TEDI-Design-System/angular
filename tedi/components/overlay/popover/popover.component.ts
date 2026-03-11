import { DOCUMENT } from "@angular/common";
import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  input,
  inject,
  Renderer2,
  computed,
  viewChild,
  signal,
  contentChild,
  AfterContentChecked,
} from "@angular/core";
import {
  NgxFloatUiContentComponent,
  NgxFloatUiModule,
  NgxFloatUiPlacements,
} from "ngx-float-ui";
import { PopoverTriggerDirective } from "./popover-trigger/popover-trigger.directive";
import { getFocusableElements } from "../../../utils/elements.util";
import { PopoverContentComponent } from "./popover-content/popover-content.component";

export type PopoverPosition = `${NgxFloatUiPlacements}`;

@Component({
  standalone: true,
  selector: "tedi-popover",
  imports: [NgxFloatUiModule],
  templateUrl: "./popover.component.html",
  styleUrl: "./popover.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverComponent implements AfterContentChecked {
  /**
   * The position of the popover relative to the trigger element.
   * @default top
   */
  position = input<PopoverPosition>("top");
  /**
   * Should position flip to opposite direction when overflowing screen?
   * @default false
   */
  preventOverflow = input(false);
  /**
   * Is dismissible by clicking outside of content?
   * @default true
   */
  dismissible = input(true);
  /**
   * Does popover content hide on scroll?
   * @default false
   */
  hideOnScroll = input(false);
  /**
   * Does popover have illustrative border on the arrow side?
   * @default false
   */
  withBorder = input(false);
  /**
   * Should show arrow?
   */
  withArrow = input(true);
  /**
   * Lock scrolling on rest of the page?
   * @default false
   */
  lockScroll = input(false);
  /**
   * Append floating element to given selector.
   * Use 'body' to append at the end of DOM or empty string to append next to trigger element.
   * @default "body"
   */
  readonly appendTo = input("body");
  /** Delay time (in ms) for closing popover when not hovering trigger or content.
   * @default 100
   */
  readonly timeoutDelay = input(100);

  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);

  readonly floatUiComponent = viewChild.required(NgxFloatUiContentComponent);
  readonly popoverTrigger = contentChild.required(PopoverTriggerDirective);
  private readonly popoverContent = contentChild.required(
    PopoverContentComponent,
  );

  readonly containerId = signal("");
  readonly isContentHovered = signal(false);

  hideTimeout?: ReturnType<typeof setTimeout>;
  private keydownListener?: () => void;
  private scrollListener?: () => void;
  private focusinListener?: () => void;
  private mousedownListener?: () => void;

  ngAfterContentChecked() {
    const floatUiEl = this.floatUiComponent().elRef
      .nativeElement as HTMLElement;
    const container = floatUiEl.querySelector<HTMLElement>(
      ".float-ui-container-popover",
    );

    if (container) {
      const labelledBy = this.popoverContent().title()
        ? this.popoverContent().titleId
        : container.id + "_trigger";
      container.setAttribute("tabindex", "-1");
      container.setAttribute("aria-labelledby", labelledBy);
      this.containerId.set(container.id);
    }
  }

  showPopover() {
    if (this.floatUiComponent().state) return;

    clearTimeout(this.hideTimeout);
    this.floatUiComponent().show();

    const floatUiEl = this.floatUiComponent().elRef
      .nativeElement as HTMLElement;
    const container = floatUiEl.querySelector<HTMLElement>(
      ".float-ui-container-popover",
    );

    if (this.lockScroll()) {
      this.renderer.setStyle(this.document.body, "overflow", "hidden");
    }

    if (container) {
      setTimeout(() => container.focus({ preventScroll: true }));
      this.setupKeyboardNavigation(container);
    }

    if (this.hideOnScroll()) {
      this.setupScrollListener();
    }

    if (this.dismissible()) {
      this.setupDismissListeners();
    }
  }

  hidePopover(focusTrigger?: boolean) {
    if (!this.floatUiComponent().state) return;

    this.cleanupKeyboardNavigation();
    this.cleanupScrollListener();
    this.cleanupDismissListeners();
    this.floatUiComponent().hide();

    if (this.lockScroll()) {
      this.renderer.removeStyle(this.document.body, "overflow");
    }

    if (focusTrigger) {
      this.popoverTrigger().host.nativeElement.focus({ preventScroll: true });
    }
  }

  togglePopover() {
    if (this.floatUiComponent().state) {
      this.hidePopover(true);
    } else {
      this.showPopover();
    }
  }

  readonly floatUiContainerClass = computed(() => {
    const classList = ["float-ui-container-popover"];

    if (this.withBorder()) {
      classList.push("float-ui-container-popover--border");
    }

    if (this.withArrow()) {
      classList.push("float-ui-container-popover--arrow");
    }

    return classList.join(",");
  });

  private setupKeyboardNavigation(container: HTMLElement) {
    this.cleanupKeyboardNavigation();

    this.keydownListener = this.renderer.listen(
      container,
      "keydown",
      (e: KeyboardEvent) => {
        if (e.key === "Escape" && this.floatUiComponent().state) {
          e.preventDefault();
          this.hidePopover(true);
        }

        if (e.key === "Tab") {
          const focusableElements = getFocusableElements(container);
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          const activeElement = this.document.activeElement as HTMLElement;

          if (
            !e.shiftKey &&
            (activeElement === lastElement ||
              (activeElement === container && !focusableElements.length))
          ) {
            e.preventDefault();
            this.focusElementAfterTrigger();
          } else if (
            e.shiftKey &&
            (activeElement === firstElement || activeElement === container)
          ) {
            e.preventDefault();
            this.focusElementBeforeTrigger();
          }
        }
      },
    );
  }

  private cleanupKeyboardNavigation() {
    if (this.keydownListener) {
      this.keydownListener();
      this.keydownListener = undefined;
    }
  }

  private setupScrollListener() {
    this.cleanupScrollListener();

    this.scrollListener = this.renderer.listen(
      this.document,
      "scroll",
      () => {
        if (this.floatUiComponent().state) {
          this.hidePopover(false);
        }
      },
      { capture: true, passive: true },
    );
  }

  private cleanupScrollListener() {
    if (this.scrollListener) {
      this.scrollListener();
      this.scrollListener = undefined;
    }
  }

  private setupDismissListeners() {
    this.cleanupDismissListeners();

    this.focusinListener = this.renderer.listen(
      this.document,
      "focusin",
      (e: FocusEvent) => this.handleClosePopoverEvent(e),
    );

    this.mousedownListener = this.renderer.listen(
      this.document,
      "mousedown",
      (e: MouseEvent) => this.handleClosePopoverEvent(e),
    );
  }

  private cleanupDismissListeners() {
    if (this.focusinListener) {
      this.focusinListener();
      this.focusinListener = undefined;
    }

    if (this.mousedownListener) {
      this.mousedownListener();
      this.mousedownListener = undefined;
    }
  }

  private focusElementAfterTrigger() {
    const focusableElements = getFocusableElements(this.document.body);
    const triggerIndex = focusableElements.indexOf(
      this.popoverTrigger().host.nativeElement,
    );

    if (triggerIndex !== -1 && triggerIndex < focusableElements.length - 1) {
      const nextElement = focusableElements[triggerIndex + 1];
      this.hidePopover();
      setTimeout(() => nextElement.focus());
    }
  }

  private focusElementBeforeTrigger() {
    const focusableElements = getFocusableElements(this.document.body);
    const triggerIndex = focusableElements.indexOf(
      this.popoverTrigger().host.nativeElement,
    );

    if (triggerIndex > 0) {
      const previousElement = focusableElements[triggerIndex - 1];
      this.hidePopover();
      setTimeout(() => previousElement.focus());
    }
  }

  private handleClosePopoverEvent(e: Event) {
    const triggerEl = this.popoverTrigger().host.nativeElement;
    const containerEl = this.floatUiComponent().elRef
      .nativeElement as HTMLElement;
    const target = e.target as HTMLElement | null;

    if (!target || triggerEl.contains(target) || containerEl.contains(target)) {
      return;
    }

    this.hidePopover(true);
  }
}
