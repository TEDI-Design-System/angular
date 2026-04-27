import { CommonModule, NgClass } from "@angular/common";
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
import { LinkComponent } from "../../../navigation/link/link.component";
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
    NgClass,
    IconComponent,
    TextComponent,
    LinkComponent,
    TediTranslationPipe,
  ],
  host: {
    "[class.tedi-accordion-item-header]": "true",
  },
})
export class AccordionItemHeaderComponent {
  private readonly item = inject(AccordionItemComponent);

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

  readonly headerId = this.item.headerId;
  readonly contentId = this.item.contentId;
  readonly expanded = this.item.expanded;

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

  readonly headerClasses = computed(() => {
    const customClass = this.headerClass();

    return {
      "tedi-accordion__header": true,
      ...(customClass ? { [customClass]: true } : {}),
      "tedi-accordion__header--hoverable": this.headerClickable(),
      "tedi-accordion__header--expanded": this.expanded(),
      "tedi-accordion__header--with-icon-card": this.item.showIconCard(),
    };
  });

  toggle() {
    this.item.toggle();
  }
}
