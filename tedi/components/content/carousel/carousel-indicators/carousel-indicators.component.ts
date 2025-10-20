import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { CarouselComponent } from "../carousel.component";
import { NgClass } from "@angular/common";
import { ButtonComponent } from "../../../buttons/button/button.component";
import { IconComponent } from "../../../base/icon/icon.component";
import { TextComponent } from "../../../base/text/text.component";
import { TediTranslationService } from "../../../../services";

export type CarouselIndicatorsVariant = "dots" | "numbers";

@Component({
  standalone: true,
  selector: "tedi-carousel-indicators",
  templateUrl: "./carousel-indicators.component.html",
  styleUrl: "./carousel-indicators.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [NgClass, ButtonComponent, IconComponent, TextComponent],
})
export class CarouselIndicatorsComponent {
  /** Should show indicators with arrows? If yes, don't use carousel-navigation component */
  readonly withArrows = input(false);

  /** Variant of indicators (dots and numbers) */
  readonly variant = input<CarouselIndicatorsVariant>("dots");

  translationService = inject(TediTranslationService);
  carousel = inject(CarouselComponent);

  readonly indicatorsArray = computed(() =>
    Array.from(
      { length: this.carousel.carouselContent()?.slides().length ?? 0 },
      (_, i) => ({
        index: i,
        active: this.carousel.carouselContent()?.slideIndex() === i,
      }),
    ),
  );

  readonly activeSlideNumber = computed(() => {
    const currentIndex = this.carousel.carouselContent()?.slideIndex();

    if (currentIndex !== undefined) {
      return currentIndex + 1;
    }

    return 0;
  });

  handleNext() {
    this.carousel.carouselContent()?.next();
  }

  handlePrev() {
    this.carousel.carouselContent()?.prev();
  }

  handleIndicatorClick(index: number) {
    this.carousel.carouselContent()?.goToIndex(index);
  }
}
