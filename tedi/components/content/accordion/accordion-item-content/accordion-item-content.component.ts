import {
  ChangeDetectionStrategy,
  Component,
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
  imports: [],
  host: {
    "[class.tedi-accordion-item-content]": "true",
    "[class.tedi-accordion-item-content--with-icon-card]": "item.showIconCard()",
    "[class]": "contentClass() ?? ''",
    "[id]": "contentId",
    "[attr.role]": "expanded() ? 'region' : null",
    "[attr.aria-labelledby]": "headerId",
    "[attr.aria-hidden]": "!expanded()",
    "[attr.inert]": "!expanded() ? '' : null",
  },
})
export class AccordionItemContentComponent {
  protected readonly item = inject(AccordionItemComponent);

  /**
   * Custom CSS classes for the accordion content.
   */
  contentClass = input<string | null>(null);

  readonly headerId = this.item.headerId;
  readonly contentId = this.item.contentId;
  readonly expanded = this.item.expanded;
}
