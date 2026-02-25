import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
} from "@angular/core";

@Directive({
  selector: "[tediSpreadAttrs]",
})
export class SpreadAttrsDirective implements OnChanges {
  @Input("tediSpreadAttrs") attrs: Record<
    string,
    string | number | boolean | null | undefined
  > = {};

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes["attrs"]) {
      const element = this.el.nativeElement as HTMLElement;

      for (const [key, value] of Object.entries(this.attrs)) {
        if (value !== null && value !== undefined) {
          this.renderer.setAttribute(element, key, String(value));
        } else {
          this.renderer.removeAttribute(element, key);
        }
      }
    }
  }
}
