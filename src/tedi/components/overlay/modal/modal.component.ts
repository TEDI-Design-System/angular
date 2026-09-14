import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  input,
  computed,
  model,
  inject,
  AfterViewInit,
  ElementRef,
  OnDestroy,
  Optional,
  PLATFORM_ID,
  SkipSelf,
  Signal,
  effect,
} from "@angular/core";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { CdkTrapFocus } from "@angular/cdk/a11y";
import { ModalRef } from "./modal-ref";
import { MODAL_SIZE } from "./modal.types";
import type { ModalSize, ModalWidth, ModalPosition } from "./modal.types";

/**
 * Modal component that works in two modes:
 *
 * **Service mode** When opened via `ModalService.open()`, acts as a
 * lightweight layout wrapper. CDK Dialog handles overlay, backdrop, focus trap,
 * scroll blocking, and keyboard events.
 *
 * **Standalone mode** (deprecated): When used directly in a template with `[(open)]`,
 * manages its own overlay, scroll lock, and focus. Migrate to `ModalService.open()`.
 */
@Component({
  standalone: true,
  selector: "tedi-modal",
  imports: [CdkTrapFocus],
  templateUrl: "./modal.component.html",
  styleUrl: "./modal.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "classes()",
  },
  providers: [
    {
      provide: MODAL_SIZE,
      // In service mode the template `size` input stays at its default — the
      // real variant lives on the cdk-overlay-pane and is provided by
      // ModalService via the dialog injector. Delegate to that when present.
      useFactory: (
        modal: ModalComponent,
        parentSize: Signal<ModalSize> | null,
      ) => (modal.serviceMode && parentSize ? parentSize : modal.size),
      deps: [ModalComponent, [new Optional(), new SkipSelf(), MODAL_SIZE]],
    },
  ],
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  /** @deprecated Is modal open? Only used in standalone (deprecated) mode. */
  readonly open = model(false);

  /** Modal size */
  readonly size = input<ModalSize>("default");

  /** Modal width */
  readonly width = input<ModalWidth>("sm");

  /** Position of the modal */
  readonly position = input<ModalPosition>("center");

  /** @deprecated Whether clicking the backdrop closes the modal. Only used in standalone mode. */
  readonly closeOnBackdropClick = input(true);

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * When a ModalRef is available, this component is inside a CDK Dialog
   * and should act as a layout-only wrapper.
   */
  readonly serviceMode = !!inject(ModalRef, { optional: true });

  private prevBodyOverflow: string = "";
  private prevFocusedElement: HTMLElement | null = null;

  private readonly isPresetWidth = computed(() =>
    (["xs", "sm", "md", "lg", "xl"] as string[]).includes(this.width()),
  );

  /** Custom width for non-preset widths (legacy mode only). */
  readonly customWidth = computed(() =>
    !this.serviceMode && !this.isPresetWidth() ? this.width() : null,
  );

  readonly classes = computed(() => {
    const classList = ["tedi-modal"];

    if (this.serviceMode) {
      classList.push("tedi-modal--service");
    } else {
      classList.push(`tedi-modal--${this.size()}`);

      if (this.isPresetWidth()) {
        classList.push(`tedi-modal--${this.width()}`);
      }

      if (this.position() === "top") {
        classList.push("tedi-modal--center", "tedi-modal--top");
      } else {
        classList.push(`tedi-modal--${this.position()}`);
      }

      if (this.open()) {
        classList.push("tedi-modal--open");
      }
    }

    return classList.join(" ");
  });

  constructor() {
    if (this.serviceMode) return;

    effect(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      if (this.open()) {
        this.onOpen();
      } else {
        this.onClose();
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.serviceMode) return;
    if (!isPlatformBrowser(this.platformId)) return;

    this.document.body.appendChild(this.host.nativeElement);
  }

  ngOnDestroy() {
    if (this.serviceMode) return;
    if (!isPlatformBrowser(this.platformId)) return;

    const element = this.host.nativeElement;

    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }

    this.document.removeEventListener("keydown", this.handleKeydown);
  }

  private onOpen() {
    this.prevFocusedElement = this.document.activeElement as HTMLElement;
    this.prevBodyOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = "hidden";
    this.document.addEventListener("keydown", this.handleKeydown);
  }

  private onClose() {
    this.document.body.style.overflow = this.prevBodyOverflow;

    if (this.prevFocusedElement) {
      this.prevFocusedElement.focus({ preventScroll: true });
    }

    this.document.removeEventListener("keydown", this.handleKeydown);
  }

  /** @internal */
  onBackdropClick(): void {
    if (this.closeOnBackdropClick()) {
      this.open.set(false);
    }
  }

  private handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      this.open.set(false);
    }
  };
}
