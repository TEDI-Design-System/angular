import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  ElementRef,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import {
  BreakpointInputs,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";
import { LabelComponent } from "../../../components/form";
import { TextGroupLabelComponent } from "./text-group-label.component";

export type TextGroupType = "vertical" | "horizontal";

export type TextGroupInputs = {
  /**
   * Type of text group layout
   * @default horizontal
   */
  type: TextGroupType;
  /**
   * Width for the label (e.g., '200px', '30%', etc.)
   */
  labelWidth: string | undefined;
};
@Component({
  standalone: true,
  selector: "tedi-text-group",
  templateUrl: "./text-group.component.html",
  styleUrl: "./text-group.component.scss",
  imports: [LabelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TextGroupComponent
  implements BreakpointInputs<TextGroupInputs>, AfterContentChecked
{
  type = input<TextGroupType>("horizontal");
  labelWidth = input<string>();
  breakpointService = inject(BreakpointService);

  readonly textGroupLabel = contentChild(TextGroupLabelComponent, {
    read: ElementRef,
  });
  readonly labelText = signal<string | null>(null);

  xs = input<TextGroupInputs>();
  sm = input<TextGroupInputs>();
  md = input<TextGroupInputs>();
  lg = input<TextGroupInputs>();
  xl = input<TextGroupInputs>();
  xxl = input<TextGroupInputs>();

  breakpointInputs = computed(() => {
    return this.breakpointService.getBreakpointInputs<TextGroupInputs>({
      type: this.type(),
      labelWidth: this.labelWidth(),

      xs: this.xs(),
      sm: this.sm(),
      md: this.md(),
      lg: this.lg(),
      xl: this.xl(),
      xxl: this.xxl(),
    });
  });

  classes = computed(() => {
    const classList = [
      "tedi-text-group",
      `tedi-text-group--${this.breakpointInputs().type}`,
    ];
    return classList.join(" ");
  });

  ngAfterContentChecked(): void {
    const labelEl = this.textGroupLabel()?.nativeElement as HTMLElement;
    if (labelEl) {
      const text = labelEl.textContent?.trim() || null;
      if (text !== this.labelText()) {
        this.labelText.set(text);
      }
    }
  }
}
