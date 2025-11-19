import { Component, input, signal } from "@angular/core";
import { TableOfContentsItemComponent } from "./table-of-contents-item/table-of-contents-item.component";
import { CardComponent, CardContentComponent } from "community/components/cards";
import { TextComponent } from "tedi/components";

@Component({
  selector: "tedi-table-of-contents",
  templateUrl: "./table-of-contents.component.html",
  styleUrl: "./table-of-contents.component.scss",
  imports: [TableOfContentsItemComponent, CardComponent, CardContentComponent, TextComponent],
})
export class TableOfContentsComponent {
  /**
   * List of items to be shown in the table of contents
   */
  items = input.required<string[]>();
  /**
   * Heading of the table of contents
   * @default Value from LabelProvider
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
   * Callback when component is toggled.
   * Use to handle state outside of component, should use with open prop.
   */
  onToggle?: (open: boolean) => void;
  /**
   * Show icons before items
   * @default false
   */
  active = signal<string>("");
}
