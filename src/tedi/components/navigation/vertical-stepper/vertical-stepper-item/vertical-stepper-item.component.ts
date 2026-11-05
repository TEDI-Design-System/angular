import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  ViewEncapsulation,
} from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { NgTemplateOutlet } from "@angular/common";
import { IconComponent } from "../../../base/icon/icon.component";
import { TextComponent } from "../../../base/text/text.component";
import { CollapseButtonComponent } from "../../../buttons/collapse-button/collapse-button.component";
import { TediTranslationPipe } from "../../../../services/translation/translation.pipe";
import { generateUUID } from "../../../../helpers/generate-uuid";
import {
  VerticalStepNumberComponent,
  VerticalStepNumberType,
} from "../vertical-step-number/vertical-step-number.component";

@Component({
  selector: "tedi-vertical-stepper-item",
  imports: [
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    IconComponent,
    TextComponent,
    CollapseButtonComponent,
    TediTranslationPipe,
    VerticalStepNumberComponent,
  ],
  templateUrl: "./vertical-stepper-item.component.html",
  styleUrl: "./vertical-stepper-item.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-vertical-stepper-item",
    "[class.tedi-vertical-stepper-item--default]":
      "progressState() === 'default'",
    "[class.tedi-vertical-stepper-item--completed]":
      "progressState() === 'completed'",
    "[class.tedi-vertical-stepper-item--error]": "progressState() === 'error'",
    "[class.tedi-vertical-stepper-item--disabled]": "disabled()",
    "[class.tedi-vertical-stepper-item--selected]": "selected()",
    "[class.tedi-vertical-stepper-item--sub-item]": "isSubItem",
    "[class.tedi-vertical-stepper-item--informative]": "informative()",
    "[class.tedi-vertical-stepper-item--expanded]": "expanded()",
    "[class.tedi-vertical-stepper-item--numbered]":
      "!isSubItem && _compact() && _enumerated()",
    role: "listitem",
    // A static `title` attribute would otherwise show a native tooltip over the whole step.
    "[attr.title]": "null",
    "[attr.aria-disabled]": "disabled() ? true : null",
    "[attr.aria-current]": "!interactive() && selected() ? 'step' : null",
  },
})
export class VerticalStepperItemComponent {
  /**
   * Step title. Also names the sub-step toggle when `[item-title]` replaces the label.
   */
  title = input.required<string>();
  /**
   * Completed progress state, independent of `disabled` and `selected`.
   * Takes precedence over `error`.
   * @default false
   */
  completed = input(false, { transform: booleanAttribute });
  /**
   * Error progress state, independent of `disabled` and `selected`.
   * @default false
   */
  error = input(false, { transform: booleanAttribute });
  /**
   * Current step. Sets `aria-current="step"`. Selecting a nested item opens its parent.
   * @default false
   */
  selected = input(false, { transform: booleanAttribute });
  /**
   * Render the label as text without discarding completed/error status.
   * @default false
   */
  disabled = input(false, { transform: booleanAttribute });
  /**
   * Non-interactive, secondary text treatment, e.g. for steps filled in by an official.
   * @default false
   */
  informative = input(false, { transform: booleanAttribute });
  /**
   * Angular `RouterLink` destination. Renders the label as a link.
   */
  route = input<RouterLink["routerLink"]>();
  /**
   * Expand the directly projected nested items. Supports `[(opened)]`.
   * @default false
   */
  opened = model(false);

  /**
   * Emits when a label button is activated, or when `route` becomes active,
   * including programmatic navigation.
   */
  itemSelect = output<void>();

  /** @internal Set by the parent stepper. */
  _stepNumber = signal(0);
  /** @internal Set by the parent stepper. */
  _compact = signal(false);
  /** @internal Set by the parent stepper. */
  _enumerated = signal(false);

  protected readonly isSubItem = !!inject(VerticalStepperItemComponent, {
    optional: true,
    skipSelf: true,
  });
  protected readonly progressState = computed(() =>
    this.completed() ? "completed" : this.error() ? "error" : "default",
  );
  protected readonly stepNumberType = computed<VerticalStepNumberType>(() => {
    if (this.disabled() || this.informative()) return "disabled";
    if (this.selected()) return "selected";

    const progress = this.progressState();
    if (progress === "completed") return "success";
    if (progress === "error") return "danger";

    return "default";
  });
  protected readonly nestedItems = contentChildren(
    VerticalStepperItemComponent,
    { descendants: false },
  );
  protected readonly subListId = `tedi-vertical-stepper-sub-list-${generateUUID()}`;
  protected readonly statusId = `${this.subListId}-status`;

  protected readonly expandable = computed(() => this.nestedItems().length > 0);
  protected readonly expanded = computed(
    () => this.expandable() && this.opened(),
  );
  /** A parent without a route is expanded by its toggle, so its label stays text. */
  protected readonly element = computed<"a" | "button" | "text">(() => {
    if (this.disabled() || this.informative()) return "text";
    if (this.route() != null) return "a";
    return this.expandable() ? "text" : "button";
  });
  protected readonly interactive = computed(() => this.element() !== "text");

  private readonly expandSelectedChild = effect(() => {
    if (this.nestedItems().some((item) => item.selected())) {
      untracked(() => this.opened.set(true));
    }
  });

  protected onRouteActiveChange(active: boolean): void {
    if (active) this.itemSelect.emit();
  }
}
