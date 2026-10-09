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
/** Quiet period before a programmatic scroll counts as finished. */
const SCROLL_SETTLE_QUIET_MS = 200;
/** Releases a column whose programmatic scroll never fired a scroll event. */
const SCROLL_SETTLE_MAX_WAIT_MS = 1000;
const SCROLL_DEBOUNCE_MS = 150;
/**
 * How long a gesture stays armed before it has scrolled anything. A pointer can
 * go down on a column's padding and never move it, and nothing else would clear
 * the flag. Cancelled as soon as the gesture does scroll.
 */
const GESTURE_WITHOUT_SCROLL_MS = 500;
/**
 * The gestures that can scroll a column. Scrollbars are hidden and scrolling
 * keys are handled in `onColumnKeydown`, so a scroll with none of these behind
 * it was not started by the user.
 */
const USER_GESTURE_EVENTS = [
  "wheel",
  "touchstart",
  "touchmove",
  "pointerdown",
] as const;
const USER_GESTURE_OPTIONS: AddEventListenerOptions = {
  capture: true,
  passive: true,
};

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

  /**
   * Held until the programmatic scroll has actually settled, not for a fixed
   * time: `scrollTo` reports its own events plus the scroll-snap adjustment on
   * top, and the engine decides when those arrive.
   */
  private readonly isProgrammaticScroll: Record<WheelType, boolean> = {
    hour: false,
    minute: false,
  };
  private readonly isSmoothProgrammaticScroll: Record<WheelType, boolean> = {
    hour: false,
    minute: false,
  };
  /** Only a scroll with a gesture behind it may change the value. */
  private readonly hasUserGesture: Record<WheelType, boolean> = {
    hour: false,
    minute: false,
  };
  /** Guards against a correction and the engine trading scrolls indefinitely. */
  private readonly hasCorrectedScroll: Record<WheelType, boolean> = {
    hour: false,
    minute: false,
  };
  private readonly programmaticScrollTarget: Partial<
    Record<WheelType, number>
  > = {};
  private readonly scrollLockTimer: Partial<
    Record<WheelType, ReturnType<typeof setTimeout>>
  > = {};
  /** Latest moment a programmatic scroll may still own its column. */
  private readonly scrollLockDeadline: Partial<Record<WheelType, number>> = {};
  private readonly scrollDebounceTimer: Partial<
    Record<WheelType, ReturnType<typeof setTimeout>>
  > = {};
  private readonly gestureTimer: Partial<
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
    () =>
      `display: grid; grid-template-columns: repeat(${this.columns()}, 1fr)`,
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
      this.resizeObserver = new ResizeObserver(() => this.syncItemHeight());
      this.resizeObserver.observe(this.el.nativeElement as HTMLElement);
    }
    const host = this.el.nativeElement as HTMLElement;
    USER_GESTURE_EVENTS.forEach((name) => {
      host.addEventListener(name, this.handleUserGesture, USER_GESTURE_OPTIONS);
    });
    requestAnimationFrame(() => this.alignScroll("instant"));
  }

  /**
   * The height a row is actually rendered at, or 0 when it has no box at all
   * (the picker is hidden, or has not been laid out yet).
   */
  private measureItemBox(): number {
    const root = this.el.nativeElement as HTMLElement;
    const item = root.querySelector(
      ".tedi-time-picker__item",
    ) as HTMLElement | null;
    return item?.offsetHeight ?? 0;
  }

  private measureItemHeight(): number {
    return this.measureItemBox() || DEFAULT_ITEM_HEIGHT;
  }

  private getItemHeight(): number {
    return this.cachedItemHeight ?? this.measureItemHeight();
  }

  /**
   * Column offsets are derived from the item height, so when the height changes
   * (a breakpoint switch, or the first real measurement after
   * `DEFAULT_ITEM_HEIGHT` stood in) they no longer land on the highlighted row.
   */
  private syncItemHeight(): void {
    // A hidden element measures 0 and ResizeObserver fires for it, so keep the
    // last height actually rendered rather than caching the fallback.
    const height = this.measureItemBox();
    if (!height || height === this.cachedItemHeight) return;

    this.cachedItemHeight = height;
    if (this.variant() !== "scroll") return;

    this.scrollColumnToIndex("hour", this.hourScrollIndex(), "instant");
    this.scrollColumnToIndex("minute", this.minuteScrollIndex(), "instant");
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    const host = this.el.nativeElement as HTMLElement;
    USER_GESTURE_EVENTS.forEach((name) => {
      host.removeEventListener(
        name,
        this.handleUserGesture,
        USER_GESTURE_OPTIONS,
      );
    });
    (Object.keys(this.scrollLockTimer) as WheelType[]).forEach((k) => {
      const t = this.scrollLockTimer[k];
      if (t) clearTimeout(t);
    });
    (Object.keys(this.scrollDebounceTimer) as WheelType[]).forEach((k) => {
      const t = this.scrollDebounceTimer[k];
      if (t) clearTimeout(t);
    });
    (Object.keys(this.gestureTimer) as WheelType[]).forEach((k) => {
      const t = this.gestureTimer[k];
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
    // The pointer went down to pick a row, not to scroll the column.
    this.hasUserGesture.hour = false;
    this.clearGestureTimer("hour");
    const idx = parseInt(hour, 10);
    this.scrollColumnToIndex("hour", idx, "smooth");
    this.selectHour(hour);
    this.focusOtherColumn("hour");
  }

  onMinuteClick(minute: string): void {
    if (this.isDisabled()) return;
    this.hasUserGesture.minute = false;
    this.clearGestureTimer("minute");
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

  private readonly handleUserGesture = (event: Event): void => {
    const target = event.target as Element | null;
    const column = target?.closest?.(".tedi-time-picker__column") ?? null;
    if (!column) return;

    let type: WheelType | null = null;
    if (column === this.getColumnElement("hour")) type = "hour";
    if (column === this.getColumnElement("minute")) type = "minute";
    if (!type) return;

    this.hasUserGesture[type] = true;
    this.hasCorrectedScroll[type] = false;
    this.armGestureTimer(type);
  };

  /**
   * Bounds a gesture that never scrolls. Without it one pointer-down on a
   * column's padding would leave it marked user-driven forever, and the next
   * offset the engine handed it would be committed as a value.
   */
  private armGestureTimer(type: WheelType): void {
    this.clearGestureTimer(type);
    this.gestureTimer[type] = setTimeout(() => {
      this.hasUserGesture[type] = false;
      delete this.gestureTimer[type];
    }, GESTURE_WITHOUT_SCROLL_MS);
  }

  private clearGestureTimer(type: WheelType): void {
    const existing = this.gestureTimer[type];
    if (existing) clearTimeout(existing);
    delete this.gestureTimer[type];
  }

  /**
   * Precedence, highest first: a gesture on this column (the offset is the
   * user's, and it takes over any animation still running), a programmatic
   * scroll (its own echo, never re-read as a selection), or neither, which
   * means the engine moved it and the column goes back on the value's row.
   */
  onColumnScroll(type: WheelType): void {
    const column = this.getColumnElement(type);
    if (!column) return;

    if (this.hasUserGesture[type]) {
      // The debounce owns the flag from here, not the no-scroll timeout.
      this.clearGestureTimer(type);
      this.clearProgrammaticScroll(type);
      this.setScrollIndex(type, this.indexFromScroll(type, column));
      this.scheduleScrollSelection(type);
      return;
    }

    if (this.isProgrammaticScroll[type]) {
      // Keep the lock open for as long as events keep arriving, so a column
      // that is still settling (a snap adjustment on top of the scroll, a slow
      // frame) stays owned by the scroll that started it.
      this.releaseScrollLockAfter(type, SCROLL_SETTLE_QUIET_MS);

      // A non-smooth programmatic scroll has already set the authoritative
      // index. Re-deriving it from scrollTop would move the highlight to a
      // neighbouring row whenever the measured item height and the rendered one
      // disagree. Smooth ones fall through: their highlight tracks the running
      // animation.
      if (this.isSmoothProgrammaticScroll[type]) {
        this.setScrollIndex(type, this.indexFromScroll(type, column));
        return;
      }

      // A snap adjustment settles on the row next to the offset it was given,
      // so anything further out is not this scroll finishing.
      const target = this.programmaticScrollTarget[type] ?? column.scrollTop;
      if (Math.abs(column.scrollTop - target) <= this.getItemHeight()) return;
    }

    this.restoreColumnPosition(type);
  }

  private indexFromScroll(type: WheelType, column: HTMLElement): number {
    const list = type === "hour" ? this.hours : this.minutes();
    const rawIndex = Math.round(column.scrollTop / this.getItemHeight());
    return Math.max(0, Math.min(rawIndex, list.length - 1));
  }

  private setScrollIndex(type: WheelType, index: number): void {
    if (type === "hour") this.hourScrollIndex.set(index);
    else this.minuteScrollIndex.set(index);
  }

  private scheduleScrollSelection(type: WheelType): void {
    const existing = this.scrollDebounceTimer[type];
    if (existing) clearTimeout(existing);

    this.scrollDebounceTimer[type] = setTimeout(() => {
      delete this.scrollDebounceTimer[type];

      this.hasUserGesture[type] = false;
      this.clearGestureTimer(type);

      const column = this.getColumnElement(type);
      if (!column) return;

      const list = type === "hour" ? this.hours : this.minutes();
      const index = this.indexFromScroll(type, column);

      if (type === "hour") this.selectHour(list[index]);
      else this.selectMinute(list[index]);
    }, SCROLL_DEBOUNCE_MS);
  }

  /**
   * Gecko hands a torn-down scroll container's offset to the one replacing it
   * in the same position, so a picker can arrive already scrolled to the
   * previous picker's row. Nothing marks that as not-the-user, which is how
   * `09:30` came to render and report `14:06`.
   */
  private restoreColumnPosition(type: WheelType): void {
    if (this.hasCorrectedScroll[type]) return;

    const index =
      type === "hour" ? this.selectedHourIndex() : this.selectedMinuteIndex();
    // Only a correction that moved the column spends the one-shot budget.
    if (this.scrollColumnToIndex(type, index, "instant")) {
      this.hasCorrectedScroll[type] = true;
    }
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

    // A fresh alignment is a fresh start for the correction guard.
    this.hasCorrectedScroll.hour = false;
    this.hasCorrectedScroll.minute = false;

    if (behavior !== "smooth") {
      this.hourScrollIndex.set(targetHour);
      this.minuteScrollIndex.set(targetMinute);
    }

    // Only a smooth scroll is worth protecting from a realignment: it is still
    // animating towards the value that started it, and an instant scrollTo to
    // the same row would cut that animation short. An instant scroll has
    // already arrived, so a new value must be allowed to move the column even
    // while the column is settling.
    if (!this.isSmoothProgrammaticScroll.hour) {
      this.scrollColumnToIndex("hour", targetHour, behavior);
    }
    if (!this.isSmoothProgrammaticScroll.minute) {
      this.scrollColumnToIndex("minute", targetMinute, behavior);
    }
  }

  /** Returns whether a scroll was actually issued. */
  private scrollColumnToIndex(
    type: WheelType,
    index: number,
    behavior: ScrollBehavior = "auto",
  ): boolean {
    const column = this.getColumnElement(type);
    if (!column) return false;

    const target = index * this.getItemHeight();

    if (behavior !== "smooth") {
      if (type === "hour") this.hourScrollIndex.set(index);
      else this.minuteScrollIndex.set(index);
    }

    if (Math.abs(column.scrollTop - target) < 1) return false;

    this.isProgrammaticScroll[type] = true;
    this.isSmoothProgrammaticScroll[type] = behavior === "smooth";
    this.programmaticScrollTarget[type] = target;

    if (typeof column.scrollTo === "function") {
      column.scrollTo({ top: target, behavior });
    } else {
      column.scrollTop = target;
    }

    this.scrollLockDeadline[type] = Date.now() + SCROLL_SETTLE_MAX_WAIT_MS;
    this.releaseScrollLockAfter(type, SCROLL_SETTLE_MAX_WAIT_MS);
    return true;
  }

  private releaseScrollLockAfter(type: WheelType, delay: number): void {
    const existing = this.scrollLockTimer[type];
    if (existing) clearTimeout(existing);

    const deadline = this.scrollLockDeadline[type];
    const wait =
      deadline === undefined
        ? delay
        : Math.max(0, Math.min(delay, deadline - Date.now()));

    this.scrollLockTimer[type] = setTimeout(() => {
      this.isProgrammaticScroll[type] = false;
      this.isSmoothProgrammaticScroll[type] = false;
      delete this.programmaticScrollTarget[type];
      delete this.scrollLockTimer[type];
      delete this.scrollLockDeadline[type];
    }, wait);
  }

  /** Drops every trace of a programmatic scroll, target offset included. */
  private clearProgrammaticScroll(type: WheelType): void {
    const existing = this.scrollLockTimer[type];
    if (existing) clearTimeout(existing);
    delete this.scrollLockTimer[type];
    delete this.scrollLockDeadline[type];
    this.isProgrammaticScroll[type] = false;
    this.isSmoothProgrammaticScroll[type] = false;
    delete this.programmaticScrollTarget[type];
  }
}
