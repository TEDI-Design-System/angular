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
  signal,
} from "@angular/core";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { CdkTrapFocus, _IdGenerator } from "@angular/cdk/a11y";
import { ModalRef } from "./modal-ref";
import { resolveModalHeadingId } from "./modal-label";
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

  /**
   * Accessible name for the dialog. Only needed when the modal has no heading
   * in `<tedi-modal-header>`, or that heading is not the name to announce.
   * Standalone mode only; service mode uses `ModalConfig.ariaLabel`.
   */
  readonly ariaLabel = input<string | undefined>(undefined);

  /**
   * Id of an element labelling the dialog, for a label outside
   * `<tedi-modal-header>`. Ignored when `ariaLabel` is set.
   */
  readonly ariaLabelledBy = input<string | undefined>(undefined);

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly idGenerator = inject(_IdGenerator);

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

  /** Re-resolved on every open, since the heading is projected content. */
  private readonly headingLabelId = signal<string | null>(null);

  /** @internal */
  protected readonly dialogAriaLabel = computed(() =>
    this.serviceMode ? null : (this.ariaLabel() ?? null),
  );

  /** @internal `aria-label` wins, so it is never paired with a labelledby. */
  protected readonly dialogAriaLabelledBy = computed(() => {
    if (this.serviceMode || this.ariaLabel()) return null;
    return this.ariaLabelledBy() ?? this.headingLabelId();
  });

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
    this.resolveHeadingLabel();
    this.prevFocusedElement = this.document.activeElement as HTMLElement;
    this.prevBodyOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = "hidden";
    this.document.addEventListener("keydown", this.handleKeydown);
  }

  /**
   * A DOM query rather than a `contentChild`, because the header injects this
   * component (importing it back would close a cycle) and the heading is
   * double-projected, out of reach of any query here.
   */
  private resolveHeadingLabel(): void {
    if (this.ariaLabel() || this.ariaLabelledBy()) {
      this.headingLabelId.set(null);
      return;
    }

    this.headingLabelId.set(
      resolveModalHeadingId(this.host.nativeElement, this.idGenerator),
    );
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
