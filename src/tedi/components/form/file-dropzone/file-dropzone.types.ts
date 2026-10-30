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
   * File name shown in the list and used in the remove button's label and the
   * announcements, so the user can tell the files apart.
   */
  name: string;
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

/**
 * What the dropzone does when a file it already lists is picked again.
 *
 * - `skip` — leave the list as it is and tell the user the file is already
 *   there. A repeat is matched on name, size and modification time, so two
 *   genuinely different files that share a name are both kept.
 * - `rename` — keep both, the newcomer renamed `scan (1).pdf`.
 * - `replace` — swap the listed file for the newcomer.
 *
 * `rename` and `replace` match on the file name alone, since the collision
 * they resolve is the one the user sees in the list.
 */
export type FileDropzoneDuplicates = "skip" | "rename" | "replace";
