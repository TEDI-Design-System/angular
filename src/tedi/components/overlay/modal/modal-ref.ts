import { ErrorHandler } from "@angular/core";
import { Observable, firstValueFrom, isObservable } from "rxjs";
import { DialogRef } from "@angular/cdk/dialog";

export type ModalCloseReason =
  "backdrop" | "escape" | "close-button" | "programmatic";

/**
 * Return `false` to keep the modal open. For an Observable, its first value
 * counts. A rejection or error counts as `false` and goes to `ErrorHandler`.
 */
export type ModalCloseGuard<R = unknown> = (
  result: R | undefined,
  reason: ModalCloseReason,
) => boolean | Promise<boolean> | Observable<boolean>;

/**
 * Reference to a modal opened via `ModalService`.
 * Provides methods to close the modal and observe its lifecycle.
 * The opener and the content share the same instance.
 */
export class ModalRef<R = unknown> {
  /** Checked before every close, except `ModalService.closeAll()` and navigation. */
  canClose: ModalCloseGuard<R> | null = null;

  private pendingGuard = false;

  constructor(
    private readonly dialogRef: DialogRef<R>,
    private readonly errorHandler = new ErrorHandler(),
  ) {}

  /** Close the modal, optionally returning a result. Subject to `canClose`. */
  close(result?: R): void {
    this.requestClose("programmatic", result);
  }

  /** @internal */
  requestClose(reason: ModalCloseReason, result?: R): void {
    if (this.pendingGuard) return;

    let verdict: ReturnType<ModalCloseGuard<R>>;

    try {
      verdict = this.canClose ? this.canClose(result, reason) : true;
    } catch (error) {
      this.errorHandler.handleError(error);
      return;
    }

    if (typeof verdict === "boolean") {
      if (verdict) this.dialogRef.close(result);
      return;
    }

    this.pendingGuard = true;

    const decision = isObservable(verdict)
      ? firstValueFrom(verdict, { defaultValue: false })
      : verdict;

    decision
      .then((allowed) => {
        if (allowed) this.dialogRef.close(result);
      })
      .catch((error: unknown) => this.errorHandler.handleError(error))
      .finally(() => (this.pendingGuard = false));
  }

  /** Observable that emits when the modal is closed, with the optional result value. */
  get closed(): Observable<R | undefined> {
    return this.dialogRef.closed;
  }

  /** Observable that emits when the backdrop is clicked. */
  get backdropClick(): Observable<MouseEvent> {
    return this.dialogRef.backdropClick;
  }

  /** Observable that emits on keyboard events within the modal. */
  get keydownEvents(): Observable<KeyboardEvent> {
    return this.dialogRef.keydownEvents;
  }

  /** Update the modal's width and height. */
  updateSize(width?: string, height?: string): this {
    this.dialogRef.updateSize(width, height);
    return this;
  }
}
