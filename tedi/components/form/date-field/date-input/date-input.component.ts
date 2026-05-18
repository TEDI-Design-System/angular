import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  effect,
  inject,
  input,
  output,
  viewChild,
  ViewEncapsulation,
} from "@angular/core";
import { IconComponent } from "../../../base/icon/icon.component";
import { TextFieldComponent } from "../../text-field/text-field.component";
import { TagComponent } from "../../../tags/tag/tag.component";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { DateFieldMode } from "../../../content/calendar/types";

export interface DateInputChip {
  id: string;
  label: string;
}

@Component({
  selector: "tedi-date-input",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [IconComponent, TextFieldComponent, TagComponent],
  templateUrl: "./date-input.component.html",
  styleUrl: "./date-input.component.scss",
  host: {
    class: "tedi-date-input",
    "[class.tedi-date-input--disabled]": "disabled()",
    "[class.tedi-date-input--readonly]": "readOnly()",
    "[class.tedi-date-input--with-chips]": "hasChips()",
  },
})
export class DateInputComponent {
  readonly inputId = input.required<string>();
  readonly value = input<string>("");
  readonly chips = input<readonly DateInputChip[]>([]);
  readonly mode = input<DateFieldMode>("single");
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
  readonly chipRemove = output<string>();
  readonly clear = output<void>();

  private readonly translationService = inject(TediTranslationService);

  private readonly inputElement = viewChild("inputElement", {
    read: ElementRef,
  });

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
  }

  readonly hasChips = computed(
    () => this.mode() === "multiple" && this.chips().length > 0,
  );

  readonly inputType = computed(() => (this.useNativePicker() ? "date" : "text"));

  readonly inputValue = computed(() =>
    this.useNativePicker() ? this.nativeIsoValue() : this.value(),
  );

  readonly showClear = computed(
    () =>
      this.clearable() &&
      !this.disabled() &&
      !this.readOnly() &&
      this.inputValue() !== "",
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

  handleChipRemove(id: string): void {
    if (this.disabled() || this.readOnly()) return;
    this.chipRemove.emit(id);
  }

  handleClear(): void {
    if (this.disabled() || this.readOnly()) return;
    this.clear.emit();
  }
}
