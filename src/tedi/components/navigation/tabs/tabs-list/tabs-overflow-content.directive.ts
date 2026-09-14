import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  input,
} from "@angular/core";
import { TabsTriggerComponent } from "../tabs-trigger/tabs-trigger.component";

/**
 * Mirrors a tab trigger's rendered content (icon, label, badges, indicators)
 * into the overflow "More" dropdown item by cloning the trigger's child nodes.
 * Plain DOM cloning is used because triggers project arbitrary consumer markup
 * through `<ng-content>`, so there is no `TemplateRef` to re-render.
 */
@Directive({
  selector: "[tediTabsOverflowContent]",
  standalone: true,
})
export class TabsOverflowContentDirective implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly trigger = input.required<TabsTriggerComponent>({
    alias: "tediTabsOverflowContent",
  });

  ngAfterViewInit(): void {
    this.host.nativeElement.replaceChildren(...this.trigger().contentNodes);
  }
}
