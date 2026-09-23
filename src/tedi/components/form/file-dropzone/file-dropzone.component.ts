import { NgTemplateOutlet } from "@angular/common";
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
import { FileDropzoneFeedback, FileDropzoneFile } from "./file-dropzone.types";

type FileRejectionReason = "extension" | "size";

let fileDropzoneIdCounter = 0;

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
  implements OnInit, ControlValueAccessor, Validator
{
  private readonly translations = inject(TediTranslationService);
  private readonly injector = inject(Injector);
  private announceId = 0;
  protected readonly announcements = signal<{ id: number; text: string }[]>([]);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly fileInput =
    viewChild<ElementRef<HTMLInputElement>>("fileInput");

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
   */
  readonly accept = input<string>();
  /**
   * Largest accepted file size, in bytes — the unit `File.size` is in. The
   * restrictions hint renders it in whichever unit reads best, so a sub-megabyte
   * limit still shows as e.g. `500 KB`.
   */
  readonly maxSize = input<number>();
  /**
   * Whether more than one file can be held at a time. A single-file dropzone
   * replaces its file on the next selection.
   * @default false
   */
  readonly multiple = input(false, { transform: booleanAttribute });
  /**
   * Keeps rejected files in the list, each carrying its own reason, so the user
   * can see which of their files failed and remove it. Turn it off to discard a
   * rejected file instead and summarise every rejection in one message under
   * the dropzone.
   * @default true
   */
  readonly keepRejectedFiles = input(true, { transform: booleanAttribute });
  /**
   * Whether the allowed types and maximum size are summarised in a hint below
   * the dropzone. Turn it off when the same information is shown elsewhere —
   * rejection errors still render.
   * @default true
   */
  readonly showRestrictions = input(true, { transform: booleanAttribute });
  /**
   * Whether each file's size is shown next to its name.
   * @default false
   */
  readonly showFileSize = input(false, { transform: booleanAttribute });
  /**
   * Feedback text below the dropzone. An `error` type also paints the dropzone
   * border red.
   */
  readonly feedbackText = input<FileDropzoneFeedback>();
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
    () =>
      this.invalid() ||
      !!this.rejectionError() ||
      this.feedbackText()?.type === "error" ||
      this.derived.invalid(),
  );

  protected readonly isValid = computed(
    () => !this.isInvalid() && this.feedbackText()?.type === "valid",
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

  protected readonly rejectedLabel = this.translations.track(
    "file-dropzone.rejected",
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
      const name = file.name ?? "";
      const label = `${removeLabel} ${name}`;

      return {
        file,
        name,
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
  protected readonly restrictionsHint = computed(() => {
    if (!this.showRestrictions()) return undefined;

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
    return {
      error: `${id}-error`,
      feedback: `${id}-feedback`,
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
          this.rejectionError() ? ids.error : null,
          this.feedbackText() ? ids.feedback : null,
          this.restrictionsHint() ? ids.hint : null,
        ].filter((id): id is string => !!id),
      );
    });
  }

  ngOnInit(): void {
    this.derived.connect();
  }

  writeValue(files: FileDropzoneFile[] | null): void {
    this.files.set(files ?? []);
  }

  registerOnChange(fn: (files: FileDropzoneFile[]) => void): void {
    this.onChange = fn;
  }

  /**
   * Fails the control while any rejected file is still listed. Without it a
   * `Validators.required` control reports valid on a list of visibly broken
   * files, since `keepRejectedFiles` keeps them in the value.
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

  protected handleSelection(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addFiles(Array.from(input.files ?? []));
    // Without this the same file cannot be picked twice in a row: the input
    // holds it, so re-selecting it fires no `change`.
    input.value = "";
  }

  protected handleBlur(): void {
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
    this.fileRemove.emit(file);
    this.onTouched();
    this.announce(
      this.translations.translate("file-upload.removed", file.name ?? ""),
    );
    this.restoreFocus(removedIndex);
  }

  /**
   * The button the user just pressed leaves the DOM with its row, so focus would
   * fall to `<body>`, losing the user's place. Move it to the *previous* file's
   * remove button rather than the next one, so repeated presses cannot walk
   * destructively down the list. Removing the first file has no previous row, so
   * focus goes to the one that replaced it; removing the last goes to the drop zone.
   */
  private restoreFocus(removedIndex: number): void {
    afterNextRender(
      () => {
        const rows = this.host.nativeElement.querySelectorAll(
          ".tedi-file-dropzone__file",
        );

        if (!rows.length) {
          this.fileInput()?.nativeElement.focus();
          return;
        }

        const row = rows[Math.max(removedIndex - 1, 0)];

        (
          row.querySelector<HTMLElement>(FOCUSABLE) ??
          this.fileInput()?.nativeElement
        )?.focus();
      },
      { injector: this.injector },
    );
  }

  private addFiles(selected: File[]): void {
    if (!selected.length) return;

    const keepRejected = this.keepRejectedFiles();
    const rejected: { reason: FileRejectionReason; file: File }[] = [];

    // Picking the same file twice almost always means the user lost track of
    // what they had already added, so the repeat is skipped rather than listed
    // twice. Matching on more than the name keeps two genuinely different files
    // that share one — scans and camera exports collide constantly.
    const listed = new Set(this.files().map(fileIdentity));
    const duplicates = selected.filter((file) =>
      listed.has(fileIdentity(file)),
    );
    const fresh = selected.filter((file) => !listed.has(fileIdentity(file)));

    const candidates = fresh.map((file) => {
      const reason = this.reasonFor(file);
      if (reason) rejected.push({ reason, file });

      return Object.assign(file, {
        id: generateUUID(),
        isLoading: false,
        isValid: !reason,
        error:
          reason && keepRejected
            ? this.translations.translate(
                `file-dropzone.file-rejected-${reason}`,
              )
            : undefined,
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

    if (rejected.length) {
      const message = this.rejectionMessage(rejected);
      this.rejectionError.set(keepRejected ? undefined : message);
      this.announce(message);
      return;
    }

    this.rejectionError.set(undefined);

    if (duplicates.length) {
      this.announce(
        this.translations.translate(
          "file-upload.duplicates-skipped",
          duplicates.map((file) => `'${file.name}'`).join(", "),
        ),
      );
    }

    if (kept.length) {
      this.announce(
        this.translations.translate(
          "file-upload.added",
          String(multiple ? kept.length : 1),
        ),
      );
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

  private reasonFor(file: FileDropzoneFile): FileRejectionReason | undefined {
    if (!this.isAcceptedType(file as File)) return "extension";
    if (!this.isAcceptedSize(file as File)) return "size";

    return undefined;
  }

  /**
   * Groups the rejected files by reason into one message. Returns `undefined`
   * when none of them is a file the dropzone itself rejected.
   */
  private rejectionMessage(
    rejected: { reason: FileRejectionReason; file: File }[],
  ): string {
    return (["extension", "size"] as const)
      .map((reason) => {
        const names = rejected
          .filter((rejection) => rejection.reason === reason)
          .map((rejection) => `'${rejection.file.name}'`);

        return names.length
          ? this.translations.translate(
              `file-upload.${reason}-rejected`,
              names.join(", "),
            )
          : null;
      })
      .filter(Boolean)
      .join(". ");
  }

  /**
   * Feeds the component's own live region. CDK's `LiveAnnouncer` is deliberately
   * not used: it rewrites `aria-live` on every call, and screen readers re-register
   * a region mutated that way and drop the pending message. Each announcement is
   * rendered as a fresh node so that repeating the same text still announces.
   */
  private announce(text: string): void {
    if (text) {
      this.announcements.set([{ id: ++this.announceId, text }]);
    }
  }
}
