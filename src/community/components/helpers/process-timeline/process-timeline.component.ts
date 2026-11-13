import { isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  PLATFORM_ID,
  signal,
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

  private readonly overflowing = signal(false);
  private widthNeeded = 0;

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

    const observer = new ResizeObserver(() => this.checkFit());
    inject(DestroyRef).onDestroy(() => observer.disconnect());

    effect(() => {
      this.items();
      const el = this.host.nativeElement;
      observer.disconnect();
      observer.observe(el);
      Array.from(el.children).forEach((child) => observer.observe(child));
    });
  }

  private checkFit() {
    if (this.resolvedOrientation() === "vertical") {
      return;
    }

    const el = this.host.nativeElement;

    if (this.overflowing()) {
      if (el.clientWidth >= this.widthNeeded) {
        this.overflowing.set(false);
      }
    } else if (el.scrollWidth > el.clientWidth) {
      this.widthNeeded = el.scrollWidth;
      this.overflowing.set(true);
    }
  }
}
