import { NgTemplateOutlet } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "li[tedi-sidenav-dropdown-item]",
  standalone: true,
  templateUrl: "./sidenav-dropdown-item.component.html",
  styleUrl: "./sidenav-dropdown-item.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, NgTemplateOutlet],
  host: {
    "[class]": "classes()",
  },
})
export class SideNavDropdownItemComponent implements AfterViewInit {
  /**
   * Is navigation item selected
   * @default false
   */
  selected = input<boolean>(false);
  /**
   * External link
   */
  href = input<string>();
  /**
   * Router link
   */
  route = input<string>();

  textContent = signal("");

  private readonly host = inject(ElementRef);

  ngAfterViewInit(): void {
    if (this.host.nativeElement) {
      const text = this.host.nativeElement.textContent?.trim();
      if (text) {
        this.textContent.set(text);
      }
    }
  }

  classes = computed(() => {
    const classList = ["tedi-sidenav-dropdown-item"];

    if (this.selected()) {
      classList.push("tedi-sidenav-dropdown-item--selected");
    }

    return classList.join(" ");
  });
}
