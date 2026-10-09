import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from "@angular/core";

@Component({
  standalone: true,
  selector: "tedi-radio-card-group",
  template: "<ng-content />",
  styleUrl: "./radio-card-group.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-radio-card-group",
    "[class.tedi-radio-card-group--grouped]": "grouped()",
  },
})
export class RadioCardGroupComponent {
  /**
   * Renders children in a button-group style layout with shared borders and
   * no gap. Child `tedi-radio-card` instances automatically inherit this and
   * do not need their own `grouped` input.
   * @default false
   */
  readonly grouped = input<boolean>(false);
}
