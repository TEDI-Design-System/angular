/**
 * A file held by the field. Real selections are `File` objects carrying the
 * extra fields; a preloaded entry only needs a `name`.
 */
export interface FileUploadFile extends Partial<File> {
  /**
   * Stable identifier for the consumer's own bookkeeping. Generated for files
   * the user selects.
   */
  id?: string;
  /**
   * Whether an upload is in flight for this file. Left to the consumer to set
   * and clear — the field only selects files, it does not upload them. A
   * loading file is shown with a spinner and cannot be removed.
   */
  isLoading?: boolean;
  /**
   * Whether the file passed the `accept`, `maxSize` and `validator` checks. A
   * file marked `false` is shown as a danger tag while two or more files are
   * listed; a single file shows only its name.
   */
  isValid?: boolean;
}

/**
 * A rule of the consumer's own, checked for each selected file. Returns the
 * reason the file is rejected, or nothing when it passes.
 */
export type FileUploadValidator = (file: File) => string | null | undefined;

export type FileUploadSize = "default" | "small";
