import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewEncapsulation,
} from "@angular/core";
import { ButtonComponent } from "../../../buttons";
import { IconComponent } from "../../../base";
import { CarouselComponent } from "../carousel.component";
import { TediTranslationService } from "../../../../services";

@Component({
  standalone: true,
  selector: "tedi-carousel-navigation",
  templateUrl: "./carousel-navigation.component.html",
  styleUrl: "./carousel-navigation.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [ButtonComponent, IconComponent],
})
export class CarouselNavigationComponent {
  readonly translationService = inject(TediTranslationService);
  carousel = inject(CarouselComponent);

  handleNext() {
    this.carousel.carouselContent()?.next();
  }

  handlePrev() {
    this.carousel.carouselContent()?.prev();
  }
}
