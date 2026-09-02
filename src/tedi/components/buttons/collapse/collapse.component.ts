import {
  Component,
  computed,
  input,
  signal,
  AfterViewInit,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from "@angular/core";
import {
  CollapseButtonComponent,
  type CollapseButtonArrowType,
  type CollapseButtonSize,
} from "../collapse-button/collapse-button.component";
import { generateUUID } from "../../../helpers/generate-uuid";

export type ArrowType = CollapseButtonArrowType;
export type CollapseSize = CollapseButtonSize;

@Component({
  standalone: true,
  selector: "tedi-collapse",
  imports: [CollapseButtonComponent],
  templateUrl: "./collapse.component.html",
  styleUrls: ["./collapse.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CollapseComponent implements AfterViewInit {
  /**
   * The title/header element for the collapsible section.
   * Rendered inside the toggle button.
   */
  openText = input<string>();
  /**
   * Text shown on the toggle button when the content is expanded.
   */
  closeText = input<string>();
  /**
   * Whether the collapse should be initially open.
   * @default false
   */
  defaultOpen = input<boolean>(false);
  /**
   * To show or hide the openText and closeText.
   * @default "false"
   */
  hideCollapseText = input<boolean>(false);
  /**
   * Option for toggling different arrow styles.
   * @default "default"
   */
  arrowType = input<ArrowType>("default");
  /**
   * Visual size of the toggle button.
   * @default "default"
   */
  size = input<CollapseSize>("default");
  /**
   * Inverted color palette — flips the link / icon colors to their
   * inverted-surface equivalents (white text + icon), for use on top of dark
   * backgrounds. Pairs with both the text and icon-only variants; the
   * secondary-arrow style has no inverted form in the design and the flag is
   * ignored when `arrowType === 'secondary'`.
   * @default false
   */
  inverted = input<boolean>(false);

  collapseContentId: string = `collapse-content-${generateUUID()}`;
  isOpen = signal<boolean>(false);
  protected readonly isInvertedActive = computed(
    () => this.inverted() && this.arrowType() !== "secondary",
  );

  toggleCollapse() {
    this.isOpen.update((prev) => !prev);
  }

  ngAfterViewInit() {
    if (this.defaultOpen()) {
      this.isOpen.set(true);
    }
  }
}
