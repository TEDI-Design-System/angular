import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";

/**
 * Interactive wrapper around a `tedi-card`. Apply to an anchor (with `href`
 * or `routerLink`) for navigation or to a button for actions — the host
 * element provides the interaction semantics and applies the hover, active,
 * focus and disabled states to the card and its blocks inside.
 *
 * Only a projected `tedi-card` is rendered — other content is ignored. The
 * card may use any card sub-components (content, rows, icon cells). Do not
 * place other interactive elements inside.
 */
@Component({
  selector: "a[tedi-card-button], button[tedi-card-button]",
  standalone: true,
  templateUrl: "./card-button.component.html",
  styleUrl: "./card-button.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "tedi-card-button",
  },
})
export class CardButtonComponent {}
