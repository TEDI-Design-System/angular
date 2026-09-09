import { Directive } from "@angular/core";

/**
 * Marks content projected into `tedi-form-field` as an extra addition, rendered
 * below the feedback row.
 */
@Directive({
  selector: "[tediFormFieldExtra]",
  standalone: true,
})
export class FormFieldExtraDirective {}
