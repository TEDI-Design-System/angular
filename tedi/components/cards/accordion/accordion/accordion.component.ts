import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  contentChildren,
} from "@angular/core";
import { AccordionItemComponent } from "../accordion-item/accordion-item.component";

@Component({
  selector: "tedi-accordion",
  standalone: true,
  template: "<ng-content />",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionComponent {
  /**
   * Whether the accordion allows multiple items to be expanded at the same time.
   * If false, opening one item will collapse the others automatically.
   */
  multiple = input(false);

  items = contentChildren(AccordionItemComponent);

  onItemToggled(activeItem: AccordionItemComponent) {
    if (this.multiple()) return;

    if (activeItem.expanded()) {
      this.items().forEach((item) => {
        if (item !== activeItem) {
          item.setExpanded(false);
        }
      });
    }
  }
}
