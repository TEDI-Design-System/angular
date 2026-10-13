/**
 * Validates a selected file. Returns the reason it is rejected, or nothing to
 * accept it.
 */
export type FileDropzoneValidator = (file: File) => string | null | undefined;

/**
 * A file held by the dropzone. Real selections are `File` objects carrying the
 * extra fields; a preloaded entry only needs a `name`.
 */
export interface FileDropzoneFile extends Partial<File> {
  /**
   * Stable identifier, used to track the file across re-renders. Generated for
   * files the user selects.
   */
  id?: string;
  /**
   * Whether an upload is in flight for this file. Left to the consumer to set
   * and clear — the dropzone only selects files, it does not upload them.
   */
  isLoading?: boolean;
  /**
   * Whether the file passed the `accept`, `maxSize` and `validator` checks. To
   * change it, set a new array on `files` or the bound control — the dropzone
   * does not see an in-place edit.
   */
  isValid?: boolean;
  /**
   * Validation message rendered under this file. Set for files the dropzone
   * rejects itself; set it yourself on preloaded files, or to surface an error
   * the upload returned.
   *
   * Worth setting whenever you set `isValid: false`: without it the error icon
   * falls back to a generic "invalid file" label, so the failure is announced
   * but its reason is not.
   */
  error?: string;
}
