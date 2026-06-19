import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  ViewEncapsulation,
  viewChildren,
  AfterViewInit,
  OnDestroy,
  effect,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { _IdGenerator } from "@angular/cdk/a11y";
import { TediTranslationPipe } from "../../../services/translation/translation.pipe";
import { isValidTime } from "../../../utils/time.util";
import { RadioCardComponent } from "../radio-card/radio-card.component";
import { RadioCardGroupComponent } from "../radio-card-group/radio-card-group.component";
import { RadioComponent } from "../radio/radio.component";

export type TimePickerVariant = "scroll" | "slots" | "dropdown";

const DEFAULT_ITEM_HEIGHT = 40;
const SMOOTH_SCROLL_LOCK_MS = 400;
const INSTANT_SCROLL_LOCK_MS = 50;
const SCROLL_DEBOUNCE_MS = 150;

type WheelType = "hour" | "minute";

@Component({
  selector: "tedi-time-picker",
  standalone: true,
  imports: [
    TediTranslationPipe,
    RadioCardComponent,
    RadioCardGroupComponent,
    RadioComponent,
  ],
  templateUrl: "./time-picker.component.html",
  styleUrl: "./time-picker.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "tedi-time-picker",
    "[class.tedi-time-picker--scroll]": "variant() === 'scroll'",
    "[class.tedi-time-picker--slots]": "variant() === 'slots'",
    "[class.tedi-time-picker--dropdown]": "variant() === 'dropdown'",
    "[class.tedi-time-picker--disabled]": "isDisabled()",
    "[class.tedi-time-picker--bordered]": "border()",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePickerComponent),
      multi: true,
    },
  ],
})
export class TimePickerComponent
  implements ControlValueAccessor, AfterViewInit, OnDestroy
{
  /** Selected time in `HH:mm` format. Two-way bindable. */
  readonly value = model<string | null>(null);
  /** Visual variant. `scroll` shows hour/minute wheels, `slots` a grid of fixed times, `dropdown` a list. */
  readonly variant = input<TimePickerVariant>("scroll");
  /** Predefined times for the `slots` and `dropdown` variants (`HH:mm` strings). */
  readonly timeSlots = input<string[]>([]);
  /** Number of columns for the `slots` grid. */
  readonly columns = input<number>(3);
  /** Show the radio indicator dot on each card in the `slots` variant. Has no effect on other variants. */
  readonly showSlotIndicator = input<boolean>(false);
  /** Minute step for the `scroll` variant — e.g. `5` renders `00, 05, 10…`. */
  readonly minuteStep = input<number>(1);
  /** Disables interaction. Combines with the form-control disabled state. */
  readonly disabled = input<boolean>(false);
  /** Render the picker with a surrounding border — useful when embedded inside other content where it needs to stand apart. */
  readonly border = input<boolean>(false);
  /** Trap Tab between hour/minute columns (`scroll`) or emit `closeRequested` (`slots`/`dropdown`). */
  readonly trapFocus = input<boolean>(false);
  /** Emitted when the picker requests to be closed (Tab while `trapFocus` is `true`). */
  readonly closeRequested = output<void>();

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly uniqueId = inject(_IdGenerator).getId("tedi-time-picker-");
  private readonly formDisabled = signal(false);
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};
  private initialized = false;

  private readonly isProgrammaticScroll: Record<WheelType, boolean> = {
    hour: false,
    minute: false,
  };
  private readonly scrollLockTimer: Partial<
    Record<WheelType, ReturnType<typeof setTimeout>>
  > = {};
  private readonly scrollDebounceTimer: Partial<
    Record<WheelType, ReturnType<typeof setTimeout>>
  > = {};
  private cachedItemHeight: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private readonly hourScrollIndex = signal(0);
  private readonly minuteScrollIndex = signal(0);

  readonly hourColumns = viewChildren<ElementRef<HTMLElement>>("hourColumn");
  readonly minuteColumns =
    viewChildren<ElementRef<HTMLElement>>("minuteColumn");

  /**
   * The current `value` after validation. Invalid strings (e.g. `"25:99"`,
   * `"abc"`, anything not matching `HH:mm`) collapse to `null`, so the picker
   * renders as "no selection" instead of trying to scroll to a nonexistent
   * row. The `value` model itself is left untouched — consumers using
   * reactive forms can still see their invalid state.
   */
  private readonly safeValue = computed(() => {
    const v = this.value()?.trim();
    return v && isValidTime(v) ? v : null;
  });

  readonly selectedHour = computed(() => {
    const val = this.safeValue();
    if (!val) return null;
    return parseInt(val.split(":")[0], 10);
  });

  readonly selectedMinute = computed(() => {
    const val = this.safeValue();
    if (!val) return null;
    return parseInt(val.split(":")[1], 10);
  });

  readonly hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  );

  readonly minutes = computed(() =>
    Array.from({ length: Math.ceil(60 / this.minuteStep()) }, (_, i) =>
      String(i * this.minuteStep()).padStart(2, "0"),
    ),
  );

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly gridStyle = computed(
    () => `grid-template-columns: repeat(${this.columns()}, 1fr)`,
  );

  // With no value the wheel parks on 12:00 (display only — nothing is emitted).
  readonly selectedHourIndex = computed(() => this.selectedHour() ?? 12);
  readonly selectedMinuteIndex = computed(() => {
    const m = this.selectedMinute();
    if (m === null) return 0;
    return Math.floor(m / this.minuteStep());
  });

  readonly highlightedHourIndex = computed(() => this.hourScrollIndex());
  readonly highlightedMinuteIndex = computed(() => this.minuteScrollIndex());

  readonly hourActiveId = computed(
    () => `${this.uniqueId}hour-${this.highlightedHourIndex()}`,
  );
  readonly minuteActiveId = computed(
    () => `${this.uniqueId}minute-${this.highlightedMinuteIndex()}`,
  );

  hourItemId(index: number): string {
    return `${this.uniqueId}hour-${index}`;
  }

  minuteItemId(index: number): string {
    return `${this.uniqueId}minute-${index}`;
  }

  slotId(index: number): string {
    return `${this.uniqueId}slot-${index}`;
  }

  get radioGroupName(): string {
    return `${this.uniqueId}slot-group`;
  }

  onRadioChange(slot: string): void {
    this.selectSlot(slot);
  }

  constructor() {
    effect(() => {
      // Re-align the scroll wheel when the (sanitized) value changes. Reading
      // safeValue here intentionally skips realignment for invalid strings.
      this.safeValue();
      if (!this.initialized) return;
      if (this.variant() !== "scroll") return;
      this.alignScroll("instant");
    });
  }

  ngAfterViewInit(): void {
    this.initialized = true;
    this.cachedItemHeight = this.measureItemHeight();
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(
        () => (this.cachedItemHeight = this.measureItemHeight()),
      );
      this.resizeObserver.observe(this.el.nativeElement as HTMLElement);
    }
    requestAnimationFrame(() => this.alignScroll("instant"));
  }

  private measureItemHeight(): number {
    const root = this.el.nativeElement as HTMLElement;
    const item = root.querySelector(
      ".tedi-time-picker__item",
    ) as HTMLElement | null;
    return item?.offsetHeight || DEFAULT_ITEM_HEIGHT;
  }

  private getItemHeight(): number {
    return this.cachedItemHeight ?? this.measureItemHeight();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    (Object.keys(this.scrollLockTimer) as WheelType[]).forEach((k) => {
      const t = this.scrollLockTimer[k];
      if (t) clearTimeout(t);
    });
    (Object.keys(this.scrollDebounceTimer) as WheelType[]).forEach((k) => {
      const t = this.scrollDebounceTimer[k];
      if (t) clearTimeout(t);
    });
  }

  writeValue(value: string | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  selectHour(hour: string): void {
    if (this.isDisabled()) return;
    const minute = this.selectedMinute();
    const minuteStr = minute !== null ? String(minute).padStart(2, "0") : "00";
    const newValue = `${hour}:${minuteStr}`;
    if (this.value() === newValue) return;
    this.value.set(newValue);
    this.onTouched();
    this.onChange(newValue);
  }

  selectMinute(minute: string): void {
    if (this.isDisabled()) return;
    const hour = this.selectedHour();
    const hourStr = hour !== null ? String(hour).padStart(2, "0") : "00";
    const newValue = `${hourStr}:${minute}`;
    if (this.value() === newValue) return;
    this.value.set(newValue);
    this.onTouched();
    this.onChange(newValue);
  }

  selectSlot(slot: string): void {
    if (this.isDisabled()) return;
    this.value.set(slot);
    this.onTouched();
    this.onChange(slot);
  }

  isSlotSelected(slot: string): boolean {
    return this.value() === slot;
  }

  onHourClick(hour: string): void {
    if (this.isDisabled()) return;
    const idx = parseInt(hour, 10);
    this.scrollColumnToIndex("hour", idx, "smooth");
    this.selectHour(hour);
    this.focusOtherColumn("hour");
  }

  onMinuteClick(minute: string): void {
    if (this.isDisabled()) return;
    const list = this.minutes();
    const idx = list.indexOf(minute);
    if (idx >= 0) this.scrollColumnToIndex("minute", idx, "smooth");
    this.selectMinute(minute);
    this.minuteColumns()[0]?.nativeElement.focus({ preventScroll: true });
  }

  onColumnKeydown(event: KeyboardEvent, type: WheelType): void {
    if (this.isDisabled()) return;

    if (event.key === "Tab") {
      if (this.trapFocus()) {
        event.preventDefault();
        event.stopPropagation();
        this.focusOtherColumn(type);
      }
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (type === "hour") this.focusOtherColumn("hour");
      return;
    }

    const list = type === "hour" ? this.hours : this.minutes();
    if (!list.length) return;

    const currentIndex =
      type === "hour"
        ? this.highlightedHourIndex()
        : this.highlightedMinuteIndex();
    const move = this.computeWheelMove(event.key, currentIndex, list.length);
    if (move === null) return;

    event.preventDefault();
    this.scrollColumnToIndex(
      type,
      move.index,
      move.wrapped ? "instant" : "smooth",
    );
    if (type === "hour") {
      this.selectHour(list[move.index]);
    } else {
      this.selectMinute(list[move.index]);
    }
  }

  private computeWheelMove(
    key: string,
    currentIndex: number,
    length: number,
  ): { index: number; wrapped: boolean } | null {
    switch (key) {
      case "ArrowDown":
        return {
          index: (currentIndex + 1) % length,
          wrapped: currentIndex === length - 1,
        };
      case "ArrowUp":
        return {
          index: (currentIndex - 1 + length) % length,
          wrapped: currentIndex === 0,
        };
      case "Home":
        return { index: 0, wrapped: false };
      case "End":
        return { index: length - 1, wrapped: false };
      case "PageDown":
        return {
          index: Math.min(currentIndex + 5, length - 1),
          wrapped: false,
        };
      case "PageUp":
        return { index: Math.max(currentIndex - 5, 0), wrapped: false };
      default:
        return null;
    }
  }

  onColumnScroll(type: WheelType): void {
    const column = this.getColumnElement(type);
    if (!column) return;

    const list = type === "hour" ? this.hours : this.minutes();
    const rawIndex = Math.round(column.scrollTop / this.getItemHeight());
    const index = Math.max(0, Math.min(rawIndex, list.length - 1));

    if (type === "hour") this.hourScrollIndex.set(index);
    else this.minuteScrollIndex.set(index);

    if (this.isProgrammaticScroll[type]) return;

    const existing = this.scrollDebounceTimer[type];
    if (existing) clearTimeout(existing);

    this.scrollDebounceTimer[type] = setTimeout(() => {
      const col = this.getColumnElement(type);
      if (!col) return;
      const finalIdx = Math.max(
        0,
        Math.min(
          Math.round(col.scrollTop / this.getItemHeight()),
          list.length - 1,
        ),
      );
      if (type === "hour") this.selectHour(list[finalIdx]);
      else this.selectMinute(list[finalIdx]);
    }, SCROLL_DEBOUNCE_MS);
  }

  /** Roving-tabindex helper for dropdown items: only the selected item (or the first
   * when nothing is selected yet) is in the tab sequence. */
  getDropdownTabIndex(index: number): number {
    const slots = this.timeSlots();
    const selectedIndex = slots.indexOf(this.value() ?? "");
    if (selectedIndex !== -1) {
      return selectedIndex === index ? 0 : -1;
    }
    return index === 0 ? 0 : -1;
  }

  onDropdownKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) return;

    if (event.key === "Tab") {
      if (this.trapFocus()) {
        event.preventDefault();
        event.stopPropagation();
        this.closeRequested.emit();
      }
      return;
    }

    const target = event.target as HTMLElement;
    const list = target.closest(".tedi-time-picker__dropdown");
    if (!list) return;

    const items = Array.from(
      list.querySelectorAll<HTMLElement>(".tedi-time-picker__dropdown-item"),
    );
    const currentIndex = items.indexOf(target);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowDown":
        nextIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case "ArrowUp":
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = items.length - 1;
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        this.selectSlot(items[currentIndex].textContent!.trim());
        return;
      default:
        return;
    }

    event.preventDefault();
    items[nextIndex].focus();
  }

  private focusOtherColumn(currentType: WheelType): void {
    const target =
      currentType === "hour" ? this.minuteColumns()[0] : this.hourColumns()[0];
    target?.nativeElement.focus({ preventScroll: true });
  }

  focusActiveItem(): void {
    const variant = this.variant();
    if (variant === "scroll") {
      this.hourColumns()[0]?.nativeElement?.focus({ preventScroll: true });
      return;
    }

    const root = this.el.nativeElement as HTMLElement;

    if (variant === "slots") {
      const inputs = root.querySelectorAll<HTMLInputElement>(
        '.tedi-time-picker__grid input[type="radio"]',
      );
      const checked = Array.from(inputs).find((input) => input.checked);
      (checked ?? inputs[0])?.focus({ preventScroll: true });
      return;
    }

    if (variant === "dropdown") {
      const items = root.querySelectorAll<HTMLButtonElement>(
        ".tedi-time-picker__dropdown-item",
      );
      const focusable = Array.from(items).find(
        (item) => item.getAttribute("tabindex") === "0",
      );
      (focusable ?? items[0])?.focus({ preventScroll: true });
    }
  }

  scrollToSelected(): void {
    this.alignScroll("instant");
  }

  private getColumnElement(type: WheelType): HTMLElement | undefined {
    const columns = type === "hour" ? this.hourColumns() : this.minuteColumns();
    return columns[0]?.nativeElement;
  }

  private alignScroll(behavior: ScrollBehavior): void {
    if (this.variant() !== "scroll") return;

    const targetHour = this.selectedHourIndex();
    const targetMinute = this.selectedMinuteIndex();

    if (behavior !== "smooth") {
      this.hourScrollIndex.set(targetHour);
      this.minuteScrollIndex.set(targetMinute);
    }

    if (!this.isProgrammaticScroll.hour) {
      this.scrollColumnToIndex("hour", targetHour, behavior);
    }
    if (!this.isProgrammaticScroll.minute) {
      this.scrollColumnToIndex("minute", targetMinute, behavior);
    }
  }

  private scrollColumnToIndex(
    type: WheelType,
    index: number,
    behavior: ScrollBehavior = "auto",
  ): void {
    const column = this.getColumnElement(type);
    if (!column) return;

    const target = index * this.getItemHeight();

    if (behavior !== "smooth") {
      if (type === "hour") this.hourScrollIndex.set(index);
      else this.minuteScrollIndex.set(index);
    }

    if (Math.abs(column.scrollTop - target) < 1) return;

    this.isProgrammaticScroll[type] = true;

    const existing = this.scrollLockTimer[type];
    if (existing) clearTimeout(existing);

    if (typeof column.scrollTo === "function") {
      column.scrollTo({ top: target, behavior });
    } else {
      column.scrollTop = target;
    }

    this.scrollLockTimer[type] = setTimeout(
      () => {
        this.isProgrammaticScroll[type] = false;
      },
      behavior === "smooth" ? SMOOTH_SCROLL_LOCK_MS : INSTANT_SCROLL_LOCK_MS,
    );
  }
}
