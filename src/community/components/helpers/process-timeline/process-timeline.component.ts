import { isPlatformBrowser } from "@angular/common";
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  input,
  PLATFORM_ID,
  signal,
  untracked,
  ViewEncapsulation,
} from "@angular/core";
import {
  BreakpointInput,
  breakpointInput,
  BreakpointObject,
  BreakpointService,
} from "@tedi-design-system/angular/tedi";
import { ProcessTimelineItemComponent } from "./process-timeline-item/process-timeline-item.component";
import {
  PROCESS_TIMELINE,
  ProcessTimelineConnectorThickness,
  ProcessTimelineContext,
  ProcessTimelineOrientation,
} from "./process-timeline.token";

const VERTICAL_CLASS = "tedi-process-timeline--vertical";
const HORIZONTAL_CLASS = "tedi-process-timeline--horizontal";
const ITEM_VERTICAL_CLASS = "tedi-process-timeline-item--vertical";

@Component({
  standalone: true,
  selector: "ol[tedi-process-timeline]",
  template: "<ng-content />",
  styleUrl: "./process-timeline.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: PROCESS_TIMELINE,
      useExisting: forwardRef(() => ProcessTimelineComponent),
    },
  ],
  host: {
    class: "tedi-process-timeline",
    // Safari drops list semantics from lists styled with `list-style: none`.
    role: "list",
    "[class.tedi-process-timeline--vertical]": "vertical()",
    "[class.tedi-process-timeline--horizontal]": "!vertical()",
  },
})
export class ProcessTimelineComponent implements ProcessTimelineContext {
  private readonly breakpointService = inject(BreakpointService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Layout direction; accepts a breakpoint object such as `{ xs: "vertical", md: "horizontal" }`.
   * Horizontal falls back to vertical while the stages don't fit the container's width.
   * @default { xs: "vertical", md: "horizontal" }
   */
  readonly orientation = input<
    BreakpointObject<ProcessTimelineOrientation>,
    BreakpointInput<ProcessTimelineOrientation>
  >(
    { xs: "vertical", md: "horizontal" },
    {
      transform: (v: BreakpointInput<ProcessTimelineOrientation>) =>
        breakpointInput(v),
    },
  );

  /**
   * Thickness of the connectors between stages, in pixels.
   * @default 1
   */
  readonly connectorThickness = input<ProcessTimelineConnectorThickness>(1);

  readonly items = contentChildren(ProcessTimelineItemComponent);

  private readonly resolvedOrientation = computed<ProcessTimelineOrientation>(
    () => {
      const v = this.orientation();
      const above = (bp: "sm" | "md" | "lg" | "xl" | "xxl") =>
        this.breakpointService.isAboveBreakpoint(bp)();

      if (v.xxl !== undefined && above("xxl")) return v.xxl;
      if (v.xl !== undefined && above("xl")) return v.xl;
      if (v.lg !== undefined && above("lg")) return v.lg;
      if (v.md !== undefined && above("md")) return v.md;
      if (v.sm !== undefined && above("sm")) return v.sm;
      return v.xs;
    },
  );

  /** True while horizontal is resolved but the stages don't fit the container's width. */
  private readonly overflowing = signal(false);

  readonly vertical = computed(
    () => this.resolvedOrientation() === "vertical" || this.overflowing(),
  );

  constructor() {
    if (
      !isPlatformBrowser(inject(PLATFORM_ID)) ||
      typeof ResizeObserver === "undefined"
    ) {
      return;
    }

    const el = this.host.nativeElement;
    // The container or a stage changed size.
    const resizeObserver = new ResizeObserver(() => this.checkFit());
    // Stage text changed or stages were added/removed. Class and attribute changes, including
    // the ones checkFit makes while measuring, are not observed.
    const mutationObserver =
      typeof MutationObserver === "undefined"
        ? undefined
        : new MutationObserver(() => this.checkFit());
    mutationObserver?.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    inject(DestroyRef).onDestroy(() => {
      resizeObserver.disconnect();
      mutationObserver?.disconnect();
    });

    afterRenderEffect(() => {
      this.items();
      this.resolvedOrientation();
      untracked(() => {
        resizeObserver.disconnect();
        resizeObserver.observe(el);
        Array.from(el.children).forEach((child) =>
          resizeObserver.observe(child),
        );
        this.checkFit();
      });
    });
  }

  /**
   * Decides the fallback from the width the stages need in the horizontal layout, measured fresh
   * every time. The result depends only on the content and the container, not on the current
   * layout, so switching the layout can't make it flip back and forth.
   */
  private checkFit() {
    if (this.resolvedOrientation() === "vertical") {
      this.overflowing.set(false);
      return;
    }

    const el = this.host.nativeElement;
    this.overflowing.set(this.horizontalWidth() > el.clientWidth);
  }

  /**
   * Width the stages need side by side. While the fallback is on, the horizontal classes are
   * applied for the synchronous measurement and restored before the browser paints.
   */
  private horizontalWidth(): number {
    const el = this.host.nativeElement;

    if (!el.classList.contains(VERTICAL_CLASS)) {
      return el.scrollWidth;
    }

    const items = Array.from(
      el.querySelectorAll(`:scope > .${ITEM_VERTICAL_CLASS}`),
    );
    el.classList.replace(VERTICAL_CLASS, HORIZONTAL_CLASS);
    items.forEach((item) => item.classList.remove(ITEM_VERTICAL_CLASS));

    const width = el.scrollWidth;

    el.classList.replace(HORIZONTAL_CLASS, VERTICAL_CLASS);
    items.forEach((item) => item.classList.add(ITEM_VERTICAL_CLASS));

    return width;
  }
}
