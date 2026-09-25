import { Directive, inject, TemplateRef } from "@angular/core";
import { FileDropzoneFile } from "./file-dropzone.types";

export interface FileDropzoneFileContext {
  /** The file this row renders, bound by `let-file` without naming a key. */
  $implicit: FileDropzoneFile;
  /** Removes this file from the dropzone. */
  remove: () => void;
  /** Translated accessible name for the remove control, including the file name. */
  removeLabel: string;
}

/**
 * Replaces the built-in `tedi-attachment` row for every selected file. Use it
 * to add a progress bar, extra actions or per-file feedback.
 *
 * @example
 * ```html
 * <tedi-file-dropzone multiple [(files)]="files">
 *   <ng-template tediFileDropzoneFile let-file let-remove="remove" let-removeLabel="removeLabel">
 *     <tedi-attachment [name]="file.name" icon="description">
 *       @if (file.isLoading) {
 *         <tedi-progress-bar [value]="progressFor(file)" />
 *       }
 *       <tedi-attachment-actions>
 *         <button tedi-button variant="neutral" [attr.aria-label]="removeLabel" (click)="remove()">
 *           <tedi-icon name="delete" [size]="18" color="inherit" />
 *         </button>
 *       </tedi-attachment-actions>
 *     </tedi-attachment>
 *   </ng-template>
 * </tedi-file-dropzone>
 * ```
 */
@Directive({
  selector: "[tediFileDropzoneFile]",
  standalone: true,
})
export class FileDropzoneFileDirective {
  readonly template = inject<TemplateRef<FileDropzoneFileContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _directive: FileDropzoneFileDirective,
    _context: unknown,
  ): _context is FileDropzoneFileContext {
    return true;
  }
}
