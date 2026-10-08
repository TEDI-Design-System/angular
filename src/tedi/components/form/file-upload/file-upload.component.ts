import { DOCUMENT, NgTemplateOutlet } from "@angular/common";
import {
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  model,
  OnDestroy,
  OnInit,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from "@angular/core";
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from "@angular/forms";
import {
  ToastAnnouncerService,
  ToastPoliteness,
} from "../../../services/toast/toast-announcer.service";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { BreakpointService } from "../../../services/breakpoint/breakpoint.service";
import { generateUUID } from "../../../helpers/generate-uuid";
import { formatFileSize } from "../../../utils/file.util";
import { IconComponent } from "../../base/icon/icon.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { ClosingButtonComponent } from "../../buttons/closing-button/closing-button.component";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { TagComponent } from "../../tags/tag/tag.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import {
  FormFieldControl,
  TEDI_FORM_FIELD_CONTROL,
} from "../form-field/form-field-control";
import { TEDI_FIELD_CONTEXT } from "../form-field/field-context.token";
import { deriveControlState } from "../form-field/derive-control-state";
import { controlDescribedBy } from "../form-field/control-described-by";
import {
  FileUploadFile,
  FileUploadSize,
  FileUploadValidator,
} from "./file-upload.types";

type FileRejectionReason = "extension" | "size";

let fileUploadIdCounter = 0;

/**
 * Closing the file dialog leaves the screen reader busy, and a message inserted
 * during it is dropped rather than queued — even an assertive one. Kept private
 * so it stays out of the published API; the spec mirrors it.
 */
const ADD_ANNOUNCE_DELAY = 300;

/**
 * Identifies a file well enough to spot a repeat selection. Name alone is not
 * enough — `IMG_0001.jpg` collides across devices — so size and mtime join it.
 */
const fileIdentity = (file: FileUploadFile): string =>
  `${file.name}:${file.size}:${file.lastModified}`;

@Component({
  selector: "tedi-file-upload",
  standalone: true,
  imports: [
    NgTemplateOutlet,
    IconComponent,
    ButtonComponent,
    ClosingButtonComponent,
    SeparatorComponent,
    TagComponent,
    FeedbackTextComponent,
  ],
  templateUrl: "./file-upload.component.html",
  styleUrl: "./file-upload.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true,
    },
    {
      provide: TEDI_FORM_FIELD_CONTROL,
      useExisting: forwardRef(() => FileUploadComponent),
    },
  ],
  host: {
    class: "tedi-file-upload",
    "[class.tedi-file-upload--small]": "resolvedSize() === 'small'",
    "[class.tedi-file-upload--disabled]": "isDisabled()",
    "[class.tedi-file-upload--read-only]": "readOnly()",
    "[class.tedi-file-upload--empty]": "!files().length",
  },
})
export class FileUploadComponent
  implements
    OnInit,
    OnDestroy,
    ControlValueAccessor,
    Validator,
    FormFieldControl<FileUploadFile[]>
{
  private readonly translations = inject(TediTranslationService);
  private readonly announcer = inject(ToastAnnouncerService);
  private readonly breakpointService = inject(BreakpointService);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly fieldContext = inject(TEDI_FIELD_CONTEXT, {
    optional: true,
  });
  private readonly fileInput =
    viewChild<ElementRef<HTMLInputElement>>("fileInput");
  private readonly addButton = viewChild("addButton", { read: ElementRef });
  private addAnnounceTimeout?: ReturnType<typeof setTimeout>;

  /**
   * Files held by the field, and the value written by `formControl` /
   * `ngModel`. Bind it one-way to seed the list and leave the field owning it
   * from there, or two-way to stay in sync with it. Every change emits on the
   * `filesChange` output this `model()` generates.
   *
   * Bind a stable reference — a field or a signal. An inline literal
   * (`[files]="[{ name: 'a.pdf' }]"`) is a new array on every check, so it is
   * written back each time and discards whatever the user added.
   */
  readonly files = model<FileUploadFile[]>([]);
  /**
   * Id of the file input. Generated when not set. Bind the sibling
   * `<label tedi-label [for]>` to the same value: clicking the label opens the
   * file picker, and the label's text is prepended to the add button's
   * accessible name so a screen reader hears which field the button belongs to.
   */
  readonly inputId = input<string>();
  /**
   * `name` attribute of the file input. The files do not travel with a native
   * form submit: the input's value is cleared after each selection so the same
   * file can be picked again. Read them from `files` or the bound control.
   */
  readonly name = input<string>();
  /**
   * Allowed file types as a comma-separated list of extensions and MIME types
   * (`".pdf,.txt"`, `"image/png"`, `"image/*"`). Forwarded to the input's
   * `accept` attribute and re-checked on selection.
   *
   * Applies to what is picked next. Files already listed keep the verdict they
   * were given, so clear them yourself if you tighten this while they are
   * listed.
   */
  readonly accept = input<string>();
  /**
   * Largest accepted file size, in bytes — the unit `File.size` is in. The
   * restrictions hint renders it in whichever unit reads best, so a sub-megabyte
   * limit still shows as e.g. `500 KB`.
   *
   * Applies to what is picked next. Files already listed keep the verdict they
   * were given, so clear them yourself if you tighten this while they are
   * listed.
   */
  readonly maxSize = input<number>();
  /**
   * A rule of your own for each selected file, run after `accept` and
   * `maxSize` pass — a minimum size, a naming convention. Return the reason a
   * file is rejected, or nothing to accept it. The reason joins the rejection
   * summary under the field, followed by the names of the files it rejected.
   *
   * It is not summarised in the restrictions hint, so describe the rule in a
   * projected `tedi-feedback-text`. Applies to what is picked next, like
   * `accept`. For checks that need a server round trip, set `isLoading` and
   * then `isValid` on the file yourself instead.
   */
  readonly validator = input<FileUploadValidator>();
  /**
   * Whether more than one file can be held at a time. A single-file field
   * replaces its file on the next selection.
   * @default false
   */
  readonly multiple = input(false, { transform: booleanAttribute });
  /**
   * Keeps rejected files in the list, marked invalid, so the user can see which
   * of their files failed and remove it. Off, a rejected file is discarded.
   * Either way every rejection is summarised in one message under the field.
   * @default false
   */
  readonly keepRejectedFiles = input(false, { transform: booleanAttribute });
  /**
   * Whether the allowed types and maximum size are summarised in a hint below
   * the field. Turn it off when the same information is shown elsewhere — a
   * projected `tedi-feedback-text`, say — rejection errors still render.
   * @default true
   */
  readonly showRestrictions = input(true, { transform: booleanAttribute });
  /**
   * Whether a clear button removes every file at once while any is listed.
   * Falls back to the wrapping `tedi-form-field`'s `clearable` when not set
   * here — set it on the wrapper, and use this only for a standalone field.
   * @default true
   */
  readonly clearable = input<boolean | undefined, unknown>(undefined, {
    // Unset stays `undefined` so the wrapper's `clearable` still applies.
    transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)),
  });
  /**
   * Renders only the file list: no border, no add or clear button, no remove
   * button on the tags.
   * @default false
   */
  readonly readOnly = input(false, { transform: booleanAttribute });
  /**
   * Disables the field from a parent template. Combined with the
   * reactive-forms disabled state and any input-group state.
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Marks the field as invalid. The error state is also derived from the bound
   * control, from a wrapping `tedi-form-field`'s error feedback and from
   * rejected files, so this only forces it on.
   * @default false
   */
  readonly invalid = input(false, { transform: booleanAttribute });
  /**
   * Size of the field. Falls back to the size of a wrapping `tedi-form-field`
   * when not set here.
   */
  readonly size = input<FileUploadSize | undefined>();
  /**
   * Emits each file the user removed, one event per file when clearing.
   * `filesChange` carries the new list; this says which entry left it, so an
   * in-flight upload can be aborted without diffing the two.
   */
  readonly fileRemove = output<FileUploadFile>();

  readonly value = this.files;
  readonly ownsClearButton = true;

  private readonly derived = deriveControlState();
  private readonly formDisabled = signal(false);
  private readonly fieldDescribedBy = signal<string[]>([]);
  /**
   * Set when a label points at `inputId`, so the add button, and the file list
   * in read-only mode, can be named by it.
   */
  protected readonly labelId = signal<string | undefined>(undefined);
  /**
   * Summarises the rejections from the last selection. Describes files that
   * may have been discarded rather than listed, so it cannot be derived from
   * `files()` alone.
   */
  protected readonly rejectionError = signal<string | undefined>(undefined);
  private readonly fallbackId = `tedi-file-upload-${fileUploadIdCounter++}`;

  readonly touched = this.derived.touched;
  readonly dirty = this.derived.dirty;

  readonly isDisabled = computed(
    () =>
      this.disabled() ||
      this.formDisabled() ||
      (this.fieldContext?.disabled() ?? false),
  );

  readonly isInvalid = computed(
    () =>
      this.invalid() ||
      !!this.rejectionError() ||
      this.derived.invalid() ||
      (this.fieldContext?.invalid() ?? false),
  );

  readonly isValid = computed(
    () => !this.isInvalid() && (this.fieldContext?.valid() ?? false),
  );

  readonly resolvedSize = computed<FileUploadSize>(
    () =>
      this.size() ??
      (this.fieldContext?.size() === "small" ? "small" : "default"),
  );

  readonly paintsSurface = computed(
    () => !(this.fieldContext?.ownsSurface() ?? false),
  );

  protected readonly resolvedId = computed(
    () => this.inputId() ?? this.fallbackId,
  );

  protected readonly addLabelId = computed(() => `${this.resolvedId()}-add`);

  protected readonly addLabelledBy = computed(() => {
    const labelId = this.labelId();
    return labelId ? `${labelId} ${this.addLabelId()}` : null;
  });

  /**
   * Below `md` the field stacks: files above, buttons in a full-width row with
   * the clear button spelled out instead of an icon.
   */
  protected readonly isStacked = this.breakpointService.isBelowBreakpoint("md");

  /** Own `clearable` wins, then the wrapping `tedi-form-field`'s. */
  readonly clearableResolved = computed(
    () => this.clearable() ?? this.fieldContext?.clearable() ?? true,
  );

  protected readonly showClear = computed(
    () =>
      this.clearableResolved() && this.files().length > 0 && !this.isDisabled(),
  );

  protected readonly addLabel = this.translations.track("file-upload.add");
  protected readonly clearLabel = this.translations.track("clear");
  protected readonly failedLabel =
    this.translations.track("file-upload.failed");

  protected readonly isEditable = computed(
    () => !this.isDisabled() && !this.readOnly(),
  );

  private readonly acceptTokens = computed(
    () =>
      this.accept()
        ?.split(",")
        .map((token) => token.trim().toLowerCase())
        .filter(Boolean) ?? [],
  );

  /**
   * Rendered alongside — not instead of — a rejection error, so an error never
   * hides the restrictions the user has to satisfy.
   */
  protected readonly restrictionsHint = computed(() => {
    if (!this.showRestrictions() || this.readOnly()) return undefined;

    const accept = this.accept();
    const maxSize = this.maxSize();
    const parts = [
      accept &&
        `${this.translations.translate("file-upload.accept")} ${accept.replaceAll(",", ", ")}`,
      maxSize &&
        `${this.translations.translate("file-upload.max-size")} ${formatFileSize(maxSize)}`,
    ].filter(Boolean);

    return parts.join(". ") || undefined;
  });

  protected readonly feedbackIds = computed(() => {
    const id = this.resolvedId();
    return { error: `${id}-error`, hint: `${id}-hint` };
  });

  /**
   * The ids are pushed through `controlDescribedBy` rather than bound directly,
   * so a consumer's own `aria-describedby` on the host is merged in instead of
   * being stranded on a wrapper the button never references.
   */
  readonly describedBy = controlDescribedBy();

  private onChange: (files: FileUploadFile[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const ids = this.feedbackIds();
      this.describedBy.set(
        [
          ...this.fieldDescribedBy(),
          this.rejectionError() ? ids.error : null,
          this.restrictionsHint() ? ids.hint : null,
        ].filter((id): id is string => !!id),
      );
    });

    afterRenderEffect(() => {
      const id = this.resolvedId();
      const label = Array.from(this.document.querySelectorAll("label")).find(
        (candidate) => candidate.htmlFor === id,
      );
      if (label) label.id ||= `${id}-label`;
      this.labelId.set(label?.id);
    });
  }

  ngOnInit(): void {
    this.derived.connect();
  }

  ngOnDestroy(): void {
    clearTimeout(this.addAnnounceTimeout);
  }

  writeValue(files: FileUploadFile[] | null): void {
    const next = files ?? [];

    this.files.set(next);
    // `reset()` covers the clear button, but a form resetting the control comes
    // through here instead — without this the summary and the error border
    // outlive the files they describe.
    this.clearRejectionWhenResolved(next);
  }

  registerOnChange(fn: (files: FileUploadFile[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /**
   * Fails the control while any rejected file is still listed. Without it a
   * `Validators.required` control reports valid on a list of visibly broken
   * files, since `keepRejectedFiles` — or a consumer marking a preloaded file
   * `isValid: false` — keeps them in the value.
   */
  validate(control: AbstractControl): ValidationErrors | null {
    const rejected = ((control.value ?? []) as FileUploadFile[]).filter(
      (file) => file.isValid === false,
    );

    return rejected.length ? { rejectedFiles: rejected } : null;
  }

  setDescribedBy(ids: string[]): void {
    this.fieldDescribedBy.set(ids);
  }

  focus(): void {
    if (!this.isDisabled()) {
      this.addButton()?.nativeElement.focus();
    }
  }

  /**
   * Removes every file. Also what `tedi-form-field`'s and this field's own
   * clear button call.
   */
  reset(): void {
    const removed = this.files();
    if (!removed.length) return;

    this.rejectionError.set(undefined);
    this.removeFiles(
      removed,
      [],
      this.translations.translate("file-upload.cleared"),
    );
  }

  protected openPicker(): void {
    if (!this.isDisabled()) {
      this.fileInput()?.nativeElement.click();
    }
  }

  protected handleSelection(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addFiles(Array.from(input.files ?? []));
    input.value = "";
    this.onTouched();
  }

  /**
   * Opening the file dialog takes focus from the page and blurs the add button
   * while the user is still choosing. Counting that as leaving the field would
   * show a `required` error behind the open dialog, so the control is marked
   * touched when the dialog closes instead.
   */
  protected handleBlur(): void {
    if (this.document.hasFocus()) {
      this.onTouched();
    }
  }

  protected handleDialogCancel(): void {
    this.onTouched();
  }

  /** Drops the summary once no invalid file is left for it to describe. */
  private clearRejectionWhenResolved(files: FileUploadFile[]): void {
    if (!files.some((file) => file.isValid === false)) {
      this.rejectionError.set(undefined);
    }
  }

  protected removeFile(file: FileUploadFile): void {
    const remaining = this.files().filter((current) => current !== file);

    this.clearRejectionWhenResolved(remaining);

    this.removeFiles(
      [file],
      remaining,
      this.translations.translate("file-upload.removed", file.name ?? ""),
    );
  }

  /**
   * Focus goes to the add button because the remove button the user just
   * pressed leaves the DOM with its tag, and the add button is the one control
   * that is always there.
   */
  private removeFiles(
    removed: FileUploadFile[],
    remaining: FileUploadFile[],
    message: string,
  ): void {
    if (!this.isEditable()) return;

    this.commit(remaining);
    removed.forEach((file) => this.fileRemove.emit(file));
    this.onTouched();
    this.announce(message);
    afterNextRender(() => this.addButton()?.nativeElement.focus(), {
      injector: this.injector,
    });
  }

  private addFiles(selected: File[]): void {
    if (!selected.length) return;

    const listed = new Set(this.files().map(fileIdentity));
    const duplicates: File[] = [];
    const fresh: File[] = [];
    for (const file of selected) {
      (listed.has(fileIdentity(file)) ? duplicates : fresh).push(file);
    }

    const rejectedNames: Record<FileRejectionReason, string[]> = {
      extension: [],
      size: [],
    };
    const customRejections = new Map<string, string[]>();
    const candidates = fresh.map((file) => {
      const reason = this.rejectionReason(file);
      const message = reason
        ? undefined
        : this.validator()?.(file) || undefined;
      const name = `'${file.name}'`;

      if (reason) {
        rejectedNames[reason].push(name);
      } else if (message) {
        customRejections.set(message, [
          ...(customRejections.get(message) ?? []),
          name,
        ]);
      }

      return Object.assign(file, {
        id: generateUUID(),
        isLoading: false,
        isValid: !reason && !message,
      }) as FileUploadFile;
    });

    const kept = this.keepRejectedFiles()
      ? candidates
      : candidates.filter((file) => file.isValid);
    const multiple = this.multiple();

    if (kept.length) {
      this.commit(multiple ? [...this.files(), ...kept] : [kept[0]]);
    }

    const messages: string[] = [];

    const rejection =
      [
        ...Object.entries(rejectedNames)
          .filter(([, names]) => names.length)
          .map(([reason, names]) =>
            this.translations.translate(
              `file-upload.${reason}-rejected`,
              names.join(", "),
            ),
          ),
        ...Array.from(
          customRejections,
          ([message, names]) =>
            `${message.replace(/[\s.]+$/, "")}: ${names.join(", ")}`,
        ),
      ].join(". ") || undefined;
    this.rejectionError.set(rejection);
    if (rejection) messages.push(rejection);

    if (duplicates.length) {
      messages.push(
        this.translations.translate(
          "file-upload.duplicates-skipped",
          duplicates.map((file) => `'${file.name}'`).join(", "),
        ),
      );
    }

    const added = kept.filter((file) => file.isValid);

    if (added.length) {
      messages.push(
        this.translations.translate(
          "file-upload.added",
          String(multiple ? added.length : 1),
        ),
      );
    }

    // Assertive and delayed, because the file dialog buries this twice over:
    // closing it leaves the screen reader reading the add button for seconds,
    // so a polite message never gets spoken, and an assertive one inserted too
    // early is lost in the transition. Removal needs neither — no dialog is
    // involved there.
    clearTimeout(this.addAnnounceTimeout);
    this.addAnnounceTimeout = setTimeout(
      () => this.announce(messages.join(". "), "assertive"),
      ADD_ANNOUNCE_DELAY,
    );
  }

  private commit(files: FileUploadFile[]): void {
    this.files.set(files);
    this.onChange(files);
  }

  /**
   * Mirrors how the browser reads the `accept` attribute: an extension, an
   * exact MIME type, or a `type/*` group.
   */
  private isAcceptedType(file: File): boolean {
    const tokens = this.acceptTokens();
    if (!tokens.length) return true;

    const extension = file.name.includes(".")
      ? `.${file.name.split(".").pop()?.toLowerCase()}`
      : "";
    const mimeType = file.type.toLowerCase();

    return tokens.some((token) => {
      if (token.startsWith(".")) return token === extension;
      if (token.endsWith("/*")) return mimeType.startsWith(token.slice(0, -1));

      return token === mimeType;
    });
  }

  private rejectionReason(file: File): FileRejectionReason | undefined {
    const maxSize = this.maxSize();

    if (!this.isAcceptedType(file)) return "extension";
    if (maxSize && file.size > maxSize) return "size";

    return undefined;
  }

  /**
   * Announced from the root-level regions, not a node of this component's own.
   * Adding files rebuilds the tags beside such a node — wholesale when
   * `multiple` is off and the file is replaced — and a live region updated in
   * the same breath as the subtree around it is dropped by screen readers.
   *
   * Every announcement supersedes a pending "added": letting that one fire
   * afterwards would read the two in the wrong order.
   */
  private announce(text: string, politeness: ToastPoliteness = "polite"): void {
    clearTimeout(this.addAnnounceTimeout);
    this.announcer.announce(text, politeness);
  }
}
