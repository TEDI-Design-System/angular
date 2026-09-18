import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  ViewEncapsulation,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { IconComponent } from "../../../base/icon/icon.component";
import { TextComponent } from "../../../base/text/text.component";
import { TediTranslationPipe } from "../../../../services/translation/translation.pipe";
import type { VerticalStepperLabelElement } from "../vertical-stepper-item/vertical-stepper-item.component";

export type VerticalStepperSubItemState =
  "default" | "completed" | "error" | "disabled" | "informative";

@Component({
  selector: "tedi-vertical-stepper-sub-item",
  imports: [
    NgTemplateOutlet,
    IconComponent,
    TextComponent,
    TediTranslationPipe,
  ],
  templateUrl: "./vertical-stepper-sub-item.component.html",
  styleUrl: "./vertical-stepper-sub-item.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-vertical-stepper-sub-item",
    "[class.tedi-vertical-stepper-sub-item--default]": "state() === 'default'",
    "[class.tedi-vertical-stepper-sub-item--completed]":
      "state() === 'completed'",
    "[class.tedi-vertical-stepper-sub-item--error]": "state() === 'error'",
    "[class.tedi-vertical-stepper-sub-item--disabled]":
      "state() === 'disabled'",
    "[class.tedi-vertical-stepper-sub-item--informative]":
      "state() === 'informative'",
    "[class.tedi-vertical-stepper-sub-item--current]": "current()",
    role: "listitem",
    "[attr.aria-current]": "!interactive() && current() ? 'step' : null",
  },
})
export class VerticalStepperSubItemComponent {
  /**
   * Sub-step label.
   */
  label = input.required<string>();
  /**
   * Progress state. Disabled and informative labels render as text.
   * Use `informative` for steps completed by someone else, such as an official.
   * @default "default"
   */
  state = input<VerticalStepperSubItemState>("default");
  /**
   * Current sub-step, independent of `state`. Sets `aria-current="step"`.
   * @default false
   */
  current = input(false, { transform: booleanAttribute });
  /**
   * Label link destination. See `labelAs` for element overrides.
   */
  href = input<string>();
  /**
   * Label element. Defaults to an anchor with `href`, otherwise text.
   * Use `"button"` with `stepSelect` to handle navigation.
   * Anchors require `href`; disabled and informative labels always render as text.
   */
  labelAs = input<VerticalStepperLabelElement>();

  /**
   * Emits when the label link or button is activated.
   */
  stepSelect = output<Event>();

  protected readonly element = computed<VerticalStepperLabelElement>(() => {
    const state = this.state();
    if (state === "disabled" || state === "informative") return "text";

    const requested =
      this.labelAs() ?? (this.href() !== undefined ? "a" : "text");
    if (requested === "a" && this.href() === undefined) return "text";

    return requested;
  });

  protected readonly interactive = computed(() => this.element() !== "text");

  protected onSelect(event: Event): void {
    this.stepSelect.emit(event);
  }
}
