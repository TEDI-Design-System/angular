import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";

/**
 * Optional trailing element of a `tedi-text-group-value` — an info tooltip,
 * status badge, tag, etc. Place it as the last child of the value: it renders
 * inline after the text, centered against it, and keeps its own width instead of
 * being squeezed when the row runs out of space.
 */
@Component({
  selector: "tedi-text-group-slot",
  template: `<ng-content />`,
  styleUrl: "./text-group.component.scss",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "tedi-text-group-slot",
  },
})
export class TextGroupSlotComponent {}
