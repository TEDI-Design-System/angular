import { Injectable, inject } from "@angular/core";
import { Dialog, DialogRef } from "@angular/cdk/dialog";
import { GlobalPositionStrategy, Overlay } from "@angular/cdk/overlay";
import { ComponentType } from "@angular/cdk/portal";
import { ModalRef } from "./modal-ref";
import { ModalConfig, ModalPosition, ModalScrollBehavior, MODAL_DATA } from "./modal.types";

const WIDTH_PRESETS: readonly string[] = ["xs", "sm", "md", "lg", "xl"];

@Injectable({ providedIn: "root" })
export class ModalService {
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);

  /**
   * Open a modal dialog with the given component as content.
   *
   * @param component Component to render inside the modal.
   * @param config Modal configuration (size, width, position, data, etc.).
   * @returns A `ModalRef` to control and observe the modal.
   *
   * @example
   * ```ts
   * const ref = this.modalService.open(MyFormComponent, {
   *   data: { userId: 123 },
   *   width: 'md',
   *   position: 'center',
   * });
   *
   * ref.closed.subscribe(result => console.log('Modal closed with:', result));
   * ```
   */
  open<R = unknown, D = unknown>(
    component: ComponentType<unknown>,
    config: ModalConfig<D> = {},
  ): ModalRef<R> {
    const {
      data,
      size = "default",
      width = "sm",
      position = "center",
      scrollBehavior = "content",
      closeOnBackdropClick = true,
      closeOnEscape = true,
      mobileFullscreen = false,
      ariaLabel,
      ariaLabelledBy,
    } = config;

    const panelClasses = this.buildPanelClasses(size, width, position, scrollBehavior, mobileFullscreen);
    const isPresetWidth = WIDTH_PRESETS.includes(width);

    const dialogRef = this.dialog.open<R, D>(component, {
      data,
      panelClass: panelClasses,
      backdropClass: "tedi-modal-backdrop",
      hasBackdrop: true,
      disableClose: true,
      ariaLabel,
      ariaLabelledBy,
      ariaModal: true,
      autoFocus: "first-tabbable",
      restoreFocus: true,
      positionStrategy: this.buildPositionStrategy(position, scrollBehavior),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      providers: (ref) => [
        { provide: ModalRef, useValue: new ModalRef<R>(ref) },
        { provide: MODAL_DATA, useValue: data },
      ],
    });

    if (!isPresetWidth) {
      dialogRef.overlayRef.overlayElement.style.maxWidth = width;
    }

    this.setupDialogBehavior(dialogRef, scrollBehavior, closeOnBackdropClick, closeOnEscape);

    return new ModalRef<R>(dialogRef);
  }

  /** Close all open modals. */
  closeAll(): void {
    this.dialog.closeAll();
  }

  private buildPanelClasses(
    size: string,
    width: string,
    position: ModalPosition,
    scrollBehavior: ModalScrollBehavior,
    mobileFullscreen: boolean,
  ): string[] {
    const classes = [
      "tedi-modal-dialog",
      `tedi-modal-dialog--${size}`,
    ];

    if (WIDTH_PRESETS.includes(width)) {
      classes.push(`tedi-modal-dialog--${width}`);
    }

    if (position === "top") {
      classes.push("tedi-modal-dialog--center", "tedi-modal-dialog--top");
    } else {
      classes.push(`tedi-modal-dialog--${position}`);
    }

    if (scrollBehavior === "page") {
      classes.push("tedi-modal-dialog--scroll-page");
    }

    if (mobileFullscreen) {
      classes.push("tedi-modal-dialog--fullscreen-mobile");
    }

    return classes;
  }

  private setupDialogBehavior<R>(
    dialogRef: DialogRef<R>,
    scrollBehavior: ModalScrollBehavior,
    closeOnBackdropClick: boolean,
    closeOnEscape: boolean,
  ): void {
    if (scrollBehavior === "page") {
      const host = dialogRef.overlayRef.hostElement;
      host.style.overflow = "auto";
      host.style.paddingBlock = "var(--layout-grid-gutters-16)";
    }

    if (closeOnBackdropClick) {
      dialogRef.backdropClick.subscribe(() => dialogRef.close());
    }

    if (closeOnEscape) {
      dialogRef.keydownEvents.subscribe((event) => {
        if (event.key === "Escape") {
          dialogRef.close();
        }
      });
    }
  }

  private buildPositionStrategy(
    position: ModalPosition,
    scrollBehavior: ModalScrollBehavior,
  ): GlobalPositionStrategy {
    const global = this.overlay.position().global();

    if (position === "left") {
      return global.left("0").top("0");
    }

    if (position === "right") {
      return global.right("0").top("0");
    }

    if (position === "top") {
      return global.centerHorizontally().top("var(--modal-top-margin)");
    }

    if (scrollBehavior === "page") {
      return global.centerHorizontally().top("0");
    }

    return global.centerHorizontally().centerVertically();
  }
}
