import {
  Component,
  computed,
  input,
  signal,
  EventEmitter,
} from "@angular/core";
import { ButtonComponent } from "tedi/components";

@Component({
  selector: "tedi-table-of-contents-item",
  templateUrl: "./table-of-contents-item.component.html",
  styleUrl: "./table-of-contents-item.component.scss",
  imports: [ButtonComponent],
})
export class TableOfContentsItemComponent {
  idTo = input.required<string>();

  selected = signal(false);

  itemSelected = new EventEmitter<string>();

  classes = computed(() => {
    const classes = ["table-of-contents__item"];
    if (this.selected()) {
      classes.push("table-of-contents__item--active");
    }
    return classes.join(" ");
  });

  itemClick() {
    this.itemSelected.emit(this.idTo());
  }
}
