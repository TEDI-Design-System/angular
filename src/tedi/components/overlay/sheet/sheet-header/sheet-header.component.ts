import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  inject,
  input,
  OnDestroy,
  ViewEncapsulation,
} from "@angular/core";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import {
  HeadingModifiers,
  TextComponent,
} from "../../../base/text/text.component";
import { ClosingButtonComponent } from "../../../buttons/closing-button/closing-button.component";
import { CollapseButtonComponent } from "../../../buttons/collapse-button/collapse-button.component";
import { SheetComponent } from "../sheet.component";
import { SheetHeaderContentDirective } from "./sheet-header-content.directive";

export type SheetHeaderVariant = "brand" | "default";
export type SheetHeaderTitlePosition = "start" | "center";
export type SheetHeaderHeadingLevel = HeadingModifiers;

/**
 * Sheet header. Project leading content with `tedi-sheet-header-start`,
 * trailing content with `tedi-sheet-header-end`, and extra icon buttons
 * (between the collapse and close buttons) with `tedi-sheet-header-actions`.
 * An element with `tedi-sheet-header-content` replaces the whole layout.
 */
@Component({
  standalone: true,
  selector: "tedi-sheet-header",
  imports: [TextComponent, ClosingButtonComponent, CollapseButtonComponent],
  templateUrl: "./sheet-header.component.html",
  styleUrl: "../sheet.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "'tedi-sheet-header tedi-sheet-header--' + variant()",
    "[class.tedi-sheet-header--center]": "titlePosition() === 'center'",
  },
})
export class SheetHeaderComponent implements OnDestroy {
  /** Title. Labels the sheet dialog. */
  readonly title = input<string>();

  /**
   * Heading level of the title. It always looks like an H6; set the level
   * that fits the page's heading outline.
   * @default h3
   */
  readonly headingLevel = input<SheetHeaderHeadingLevel>("h3");

  /**
   * `brand` is a brand-blue header with white content.
   * @default brand
   */
  readonly variant = input<SheetHeaderVariant>("brand");

  /**
   * With `center`, the start content and the buttons stay at the edges.
   * @default start
   */
  readonly titlePosition = input<SheetHeaderTitlePosition>("start");

  /**
   * Show a button that collapses the sheet to its header.
   * @default false
   */
  readonly collapsible = input(false, { transform: booleanAttribute });

  /**
   * Show the close button.
   * @default true
   */
  readonly closeButton = input(true, { transform: booleanAttribute });

  protected readonly customContent = contentChild(SheetHeaderContentDirective);

  protected readonly sheet = inject(SheetComponent);
  private readonly translationService = inject(TediTranslationService);

  private readonly expandLabel = this.translationService.track("sheet.expand");
  private readonly collapseLabel =
    this.translationService.track("sheet.collapse");

  protected readonly collapseToggleLabel = computed(() =>
    this.sheet.collapsed() ? this.expandLabel() : this.collapseLabel(),
  );

  constructor() {
    effect(() =>
      this.sheet.hasTitle.set(!!this.title() && !this.customContent()),
    );
  }

  ngOnDestroy(): void {
    this.sheet.hasTitle.set(false);
  }
}
