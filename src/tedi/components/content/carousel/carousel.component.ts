import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  ViewEncapsulation,
} from "@angular/core";
import { CarouselContentComponent } from "./carousel-content/carousel-content.component";

@Component({
  standalone: true,
  selector: "tedi-carousel",
  templateUrl: "./carousel.component.html",
  styleUrl: "./carousel.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent {
  carouselContent = contentChild.required(CarouselContentComponent);
}
