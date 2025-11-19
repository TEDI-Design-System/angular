import { Component, input } from "@angular/core";
import { ButtonComponent } from "tedi/components";

@Component({
  selector: "tedi-table-of-contents-item",
  templateUrl: "./table-of-contents-item.component.html",
  styleUrl: "./table-of-contents-item.component.scss",
  imports: [ButtonComponent],
})
export class TableOfContentsItemComponent {
  active = input<boolean>(false);
}
