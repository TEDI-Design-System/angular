import { InjectionToken, Signal } from "@angular/core";
import { BreakpointFlag } from "../../../services/breakpoint/breakpoint.service";

export type ModalSize = "default" | "small";
export type ModalWidthPreset = "xs" | "sm" | "md" | "lg" | "xl";
export type ModalWidth = ModalWidthPreset | (string & {});
export type ModalPosition = "center" | "top" | "bottom" | "left" | "right";
export type ModalScrollBehavior = "content" | "page";
export type ModalFullscreen = BreakpointFlag;

export interface ModalConfig<D = unknown> {
  /** Data to pass to the modal content component. Accessible via `inject(MODAL_DATA)`. */
  data?: D;
  /** Modal size variant. @default 'default' */
  size?: ModalSize;
  /** Modal width — preset ('xs'–'xl') or custom CSS value (e.g. '800px'). @default 'sm' */
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
  /** Fullscreen mode. `true` = always fullscreen, a breakpoint (`'sm'`, `'md'`, `'lg'`, `'xl'`, `'xxl'`) = fullscreen below that breakpoint. @default false */
  fullscreen?: ModalFullscreen;
  /** Max-width cap (e.g. '75%', '60vw'). Overrides the default 95vw limit. */
  maxWidth?: string;
  /** ARIA label for the dialog. */
  ariaLabel?: string;
  /** ID of the element that labels the dialog. */
  ariaLabelledBy?: string;
}

/** Injection token for data passed to a modal opened via ModalService. */
export const MODAL_DATA = new InjectionToken<unknown>("TediModalData");

/**
 * Injection token exposing the current modal's `size` variant as a signal.
 * Provided by both the template-based `<tedi-modal>` and `ModalService` so
 * child components (notably `<tedi-modal-header>`) can derive size-aware
 * defaults without duplicating the variant in their own inputs.
 */
export const MODAL_SIZE = new InjectionToken<Signal<ModalSize>>(
  "TediModalSize",
);
