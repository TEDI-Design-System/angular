import { InjectionToken } from "@angular/core";

export type ModalSize = "default" | "small";
export type ModalWidthPreset = "xs" | "sm" | "md" | "lg" | "xl";
export type ModalWidth = ModalWidthPreset | (string & {});
export type ModalPosition = "center" | "top" | "left" | "right";
export type ModalScrollBehavior = "content" | "page";

export interface ModalConfig<D = unknown> {
  /** Data to pass to the modal content component. Accessible via `inject(MODAL_DATA)`. */
  data?: D;
  /** Modal size variant. @default 'default' */
  size?: ModalSize;
  /** Modal width preset. @default 'sm' */
  width?: ModalWidth;
  /** Position of the modal. @default 'center' */
  position?: ModalPosition;
  /** Scroll behavior when content overflows. 'content' scrolls inside the modal, 'page' scrolls the overlay. @default 'content' */
  scrollBehavior?: ModalScrollBehavior;
  /** Whether clicking the backdrop closes the modal. @default true */
  closeOnBackdropClick?: boolean;
  /** Whether pressing Escape closes the modal. @default true */
  closeOnEscape?: boolean;
  /** Whether to show a close button in the header. @default true */
  showClose?: boolean;
  /** Whether the modal becomes fullscreen on mobile viewports. @default false */
  mobileFullscreen?: boolean;
  /** ARIA label for the dialog. */
  ariaLabel?: string;
  /** ID of the element that labels the dialog. */
  ariaLabelledBy?: string;
}

/** Injection token for data passed to a modal opened via ModalService. */
export const MODAL_DATA = new InjectionToken<unknown>("TediModalData");
