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
  PLATFORM_ID,
  effect,
} from "@angular/core";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { CdkTrapFocus } from "@angular/cdk/a11y";

export type ModalSize = "default" | "small";
export type ModalWidth = "xs" | "sm" | "md" | "lg" | "xl";
export type ModalPosition = "center" | "left" | "right";

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
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  /** Is modal open? */
  readonly open = model(false);

  /** Modal size */
  readonly size = input<ModalSize>("default");

  /** Modal width */
  readonly width = input<ModalWidth>("sm");

  /** Position of the modal */
  readonly position = input<ModalPosition>("center");

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);

  private prevBodyOverflow: string = "";
  private prevFocusedElement: HTMLElement | null = null;

  readonly classes = computed(() => {
    const classList = [
      "tedi-modal",
      `tedi-modal--${this.size()}`,
      `tedi-modal--${this.width()}`,
      `tedi-modal--${this.position()}`,
    ];

    if (this.open()) {
      classList.push("tedi-modal--open");
    }

    return classList.join(" ");
  });

  constructor() {
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
    if (!isPlatformBrowser(this.platformId)) return;

    this.document.body.appendChild(this.host.nativeElement);
  }

  ngOnDestroy() {
    if (!isPlatformBrowser(this.platformId)) return;

    const element = this.host.nativeElement;
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
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

  private handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      this.open.set(false);
    }
  };
}
