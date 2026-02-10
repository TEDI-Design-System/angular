import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  QueryList,
  ViewEncapsulation,
  AfterContentInit,
  input,
} from "@angular/core";
import { AccordionItemComponent } from "../accordion-item/accordion-item.component";

@Component({
  selector: "tedi-accordion",
  standalone: true,
  template: "<ng-content />",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionComponent implements AfterContentInit {
  /**
   * Whether the accordion allows multiple items to be expanded at the same time.
   * If false, opening one item will collapse the others automatically.
   */
  multiple = input(false);

  @ContentChildren(AccordionItemComponent)
  items!: QueryList<AccordionItemComponent>;

  ngAfterContentInit() {
    this.items.forEach((item) => {
      item.toggled.subscribe(() => {
        this.onItemToggled(item);
      });
    });
  }

  private onItemToggled(activeItem: AccordionItemComponent) {
    const shouldExpand = !activeItem.expanded();

    this.items.forEach((item) => {
      if (item === activeItem) {
        item.setExpanded(shouldExpand);
      } else if (!this.multiple()) {
        item.setExpanded(false);
      }
    });
  }
}
