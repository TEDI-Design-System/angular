import { DOCUMENT, NgTemplateOutlet } from "@angular/common";
import {
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DoCheck,
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
import { TooltipComponent } from "../../overlay/tooltip/tooltip.component";
import { TooltipTriggerComponent } from "../../overlay/tooltip/tooltip-trigger/tooltip-trigger.component";
import { TooltipContentComponent } from "../../overlay/tooltip/tooltip-content/tooltip-content.component";
import { deriveControlState } from "../form-field/derive-control-state";
import { controlDescribedBy } from "../form-field/control-described-by";
import {
  FileDropzoneFileContext,
  FileDropzoneFileDirective,
} from "./file-dropzone-file.directive";
import {
  FileDropzoneDuplicates,
  FileDropzoneFile,
  FileDropzoneValidator,
} from "./file-dropzone.types";

type FileRejectionReason = "extension" | "size";

interface FileRejection {
  name: string;
  reasons: FileRejectionReason[];
  message?: string;
}

let fileDropzoneIdCounter = 0;

// Closing the file dialog leaves the screen reader busy, and a message inserted
// during it is dropped rather than queued — even an assertive one.
const ADD_ANNOUNCE_DELAY = 300;

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Identifies a file well enough to spot a repeat selection. Name alone is not
 * enough — `IMG_0001.jpg` collides across devices — so size and mtime join it,
 * and the folder path keeps two such files from one folder upload apart.
 */
const fileIdentity = (file: FileDropzoneFile): string =>
  `${file.webkitRelativePath ?? ""}:${file.name}:${file.size}:${file.lastModified}`;

// Splits before the extension, which leaves names carrying dots of their own,
// and those without an extension, intact. A configured double extension such as
// `.tar.gz` counts as one, so the counter lands before all of it.
const withFreeNames = (
  listed: FileDropzoneFile[],
  incoming: File[],
  extensions: string[],
): File[] => {
  const taken = new Set(listed.map((file) => file.name.toLowerCase()));

  return incoming.map((file) => {
    if (!taken.has(file.name.toLowerCase())) {
      taken.add(file.name.toLowerCase());
      return file;
    }

    const lower = file.name.toLowerCase();
    const configured = extensions
      .filter((candidate) => lower.endsWith(candidate))
      .sort((a, b) => b.length - a.length)[0];
    const dot = configured
      ? file.name.length - configured.length
      : file.name.lastIndexOf(".");
    const stem = dot > 0 ? file.name.slice(0, dot) : file.name;
    const extension = dot > 0 ? file.name.slice(dot) : "";

    let counter = 1;
    let name = `${stem} (${counter})${extension}`;

    while (taken.has(name.toLowerCase())) {
      counter += 1;
      name = `${stem} (${counter})${extension}`;
    }

    taken.add(name.toLowerCase());

    return new File([file], name, {
      type: file.type,
      lastModified: file.lastModified,
    });
  });
};

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
    TooltipComponent,
    TooltipTriggerComponent,
    TooltipContentComponent,
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
  implements OnInit, DoCheck, ControlValueAccessor, Validator, OnDestroy
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
   * Files held by the dropzone, and the value written by `formControl` / `ngModel`.
   */
  readonly files = model<FileDropzoneFile[]>([]);
  /** Id of the file input, generated when not set. */
  readonly inputId = input<string>();
  /** `name` attribute of the file input. */
  readonly name = input<string>();
  /**
   * The sentence inside the dropzone, falling back to the translated
   * `file-dropzone.instructions`. Not the field's label.
   */
  readonly instructions = input<string>();
  /**
   * Announces the field as required. The zone is a button, which ARIA gives no
   * `aria-required`, so the word joins its accessible name — mark the
   * `tedi-label` `[required]` too for the asterisk.
   * @default false
   */
  readonly required = input(false, { transform: booleanAttribute });
  /**
   * Allowed file types as comma-separated extensions and MIME types (`.pdf`,
   * `image/*`).
   */
  readonly accept = input<string>();
  /** Largest accepted file size, in bytes. */
  readonly maxSize = input<number>();
  /**
   * A rule of your own for each selected file, returning the reason it is
   * rejected or nothing to accept it.
   */
  readonly validator = input<FileDropzoneValidator>();
  /**
   * Whether more than one file can be held at a time. Left unset it follows
   * `uploadFolder`, since a folder arrives as the files inside it.
   * @default undefined — `false` unless `uploadFolder` is on
   */
  readonly multiple = input<boolean | undefined, unknown>(undefined, {
    // Unset stays `undefined`, so `uploadFolder` can decide instead.
    transform: (value: unknown) =>
      value == null ? undefined : booleanAttribute(value),
  });
  /**
   * Keeps rejected files in the list, each carrying its own reason, instead of
   * discarding them and summarising every rejection under the dropzone.
   * @default false
   */
  readonly keepRejectedFiles = input(false, { transform: booleanAttribute });
  /**
   * What happens when a file the list already holds is picked again: `skip`
   * leaves the list alone, `rename` keeps both, `replace` swaps them.
   * @default "skip"
   */
  readonly duplicates = input<FileDropzoneDuplicates>("skip");
  /**
   * Lets the user pick a whole folder, which the browser hands over as the
   * files inside it — so this turns `multiple` on unless you set it yourself.
   * @default false
   */
  readonly uploadFolder = input(false, { transform: booleanAttribute });
  /**
   * Whether the allowed types and maximum size are summarised in the hint below
   * the dropzone.
   * @default true
   */
  readonly showRestrictions = input(true, { transform: booleanAttribute });
  /**
   * Whether each file's size is shown next to its name.
   * @default false
   */
  readonly showFileSize = input(false, { transform: booleanAttribute });
  /** Guidance of your own, shown after the allowed types and maximum size. */
  readonly hint = input<string>();
  /**
   * An error of your own, added to the dropzone's error text after its own
   * rejection message.
   */
  readonly error = input<string>();
  /** A success message, shown only while the dropzone has no error. */
  readonly success = input<string>();
  /**
   * Disables the dropzone from a parent template, combined with the
   * reactive-forms disabled state.
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Marks the dropzone as invalid, on top of the state derived from the bound
   * control and from rejected files.
   * @default false
   */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Emits the file the user removed. */
  readonly fileRemove = output<FileDropzoneFile>();

  private readonly derived = deriveControlState();
  private readonly formDisabled = signal(false);
  private readonly dragDepth = signal(0);
  // Describes discarded files too, so it cannot be derived from `files()`.
  protected readonly rejectionError = signal<string | undefined>(undefined);
  private readonly fallbackId = `tedi-file-dropzone-${fileDropzoneIdCounter++}`;

  protected readonly fileTemplate = contentChild(FileDropzoneFileDirective);

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );

  /** Own `multiple` wins; unset, a folder upload implies it. */
  protected readonly isMultiple = computed(
    () => this.multiple() ?? this.uploadFolder(),
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

  protected readonly resolvedInstructions = computed(
    () =>
      this.instructions() ??
      this.translations.translate("file-dropzone.instructions"),
  );

  /** Id of the element holding the instructions, for the zone to be named by. */
  protected readonly instructionsId = computed(
    () => `${this.resolvedId()}-instructions`,
  );

  protected readonly requiredId = computed(
    () => `${this.resolvedId()}-required`,
  );

  /** Id of the `tedi-label` naming this field, once one is found. */
  private readonly labelId = signal<string | undefined>(undefined);

  // A `<label for>` cannot name the zone: it is a button, and the input the
  // label points at is hidden.
  protected readonly labelledBy = computed(() => {
    const labelId = this.labelId();
    const ids = [labelId, this.instructionsId()];

    if (this.required()) ids.push(this.requiredId());

    return labelId ? ids.join(" ") : null;
  });

  protected readonly requiredLabel = this.translations.track(
    "file-dropzone.required",
  );

  protected readonly isDragActive = computed(() => this.dragDepth() > 0);

  protected readonly selectedFilesLabel = this.translations.track(
    "file-dropzone.selected-files",
  );

  protected readonly fileRows = computed(() => {
    const template = this.fileTemplate();
    const showSize = this.showFileSize();
    const removeLabel = this.translations.translate("remove");

    const rows = this.files().map((file) => {
      const label = `${removeLabel} ${file.name}`;
      const isRejected = file.isValid === false;
      const removeIcon = isRejected ? "close" : "delete";

      return {
        file,
        name: file.name,
        removeLabel: label,
        isRejected,
        removeIcon,
        size:
          showSize && typeof file.size === "number"
            ? formatFileSize(file.size, this.translations.getLanguage())
            : undefined,
        context: template
          ? ({
              $implicit: file,
              remove: () => this.removeFile(file),
              removeLabel: label,
              removeIcon,
              disabled: this.isDisabled(),
            } satisfies FileDropzoneFileContext)
          : undefined,
      };
    });

    // Rejected files lead the list: they are the ones asking to be dealt with.
    // That covers files the consumer handed over already marked invalid as
    // much as the ones `keepRejectedFiles` held on to.
    return [
      ...rows.filter((row) => row.isRejected),
      ...rows.filter((row) => !row.isRejected),
    ];
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
    const accept = this.showRestrictions() ? this.accept() : undefined;
    const maxSize = this.showRestrictions() ? this.maxSize() : undefined;
    const parts = [
      accept &&
        `${this.translations.translate("file-upload.accept")} ${accept.replaceAll(",", ", ")}`,
      maxSize != null &&
        `${this.translations.translate("file-upload.max-size")} ${formatFileSize(maxSize, this.translations.getLanguage())}`,
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
    this.isInvalid() ? undefined : this.success(),
  );

  protected readonly feedbackIds = computed(() => {
    const id = this.resolvedId();
    return {
      error: `${id}-error`,
      success: `${id}-success`,
      hint: `${id}-hint`,
    };
  });

  // Merges a consumer's own `aria-describedby` on the host rather than
  // stranding it on a wrapper the zone never references.
  readonly describedBy = controlDescribedBy();

  private onChange: (files: FileDropzoneFile[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    afterRenderEffect(() => {
      const id = this.resolvedId();
      const label = Array.from(this.document.querySelectorAll("label")).find(
        (candidate) => candidate.htmlFor === id,
      );
      if (label) label.id ||= `${id}-label`;
      this.labelId.set(label?.id);
    });

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

  ngDoCheck(): void {
    this.derived.sync();
  }

  writeValue(files: FileDropzoneFile[] | null): void {
    this.files.set(files ?? []);
    // The summary describes a selection the user made, so anything the form
    // writes over it — a reset to preloaded files included — leaves it stale.
    this.rejectionError.set(undefined);
  }

  registerOnChange(fn: (files: FileDropzoneFile[]) => void): void {
    this.onChange = fn;
  }

  // Without this a `Validators.required` control reports valid on a list of
  // visibly broken files, which `keepRejectedFiles` leaves in the value.
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

    // Read from the rendered order, not the value: rejected files lead the
    // list, so the two part company as soon as one is held.
    const removedIndex = this.fileRows().findIndex((row) => row.file === file);

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

  // The pressed button leaves the DOM with its row, so focus would fall to
  // `<body>`. It goes to the *previous* row rather than the next, so repeated
  // presses cannot walk destructively down the list.
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

        // Clamped to what is left: a `fileRemove` handler can drop further
        // files before this runs, leaving the index past the end of the list.
        const row =
          rows[Math.min(Math.max(removedIndex - 1, 0), rows.length - 1)];

        (
          row?.querySelector<HTMLElement>(FOCUSABLE) ??
          this.dropZone()?.nativeElement
        )?.focus();
      },
      { injector: this.injector },
    );
  }

  // `skip` matches on more than the name, since two different files sharing
  // one are common; `rename` and `replace` go by the name alone, which is the
  // collision the user sees.
  private resolveDuplicates(selected: File[]): {
    duplicates: File[];
    fresh: File[];
  } {
    const strategy = this.duplicates();

    if (strategy === "rename") {
      return {
        duplicates: [],
        fresh: withFreeNames(
          this.files(),
          selected,
          this.acceptTokens().filter((token) => token.startsWith(".")),
        ),
      };
    }

    if (strategy === "replace") {
      return { duplicates: [], fresh: selected };
    }

    const listed = new Set(this.files().map(fileIdentity));

    return {
      duplicates: selected.filter((file) => listed.has(fileIdentity(file))),
      fresh: selected.filter((file) => !listed.has(fileIdentity(file))),
    };
  }

  // Only a file that passed displaces its namesake: a rejected newcomer must
  // never delete a file the user already has.
  private retained(kept: FileDropzoneFile[]): FileDropzoneFile[] {
    if (this.duplicates() !== "replace") return this.files();

    const displaced = new Set(
      kept
        .filter((file) => file.isValid !== false)
        .map((file) => file.name.toLowerCase()),
    );

    return this.files().filter(
      (file) => !displaced.has(file.name.toLowerCase()),
    );
  }

  private addFiles(selected: File[]): void {
    if (!selected.length) return;

    const keepRejected = this.keepRejectedFiles();
    const { duplicates, fresh } = this.resolveDuplicates(selected);

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
    const multiple = this.isMultiple();

    // A single-file zone holds one file, and it is the first that passed: a
    // rejected file dropped alongside a good one must not take its place.
    const single = kept.find((file) => file.isValid) ?? kept[0];
    const landed = multiple ? kept : kept.length ? [single] : [];
    // The one file kept when a selection brought more than this zone holds —
    // a folder always does, since `webkitdirectory` returns every file in it
    // whatever `multiple` says. Counted over the files that passed, since a
    // rejected one was turned away by the rules, not by the room left.
    const trimmed =
      !multiple && kept.filter((file) => file.isValid).length > 1
        ? single
        : undefined;

    if (landed.length) {
      this.commit(multiple ? [...this.retained(landed), ...landed] : landed);
    }

    const rejection = this.rejectionSummary(rejections);

    this.rejectionError.set(rejection && !keepRejected ? rejection : undefined);

    const messages = this.selectionMessages({
      rejection,
      duplicates,
      added: landed.filter((file) => file.isValid),
      trimmed,
    });

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
   * One selection can reject, skip and add all at once. The live region holds
   * a single message, so these are gathered and announced together —
   * announcing them one by one overwrites all but the last.
   */
  private selectionMessages({
    rejection,
    duplicates,
    added,
    trimmed,
  }: {
    rejection?: string;
    duplicates: File[];
    added: FileDropzoneFile[];
    trimmed?: FileDropzoneFile;
  }): string[] {
    const messages: string[] = [];

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

    if (trimmed) {
      messages.push(
        this.translations.translate(
          "file-dropzone.single-file-kept",
          trimmed.name,
        ),
      );
    } else if (added.length) {
      messages.push(
        this.translations.translate("file-upload.added", String(added.length)),
      );
    }

    return messages;
  }

  // The summary names files that were never listed, so removing the rows one by
  // one never resolves it — it goes when the last one does.
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
    return maxSize == null || file.size <= maxSize;
  }

  // Mirrors how the browser reads `accept`, so a dropped file is held to the
  // same rule as a picked one.
  private isAcceptedType(file: File): boolean {
    const tokens = this.acceptTokens();
    if (!tokens.length) return true;

    const name = file.name.toLowerCase();
    const mimeType = file.type.toLowerCase();

    return tokens.some((token) => {
      if (token.startsWith(".")) return name.endsWith(token);
      if (token.endsWith("/*")) {
        return !!mimeType && mimeType.startsWith(token.slice(0, -1));
      }

      return token === mimeType;
    });
  }

  // Every restriction the file breaks: reporting one at a time sends the user
  // away to fix it, only to reject it again for the next.
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

  // Announced from the root-level regions: adding files rebuilds the rows, and
  // a live region updated in the same breath as the subtree around it is
  // dropped by screen readers.
  private announce(text: string, politeness: ToastPoliteness = "polite"): void {
    if (text) {
      this.announcer.announce(text, politeness);
    }
  }
}
