import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { IconComponent } from "../../../base/icon/icon.component";
import { TextComponent } from "../../../base/text/text.component";
import { CollapseButtonComponent } from "../../../buttons/collapse-button/collapse-button.component";
import { TediTranslationPipe } from "../../../../services/translation/translation.pipe";
import { AccordionItemComponent } from "../accordion-item/accordion-item.component";

@Component({
  selector: "tedi-accordion-item-header",
  standalone: true,
  templateUrl: "./accordion-item-header.component.html",
  styleUrl: "./accordion-item-header.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IconComponent,
    TextComponent,
    CollapseButtonComponent,
    TediTranslationPipe,
  ],
  host: {
    "[class.tedi-accordion-item-header]": "true",
    "[class.tedi-accordion-item-header--hoverable]":
      "headerClickable() && !item.disabled()",
    "[class.tedi-accordion-item-header--expanded]": "expanded()",
    "[class.tedi-accordion-item-header--with-icon-card]":
      "item.showIconCard()",
    "[class.tedi-accordion-item-header--disabled]": "item.disabled()",
    "[class]": "headerClass() ?? ''",
  },
})
export class AccordionItemHeaderComponent {
  protected readonly item = inject(AccordionItemComponent);

  /**
   * If false, disables header toggling and enables using interactive elements in the accordion header.
   */
  headerClickable = input(true);
  /**
   * Sets how the accordion title stretches horizontally.
   * `hug` - container sizes to its content.
   * `fill` - container expands to available space, moving any trailing elements to the end.
   */
  titleLayout = input<"hug" | "fill">("hug");
  /** Label shown when accordion is collapsed */
  openLabel = input<string>("open");
  /** Label shown when accordion is expanded */
  closeLabel = input<string>("close");
  /**
   * Controls whether the expand/collapse label is shown.
   */
  showExpandLabel = input(true);
  /**
   * Controls whether the default expand/collapse action is shown.
   */
  showDefaultExpandAction = input(true);
  /**
   * Position of the expand action relative to the header content.
   */
  expandActionPosition = input<"start" | "end">("end");
  /**
   * Custom CSS classes for the accordion header.
   */
  headerClass = input<string | null>(null);
  /**
   * When set, wraps the header trigger in a semantic `<h1>`–`<h6>` element
   * following the WAI-ARIA Accordion Pattern. Improves accessibility for
   * documents with a heading hierarchy (FAQ pages, docs). The wrapper uses
   * `display: contents` so it doesn't affect the visual layout — it only adds
   * semantic information for assistive technologies and TOC tools.
   */
  headingLevel = input<1 | 2 | 3 | 4 | 5 | 6 | undefined>(undefined);

  readonly headerId = this.item.headerId;
  readonly contentId = this.item.contentId;
  readonly expanded = this.item.expanded;
  readonly disabled = computed(() => this.item.disabled());

  readonly expandLabel = computed(() =>
    this.expanded() ? this.closeLabel() : this.openLabel(),
  );

  readonly showStartExpandAction = computed(
    () =>
      this.showDefaultExpandAction() && this.expandActionPosition() === "start",
  );

  readonly showEndExpandAction = computed(
    () =>
      this.showDefaultExpandAction() && this.expandActionPosition() === "end",
  );

  toggle() {
    this.item.toggle();
  }
}
