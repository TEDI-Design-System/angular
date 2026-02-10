import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
  signal,
  OnInit,
  computed,
} from "@angular/core";
import {
  IconComponent,
  TextComponent,
  LinkComponent,
  generateUUID,
  TediTranslationPipe,
} from "@tedi-design-system/angular/tedi";

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
  ],
})
export class AccordionItemComponent implements OnInit {
  title = input("");

  /** Optional description text shown in the header */
  description = input<string | undefined>(undefined);

  /**
   * Whether the accordion item is expanded initially.
   * Does not control the expanded state after initialization.
   */
  defaultExpanded = input(false);

  /**
   * Marks the accordion item as selected.
   * Used together with `withAction` to render selection UI.
   */
  selected = input(false);

  /**
   * Controls whether the expand/collapse label is shown.
   */
  showExpandLabel = input(true);

  /**
   * Uses the inverted color variant for the expand label.
   */
  expandLabelInverted = input(false);

  /** Label shown when accordion is collapsed */
  openLabel = input<string>("open");

  /** Label shown when accordion is expanded */
  closeLabel = input<string>("close");

  /**
   * Position of the expand icon relative to the header content.
   * Has no effect when `withAction` is true.
   */
  expandIconPosition = input<"start" | "end">("end");

  /**
   * Position of the description relative to the title.
   */
  descriptionPosition = input<"start" | "end" | "both">("start");

  /**
   * Enables the icon-card layout variant.
   */
  showIconCard = input(false);

  /**
   * Disables header toggling and enables action slot usage.
   */
  withAction = input(false);

  expanded = signal(false);

  toggled = output<void>();
  selectToggle = output<boolean>();

  readonly bodyId = `tedi-accordion-body-${generateUUID()}`;
  readonly headerId = `tedi-accordion-header-${generateUUID()}`;

  ngOnInit() {
    this.expanded.set(this.defaultExpanded());
  }

  toggle() {
    this.toggled.emit();
  }

  setExpanded(value: boolean) {
    this.expanded.set(value);
  }

  onSelectClick(event: MouseEvent) {
    event.stopPropagation();
    this.selectToggle.emit(!this.selected());
  }

  expandLabel = computed(() =>
    this.expanded() ? this.closeLabel() : this.openLabel(),
  );

  showStartExpandIcon = computed(
    () => !this.withAction() && this.expandIconPosition() === "start",
  );

  showEndExpandIcon = computed(
    () => !this.withAction() && this.expandIconPosition() === "end",
  );
}
