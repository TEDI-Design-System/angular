import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { map, startWith, switchMap } from "rxjs";
import { QuillEditorComponent, QuillModules } from "ngx-quill";

export const TEXT_EDITOR_DEFAULT_MODULES: QuillModules = {
  toolbar: [
    [
      "bold",
      "italic",
      "underline",
      { align: "justify" },
      { list: "bullet" },
      { list: "ordered" },
      { background: [] },
      { color: [] },
      "clean",
    ],
  ],
};

/**
 * Requires imports of quill styles in the global styles file, e.g.:
 *
 * @example
 * ```scss
 * @forward 'quill/dist/quill.core.css';
 * @forward 'quill/dist/quill.snow.css';
 * ```
 */
@Component({
  selector: "tedi-text-editor",
  standalone: true,
  imports: [QuillEditorComponent, ReactiveFormsModule],
  templateUrl: "./text-editor.component.html",
  styleUrl: "./text-editor.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-text-editor",
  },
})
export class TextEditorComponent {
  /**
   * Reactive form control backing the editor. The value is Quill HTML.
   */
  control = input.required<FormControl>();
  /**
   * Id set on the editor element, for association with a label.
   */
  inputId = input.required<string>();
  /**
   * Placeholder shown while the editor is empty. Not translated — pass an
   * already-translated string.
   */
  placeholder = input<string>("");
  /**
   * Quill module configuration. Overriding this replaces the default toolbar
   * rather than extending it.
   *
   * @see https://github.com/KillerCodeMonkey/ngx-quill/blob/master/projects/ngx-quill/src/lib/quill-editor.component.ts
   */
  modules = input<QuillModules>(TEXT_EDITOR_DEFAULT_MODULES);

  readonly focused = signal(false);

  readonly required = toSignal(
    toObservable(this.control).pipe(
      switchMap((ctrl) =>
        ctrl.statusChanges.pipe(
          startWith(ctrl.status),
          map(() => ctrl.hasValidator(Validators.required)),
        ),
      ),
    ),
    { initialValue: false },
  );

  readonly feedbackErrorId = computed(() => `${this.inputId()}-feedback-error`);
  readonly feedbackHintId = computed(() => `${this.inputId()}-feedback-hint`);

  get hasErrors(): boolean {
    return Boolean(this.control().touched && this.control().errors);
  }
}
