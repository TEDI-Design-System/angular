import {
  ErrorHandler,
  Injectable,
  Injector,
  afterNextRender,
  inject,
  signal,
} from "@angular/core";
import { Dialog, DialogRef } from "@angular/cdk/dialog";
import { _IdGenerator } from "@angular/cdk/a11y";
import { GlobalPositionStrategy, Overlay } from "@angular/cdk/overlay";
import { ComponentType } from "@angular/cdk/portal";
import { ModalRef } from "./modal-ref";
import { resolveModalHeadingId } from "./modal-label";
import {
  ModalConfig,
  ModalFullscreen,
  ModalPosition,
  ModalScrollBehavior,
  MODAL_DATA,
  MODAL_SIZE,
} from "./modal.types";

const WIDTH_PRESETS: readonly string[] = ["xs", "sm", "md", "lg", "xl"];

@Injectable({ providedIn: "root" })
export class ModalService {
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly idGenerator = inject(_IdGenerator);
  private readonly errorHandler = inject(ErrorHandler);

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
      fullscreen = false,
      maxWidth,
      ariaLabel,
      ariaLabelledBy,
    } = config;

    const panelClasses = this.buildPanelClasses(
      size,
      width,
      position,
      scrollBehavior,
      fullscreen,
    );
    const isPresetWidth = WIDTH_PRESETS.includes(width);

    let modalRef!: ModalRef<R>;

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
        {
          provide: ModalRef,
          useValue: (modalRef = new ModalRef<R>(ref, this.errorHandler)),
        },
        { provide: MODAL_DATA, useValue: data },
        { provide: MODAL_SIZE, useValue: signal(size) },
      ],
    });

    if (!isPresetWidth) {
      dialogRef.overlayRef.overlayElement.style.width = width;
    }

    if (maxWidth) {
      dialogRef.overlayRef.overlayElement.style.setProperty(
        "--_tedi-modal-max-width",
        maxWidth,
      );
    }

    this.setupDialogBehavior(
      dialogRef,
      modalRef,
      scrollBehavior,
      closeOnBackdropClick,
      closeOnEscape,
    );

    if (!ariaLabel && !ariaLabelledBy) {
      this.labelFromHeading(dialogRef);
    }

    return modalRef;
  }

  /** Close all open modals, ignoring `canClose`. */
  closeAll(): void {
    this.dialog.closeAll();
  }

  /**
   * Names the dialog from the heading in its `<tedi-modal-header>` when the
   * caller passed no label of their own. Deferred, because `Dialog.open`
   * returns before the content renders and the heading does not exist yet.
   *
   * Written onto the container rather than passed as
   * `DialogConfig.ariaLabelledBy`, which would commit to an id before knowing
   * whether a heading exists and leave a dangling reference when none does.
   */
  private labelFromHeading<R>(dialogRef: DialogRef<R>): void {
    afterNextRender(
      () => {
        // The container, not the pane, is what carries role="dialog".
        // The pane is null if the modal closed before rendering.
        const container =
          dialogRef.overlayRef.overlayElement?.querySelector<HTMLElement>(
            "cdk-dialog-container",
          );

        if (!container) return;

        const headingId = resolveModalHeadingId(container, this.idGenerator);

        if (headingId) {
          container.setAttribute("aria-labelledby", headingId);
        }
      },
      { injector: this.injector },
    );
  }

  private buildPanelClasses(
    size: string,
    width: string,
    position: ModalPosition,
    scrollBehavior: ModalScrollBehavior,
    fullscreen: ModalFullscreen,
  ): string[] {
    const classes = ["tedi-modal-dialog", `tedi-modal-dialog--${size}`];

    if (WIDTH_PRESETS.includes(width)) {
      classes.push(`tedi-modal-dialog--${width}`);
    }

    if (position === "top" || position === "bottom") {
      classes.push(
        "tedi-modal-dialog--center",
        `tedi-modal-dialog--${position}`,
      );
    } else {
      classes.push(`tedi-modal-dialog--${position}`);
    }

    if (scrollBehavior === "page") {
      classes.push("tedi-modal-dialog--scroll-page");
    }

    if (fullscreen === true) {
      classes.push("tedi-modal-dialog--fullscreen");
    } else if (typeof fullscreen === "string") {
      classes.push(`tedi-modal-dialog--fullscreen-${fullscreen}`);
    }

    return classes;
  }

  private setupDialogBehavior<R>(
    dialogRef: DialogRef<R>,
    modalRef: ModalRef<R>,
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
      dialogRef.backdropClick.subscribe(() =>
        modalRef.requestClose("backdrop"),
      );
    }

    if (closeOnEscape) {
      dialogRef.keydownEvents.subscribe((event) => {
        if (event.key === "Escape") {
          modalRef.requestClose("escape");
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

    if (position === "bottom") {
      return global.centerHorizontally().bottom("var(--modal-top-margin)");
    }

    if (scrollBehavior === "page") {
      return global.centerHorizontally().top("0");
    }

    return global.centerHorizontally().centerVertically();
  }
}
