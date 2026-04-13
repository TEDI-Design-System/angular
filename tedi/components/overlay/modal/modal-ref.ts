import { Observable } from "rxjs";
import { DialogRef } from "@angular/cdk/dialog";

/**
 * Reference to a modal opened via `ModalService`.
 * Provides methods to close the modal and observe its lifecycle.
 */
export class ModalRef<R = unknown> {
  constructor(private readonly dialogRef: DialogRef<R>) {}

  /** Close the modal, optionally returning a result. */
  close(result?: R): void {
    this.dialogRef.close(result);
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
