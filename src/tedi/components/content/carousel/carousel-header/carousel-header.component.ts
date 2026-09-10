import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";

@Component({
  standalone: true,
  selector: "tedi-carousel-header",
  template: "<ng-content />",
  styleUrl: "./carousel-header.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CarouselHeaderComponent {}
