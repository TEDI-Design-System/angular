import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IconComponent } from "../../base/icon/icon.component";

export type RatingVariant = "star" | "number" | "icon";

export interface RatingItem {
  icon: string;
  label?: string;
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
  readonly items = input<RatingItem[]>([]);
  readonly startLabel = input<string>();
  readonly endLabel = input<string>();
  readonly ariaLabel = input<string>();

  private formDisabled = signal(false);
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};
  private hostEl = inject(ElementRef);

  readonly isDisabled = computed(() => this.formDisabled());

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

  select(index: number): void {
    if (this.isDisabled()) return;
    const newValue = this.value() === index ? null : index;
    this.value.set(newValue);
    this.onChange(newValue);
    this.onTouched();
  }

  isStarFilled(index: number): boolean {
    const val = this.value();
    return val !== null && index <= val;
  }

  getTabIndex(index: number): number {
    if (this.isDisabled()) return -1;
    if (this.value() !== null) {
      return this.value() === index ? 0 : -1;
    }
    return index === 1 ? 0 : -1;
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

    if (nextIndex !== null) {
      this.focusItem(nextIndex);
    }
  }

  handleBlur(): void {
    this.onTouched();
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
