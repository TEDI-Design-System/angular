import { CdkOverlayOrigin, OverlayModule } from "@angular/cdk/overlay";
import { CdkListbox, CdkListboxModule } from "@angular/cdk/listbox";
import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
  viewChild,
  ViewEncapsulation,
  forwardRef,
  computed,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import {
  InputComponent,
  InputSize,
  InputState,
} from "../input/input.component";
import { DropdownItemComponent } from "../../../components/overlay";
import { SelectOptionComponent } from "./select-option.component";
import { CommonModule } from "@angular/common";
import {
  ClosingButtonComponent,
  ComponentInputs,
  FeedbackTextComponent,
  IconComponent,
  LabelComponent,
  TediTranslationPipe,
  TextComponent,
} from "@tedi-design-system/angular/tedi";
import { CardComponent, CardContentComponent } from "../../../components/cards";

@Component({
  selector: "tedi-select",
  imports: [
    CommonModule,
    OverlayModule,
    CdkListboxModule,
    InputComponent,
    CardComponent,
    CardContentComponent,
    DropdownItemComponent,
    ClosingButtonComponent,
    IconComponent,
    LabelComponent,
    FeedbackTextComponent,
    TextComponent,
    TediTranslationPipe,
  ],
  templateUrl: "./select.component.html",
  styleUrl: "./select.component.scss",
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-select",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent
  implements AfterContentChecked, ControlValueAccessor
{
  /**
   * The id of the select input (for label association).
   * @default ""
   */
  inputId = input.required<string>();
  /**
   * The label for the select input.
   * @default ""
   */
  label = input<string>();
  /**
   * Should show label as required?
   * @default false
   */
  required = input<boolean>(false);
  /**
   * The placeholder text to display when no option is selected.
   * @default ""
   */
  placeholder = input<string>("");
  /**
   * The state of the input.
   * @default "default"
   */
  state = input<InputState>("default");
  /**
   * The size of the input.
   * @default "default"
   */
  size = input<InputSize>("default");
  /**
   * Whether the clear button will be shown when an option is selected.
   * @default false
   */
  clearable = input<boolean>(true);
  /**
   * Optional element reference to calculate dropdown width from.
   * If provided but null, dropdown will use auto width.
   * If not provided, defaults to the host element width.
   * @default undefined
   */
  dropdownWidthRef = input<ElementRef | null>();
  feedbackText = input<ComponentInputs<FeedbackTextComponent>>();

  isOpen = signal(false);
  selectedOptions = signal<readonly string[]>([]);
  listboxRef = viewChild(CdkListbox, { read: ElementRef });
  triggerRef = viewChild(CdkOverlayOrigin, { read: ElementRef });
  hostRef = inject(ElementRef);
  options = contentChildren(SelectOptionComponent);
  dropdownWidth = signal<number | null>(null);
  disabled = signal(false);

  optionGroups = computed(() => {
    const groups: { label: string; options: SelectOptionComponent[] }[] = [];
    this.options().forEach((option) => {
      const group = groups.find((g) => g.label === option.group());
      if (group) {
        group.options.push(option);
      } else {
        groups.push({ label: option.group() ?? "", options: [option] });
      }
    });
    return groups;
  });

  ngAfterContentChecked(): void {
    this.setDropdownWidth();
  }

  @HostListener("window:resize")
  onWindowResize() {
    this.setDropdownWidth();
  }

  toggleIsOpen(value?: boolean): void {
    if (this.disabled()) return;

    if (value === undefined) {
      this.isOpen.update((previousValue) => !previousValue);
    } else if (value === false) {
      this.isOpen.set(value);
      this.focusTrigger();
    }
  }

  handleValueChange(event: { value: readonly string[] }): void {
    const selected = event.value[0] ?? null;
    this.selectedOptions.set(selected ? [selected] : []);
    this.onChange(selected);
    this.onTouched();
    this.toggleIsOpen(false);
  }

  clear(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.selectedOptions.set([]);
    this.onChange(null);
    this.onTouched();
  }

  focusListboxWhenVisible = effect(() => {
    if (this.listboxRef()) this.listboxRef()?.nativeElement.focus();
  });

  focusTrigger(): void {
    this.triggerRef()?.nativeElement.focus();
  }

  isOptionSelected(option: string): boolean {
    return this.selectedOptions().includes(option);
  }

  selectedLabels = computed(() => {
    return this.options()
      .filter((option) => this.isOptionSelected(option.value()))
      .map((option) => option.label());
  });

  private setDropdownWidth(): void {
    const widthRef = this.dropdownWidthRef();
    if (widthRef === null) {
      this.dropdownWidth.set(null);
      return;
    }

    const element = widthRef?.nativeElement ?? this.hostRef?.nativeElement;
    const computedWidth = element?.getBoundingClientRect()?.width ?? 0;
    this.dropdownWidth.set(computedWidth);
  }

  // ControlValueAccessor implementation
  onChange: (value: string | null) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.selectedOptions.set(value ? [value] : []);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
