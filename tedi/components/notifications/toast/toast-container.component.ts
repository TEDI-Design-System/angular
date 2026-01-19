import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  computed,
} from "@angular/core";
import { ToastComponent, ToastPosition, ToastRole } from "./toast.component";
import { ToastService } from "../../../services/toast/toast.service";

export interface ToastItem {
  id: string;
  title: string;
  content?: string;
  type?: "info" | "success" | "warning" | "danger";
  icon?: string;
  role?: ToastRole;
  duration?: number;
  showProgressBar?: boolean;
  pauseOnHover?: boolean;
  paused?: boolean;
  exiting?: boolean;
  position: ToastPosition;
}

const POSITIONS: ToastPosition[] = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];

/**
 * Internal toast container component that renders toast notifications.
 * This component is automatically created by ToastService using CDK Overlay.
 *
 * @internal
 */
@Component({
  selector: "tedi-toast-container",
  standalone: true,
  imports: [ToastComponent],
  template: `
    @for (position of positions; track position) {
      @if (toastsByPosition()[position].length > 0) {
        <div class="tedi-toast-container__position tedi-toast-container__position--{{ position }}">
          @for (toast of toastsByPosition()[position]; track toast.id) {
            <tedi-toast
              [title]="toast.title"
              [type]="toast.type ?? 'info'"
              [icon]="toast.icon ?? ''"
              [role]="toast.role ?? 'status'"
              [duration]="toast.duration ?? 0"
              [showProgressBar]="toast.showProgressBar ?? false"
              [paused]="toast.paused ?? false"
              [class.tedi-toast--exiting]="toast.exiting"
              (closed)="onClosed(toast.id)"
              (mouseEnter)="onMouseEnter(toast.id)"
              (mouseLeave)="onMouseLeave(toast.id)"
            >
              @if (toast.content) {
                {{ toast.content }}
              }
            </tedi-toast>
          }
        </div>
      }
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-toast-container",
  },
})
export class ToastContainerComponent {
  private readonly toastService = inject(ToastService);

  readonly positions = POSITIONS;

  readonly toastsByPosition = computed(() => {
    const toasts = this.toastService.toasts$();
    const grouped: Record<ToastPosition, ToastItem[]> = {
      "top-left": [],
      "top-right": [],
      "bottom-left": [],
      "bottom-right": [],
    };

    for (const toast of toasts) {
      grouped[toast.position].push(toast);
    }

    return grouped;
  });

  hasToastsForPosition(position: ToastPosition): boolean {
    return this.toastService.getToasts().some((t) => t.position === position);
  }

  getToastsForPosition(position: ToastPosition): ToastItem[] {
    return this.toastService.getToasts().filter((t) => t.position === position);
  }

  onClosed(id: string): void {
    this.toastService.close(id);
  }

  onMouseEnter(id: string): void {
    this.toastService.pause(id);
  }

  onMouseLeave(id: string): void {
    this.toastService.resume(id);
  }
}
