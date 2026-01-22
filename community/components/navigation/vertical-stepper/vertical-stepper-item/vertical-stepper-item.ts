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
  ViewEncapsulation,
} from "@angular/core";
import { VerticalStepperComponent } from "../vertical-stepper";
import { RouterLink } from "@angular/router";
import { NgTemplateOutlet } from "@angular/common";
import { IconComponent } from "@tedi-design-system/angular/tedi";

@Component({
  selector: "tedi-vertical-stepper-item",
  imports: [IconComponent, RouterLink, NgTemplateOutlet],
  templateUrl: "./vertical-stepper-item.html",
  styleUrl: "./vertical-stepper-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class.tedi-vertical-stepper-item]": "true",
    "[class.tedi-vertical-stepper-item--completed]": "completed()",
    "[class.tedi-vertical-stepper-item--error]": "error()",
    "[class.tedi-vertical-stepper-item--selected]": "selected()",
    "[class.tedi-vertical-stepper-item--disabled]": "disabled()",
    "[class.tedi-vertical-stepper-item--sub-item]": "subItem()",
    "[class.tedi-vertical-stepper-item--compact]": "compact()",
    "[class.tedi-vertical-stepper-item--enumerated]": "enumerated()",
  },
})
export class VerticalStepperItemComponent {
  completed = input(false, { transform: booleanAttribute });
  error = input(false, { transform: booleanAttribute });
  selected = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  title = input.required<string>();
  link = input<RouterLink["routerLink"]>(undefined);
  opened = model<boolean>(false); // for items with children
  subItem = signal<boolean>(false);

  private stepperContext = inject(VerticalStepperComponent, { optional: true });
  subItems = contentChildren(VerticalStepperItemComponent);
  compact = computed(() => this.stepperContext?.compact());
  enumerated = computed(() => this.stepperContext?.compact());
  hasSubItems = computed(() => !!this.subItems().length);

  itemSelect = output();

  onSubItemSelect = effect(() => {
    const subItemSelected = this.subItems().some((item) => item.selected());
    if (subItemSelected) {
      this.opened.set(true);
    }
  });

  onSubItemChanges = effect(() => {
    this.subItems().forEach((item) => item.subItem.set(true));
  });

  toggleOpen() {
    this.opened.update((previouslyOpened) => !previouslyOpened);
  }
}
