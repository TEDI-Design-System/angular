import { NgClass } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { AccordionItemComponent } from "../accordion-item/accordion-item.component";

@Component({
  selector: "tedi-accordion-item-content",
  standalone: true,
  templateUrl: "./accordion-item-content.component.html",
  styleUrl: "./accordion-item-content.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  host: {
    "[class.tedi-accordion-item-content]": "true",
  },
})
export class AccordionItemContentComponent {
  private readonly item = inject(AccordionItemComponent);

  /**
   * Custom CSS classes for the accordion content.
   */
  contentClass = input<string | null>(null);

  readonly headerId = this.item.headerId;
  readonly contentId = this.item.contentId;
  readonly expanded = this.item.expanded;

  readonly contentClasses = computed(() => {
    const customClass = this.contentClass();
    return {
      "tedi-accordion__content": true,
      ...(customClass ? { [customClass]: true } : {}),
      "tedi-accordion__content--with-icon-card": this.item.showIconCard(),
    };
  });
}
