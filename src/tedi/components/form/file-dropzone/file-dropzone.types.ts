import { ComponentInputs } from "../../../types/inputs.type";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";

/**
 * `tedi-feedback-text` inputs, with everything but the message optional.
 */
export type FileDropzoneFeedback = Partial<
  ComponentInputs<FeedbackTextComponent>
> & { text: string };

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
   * Whether the file passed the `accept` and `maxSize` checks.
   */
  isValid?: boolean;
  /**
   * Validation message rendered under this file. Set for files the dropzone
   * rejects itself; set it yourself on preloaded files, or to surface an error
   * the upload returned.
   */
  error?: string;
}
