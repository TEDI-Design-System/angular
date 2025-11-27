import { Component, computed, inject, input } from "@angular/core";
import { ButtonComponent } from "tedi/components";
import { TableOfContentsService } from "../table-of-contents.service";

@Component({
  selector: "tedi-table-of-contents-item",
  templateUrl: "./table-of-contents-item.component.html",
  styleUrl: "./table-of-contents-item.component.scss",
  imports: [ButtonComponent],
})
export class TableOfContentsItemComponent {
  idTo = input.required<string>();

  private tableContentsService = inject(TableOfContentsService, {
    optional: true,
  });

  classes = computed(() => {
    const classes = ["table-of-contents__item"];
    if (this.tableContentsService?.active() === this.idTo()) {
      classes.push("table-of-contents__item--active");
    }
    return classes.join(" ");
  });

  anchorClasses = computed(() => {
    const classes = ["table-of-contents__item-anchor"];
    if (this.tableContentsService?.active() === this.idTo()) {
      classes.push("table-of-contents__item-anchor--active");
    }
    return classes.join(" ");
  });

  itemClick() {
    if (!this.tableContentsService) {
      return;
    }
    this.tableContentsService.setActive(this.idTo());
    this.tableContentsService.seekTo(this.idTo());
  }
}
