import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
} from "@angular/core";
import { AlertComponent, AlertType, AlertRole } from "../alert/alert.component";

export const TOAST_DEFAULT_DURATION = 6000;

export type ToastType = AlertType;
export type ToastRole = AlertRole;
export type ToastPosition =
  "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface ToastConfig {
  /**
   * Title of the toast notification.
   */
  title: string;
  /**
   * Toast text content.
   */
  content?: string;
  /**
   * Type of the toast notification determining its color scheme.
   * @default info
   */
  type?: ToastType;
  /**
   * Specifies an optional icon to display in the toast notification, providing quick visual context.
   */
  icon?: string;
  /**
   * Toast duration in milliseconds. Set to 0 for persistent toast.
   */
  duration?: number;
  /**
   * Whether to show the progress bar for timed toasts.
   * @default false
   */
  showProgressBar?: boolean;
  /**
   * Whether to pause the auto-close timer when hovering over the toast.
   * @default true
   */
  pauseOnHover?: boolean;
  /**
   * The ARIA role of the toast, informing screen readers about the notification's priority.
   * - 'status': For non-critical notifications.
   * - 'alert': For critical errors.
   * - 'none': Used when no ARIA role is needed.
   * @default status
   */
  role?: ToastRole;
  /**
   * The position of toast container.
   * Possible values:
   * - 'top-left'
   * - 'top-right'
   * - 'bottom-left'
   * - 'bottom-right'
   * @default bottom-right
   */
  position?: ToastPosition;
  /**
   * Unique identifier of given toast. Id is automatically generated if not provided by client
   */
  id?: string;
}

@Component({
  selector: "tedi-toast",
  standalone: true,
  imports: [AlertComponent],
  templateUrl: "./toast.component.html",
  styleUrl: "./toast.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  /**
   * Title of the toast notification.
   */
  readonly title = input<string>();

  /**
   * Type of the toast notification determining its color scheme.
   * @default info
   */
  readonly type = input<ToastType>("info");

  /**
   * Icon name. Only shown when provided.
   */
  readonly icon = input<string>("");

  /**
   * The ARIA role of the toast, informing screen readers about the notification's priority.
   * - 'status': For non-critical notifications (screen readers announce politely).
   * - 'alert': For critical errors (screen readers announce immediately).
   * - 'none': Used when no ARIA role is needed.
   * @default status
   */
  readonly role = input<ToastRole>("status");

  /**
   * Duration in milliseconds for auto-close.
   * @default 6000
   */
  readonly duration = input<number>(TOAST_DEFAULT_DURATION);

  /**
   * Whether to show the progress bar.
   * @default false
   */
  readonly showProgressBar = input<boolean>(false);

  /**
   * Whether the toast timer is currently paused.
   * @default false
   */
  readonly paused = input<boolean>(false);

  /**
   * Emits when the toast is closed by the user.
   */
  readonly closed = output<void>();

  readonly mouseEnter = output<void>();
  readonly mouseLeave = output<void>();

  handleClose(): void {
    this.closed.emit();
  }

  onMouseEnter(): void {
    this.mouseEnter.emit();
  }

  onMouseLeave(): void {
    this.mouseLeave.emit();
  }
}
