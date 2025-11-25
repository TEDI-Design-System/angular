import {
  Component,
  computed,
  HostListener,
  inject,
  input,
  signal,
  viewChild,
  ElementRef,
  OnInit,
  output,
  Self,
  SimpleChange,
  SimpleChanges,
  effect,
  OnChanges,
} from "@angular/core";
import {
  AbstractControl,
  AsyncValidatorFn,
  ControlValueAccessor,
  NgControl,
  ReactiveFormsModule,
  ValidationErrors,
} from "@angular/forms";
import {
  ClosingButtonComponent,
  FeedbackTextComponent,
  IconComponent,
  TooltipComponent,
  TooltipTriggerComponent,
  TooltipContentComponent,
  InfoButtonComponent,
  TediTranslationPipe,
  TediTranslationService,
  VerticalSpacingDirective,
} from "@tedi-design-system/angular/tedi";
import { CardComponent, CardContentComponent } from "../../cards";
import {
  DropzoneValidatorFunction,
  FeedbackTextProps,
  FileDropzone,
  FileInputMode,
  SizeDisplayStandard,
  ValidationState,
} from "./types";
import {
  formatBytes,
  getDefaultHelpers,
  validateFileSize,
  validateFileType,
  validatorWrapper,
} from "./utils";
import { FileService } from "./file.service";

