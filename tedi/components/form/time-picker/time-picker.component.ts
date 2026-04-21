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
  effect,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ScrollFadeComponent } from "../../helpers/scroll-fade/scroll-fade.component";
import { TediTranslationPipe } from "../../../services/translation/translation.pipe";

export type TimePickerVariant = "scroll" | "slots" | "dropdown";

@Component({
  selector: "tedi-time-picker",
  standalone: true,
  imports: [ScrollFadeComponent, TediTranslationPipe],
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
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePickerComponent),
      multi: true,
    },
  ],
})
export class TimePickerComponent implements ControlValueAccessor, AfterViewInit {
  readonly value = model<string | null>(null);
  readonly variant = input<TimePickerVariant>("scroll");
  readonly timeSlots = input<string[]>([]);
  readonly columns = input<number>(3);
  readonly minuteStep = input<number>(1);
  readonly disabled = input<boolean>(false);
  readonly trapFocus = input<boolean>(false);
  readonly closeRequested = output<void>();

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly formDisabled = signal(false);
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};
  private initialized = false;

  readonly hourColumns = viewChildren<ElementRef<HTMLElement>>("hourColumn");
  readonly minuteColumns = viewChildren<ElementRef<HTMLElement>>("minuteColumn");

  readonly selectedHour = computed(() => {
    const val = this.value();
    if (!val) return null;
    return parseInt(val.split(":")[0], 10);
  });

  readonly selectedMinute = computed(() => {
    const val = this.value();
    if (!val) return null;
    return parseInt(val.split(":")[1], 10);
  });

  readonly hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  );

  readonly minutes = computed(() =>
    Array.from(
      { length: Math.ceil(60 / this.minuteStep()) },
      (_, i) => String(i * this.minuteStep()).padStart(2, "0"),
    ),
  );

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly gridStyle = computed(() => `grid-template-columns: repeat(${this.columns()}, 1fr)`);

  constructor() {
    effect(() => {
      this.value();
      if (this.initialized) {
        this.scrollToSelected();
      }
    });
  }

  ngAfterViewInit(): void {
    this.initialized = true;
    requestAnimationFrame(() => this.scrollToSelected());
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
    this.value.set(newValue);
    this.onTouched();
    this.onChange(newValue);
    if (this.variant() === "scroll") {
      this.focusOtherColumn("hour");
    }
  }

  selectMinute(minute: string): void {
    if (this.isDisabled()) return;
    const hour = this.selectedHour();
    const hourStr = hour !== null ? String(hour).padStart(2, "0") : "00";
    const newValue = `${hourStr}:${minute}`;
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

  getTabIndex(type: "hour" | "minute", index: number): number {
    const selected = type === "hour" ? this.selectedHour() : this.selectedMinute();
    if (selected !== null) {
      if (type === "minute") {
        const step = this.minuteStep();
        return Math.floor(selected / step) === index ? 0 : -1;
      }
      return selected === index ? 0 : -1;
    }
    return index === 0 ? 0 : -1;
  }

  onColumnKeydown(event: KeyboardEvent, type: "hour" | "minute"): void {
    if (event.key === "Tab") {
      if (this.trapFocus()) {
        event.preventDefault();
        event.stopPropagation();
        this.focusOtherColumn(type);
      }
      return;
    }

    const target = event.target as HTMLElement;
    const items = Array.from(
      target.parentElement?.querySelectorAll<HTMLButtonElement>(
        ".tedi-time-picker__item",
      ) ?? [],
    );
    const currentIndex = items.indexOf(target as HTMLButtonElement);
    if (currentIndex === -1) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const label = items[currentIndex].textContent!.trim();
      if (type === "hour") {
        this.selectHour(label);
      } else {
        this.selectMinute(label);
      }
      return;
    }

    const nextIndex = this.getNextColumnIndex(
      event.key,
      currentIndex,
      items.length,
    );
    if (nextIndex === null) return;

    event.preventDefault();
    items[nextIndex].focus();
  }

  private getNextColumnIndex(
    key: string,
    currentIndex: number,
    length: number,
  ): number | null {
    switch (key) {
      case "ArrowDown":
        return (currentIndex + 1) % length;
      case "ArrowUp":
        return (currentIndex - 1 + length) % length;
      case "Home":
        return 0;
      case "End":
        return length - 1;
      case "PageDown":
        return Math.min(currentIndex + 5, length - 1);
      case "PageUp":
        return Math.max(currentIndex - 5, 0);
      default:
        return null;
    }
  }

  getSlotTabIndex(index: number): number {
    return this.getSelectedSlotTabIndex(index);
  }

  getDropdownTabIndex(index: number): number {
    return this.getSelectedSlotTabIndex(index);
  }

  onDropdownKeydown(event: KeyboardEvent): void {
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
      list.querySelectorAll<HTMLButtonElement>(".tedi-time-picker__dropdown-item"),
    );
    const currentIndex = items.indexOf(target as HTMLButtonElement);
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

  onSlotKeydown(event: KeyboardEvent): void {
    if (event.key === "Tab") {
      if (this.trapFocus()) {
        event.preventDefault();
        event.stopPropagation();
        this.closeRequested.emit();
      }
      return;
    }

    const target = event.target as HTMLElement;
    const grid = target.closest(".tedi-time-picker__grid");
    if (!grid) return;

    const slots = Array.from(
      grid.querySelectorAll<HTMLButtonElement>(".tedi-time-picker__slot"),
    );
    const currentIndex = slots.indexOf(target as HTMLButtonElement);
    if (currentIndex === -1) return;

    const cols = this.columns();
    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = Math.min(currentIndex + 1, slots.length - 1);
        break;
      case "ArrowLeft":
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case "ArrowDown":
        nextIndex = Math.min(currentIndex + cols, slots.length - 1);
        break;
      case "ArrowUp":
        nextIndex = Math.max(currentIndex - cols, 0);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        this.selectSlot(slots[currentIndex].textContent!.trim());
        return;
      default:
        return;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      slots[nextIndex].focus();
    }
  }

  private focusOtherColumn(currentType: "hour" | "minute"): void {
    const targetColumns =
      currentType === "hour" ? this.minuteColumns() : this.hourColumns();
    const column = targetColumns[0]?.nativeElement;
    if (!column) return;

    const items = column.querySelectorAll<HTMLButtonElement>(
      ".tedi-time-picker__item",
    );
    const focusable = Array.from(items).find(
      (item) => item.getAttribute("tabindex") === "0",
    );
    (focusable ?? items[0])?.focus();
  }

  scrollToSelected(): void {
    if (this.variant() !== "scroll") return;

    const hour = this.selectedHour();
    const minute = this.selectedMinute();

    if (hour !== null) {
      this.scrollColumnToIndex("hour", hour);
    }
    if (minute !== null) {
      const step = this.minuteStep();
      this.scrollColumnToIndex("minute", Math.floor(minute / step));
    }
  }

  focusActiveItem(): void {
    const variant = this.variant();
    let container: HTMLElement | undefined;
    let selector: string;

    if (variant === "scroll") {
      container = this.hourColumns()[0]?.nativeElement;
      selector = ".tedi-time-picker__item";
    } else if (variant === "dropdown") {
      container = this.el.nativeElement.querySelector(".tedi-time-picker__dropdown") ?? undefined;
      selector = ".tedi-time-picker__dropdown-item";
    } else if (variant === "slots") {
      container = this.el.nativeElement.querySelector(".tedi-time-picker__grid") ?? undefined;
      selector = ".tedi-time-picker__slot";
    } else {
      return;
    }

    if (!container) return;

    const items = container.querySelectorAll<HTMLButtonElement>(selector);
    const focusable = Array.from(items).find(
      (item) => item.getAttribute("tabindex") === "0",
    );
    (focusable ?? items[0])?.focus({ preventScroll: true });
  }

  /** @deprecated Use focusActiveItem() instead */
  focusHourColumn(): void {
    this.focusActiveItem();
  }

  private getSelectedSlotTabIndex(index: number): number {
    const slots = this.timeSlots();
    const selectedIndex = slots.indexOf(this.value() ?? "");
    if (selectedIndex !== -1) {
      return selectedIndex === index ? 0 : -1;
    }
    return index === 0 ? 0 : -1;
  }

  private scrollColumnToIndex(type: "hour" | "minute", index: number): void {
    const columns =
      type === "hour" ? this.hourColumns() : this.minuteColumns();
    const column = columns[0]?.nativeElement;
    if (!column) return;

    const items = column.querySelectorAll<HTMLElement>(
      ".tedi-time-picker__item",
    );
    const item = items[index];
    if (!item) return;

    const scrollContainer = column.closest(
      ".tedi-scroll-fade__inner",
    ) as HTMLElement | null;
    const container = scrollContainer ?? column;

    const offsetTop = item.offsetTop;
    const itemHeight = item.offsetHeight;
    const containerHeight = container.clientHeight;
    const scrollableHeight = container.scrollHeight;

    const centeredPosition =
      offsetTop - containerHeight / 2 + itemHeight / 2;
    const maxScrollTop = scrollableHeight - containerHeight;

    container.scrollTop = Math.max(
      0,
      Math.min(centeredPosition, maxScrollTop),
    );
  }
}
