import {
  Injectable,
  Injector,
  inject,
  signal,
} from "@angular/core";
import { Overlay, OverlayRef, OverlayConfig } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { ToastContainerComponent, ToastItem } from "../../components/notifications/toast/toast-container.component";
import { ToastConfig, ToastRole, TOAST_DEFAULT_DURATION } from "../../components/notifications/toast/toast.component";
import { ToastAnnouncerService } from "./toast-announcer.service";

type ToastMethodOptions = Partial<Omit<ToastConfig, "title" | "content" | "type">>;

const ANIMATION_DURATION = 300;

let toastId = 0;

interface ToastTimerState {
  timeout: ReturnType<typeof setTimeout> | null;
  startTime: number;
  remainingTime: number;
}

@Injectable({ providedIn: "root" })
export class ToastService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly announcer = inject(ToastAnnouncerService);

  // Static shared state across all service instances
  private static readonly sharedToasts = signal<ToastItem[]>([]);
  private static readonly sharedTimerMap = new Map<string, ToastTimerState>();
  private static sharedOverlayRef: OverlayRef | null = null;

  // Instance accessors for static state
  private get toasts() {
    return ToastService.sharedToasts;
  }

  private get timerMap() {
    return ToastService.sharedTimerMap;
  }

  private get overlayRef() {
    return ToastService.sharedOverlayRef;
  }

  private set overlayRef(value: OverlayRef | null) {
    ToastService.sharedOverlayRef = value;
  }

  /**
   * Readonly signal of all current toasts.
   * @internal
   */
  readonly toasts$ = ToastService.sharedToasts.asReadonly();

  /**
   * Get all current toasts
   * @internal
   */
  getToasts(): ToastItem[] {
    return this.toasts();
  }

  /**
   * Show an info toast notification.
   * @param title The toast title
   * @param content Toast content
   * @param options Additional toast options
   */
  info(title: string, content?: string, options?: ToastMethodOptions): string {
    return this.show({ ...options, title, content, type: "info" });
  }

  /**
   * Show a success toast notification.
   * @param title The toast title
   * @param content Toast content
   * @param options Additional toast options
   */
  success(title: string, content?: string, options?: ToastMethodOptions): string {
    return this.show({ ...options, title, content, type: "success" });
  }

  /**
   * Show a warning toast notification.
   * @param title The toast title
   * @param content Toast content
   * @param options Additional toast options
   */
  warning(title: string, content?: string, options?: ToastMethodOptions): string {
    return this.show({ ...options, title, content, type: "warning" });
  }

  /**
   * Show a danger toast notification.
   * Defaults to role="alert" for immediate screen reader announcement.
   * @param title The toast title
   * @param content Toast content
   * @param options Additional toast options
   */
  danger(title: string, content?: string, options?: ToastMethodOptions): string {
    return this.show({ role: "alert", ...options, title, content, type: "danger" });
  }

  /**
   * Show a toast notification with full configuration.
   */
  show(options: ToastConfig): string {
    this.assertContainerExists();

    const id = options.id || this.generateId();
    const position = options.position || "bottom-right";
    const duration = options.duration ?? TOAST_DEFAULT_DURATION;
    const role = options.role ?? "status";
    const showProgressBar = options.showProgressBar ?? false;
    const pauseOnHover = options.pauseOnHover ?? true;

    const toast: ToastItem = {
      id,
      title: options.title,
      content: options.content,
      type: options.type ?? "info",
      icon: options.icon ?? "",
      role,
      duration,
      showProgressBar,
      pauseOnHover,
      position,
    };

    this.toasts.update((toasts) => [...toasts, toast]);

    this.announceToScreenReader(toast, role);

    if (duration > 0) {
      this.startTimer(id, duration);
    }

    return id;
  }

  /**
   * Close a specific toast by ID.
   */
  close(id: string): void {
    this.clearTimer(id);

    const toast = this.toasts().find((t) => t.id === id);
    if (!toast || toast.exiting) return;

    this.toasts.update((toasts) =>
      toasts.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );

    setTimeout(() => {
      this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
      this.cleanupIfEmpty();
    }, ANIMATION_DURATION);
  }

  /**
   * Pause a toast's auto-close timer.
   * @internal
   */
  pause(id: string): void {
    const toast = this.toasts().find((t) => t.id === id);
    if (!toast || !toast.pauseOnHover || toast.exiting) return;

    const timerState = this.timerMap.get(id);
    if (!timerState || !timerState.timeout) return;

    const elapsed = Date.now() - timerState.startTime;
    const remainingTime = Math.max(0, timerState.remainingTime - elapsed);

    clearTimeout(timerState.timeout);
    timerState.timeout = null;
    timerState.remainingTime = remainingTime;

    this.toasts.update((toasts) =>
      toasts.map((t) => (t.id === id ? { ...t, paused: true } : t))
    );
  }

  /**
   * Resume a toast's auto-close timer.
   * @internal
   */
  resume(id: string): void {
    const toast = this.toasts().find((t) => t.id === id);
    if (!toast || !toast.pauseOnHover || toast.exiting) return;

    const timerState = this.timerMap.get(id);
    if (!timerState || timerState.timeout) return;

    this.toasts.update((toasts) =>
      toasts.map((t) => (t.id === id ? { ...t, paused: false } : t))
    );

    if (timerState.remainingTime > 0) {
      timerState.startTime = Date.now();
      timerState.timeout = setTimeout(() => this.close(id), timerState.remainingTime);
    }
  }

  private startTimer(id: string, duration: number): void {
    const timeout = setTimeout(() => this.close(id), duration);
    this.timerMap.set(id, {
      timeout,
      startTime: Date.now(),
      remainingTime: duration,
    });
  }

  private clearTimer(id: string): void {
    const timerState = this.timerMap.get(id);
    if (timerState?.timeout) {
      clearTimeout(timerState.timeout);
    }
    this.timerMap.delete(id);
  }

  private assertContainerExists(): void {
    if (this.overlayRef) {
      // Check if the portal is attached and the overlay element is in the DOM
      const isAttached = this.overlayRef.hasAttached();
      const isInDom = this.overlayRef.overlayElement?.isConnected ?? false;

      if (isAttached && isInDom) {
        return;
      }

      // Portal detached or element removed from DOM, clean up stale overlay
      try {
        this.overlayRef.dispose();
      } catch {
        // Ignore disposal errors
      }
      this.overlayRef = null;
      this.toasts.set([]);
      this.timerMap.forEach((state) => {
        if (state.timeout) clearTimeout(state.timeout);
      });
      this.timerMap.clear();
    }

    const overlayConfig = new OverlayConfig({
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      positionStrategy: this.overlay.position().global(),
    });

    this.overlayRef = this.overlay.create(overlayConfig);

    const portal = new ComponentPortal(
      ToastContainerComponent,
      null,
      this.injector
    );

    this.overlayRef.attach(portal);
  }

  private cleanupIfEmpty(): void {
    if (!this.toasts().length && this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  private announceToScreenReader(toast: ToastItem, role: ToastRole): void {
    if (role === "none") return;

    const message = toast.content
      ? `${toast.title}: ${toast.content}`
      : toast.title;

    const politeness = role === "alert" ? "assertive" : "polite";
    this.announcer.announce(message, politeness);
  }

  private generateId(): string {
    return `toast-${++toastId}`;
  }
}
