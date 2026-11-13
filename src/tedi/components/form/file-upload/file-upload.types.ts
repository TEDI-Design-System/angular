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
   * Whether the file is uploading. Its tag shows a spinner and has no remove
   * button; the clear button still removes it.
   */
  isLoading?: boolean;
  /**
   * Whether the file is valid. An invalid file shows as a danger tag, but one
   * the field rejects itself is listed only with `keepRejectedFiles`.
   */
  isValid?: boolean;
}

/**
 * A rule of the consumer's own, checked for each selected file. Returns the
 * reason the file is rejected, or nothing when it passes.
 */
export type FileUploadValidator = (file: File) => string | null | undefined;

export type FileUploadSize = "default" | "small";
