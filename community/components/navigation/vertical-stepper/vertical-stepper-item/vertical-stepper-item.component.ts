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
import { VerticalStepperComponent } from "../vertical-stepper.component";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { NgTemplateOutlet } from "@angular/common";
import {
  IconComponent,
  TediTranslationPipe,
} from "@tedi-design-system/angular/tedi";

@Component({
  selector: "tedi-vertical-stepper-item",
  imports: [
    IconComponent,
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet,
    TediTranslationPipe,
  ],
  templateUrl: "./vertical-stepper-item.component.html",
  styleUrl: "./vertical-stepper-item.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class.tedi-vertical-stepper-item]": "true",
    "[class.tedi-vertical-stepper-item--completed]": "completed()",
    "[class.tedi-vertical-stepper-item--error]": "error()",
    "[class.tedi-vertical-stepper-item--selected]": "selected()",
    "[class.tedi-vertical-stepper-item--disabled]": "disabled()",
    "[class.tedi-vertical-stepper-item--informative]": "informative()",
    "[class.tedi-vertical-stepper-item--sub-item]": "subItem()",
    "[class.tedi-vertical-stepper-item--compact]": "compact()",
    "[class.tedi-vertical-stepper-item--enumerated]": "enumerated()",
    "[attr.role]": "'treeitem'",
    "[attr.aria-selected]": "selected()",
  },
})
export class VerticalStepperItemComponent {
  completed = input(false, { transform: booleanAttribute });
  error = input(false, { transform: booleanAttribute });
  selected = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  informative = input(false, { transform: booleanAttribute });
  title = input.required<string>();
  route = input<RouterLink["routerLink"]>(undefined);
  opened = model<boolean>(false); // for items with children

  itemSelect = output();

  private stepperContext = inject(VerticalStepperComponent, { optional: true });
  subItem = signal<boolean>(false);
  subItems = contentChildren(VerticalStepperItemComponent);
  compact = computed(() => this.stepperContext?.compact());
  enumerated = computed(() => this.stepperContext?.enumerated());
  hasSubItems = computed(() => !!this.subItems().length);

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

  routerLinkActiveChange(isActive: boolean) {
    if (isActive) {
      this.itemSelect.emit();
    }
  }
}
