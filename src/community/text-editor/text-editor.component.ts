import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  OnInit,
  Renderer2,
  signal,
  untracked,
  ViewEncapsulation,
} from "@angular/core";
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from "@angular/forms";
import {
  controlDescribedBy,
  deriveControlState,
  FormFieldControl,
  TEDI_FIELD_CONTEXT,
  TEDI_FORM_FIELD_CONTROL,
} from "@tedi-design-system/angular/tedi";
import { QuillEditorComponent, QuillModules } from "ngx-quill";
import type Quill from "quill";

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
 * Quill binds Tab to "insert a tab character" and, inside a list, to indent and
 * outdent. All three swallow the key and leave the user unable to tab out of the
 * editor, which is a keyboard trap (WCAG 2.1.2). Quill skips any binding whose
 * value is `null`, so nulling them lets Tab fall through to the browser's normal
 * focus move. List indenting stays available from the toolbar and via
 * `Ctrl+]` / `Ctrl+[`.
 */
const NO_KEYBOARD_TRAP_BINDINGS = {
  tab: null,
  indent: null,
  outdent: null,
};

/**
 * Length of the text a reader actually sees, with the markup stripped. Parsed
 * rather than regex-stripped so entities (`&nbsp;`) count as the one character
 * they render as; a `DOMParser` document is inert, so nothing in the markup
 * runs or loads.
 */
function visibleTextLength(html: string): number {
  if (!html) return 0;
  if (typeof DOMParser === "undefined") return html.length;

  const text =
    new DOMParser().parseFromString(html, "text/html").body.textContent ?? "";

  return text.length;
}

