import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
  model,
  output,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { IconComponent } from "../../../base/icon/icon.component";
import { TextComponent } from "../../../base/text/text.component";
import { CollapseButtonComponent } from "../../../buttons/collapse-button/collapse-button.component";
import { TediTranslationPipe } from "../../../../services/translation/translation.pipe";
import { generateUUID } from "../../../../helpers/generate-uuid";
import { VerticalStepperSubItemComponent } from "../vertical-stepper-sub-item/vertical-stepper-sub-item.component";

export type VerticalStepperItemState =
  "default" | "completed" | "error" | "disabled";

export type VerticalStepperLabelElement = "a" | "button" | "text";

@Component({
  selector: "tedi-vertical-stepper-item",
  imports: [
    NgTemplateOutlet,
    IconComponent,
    TextComponent,
    CollapseButtonComponent,
    TediTranslationPipe,
  ],
  templateUrl: "./vertical-stepper-item.component.html",
  styleUrl: "./vertical-stepper-item.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-vertical-stepper-item",
    "[class.tedi-vertical-stepper-item--default]": "state() === 'default'",
    "[class.tedi-vertical-stepper-item--completed]": "state() === 'completed'",
    "[class.tedi-vertical-stepper-item--error]": "state() === 'error'",
    "[class.tedi-vertical-stepper-item--disabled]": "state() === 'disabled'",
    "[class.tedi-vertical-stepper-item--current]": "current()",
    "[class.tedi-vertical-stepper-item--expanded]": "expanded()",
    "[class.tedi-vertical-stepper-item--numbered]":
      "_compact() && _showNumber()",
    role: "listitem",
    "[attr.aria-current]": "!interactive() && current() ? 'step' : null",
  },
})
export class VerticalStepperItemComponent {
  /**
   * Step label.
   */
  label = input.required<string>();
  /**
   * Secondary text below the label.
   */
  description = input<string>();
  /**
   * Progress state. Disabled labels render as text.
   * @default "default"
   */
  state = input<VerticalStepperItemState>("default");
  /**
   * Current step, independent of `state`. Sets `aria-current="step"`.
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
   * Anchors require `href`; disabled labels always render as text.
   */
  labelAs = input<VerticalStepperLabelElement>();
  /**
   * Expand directly projected sub-steps. Supports `[(open)]`.
   * @default false
   */
  open = model(false);

  /**
   * Emits when the label link or button is activated.
   */
  stepSelect = output<Event>();

  /** @internal Set by the parent stepper. */
  _stepNumber = signal(0);
  /** @internal Set by the parent stepper. */
  _compact = signal(false);
  /** @internal Set by the parent stepper. */
  _showNumber = signal(false);

  protected readonly subItems = contentChildren(
    VerticalStepperSubItemComponent,
    { descendants: false },
  );
  protected readonly subListId = `tedi-vertical-stepper-sub-list-${generateUUID()}`;

  protected readonly element = computed<VerticalStepperLabelElement>(() => {
    if (this.state() === "disabled") return "text";

    const requested =
      this.labelAs() ?? (this.href() !== undefined ? "a" : "text");
    if (requested === "a" && this.href() === undefined) return "text";

    return requested;
  });

  protected readonly interactive = computed(() => this.element() !== "text");
  protected readonly expandable = computed(() => this.subItems().length > 0);
  protected readonly expanded = computed(
    () => this.expandable() && this.open(),
  );

  protected onSelect(event: Event): void {
    this.stepSelect.emit(event);
  }
}
