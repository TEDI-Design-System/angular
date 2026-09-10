import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  ViewEncapsulation,
} from "@angular/core";
import { CardComponent } from "../../card/card.component";
import { _IdGenerator } from "@angular/cdk/a11y";

@Component({
  selector: "tedi-accordion-item",
  standalone: true,
  imports: [CardComponent],
  templateUrl: "./accordion-item.component.html",
  styleUrl: "./accordion-item.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.tedi-accordion-item]": "true",
  },
})
export class AccordionItemComponent {
  /**
   * Accordion item id
   */
  id = input<string>();
  /**
   * Whether accordion item is selected
   */
  selected = input<boolean>(false);

  opened = model<boolean>(false);

  private idGenerator = inject(_IdGenerator);

  private itemId = computed(
    () => this.id() || this.idGenerator.getId("accordion"),
  );

  headerId = computed(() => {
    return `tedi-accordion-header-${this.itemId()}`;
  });
  contentId = computed(() => {
    return `tedi-accordion-content-${this.itemId()}`;
  });

  open() {
    this.opened.set(true);
  }

  close() {
    this.opened.set(false);
  }

  toggle() {
    this.opened.update((wasOpened) => !wasOpened);
  }
}
