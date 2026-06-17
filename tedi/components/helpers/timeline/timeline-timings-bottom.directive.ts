import { Directive, inject, TemplateRef } from "@angular/core";

/**
 * Marks content that is pinned to the bottom of a timeline item's timings
 * column on desktop and rendered after the item content on mobile.
 *
 * Usage: `<p *tediTimelineTimingsBottom>Muudetud 08.02.2024</p>`
 */
@Directive({
  selector: "[tediTimelineTimingsBottom]",
  standalone: true,
})
export class TimelineTimingsBottomDirective {
  templateRef = inject(TemplateRef);
}
