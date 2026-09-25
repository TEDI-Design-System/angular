import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { ButtonComponent, FloatingButtonComponent } from "../../../buttons";
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
  imports: [ButtonComponent, FloatingButtonComponent, IconComponent],
  host: {
    "[class.tedi-carousel-navigation--overlay]": "overlay()",
  },
})
export class CarouselNavigationComponent {
  /**
   * Shows floating navigation buttons over the slides. Place navigation directly
   * inside `tedi-carousel`, outside the header and footer.
   * @default false
   */
  readonly overlay = input(false, { transform: booleanAttribute });

  readonly translationService = inject(TediTranslationService);
  private readonly carousel = inject(CarouselComponent);

  readonly canPrev = computed(() => this.carousel.carouselContent().canPrev());
  readonly canNext = computed(() => this.carousel.carouselContent().canNext());

  handleNext() {
    this.carousel.carouselContent().next();
  }

  handlePrev() {
    this.carousel.carouselContent().prev();
  }
}
