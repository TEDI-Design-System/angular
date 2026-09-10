import {
  Directive,
  input,
  inject,
  TemplateRef,
  ViewContainerRef,
  computed,
  effect,
} from "@angular/core";
import {
  Breakpoint,
  BreakpointService,
} from "../../services/breakpoint/breakpoint.service";

@Directive({
  selector: "[showAt]",
  standalone: true,
  host: {
    "[style.display]": "hostDisplay()",
  },
})
export class ShowAtDirective {
  showAt = input.required<Breakpoint>();

  private templateRef = inject(TemplateRef, { optional: true });
  private viewContainerRef = inject(ViewContainerRef);
  private breakpointService = inject(BreakpointService);

  private visible = computed(() =>
    this.breakpointService.isAboveBreakpoint(this.showAt())(),
  );

  /**
   * Attribute usage (`showAt` on a real element) toggles `display` so the
   * element stays in the DOM and remains eligible for content projection.
   * Structural usage (`*showAt`) creates/clears the view instead and leaves
   * `display` untouched (returns `null`).
   */
  protected hostDisplay = computed(() =>
    this.templateRef || this.visible() ? null : "none",
  );

  constructor() {
    effect(() => {
      if (!this.templateRef) {
        return;
      }

      if (this.visible()) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainerRef.clear();
      }
    });
  }
}
