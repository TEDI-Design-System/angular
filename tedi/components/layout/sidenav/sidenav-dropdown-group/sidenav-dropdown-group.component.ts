import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChildren,
  QueryList,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { SideNavDropdownItemComponent } from "../sidenav-dropdown-item/sidenav-dropdown-item.component";

@Component({
  selector: "tedi-sidenav-dropdown-group",
  standalone: true,
  templateUrl: "./sidenav-dropdown-group.component.html",
  styleUrl: "./sidenav-dropdown-group.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink],
  host: {
    "class": "tedi-sidenav-dropdown-group",
    "role": "presentation",
    "style": "display: contents",
  },
})
export class SideNavDropdownGroupComponent implements AfterContentInit {
  @ContentChildren(SideNavDropdownItemComponent)
  items!: QueryList<SideNavDropdownItemComponent>;

  private itemsArray = signal<SideNavDropdownItemComponent[]>([]);

  firstItem = computed(() => this.itemsArray()[0]);
  restItems = computed(() => this.itemsArray().slice(1));

  // to keep same component composition structure but rearrange dom elements inside the group for correct html semantics
  ngAfterContentInit(): void {
    this.itemsArray.set(this.items.toArray());

    this.items.changes.subscribe(() => {
      this.itemsArray.set(this.items.toArray());
    });
  }
}
