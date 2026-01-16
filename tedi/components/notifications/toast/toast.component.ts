import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
} from "@angular/core";
import { AlertComponent, AlertType, AlertRole } from "../alert/alert.component";

export type ToastType = AlertType;
export type ToastRole = AlertRole;
export type ToastPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface ToastConfig {
  title: string;
  content?: string;
  type?: ToastType;
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
  readonly icon = input<string>();

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
   * @default 0
   */
  readonly duration = input<number>(0);

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
