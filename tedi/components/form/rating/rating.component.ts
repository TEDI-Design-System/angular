import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  isDevMode,
  model,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IconColor, IconComponent } from "../../base/icon/icon.component";

export type RatingVariant = "star" | "number" | "icon";

export type RatingPrecision = 1 | 0.5;

export interface RatingItem {
  icon: string;
  label?: string;
}

interface StarSegment {
  value: number;
  leftPercent: number;
  widthPercent: number;
}

interface StarBox {
  index: number;
  segments: StarSegment[];
}

@Component({
  selector: "tedi-rating",
  standalone: true,
  imports: [IconComponent],
  templateUrl: "./rating.component.html",
  styleUrl: "./rating.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "tedi-rating",
    "[class.tedi-rating--star]": "variant() === 'star'",
    "[class.tedi-rating--number]": "variant() === 'number'",
    "[class.tedi-rating--icon]": "variant() === 'icon'",
    "[class.tedi-rating--disabled]": "isDisabled()",
    role: "radiogroup",
    "[attr.aria-label]": "ariaLabel()",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingComponent),
      multi: true,
    },
  ],
})
export class RatingComponent implements ControlValueAccessor {
  readonly value = model<number | null>(null);
  readonly variant = input<RatingVariant>("star");
  readonly max = input<number>(5);
  readonly precision = input<RatingPrecision>(1);
  readonly icon = input<string>("kid_star");
  readonly color = input<IconColor>("brand");
  readonly items = input<RatingItem[]>([]);
  readonly startLabel = input<string>();
  readonly endLabel = input<string>();
  readonly ariaLabel = input<string>();

  constructor() {
    effect(() => {
      if (isDevMode() && this.variant() === "star" && this.precision() === 0.5) {
        console.warn(
          "[tedi-rating] precision=0.5 makes each half-star target roughly 12px wide, below the WCAG 2.5.8 (24×24px) minimum target size. Prefer precision=1 unless half-star input is essential.",
        );
      }
    });
  }

  private formDisabled = signal(false);
  private hoverValue = signal<number | null>(null);
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};
  private hostEl = inject(ElementRef);

  readonly isDisabled = computed(() => this.formDisabled());

  readonly effectivePrecision = computed(() => {
    if (this.variant() !== "star") return 1;
    return this.precision() === 0.5 ? 0.5 : 1;
  });

  readonly resolvedMax = computed(() => {
    if (this.variant() === "icon") {
      return this.items().length || this.max();
    }
    return this.max();
  });

  readonly indexedItems = computed(() =>
    Array.from({ length: this.resolvedMax() }, (_, i) => ({
      index: i + 1,
      item: this.items()[i],
    })),
  );

  readonly starGrid = computed<StarBox[]>(() => {
    const precision = this.effectivePrecision();
    const subCount = Math.round(1 / precision);
    return Array.from({ length: this.resolvedMax() }, (_, i) => {
      const index = i + 1;
      return {
        index,
        segments: Array.from({ length: subCount }, (_, k) => ({
          value: this.roundToPrecision(i + (k + 1) * precision),
          leftPercent: k * precision * 100,
          widthPercent: precision * 100,
        })),
      };
    });
  });

  private readonly displayValue = computed(
    () => this.hoverValue() ?? this.value(),
  );

  writeValue(value: number | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  select(value: number): void {
    if (this.isDisabled()) return;
    const newValue = this.value() === value ? null : value;
    this.value.set(newValue);
    this.onChange(newValue);
    this.onTouched();
  }

  getStarFill(starIndex: number): number {
    const display = this.displayValue();
    if (display === null) return 0;
    const fill = display - (starIndex - 1);
    return Math.max(0, Math.min(1, fill)) * 100;
  }

  isSegmentChecked(segmentValue: number): boolean {
    const val = this.value();
    return val !== null && segmentValue === this.roundToPrecision(val);
  }

  getSegmentTabIndex(segmentValue: number): number {
    if (this.isDisabled()) return -1;
    const val = this.value();
    if (val !== null) {
      return segmentValue === this.roundToPrecision(val) ? 0 : -1;
    }
    return segmentValue === this.effectivePrecision() ? 0 : -1;
  }

  getTabIndex(index: number): number {
    if (this.isDisabled()) return -1;
    if (this.value() !== null) {
      return this.value() === index ? 0 : -1;
    }
    return index === 1 ? 0 : -1;
  }

  setHover(value: number): void {
    if (this.isDisabled()) return;
    this.hoverValue.set(value);
  }

  clearHover(): void {
    this.hoverValue.set(null);
  }

  handleStarKeydown(event: KeyboardEvent, currentValue: number): void {
    const precision = this.effectivePrecision();
    const max = this.resolvedMax();
    let nextValue: number | null = null;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        nextValue =
          currentValue < max
            ? this.roundToPrecision(currentValue + precision)
            : precision;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        nextValue =
          currentValue > precision
            ? this.roundToPrecision(currentValue - precision)
            : max;
        break;
      case "Home":
        event.preventDefault();
        nextValue = precision;
        break;
      case "End":
        event.preventDefault();
        nextValue = max;
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        this.select(currentValue);
        return;
      default:
        return;
    }

    this.focusSegment(nextValue);
  }

  handleKeydown(event: KeyboardEvent, currentIndex: number): void {
    const max = this.resolvedMax();
    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        nextIndex = currentIndex < max ? currentIndex + 1 : 1;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        nextIndex = currentIndex > 1 ? currentIndex - 1 : max;
        break;
      case "Home":
        event.preventDefault();
        nextIndex = 1;
        break;
      case "End":
        event.preventDefault();
        nextIndex = max;
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        this.select(currentIndex);
        return;
      default:
        return;
    }

    this.focusItem(nextIndex);
  }

  handleBlur(): void {
    this.onTouched();
  }

  private roundToPrecision(value: number): number {
    const precision = this.effectivePrecision();
    const steps = Math.round(value / precision);
    return Number((steps * precision).toFixed(10));
  }

  private focusSegment(value: number): void {
    this.focusItem(Math.round(value / this.effectivePrecision()));
  }

  private focusItem(index: number): void {
    const buttons: NodeListOf<HTMLButtonElement> =
      this.hostEl.nativeElement.querySelectorAll('[role="radio"]');
    const button = buttons[index - 1];
    if (button) {
      button.focus();
    }
  }
}
