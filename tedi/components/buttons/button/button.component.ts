import { Component, ViewEncapsulation } from "@angular/core";
import { BaseButtonDirective } from "./base-button.directive";

@Component({
  selector: "[tedi-button]",
  standalone: true,
  template: "<ng-content />",
  styleUrl: "./button.component.scss",
  encapsulation: ViewEncapsulation.None,
  hostDirectives: [
    {
      directive: BaseButtonDirective,
      inputs: ["variant", "size"],
    },
  ],
})
export class ButtonComponent {}
