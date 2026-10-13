import { DOCUMENT, NgTemplateOutlet } from "@angular/common";
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
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
import { generateUUID } from "../../../helpers/generate-uuid";
import { formatFileSize } from "../../../utils/file.util";
import { IconComponent } from "../../base/icon/icon.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { AttachmentComponent } from "../../helpers/attachment/attachment.component";
import { AttachmentActionsComponent } from "../../helpers/attachment/attachment-actions.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { deriveControlState } from "../form-field/derive-control-state";
import { controlDescribedBy } from "../form-field/control-described-by";
import {
  FileDropzoneFileContext,
  FileDropzoneFileDirective,
} from "./file-dropzone-file.directive";
import { FileDropzoneFile, FileDropzoneValidator } from "./file-dropzone.types";

type FileRejectionReason = "extension" | "size";

interface FileRejection {
  name: string;
  reasons: FileRejectionReason[];
  message?: string;
}

let fileDropzoneIdCounter = 0;

/**
 * Closing the file dialog leaves the screen reader busy, and a message inserted
 * during it is dropped rather than queued — even an assertive one. Kept private
 * so it stays out of the published API; the spec mirrors it.
 */
const ADD_ANNOUNCE_DELAY = 300;

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Identifies a file well enough to spot a repeat selection. Name alone is not
 * enough — `IMG_0001.jpg` collides across devices — so size and mtime join it.
 */
const fileIdentity = (file: FileDropzoneFile): string =>
  `${file.name}:${file.size}:${file.lastModified}`;