@Component({
  selector: "tedi-file-dropzone",
  templateUrl: "./file-dropzone.component.html",
  styleUrls: ["./file-dropzone.react.scss", "./file-dropzone.component.scss"],
  imports: [
    IconComponent,
    FeedbackTextComponent,
    CardComponent,
    CardContentComponent,
    ClosingButtonComponent,
    TooltipComponent,
    TooltipTriggerComponent,
    TooltipContentComponent,
    InfoButtonComponent,
    ReactiveFormsModule,
    VerticalSpacingDirective,
    TediTranslationPipe,
  ],
  providers: [FileService],
})
export class FileDropzoneComponent
  implements ControlValueAccessor, OnInit, OnChanges
{
  /**
   * Specifies the allowed file types (e.g., "image/png, image/jpeg").
   *
   * Does not validate the contents of the file, only the file extension.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept
   **/
  accept = input<string>("");
  /**
   * The maximum file size allowed for upload, in bytes.
   * @default 0 (no limit)
   **/
  maxSize = input<number>(0);
  /**
   * Specifies the standard to use when displaying file sizes or maximum file size.
   * Options are "SI" (base 10) or "IEC" (base 2).
   *
   * SI units are in multiples of 1000 (e.g., 1 kB = 1000 bytes).
   *
   * IEC units are in multiples of 1024 (e.g., 1 KiB = 1024 bytes).
   * @default "IEC"
   *
   * https://wiki.ubuntu.com/UnitsPolicy
   */
  sizeDisplayStandard = input<SizeDisplayStandard>("IEC");
  /**
   * Determines if multiple files can be uploaded at once via the file picker.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/multiple
   * @default false
   **/
  multiple = input<boolean>(false);
  /**
   * If true, each file is validated separately instead of rejecting all at once.
    @default false
   **/
  validateIndividually = input(false);
  /**
   * An array of default files that are preloaded in the upload list.
   * @default false
   **/
  defaultFiles = input<File[] | FileDropzone[]>([]);
  /**
   * The unique identifier for the input element that this label is associated with.
   * This ID should match the input element's `id` attribute to ensure accessibility.
   */
  inputId = input<string>();
  /**
   * The name attribute for the file input, used for form submission and identifying the field.
   */
  name = input<string>();
  /**
   * The text label displayed for the file dropzone, providing context for users.
   */
  label = input<string>("file-dropzone.label");
  /**
   * Additional CSS class names to apply to the dropzone for custom styling
   */
  className = input<string>();
  /**
   * Specifies how to handle file name conflicts when multiple file of the same name are added.
   * Options are:
   * - "append": Adds new files to the end of the list, keeping existing files
   * - "replace": Replaces existing files with new files of the same name
   *  @default "append"
   */
  mode = input<FileInputMode>("append");
  /**
   * If true, allows uploading folders instead of just files.
   * This enables the user to select a folder and upload all its contents.
   * Default file browser behaviour will prevent upload of files in this state.
   * @default false
   */
  uploadFolder = input<boolean>(false);
  /**
   * Validation functions that can be used to validate files.
   * Each function should return a string error message if validation fails, or undefined if it passes
   */
  validators = input<DropzoneValidatorFunction[]>([
    validateFileSize,
    validateFileType,
  ]);
  /**
   * If true, shows the file dropzone as in a erroring state with red border.
   * Overrides default validation state.
   * @default false
   **/
  hasError = input<boolean>(false);
  /**
   * Output event triggered when files are added.
   **/
  fileChange = output<FileDropzone[]>();
  /**
   * Output event triggered when a file is removed.
   **/
  fileDelete = output<FileDropzone>();

  fileInputElement =
    viewChild.required<ElementRef<HTMLInputElement>>("fileInput");

  formatBytes = (bytes: number): string =>
    formatBytes(bytes, this.sizeDisplayStandard());

  private _uploadState = computed(() => {
    if (this._ngControl.control?.touched && this._ngControl.control?.errors) {
      return "invalid";
    }
    return this.files().length > 0 ? "valid" : "none";
  });

  private _onChange = (_: FileDropzone[]) => {};
  private _onTouched = () => {};

  private _translationService = inject(TediTranslationService);
  private _fileService = inject(FileService);
  isDragActive = signal<boolean>(false);
  disabled = signal<boolean>(false);

  uploadError = signal<string | null>(null);
  files = this._fileService.files;

  classes = computed(() => {
    const classList = ["tedi-file-dropzone"];

    if (this.disabled()) {
      classList.push("tedi-file-dropzone--disabled");
    }
    if (this.hasError()) {
      classList.push("tedi-file-dropzone--invalid");
    } else if (this._uploadState() !== "none") {
      classList.push(`tedi-file-dropzone--${this._uploadState()}`);
    }
    if (this.isDragActive()) {
      classList.push("tedi-file-dropzone--drop-over");
    }
    if (this.className()) {
      classList.push(this.className()!);
    }

    return classList.join(" ");
  });

  helperText = computed<FeedbackTextProps>(() => ({
    text: getDefaultHelpers(
      this.accept(),
      this.maxSize(),
      this.sizeDisplayStandard(),
      this._translationService.translate.bind(this._translationService)
    ),
    type: "hint",
    position: "left",
  }));

  constructor(@Self() public _ngControl: NgControl) {
    this._ngControl.valueAccessor = this;
  }

  ngOnInit(): void {
    this.addFiles(this.defaultFiles());
    this._fileService.mode = this.mode;

    const asyncValidators: AsyncValidatorFn[] = this.validators().map(
      (validator) => this.validateWrapper(validator)
    );
    this._ngControl.control?.addAsyncValidators(asyncValidators);
    this._ngControl.control?.updateValueAndValidity();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // check on changes of validators, accept, maxSize, sizeDisplayStandard
    if (
      changes["validators"] ||
      changes["accept"] ||
      changes["maxSize"] ||
      changes["sizeDisplayStandard"]
    ) {
      this._ngControl.control?.updateValueAndValidity();
    }
  }

  translateService = inject(TediTranslationService);

  validateWrapper =
    (validator: DropzoneValidatorFunction) =>
    async (
      control: AbstractControl<FileDropzone[]>
    ): Promise<ValidationErrors | null> => {
      return validatorWrapper(
        validator,
        this.maxSize(),
        this.accept(),
        control.value,
        this.sizeDisplayStandard(),
        this.translateService.translate.bind(this.translateService)
      );
    };

  // validateWrapper = async (
  //   control: AbstractControl<FileDropzone[]>
  // ): Promise<ValidationErrors | null> => {
  //   const errors: string[] = [];
  //   control.value.forEach((file) => {

  //     if (error) {
  //       errors.push(error);
  //     }
  //   });

  //   const error = errors.length ? errors.join(", ") : null;

  //   if (error) {
  //     return { fileSizeError: true };
  //   }
  //   return null;
  // };

  fileClasses = (file: FileDropzone): string => {
    const classList = ["tedi-file-dropzone__file-item"];
    if (file.className) {
      classList.push(...file.className);
    }
    if (file.fileStatus != "none") {
      classList.push(`tedi-file-dropzone__file-item--${file.fileStatus}`);
    }
    return classList.join(" ");
  };

  tooltipClasses = (file: FileDropzone): string => {
    const classes = ["tedi-file-dropzone__tooltip"];
    classes.push(`tedi-file-dropzone__tooltip--${file.helper?.type || "hint"}`);
    return classes.join(" ");
  };

  selectionChange = (event: Event) => {
    const fileList = (event.target as HTMLInputElement).files;
    const files = Array.from(fileList || []);
    this.addFiles(files);
    this.fileInputElement().nativeElement.value = "";
  };

  @HostListener("blur")
  onBlur() {
    this._onTouched();
  }

  @HostListener("keydown.code.enter")
  openFilePicker() {
    this.fileInputElement().nativeElement.click();
  }

  @HostListener("dragover", ["$event"])
  onDragOver = (event: DragEvent) => {
    event?.preventDefault();
  };

  @HostListener("dragenter", ["$event"])
  onDragEnter = (event: DragEvent) => {
    event?.preventDefault();
    this.isDragActive.set(true);

    if (event?.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
  };

  @HostListener("dragleave", ["$event"])
  onDragLeave = (event: DragEvent) => {
    event?.preventDefault();

    this.isDragActive.set(false);
  };

  @HostListener("drop", ["$event"])
  onDrop = async (event: DragEvent) => {
    this.onDragLeave(event);
    event?.preventDefault();
    if (!event.dataTransfer) return;

    const files = Array.from(event.dataTransfer.files);
    this.addFiles(files);
  };

  async addFiles(files: FileDropzone[] | File[]) {
    if (!Array.isArray(files) || !files.length) {
      return;
    }

    await this._fileService.addFiles(files);

    this._onChange(this._fileService.files());
    this.fileChange.emit(this._fileService.files());
  }

  async removeFile(file: FileDropzone) {
    await this._fileService.removeFiles([file]);

    this._onChange(this._fileService.files());
    this.fileDelete.emit(file);
  }

  currentErrorState(): string | null {
    // create a string out of this._ngControl.control?.errors
    const errors = this._ngControl.control?.errors;
    if (errors && Object.keys(errors).length > 0) {
      return Object.keys(errors).join(", ");
    }
    return null;
  }

  private _getNewState(): ValidationState {
    if (this._ngControl.control?.touched && this._ngControl.control?.errors) {
      return "invalid";
    }
    return this.files().length > 0 ? "valid" : "none";
  }

  onContainerClick() {
    this.openFilePicker();
  }

  writeValue(files: FileDropzone[]) {
    this.addFiles(files || []);
  }

  registerOnChange(fn: (value: FileDropzone[]) => void) {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
