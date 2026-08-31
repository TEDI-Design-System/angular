import { Directive, inject, TemplateRef } from "@angular/core";

@Directive({
  selector: "[tediCarouselSlide]",
  standalone: true,
})
export class CarouselSlideDirective {
  template = inject(TemplateRef);
}
