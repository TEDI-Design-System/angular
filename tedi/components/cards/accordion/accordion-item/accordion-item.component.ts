import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  OnInit,
  computed,
  model,
  inject,
} from "@angular/core";
import {
  IconComponent,
  TextComponent,
  LinkComponent,
  generateUUID,
  TediTranslationPipe,
} from "@tedi-design-system/angular/tedi";
import { AccordionComponent } from "../accordion/accordion.component";
import { NgClass } from "@angular/common";

@Component({
  selector: "tedi-accordion-item",
  standalone: true,
  templateUrl: "./accordion-item.component.html",
  styleUrl: "./accordion-item.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IconComponent,
    CommonModule,
    TextComponent,
    LinkComponent,
    TediTranslationPipe,
    NgClass,
  ],
})
export class AccordionItemComponent implements OnInit {
  /**
   * If false, disables header toggling and enables using interactive elements in the accordion header.
   */
  headerClickable = input(true);
  /** The title of the accordion item. */
  title = input("");
  /**
   * Sets how the accordion title stretches horizontally.
   * `hug` - container sizes to its content.
   * `fill` - container expands to available space, moving any trailing elements to the end.
   */
  titleLayout = input<"hug" | "fill">("hug");
  /**
   * Whether the title is rendered as separate text in the accordion header.
   * If false and `showExpandLabel` is true, the title is used as the expand button label.
   */
  showSeparateTitle = input(true);
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
   * Whether the accordion item is expanded initially.
   * Does not control the expanded state after initialization.
   */
  defaultExpanded = input(false);
  /** Optional description text shown in the header */
  description = input<string | undefined>(undefined);
  /**
   * Position of the description relative to the title.
   */
  descriptionPosition = input<"start" | "end" | "both">("start");
  /**
   * Enables the icon-card layout variant.
   */
  showIconCard = input(false);
  /**
   * Marks the accordion item as selected.
   */
  selected = input(false);
  /**
   * Custom CSS classes for the accordion header.
   */
  headerClass = input<string | null>(null);
  /**
   * Custom CSS classes for the accordion body.
   */
  bodyClass = input<string | null>(null);

  expanded = model(false);

  readonly bodyId = `tedi-accordion-body-${generateUUID()}`;
  readonly headerId = `tedi-accordion-header-${generateUUID()}`;

  private readonly accordion = inject(AccordionComponent, { optional: true });

  ngOnInit() {
    this.setExpanded(this.defaultExpanded());
  }

  toggle() {
    this.setExpanded(!this.expanded());
    this.accordion?.onItemToggled(this);
  }

  setExpanded(value: boolean) {
    this.expanded.set(value);
  }

  expandLabel = computed(() =>
    this.expanded() ? this.closeLabel() : this.openLabel(),
  );

  showStartExpandAction = computed(
    () =>
      this.showDefaultExpandAction() && this.expandActionPosition() === "start",
  );

  showEndExpandAction = computed(
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
      "tedi-accordion__header--with-icon-card": this.showIconCard(),
    };
  });

  readonly bodyClasses = computed(() => {
    const customClass = this.bodyClass();
    return {
      "tedi-accordion__body": true,
      ...(customClass ? { [customClass]: true } : {}),
      "tedi-accordion__body--with-icon-card": this.showIconCard(),
    };
  });
}
