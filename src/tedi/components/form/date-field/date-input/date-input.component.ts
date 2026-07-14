import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  effect,
  inject,
  input,
  NgZone,
  output,
  signal,
  viewChild,
  viewChildren,
  ViewEncapsulation,
} from "@angular/core";
import { IconComponent } from "../../../base/icon/icon.component";
import { ClosingButtonComponent } from "../../../buttons";
import { SeparatorComponent } from "../../../helpers/separator/separator.component";
import { TextFieldComponent } from "../../text-field/text-field.component";
import { TagComponent, TagEllipsis } from "../../../tags/tag/tag.component";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { DateFieldMode } from "../../../content/calendar/types";
import { calculateVisibleTagCount } from "../../../../utils/tag-overflow.util";

export interface DateInputTag {
  id: string;
  label: string;
}

@Component({
  selector: "tedi-date-input",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    ClosingButtonComponent,
    IconComponent,
    SeparatorComponent,
    TextFieldComponent,
    TagComponent,
  ],
  templateUrl: "./date-input.component.html",
  styleUrl: "./date-input.component.scss",
  host: {
    class: "tedi-date-input",
    "[class.tedi-date-input--disabled]": "disabled()",
    "[class.tedi-date-input--readonly]": "readOnly()",
    "[class.tedi-date-input--with-tags]": "hasTags()",
    "[class.tedi-date-input--tags-wrap]": "hasTags() && multiRow()",
    "[class.tedi-date-input--tags-single-row]": "hasTags() && !multiRow()",
    "[class.tedi-date-input--tags-measuring]":
      "hasTags() && !multiRow() && visibleTagsCount() === null",
    "(window:resize)": "onResize()",
  },
})
export class DateInputComponent implements AfterViewChecked {
  readonly inputId = input.required<string>();
  readonly value = input<string>("");
  readonly tags = input<readonly DateInputTag[]>([]);
  readonly mode = input<DateFieldMode>("single");
  /**
   * Multiple mode: when `true` (default) the tags wrap to multiple rows and the
   * field grows in height. When `false` the tags stay on a single row and the
   * overflow collapses into a "+N" counter tag.
   */
  readonly multiRow = input<boolean>(true);
  /** Which end the tag labels truncate from when they don't fit (`false` = no truncation). */
  readonly ellipsis = input<TagEllipsis>(false);
  /** Whether the tags show a remove (close) button. */
  readonly removable = input<boolean>(true);
  readonly placeholder = input<string>("");
  readonly disabled = input<boolean>(false);
  readonly readOnly = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly iconActive = input<boolean>(false);
  readonly iconDisabled = input<boolean>(false);
  readonly useNativePicker = input<boolean>(false);
  readonly nativeIsoValue = input<string>("");
  readonly clearable = input<boolean>(false);

  readonly inputChange = output<string>();
  readonly iconClick = output<void>();
  readonly tagRemove = output<string>();
  readonly clear = output<void>();

  private readonly translationService = inject(TediTranslationService);
  private readonly ngZone = inject(NgZone);

  private readonly inputElement = viewChild("inputElement", {
    read: ElementRef,
  });
  private readonly fieldElement =
    viewChild<ElementRef<HTMLElement>>("fieldElement");
  private readonly tagElements = viewChildren("tagElement", {
    read: ElementRef,
  });

  /** Number of tags that fit on a single row; `null` until measured. */
  readonly visibleTagsCount = signal<number | null>(null);

  constructor() {
    effect(() => {
      const ref = this.inputElement();
      const target = ref?.nativeElement as HTMLInputElement | undefined;
      if (!target) return;
      const next = this.inputValue();
      if (target.value !== next) {
        target.value = next;
      }
    });

    effect(() => {
      // Re-measure whenever the tag set changes.
      this.tags();
      this.visibleTagsCount.set(null);
    });
  }

  ngAfterViewChecked(): void {
    if (this.hasTags() && !this.multiRow()) {
      this.calculateVisibleTags();
    }
  }

  onResize(): void {
    if (this.hasTags() && !this.multiRow()) {
      this.visibleTagsCount.set(null);
    }
  }

  readonly hasTags = computed(
    () => this.mode() === "multiple" && this.tags().length > 0,
  );

  readonly visibleTags = computed<readonly DateInputTag[]>(() => {
    const all = this.tags();
    if (this.multiRow()) return all;
    const visible = this.visibleTagsCount();
    // Render everything until the first measurement pass completes.
    if (visible === null) return all;
    return all.slice(0, visible);
  });

  readonly hiddenTagsCount = computed(() => {
    const visible = this.visibleTagsCount();
    const total = this.tags().length;
    if (this.multiRow() || visible === null || visible >= total) return 0;
    return total - visible;
  });

  readonly inputType = computed(() =>
    this.useNativePicker() ? "date" : "text",
  );

  readonly inputValue = computed(() =>
    this.useNativePicker() ? this.nativeIsoValue() : this.value(),
  );

  readonly showClear = computed(
    () =>
      this.clearable() &&
      !this.disabled() &&
      !this.readOnly() &&
      (this.inputValue() !== "" || this.hasTags()),
  );

  readonly iconAriaLabel = this.translationService.track(
    "date-picker.open-calendar",
  );

  readonly clearAriaLabel = this.translationService.track(
    "date-picker.clear-date",
  );

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.inputChange.emit(target.value);
  }

  handleIconClick(): void {
    if (this.disabled() || this.iconDisabled()) return;
    this.iconClick.emit();
  }

  handleTagRemove(id: string): void {
    if (this.disabled() || this.readOnly()) return;
    this.tagRemove.emit(id);
  }

  handleClear(): void {
    if (this.disabled() || this.readOnly()) return;
    this.clear.emit();
  }

  private calculateVisibleTags(): void {
    const tags = this.tagElements();
    if (tags.length === 0 || this.visibleTagsCount() !== null) return;

    const available = this.getAvailableTagWidth();
    if (available <= 0) return;

    const widths = tags.map(
      (tag) => (tag.nativeElement as HTMLElement).offsetWidth,
    );
    const visible = calculateVisibleTagCount(widths, available);

    this.ngZone.run(() => this.visibleTagsCount.set(visible));
  }

  private getAvailableTagWidth(): number {
    const field = this.fieldElement()?.nativeElement;
    if (!field) return 0;
    const width = field.clientWidth;
    if (width === 0) return 0;

    const inputEl = field.querySelector<HTMLElement>(".tedi-date-input__input");
    const inputMinWidth = inputEl
      ? parseFloat(getComputedStyle(inputEl).minWidth) || 0
      : 0;

    return width - inputMinWidth;
  }
}