@Component({
  selector: "tedi-file-dropzone",
  standalone: true,
  imports: [
    NgTemplateOutlet,
    IconComponent,
    ButtonComponent,
    AttachmentComponent,
    AttachmentActionsComponent,
    FeedbackTextComponent,
  ],
  templateUrl: "./file-dropzone.component.html",
  styleUrl: "./file-dropzone.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileDropzoneComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FileDropzoneComponent),
      multi: true,
    },
  ],
  host: {
    class: "tedi-file-dropzone",
    "[class.tedi-file-dropzone--disabled]": "isDisabled()",
  },
})
export class FileDropzoneComponent
  implements OnInit, ControlValueAccessor, Validator, OnDestroy
{
  private readonly document = inject(DOCUMENT);
  private readonly translations = inject(TediTranslationService);
  private readonly announcer = inject(ToastAnnouncerService);
  private addAnnounceTimeout?: ReturnType<typeof setTimeout>;
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly fileInput =
    viewChild<ElementRef<HTMLInputElement>>("fileInput");
  private readonly dropZone = viewChild<ElementRef<HTMLElement>>("zone");

  /**
   * Files held by the dropzone, and the value written by `formControl` /
   * `ngModel`. Bind it one-way to seed the list and leave the dropzone owning
   * it from there, or two-way to stay in sync with it. Every change emits on
   * the `filesChange` output this `model()` generates.
   *
   * Bind a stable reference — a field or a signal. An inline literal
   * (`[files]="[{ name: 'a.pdf' }]"`) is a new array on every check, so it is
   * written back each time and discards whatever the user added.
   */
  readonly files = model<FileDropzoneFile[]>([]);
  /**
   * Id of the file input. Generated when not set.
   */
  readonly inputId = input<string>();
  /**
   * `name` attribute of the file input. The files do not travel with a native
   * form submit: dropped files never reach the input, and its value is cleared
   * after each selection so the same file can be picked again. Read them from
   * `files` or the bound control.
   */
  readonly name = input<string>();
  /**
   * Text inside the dropzone, which also names the file input. Falls back to
   * the translated `file-dropzone.label`.
   */
  readonly label = input<string>();
  /**
   * Allowed file types as a comma-separated list of extensions and MIME types
   * (`".pdf,.txt"`, `"image/png"`, `"image/*"`). Forwarded to the input's
   * `accept` attribute and re-checked on drop, which bypasses it.
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
   * A rule of your own for each selected file, checked alongside `accept` and
   * `maxSize` — a minimum size, a naming convention. Return the reason a file
   * is rejected, or nothing to accept it. The reason lands on that file's
   * `error` after the built-in ones, and joins the rejection summary followed
   * by the names of the files it rejected. It runs on every selected file,
   * including ones `accept` or `maxSize` rejected, so it may receive a file of
   * the wrong type or size.
   *
   * The automatic hint cannot describe it, so describe the rule in `hint`.
   * Applies to what is picked next, like `accept`. For checks that need a
   * server round trip, set `isLoading` and then `isValid` on the file yourself
   * instead.
   */
  readonly validator = input<FileDropzoneValidator>();
  /**
   * Whether more than one file can be held at a time. A single-file dropzone
   * replaces its file on the next selection.
   * @default false
   */
  readonly multiple = input(false, { transform: booleanAttribute });
  /**
   * Keeps rejected files in the list, each carrying its own reason, so the user
   * can see which of their files failed and remove it. Left off, a rejected
   * file is discarded and every rejection is summarised in one message under
   * the dropzone instead.
   * @default false
   */
  readonly keepRejectedFiles = input(false, { transform: booleanAttribute });
  /**
   * Whether the allowed types and maximum size are summarised in the hint below
   * the dropzone. Turn it off when the same information is shown elsewhere;
   * `hint` and rejection errors still render.
   * @default true
   */
  readonly showRestrictions = input(true, { transform: booleanAttribute });
  /**
   * Whether each file's size is shown next to its name.
   * @default false
   */
  readonly showFileSize = input(false, { transform: booleanAttribute });
  /**
   * Guidance of your own, such as what a `validator` checks, shown after the
   * allowed types and maximum size in the dropzone's hint.
   */
  readonly hint = input<string>();
  /**
   * An error of your own, such as one the server returned. Shown in the
   * dropzone's error text after its own rejection message, above the hint, and
   * paints the border red. It does not change a bound control's validity. For
   * an error that belongs to one file, set that file's `error` instead.
   */
  readonly error = input<string>();
  /**
   * A success message, shown in the error's place above the hint and painting
   * the border green. Shown only while the dropzone has no error: an error
   * means the user still has something to fix.
   */
  readonly success = input<string>();
  /**
   * Disables the dropzone from a parent template. Combined with the
   * reactive-forms disabled state.
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Marks the dropzone as invalid. The error state is also derived from the
   * bound control and from rejected files, so this only forces it on.
   * @default false
   */
  readonly invalid = input(false, { transform: booleanAttribute });
  /**
   * Emits the file the user removed. `filesChange` carries the new list; this
   * says which entry left it, so an in-flight upload can be aborted or a blob
   * URL revoked without diffing the two.
   */
  readonly fileRemove = output<FileDropzoneFile>();

  private readonly derived = deriveControlState();
  private readonly formDisabled = signal(false);
  private readonly dragDepth = signal(0);
  /**
   * Summarises the rejections from the last selection. Describes files that
   * were discarded rather than listed, so it cannot be derived from `files()`.
   */
  protected readonly rejectionError = signal<string | undefined>(undefined);
  private readonly fallbackId = `tedi-file-dropzone-${fileDropzoneIdCounter++}`;

  protected readonly fileTemplate = contentChild(FileDropzoneFileDirective);

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );

  protected readonly isInvalid = computed(
    () => this.invalid() || !!this.errorText() || this.derived.invalid(),
  );

  protected readonly isValid = computed(
    () => !this.isInvalid() && !!this.success(),
  );

  protected readonly resolvedId = computed(
    () => this.inputId() ?? this.fallbackId,
  );

  protected readonly resolvedLabel = computed(
    () => this.label() ?? this.translations.translate("file-dropzone.label"),
  );

  protected readonly isDragActive = computed(() => this.dragDepth() > 0);

  protected readonly selectedFilesLabel = this.translations.track(
    "file-dropzone.selected-files",
  );

  /**
   * Everything the file list binds, resolved once per `files()` change. Keeps
   * the template free of calls that would re-run — and re-allocate strings — on
   * every check.
   */
  protected readonly fileRows = computed(() => {
    const template = this.fileTemplate();
    const showSize = this.showFileSize();
    const removeLabel = this.translations.translate("remove");

    return this.files().map((file) => {
      const label = `${removeLabel} ${file.name}`;

      return {
        file,
        name: file.name,
        removeLabel: label,
        size:
          showSize && typeof file.size === "number"
            ? formatFileSize(file.size)
            : undefined,
        context: template
          ? ({
              $implicit: file,
              remove: () => this.removeFile(file),
              removeLabel: label,
            } satisfies FileDropzoneFileContext)
          : undefined,
      };
    });
  });

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
  protected readonly hintText = computed(() => {
    const accept = this.showRestrictions() && this.accept();
    const maxSize = this.showRestrictions() && this.maxSize();
    const parts = [
      accept &&
        `${this.translations.translate("file-upload.accept")} ${accept.replaceAll(",", ", ")}`,
      maxSize &&
        `${this.translations.translate("file-upload.max-size")} ${formatFileSize(maxSize)}`,
      this.hint(),
    ].filter(Boolean);

    return parts.join(". ") || undefined;
  });

  /** The dropzone shows at most one error, so both sources share one text. */
  protected readonly errorText = computed(
    () =>
      [this.rejectionError(), this.error()].filter(Boolean).join(". ") ||
      undefined,
  );

  protected readonly successText = computed(() =>
    this.errorText() ? undefined : this.success(),
  );

  protected readonly feedbackIds = computed(() => {
    const id = this.resolvedId();
    return {
      error: `${id}-error`,
      success: `${id}-success`,
      hint: `${id}-hint`,
    };
  });

  /**
   * The ids are pushed through `controlDescribedBy` rather than bound directly,
   * so a consumer's own `aria-describedby` on the host is merged in instead of
   * being stranded on a wrapper the input never references.
   */
  readonly describedBy = controlDescribedBy();

  private onChange: (files: FileDropzoneFile[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const ids = this.feedbackIds();
      this.describedBy.set(
        [
          this.errorText() ? ids.error : null,
          this.successText() ? ids.success : null,
          this.hintText() ? ids.hint : null,
        ].filter((id): id is string => !!id),
      );
    });
  }

  ngOnInit(): void {
    this.derived.connect();
  }

  writeValue(files: FileDropzoneFile[] | null): void {
    this.files.set(files ?? []);
    this.clearRejectionWhenEmpty();
  }

  registerOnChange(fn: (files: FileDropzoneFile[]) => void): void {
    this.onChange = fn;
  }

  /**
   * Fails the control while any rejected file is still listed. Without it a
   * `Validators.required` control reports valid on a list of visibly broken
   * files, which `keepRejectedFiles` leaves in the value.
   */
  validate(control: AbstractControl): ValidationErrors | null {
    const rejected = ((control.value ?? []) as FileDropzoneFile[]).filter(
      (file) => file.isValid === false,
    );

    return rejected.length ? { rejectedFiles: rejected } : null;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected openPicker(): void {
    if (!this.isDisabled()) {
      this.fileInput()?.nativeElement.click();
    }
  }

  /**
   * A `role="button"` div gets no keyboard activation of its own, so Enter and
   * Space have to be wired up by hand. Space also scrolls the page by default.
   */
  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.openPicker();
    }
  }

  protected handleSelection(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addFiles(Array.from(input.files ?? []));
    this.onTouched();
    input.value = "";
  }

  protected handleBlur(): void {
    if (this.document.hasFocus()) {
      this.onTouched();
    }
  }

  /** Dismissing the dialog counts as interaction, even with nothing picked. */
  protected handleDialogCancel(): void {
    this.onTouched();
  }

  protected handleDragEnter(event: DragEvent): void {
    if (this.isDisabled() || !this.hasFiles(event)) return;

    event.preventDefault();
    this.dragDepth.update((depth) => depth + 1);
  }

  protected handleDragOver(event: DragEvent): void {
    if (!this.hasFiles(event)) return;

    // Without preventDefault the browser opens the dropped file in the tab, so
    // a disabled zone has to claim the drag too — and then refuse it.
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = this.isDisabled() ? "none" : "copy";
    }
  }

  protected handleDragLeave(): void {
    this.dragDepth.update((depth) => Math.max(0, depth - 1));
  }

  protected handleDrop(event: DragEvent): void {
    this.dragDepth.set(0);
    event.preventDefault();
    if (this.isDisabled()) return;

    this.addFiles(Array.from(event.dataTransfer?.files ?? []));
    this.onTouched();
  }

  protected removeFile(file: FileDropzoneFile): void {
    if (this.isDisabled()) return;

    const removedIndex = this.files().indexOf(file);

    this.commit(this.files().filter((current) => current !== file));
    this.clearRejectionWhenEmpty();
    this.fileRemove.emit(file);
    this.onTouched();
    // A pending "added" is superseded by this removal; letting it fire would
    // announce the two in the wrong order.
    clearTimeout(this.addAnnounceTimeout);
    this.announce(
      this.translations.translate("file-upload.removed", file.name),
    );
    this.restoreFocus(removedIndex);
  }

  /**
   * The button the user just pressed leaves the DOM with its row, so focus would
   * fall to `<body>`, losing the user's place. Move it to the *previous* file's
   * remove button rather than the next one, so repeated presses cannot walk
   * destructively down the list. Removing the first file has no previous row, so
   * focus goes to the one that replaced it; removing the last goes to the drop
   * zone.
   */
  private restoreFocus(removedIndex: number): void {
    afterNextRender(
      () => {
        const rows = this.host.nativeElement.querySelectorAll(
          ".tedi-file-dropzone__file",
        );

        if (!rows.length) {
          this.dropZone()?.nativeElement.focus();
          return;
        }

        const row = rows[Math.max(removedIndex - 1, 0)];

        (
          row.querySelector<HTMLElement>(FOCUSABLE) ??
          this.dropZone()?.nativeElement
        )?.focus();
      },
      { injector: this.injector },
    );
  }

  private addFiles(selected: File[]): void {
    if (!selected.length) return;

    const keepRejected = this.keepRejectedFiles();

    // Picking the same file twice almost always means the user lost track of
    // what they had already added, so the repeat is skipped rather than listed
    // twice. Matching on more than the name keeps two genuinely different files
    // that share one — scans and camera exports collide constantly.
    const listed = new Set(this.files().map(fileIdentity));
    const duplicates = selected.filter((file) =>
      listed.has(fileIdentity(file)),
    );
    const fresh = selected.filter((file) => !listed.has(fileIdentity(file)));

    // Every rule a file breaks is reported, not just the first: fixing one
    // reason only to be rejected for the next sends the user round twice.
    const rejections: FileRejection[] = [];
    const candidates = fresh.map((file) => {
      const rejection: FileRejection = {
        name: file.name,
        reasons: this.reasonsFor(file),
        message: this.validator()?.(file) || undefined,
      };
      const isValid = !rejection.reasons.length && !rejection.message;

      if (!isValid) rejections.push(rejection);

      const error = [
        ...rejection.reasons.map((reason) =>
          this.translations.translate(`file-dropzone.file-rejected-${reason}`),
        ),
        rejection.message,
      ]
        .filter(Boolean)
        .join(". ");

      return Object.assign(file, {
        id: generateUUID(),
        isLoading: false,
        isValid,
        error: keepRejected && error ? error : undefined,
      }) as FileDropzoneFile;
    });

    // Rejected files are listed only when each carries its own reason;
    // otherwise they are dropped and the summary below speaks for them.
    const kept = keepRejected
      ? candidates
      : candidates.filter((file) => file.isValid);
    const multiple = this.multiple();

    if (kept.length) {
      this.commit(multiple ? [...this.files(), ...kept] : [kept[0]]);
    }

    // One selection can reject, skip and add all at once. The live region holds
    // a single message, so these are gathered and announced together —
    // announcing them one by one overwrites all but the last.
    const messages: string[] = [];

    const rejection = this.rejectionSummary(rejections);

    this.rejectionError.set(rejection && !keepRejected ? rejection : undefined);
    if (rejection) messages.push(rejection);

    if (duplicates.length) {
      messages.push(
        this.translations.translate(
          "file-upload.duplicates-skipped",
          duplicates.map((file) => `'${file.name}'`).join(", "),
          String(duplicates.length),
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
    // closing it leaves the screen reader reading the drop zone button for
    // seconds, so a polite message never gets spoken, and an assertive one
    // inserted too early is lost in the transition. Removal needs neither — no
    // dialog is involved there.
    clearTimeout(this.addAnnounceTimeout);
    this.addAnnounceTimeout = setTimeout(
      () => this.announce(messages.join(". "), "assertive"),
      ADD_ANNOUNCE_DELAY,
    );
  }

  ngOnDestroy(): void {
    clearTimeout(this.addAnnounceTimeout);
  }

  /**
   * The summary names files that were never listed, so only emptying the field
   * makes it stale — otherwise it lingers under an empty dropzone, holding the
   * border red.
   */
  private clearRejectionWhenEmpty(): void {
    if (!this.files().length) {
      this.rejectionError.set(undefined);
    }
  }

  private commit(files: FileDropzoneFile[]): void {
    this.files.set(files);
    this.onChange(files);
  }

  private hasFiles(event: DragEvent): boolean {
    return event.dataTransfer?.types.includes("Files") ?? false;
  }

  private isAcceptedSize(file: File): boolean {
    const maxSize = this.maxSize();
    return !maxSize || file.size <= maxSize;
  }

  /**
   * Mirrors how the browser reads the `accept` attribute, so a dropped file is
   * held to the same rule as a picked one: an extension, an exact MIME type, or
   * a `type/*` group.
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
      if (token.endsWith("/*")) {
        return !!mimeType && mimeType.startsWith(token.slice(0, -1));
      }

      return token === mimeType;
    });
  }

  /**
   * Every restriction the file breaks, not just the first. A file can be both
   * the wrong format and too large; reporting one reason at a time sends the
   * user away to fix it, only to reject it again for the other.
   */
  private reasonsFor(file: FileDropzoneFile): FileRejectionReason[] {
    const reasons: FileRejectionReason[] = [];

    if (!this.isAcceptedType(file as File)) reasons.push("extension");
    if (!this.isAcceptedSize(file as File)) reasons.push("size");

    return reasons;
  }

  /**
   * One message for every rejection: built-in reasons first, grouped by
   * reason, then each validator message followed by the files it refused.
   */
  private rejectionSummary(rejections: FileRejection[]): string | undefined {
    const builtIn: Record<FileRejectionReason, string[]> = {
      extension: [],
      size: [],
    };
    const custom = new Map<string, string[]>();

    for (const { name, reasons, message } of rejections) {
      const quoted = `'${name}'`;
      reasons.forEach((reason) => builtIn[reason].push(quoted));
      if (message)
        custom.set(message, [...(custom.get(message) ?? []), quoted]);
    }

    return (
      [
        ...Object.entries(builtIn)
          .filter(([, names]) => names.length)
          .map(([reason, names]) =>
            this.translations.translate(
              `file-upload.${reason}-rejected`,
              names.join(", "),
              String(names.length),
            ),
          ),
        ...Array.from(
          custom,
          ([message, names]) =>
            `${message.replace(/[\s.]+$/, "")}: ${names.join(", ")}`,
        ),
      ].join(". ") || undefined
    );
  }

  /**
   * Announced from the root-level regions, not a node of this component's own.
   * Adding files rebuilds the rows beside such a node — wholesale when
   * `multiple` is off and the row is replaced — and a live region updated in
   * the same breath as the subtree around it is dropped by screen readers.
   */
  private announce(text: string, politeness: ToastPoliteness = "polite"): void {
    if (text) {
      this.announcer.announce(text, politeness);
    }
  }
}
