import {
  booleanAttribute,
  computed,
  Directive,
  inject,
  input,
  output,
  TemplateRef,
} from "@angular/core";
import {
  breakpointInput,
  BreakpointInput,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";

export type SheetRadius = "default" | "card" | "none";
export type SheetPadding = "default" | "small";

/**
 * The sheet panel's content and settings. Holds `<tedi-sheet-header>`,
 * `<tedi-sheet-body>` and `<tedi-sheet-footer>`. Put a `cdkFocusInitial`
 * attribute on the element that should get focus when the sheet opens.
 */
@Directive({
  standalone: true,
  selector: "ng-template[tediSheetContent]",
})
export class SheetContentDirective {
  /** @internal */
  readonly templateRef = inject(TemplateRef);

  /**
   * Show the drag handle. While it's shown, the sheet can be dragged from the
   * handle or from anywhere on `<tedi-sheet-header>` except its interactive content.
   * @default true
   */
  readonly showHandle = input(true, { transform: booleanAttribute });

  /**
   * Trap focus inside the sheet while it's open.
   * @default true
   */
  readonly trapFocus = input(true, { transform: booleanAttribute });

  /**
   * Return focus to the element that had it before the sheet opened.
   * @default true
   */
  readonly returnFocus = input(true, { transform: booleanAttribute });

  /**
   * Show the dimmed backdrop. For a docked sheet that leaves the page usable,
   * also set `trapFocus` and `lockScroll` to `false`, and the sheet's
   * `closeOnBackdropClick` to `false`.
   * @default true
   */
  readonly showOverlay = input(true, { transform: booleanAttribute });

  /**
   * Block page scrolling while the sheet is open.
   * @default true
   */
  readonly lockScroll = input(true, { transform: booleanAttribute });

  /**
   * Keep the content rendered while the sheet is closed, so form values and
   * scroll position survive closing and reopening.
   * @default false
   */
  readonly keepMounted = input(false, { transform: booleanAttribute });

  /**
   * Rest heights as fractions of the viewport height (`0`–`1`), e.g. `[0.4, 0.9]`.
   * Releasing a drag snaps to the nearest one; dragging below the lowest closes the sheet.
   */
  readonly snapPoints = input<number[]>();

  /**
   * Index into the sorted `snapPoints` to open at. The last snap point the
   * user dragged to is kept across closing and reopening.
   * @default the tallest snap point
   */
  readonly defaultSnapPoint = input<number>();

  /** Emits the fraction the sheet snapped to after a drag. */
  readonly snapPointChange = output<number>();

  /**
   * Render visually hidden close buttons at the start and end of the sheet,
   * so touch screen reader users can leave it without an Escape key. Only
   * applies while `trapFocus` is `true`.
   * @default true
   */
  readonly visuallyHiddenDismiss = input(true, { transform: booleanAttribute });

  /**
   * Id of the element that labels the sheet. Only needed when the label is
   * outside `<tedi-sheet-header>`, whose `title` labels the sheet automatically.
   */
  readonly ariaLabelledBy = input<string>();

  /**
   * Accessible name for a sheet without a visible title. Ignored when
   * `ariaLabelledBy` is set or the header has a `title`.
   */
  readonly ariaLabel = input<string>();

  /** Minimum panel height (any CSS length, e.g. `60dvh`). Not applied while collapsed. */
  readonly minHeight = input<string>();

  /**
   * Maximum panel height (any CSS length). The body scrolls past it.
   * Ignored while `snapPoints` are set.
   * @default 90dvh
   */
  readonly maxHeight = input<string>();

  /**
   * Padding of the header, body and footer. To remove only the body padding,
   * use `padding="none"` on `<tedi-sheet-body>`.
   * @default default
   */
  readonly padding = input<SheetPadding>("default");

  /**
   * Top corner radius. `card` matches a card's rounded corners.
   * Accepts a plain value or a breakpoint object, e.g. `{ xs: 'none', md: 'card' }`.
   * @default default
   */
  readonly radius = input(
    { xs: "default" as SheetRadius },
    { transform: (v: BreakpointInput<SheetRadius>) => breakpointInput(v) },
  );

  /** Extra class on the sheet panel. */
  readonly panelClass = input<string>();

  private readonly breakpointService = inject(BreakpointService);

  /** @internal */
  readonly resolvedRadius = computed(() =>
    this.breakpointService.resolveBreakpointInput(this.radius()),
  );
}
