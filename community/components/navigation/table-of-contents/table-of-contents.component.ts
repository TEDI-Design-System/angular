import { Component, computed, effect, inject, input } from "@angular/core";
import {
  CardComponent,
  CardContentComponent,
} from "community/components/cards";
import { TextComponent } from "tedi/components";
import { TableOfContentsService } from "./table-of-contents.service";

type TableOfContentsPosition = "default" | "fixed" | "sticky";

@Component({
  selector: "tedi-table-of-contents",
  templateUrl: "./table-of-contents.component.html",
  styleUrl: "./table-of-contents.component.scss",
  imports: [CardComponent, CardContentComponent, TextComponent],
  providers: [TableOfContentsService],
})
export class TableOfContentsComponent {
  /**
   * Heading of the table of contents
   */
  heading = input.required<string>();
  /**
   * Should component be initially shown. Won't work with open and onToggle.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Should the component be open or closed.
   * Use to handle state outside of component, should use with onToggle prop.
   */
  open?: boolean;
  /**
   * Should child table of contents elements when clicked scroll
   */
  scrollOnClick = input<boolean>(true);
  /**
   * Callback when component is toggled.
   * Use to handle state outside of component, should use with open prop.
   */
  onToggle?: (open: boolean) => void;

  /**
   * Position strategy of the table of contents
   * @default default
   */
  position = input<TableOfContentsPosition>("default");

  ariaLabel = input<string>("Table of contents");

  private tableContentsService = inject(TableOfContentsService);

  constructor() {
    effect(() => {
      this.tableContentsService.scrollOnClick = this.scrollOnClick();
    });
  }

  classes = computed(() => {
    const classes = ["table-of-contents"];
    classes.push(`table-of-contents--position-${this.position() ?? "default"}`);
    return classes.join(" ");
  });

  getActive() {
    return this.tableContentsService.active();
  }
}