/**
 * Rich text editor built on ngx-quill. The value is Quill HTML.
 *
 * Requires Quill's stylesheets in the global styles file:
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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextEditorComponent),
      multi: true,
    },
    {
      provide: TEDI_FORM_FIELD_CONTROL,
      useExisting: forwardRef(() => TextEditorComponent),
    },
  ],
  templateUrl: "./text-editor.component.html",
  styleUrl: "./text-editor.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-text-editor",
    "[style.--_tedi-text-editor-min-rows]": "minRows()",
  },
})
export class TextEditorComponent
  implements OnInit, ControlValueAccessor, FormFieldControl<string>
{
  private readonly renderer = inject(Renderer2);
  private readonly fieldContext = inject(TEDI_FIELD_CONTEXT, {
    optional: true,
  });

  /**
   * Editor contents as Quill HTML. Supports two-way binding; with reactive or
   * template-driven forms bind the control instead.
   */
  value = model<string>("");
  /**
   * Id set on the editing area. Quill's editing area is a `contenteditable`
   * div, which `<label for>` cannot target, so pair this with `ariaLabelledby`
   * rather than relying on a label's `for`.
   */
  inputId = input.required<string>();
  /**
   * Id of the element labelling the editor, usually your own `<label>`.
   */
  ariaLabelledby = input<string>();
  /**
   * Accessible name, for when there is no visible label. Ignored when
   * `ariaLabelledby` is set.
   */
  ariaLabel = input<string>();
  /**
   * Forces the error state on. Combines with the state derived from the bound
   * control, so `false` does not switch a derived error off.
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly invalidInput = input<boolean>(false, { alias: "invalid" });
  /**
   * Marks the editor as required for assistive technology. Combines with the
   * bound control's `Validators.required`.
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly requiredInput = input<boolean>(false, { alias: "required" });
  /**
   * Placeholder shown while the editor is empty. Not translated.
   */
  placeholder = input<string>("");
  /**
   * Quill module configuration. Replaces the default toolbar rather than
   * extending it. Tab is always left to the browser so the editor can be tabbed
   * out of; pass an explicit `keyboard.bindings.tab` to override that.
   */
  modules = input<QuillModules>(TEXT_EDITOR_DEFAULT_MODULES);
  /**
   * Rows the editing area rests at, and the fewest it can ever show.
   *
   * @default 10
   */
  minRows = input<number>(10);

  readonly focused = signal(false);

  /**
   * `quill-editor` is itself a `ControlValueAccessor`, so the cleanest bridge to
   * it is a control of our own rather than reaching into the Quill instance.
   */
  protected readonly innerControl = new FormControl<string>("", {
    nonNullable: true,
  });

  private readonly editorRoot = signal<HTMLElement | null>(null);
  private readonly formDisabled = signal(false);
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  private readonly derived = deriveControlState();
  readonly describedBy = controlDescribedBy();

  readonly touched = this.derived.touched;
  readonly dirty = this.derived.dirty;

  readonly disabled = computed(
    () => this.formDisabled() || (this.fieldContext?.disabled() ?? false),
  );

  readonly invalid = computed(
    () =>
      this.invalidInput() ||
      this.derived.invalid() ||
      (this.fieldContext?.invalid() ?? false),
  );

  readonly required = computed(
    () => this.requiredInput() || this.derived.required(),
  );

  /**
   * `tedi-form-field`'s counter measures the control's value, which here is
   * Quill markup — a short sentence would blow a generous limit on tags alone.
   * Report what the user can see instead.
   */
  readonly characterCount = computed(() => visibleTextLength(this.value()));

  /**
   * Quill's own Tab handling is disabled by default, but a caller-supplied
   * binding of the same name still wins.
   */
  readonly resolvedModules = computed<QuillModules>(() => {
    // An explicit `[modules]="undefined"` binding overrides the input default,
    // so fall back here rather than trusting it.
    const modules = this.modules() ?? TEXT_EDITOR_DEFAULT_MODULES;
    const keyboard =
      typeof modules.keyboard === "object" && modules.keyboard !== null
        ? modules.keyboard
        : undefined;

    return {
      ...modules,
      keyboard: {
        ...keyboard,
        bindings: { ...NO_KEYBOARD_TRAP_BINDINGS, ...keyboard?.bindings },
      },
    };
  });

  constructor() {
    this.innerControl.valueChanges.subscribe((html) => {
      const next = html ?? "";
      if (untracked(this.value) === next) return;

      this.value.set(next);
      this.onChange(next);
    });

    effect(() => {
      const next = this.value();
      if (this.innerControl.value !== next) {
        this.innerControl.setValue(next, { emitEvent: false });
      }
    });

    effect(() => {
      const disabled = this.disabled();
      if (disabled === this.innerControl.disabled) return;

      if (disabled) this.innerControl.disable({ emitEvent: false });
      else this.innerControl.enable({ emitEvent: false });
    });

    this.syncEditorAttributes();
  }

  ngOnInit() {
    this.derived.connect();
  }

  handleEditorCreated = (quill: Quill): void => {
    this.editorRoot.set(quill.root);
  };

  handleBlur() {
    this.focused.set(false);
    this.onTouched();
  }

  setDescribedBy(ids: string[]) {
    this.describedBy.set(ids);
  }

  reset() {
    if (this.disabled()) return;

    this.value.set("");
    this.onChange("");
    this.onTouched();
  }

  focus() {
    if (this.disabled()) return;
    this.editorRoot()?.focus();
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? "");
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /**
   * Mirrors identity, name and state onto `.ql-editor`. Quill gives it no role
   * of its own, so without this it is exposed as a nameless `generic` node and
   * none of these attributes reach assistive technology.
   */
  private syncEditorAttributes() {
    effect(() => {
      const editor = this.editorRoot();
      if (!editor) return;

      const labelledby = this.ariaLabelledby();
      const invalid = this.invalid();

      const attributes: Record<string, string | null> = {
        id: this.inputId(),
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": labelledby ?? null,
        "aria-label": labelledby ? null : (this.ariaLabel() ?? null),
        "aria-describedby": this.describedBy.attribute(),
        "aria-required": this.required() ? "true" : null,
        "aria-invalid": invalid ? "true" : null,
      };

      for (const [name, attributeValue] of Object.entries(attributes)) {
        if (attributeValue === null) {
          this.renderer.removeAttribute(editor, name);
        } else {
          this.renderer.setAttribute(editor, name, attributeValue);
        }
      }
    });
  }
}
