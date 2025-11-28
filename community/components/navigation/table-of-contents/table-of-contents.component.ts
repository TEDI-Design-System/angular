import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  TemplateRef,
  viewChild,
  contentChildren,
} from "@angular/core";
import {
  CardComponent,
  CardContentComponent,
} from "community/components/cards";
import { TextComponent, IconComponent, ButtonComponent } from "tedi/components";
import { Dialog } from "@angular/cdk/dialog";
import { NgTemplateOutlet } from "@angular/common";
import { TableOfContentsItemComponent } from "./table-of-contents-item/table-of-contents-item.component";
import { Router } from "@angular/router";

export type TableOfContentsPosition = "default" | "fixed" | "sticky";
export type TableOfContentsBreakpoint =
  | "mobile"
  | "tablet"
  | "desktop"
  | "never";

@Component({
  selector: "tedi-table-of-contents",
  templateUrl: "./table-of-contents.component.html",
  styleUrl: "./table-of-contents.component.scss",
  imports: [
    CardComponent,
    CardContentComponent,
    TextComponent,
    ButtonComponent,
    IconComponent,
    NgTemplateOutlet,
  ],
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

  /**
   * ARIA label for the <nav> component
   */
  ariaLabel = input<string>("Table of contents");

  /**
   * Breakpoint to switch to modal view
   * @default mobile
   */
  modalBreakpoint = input<TableOfContentsBreakpoint>("mobile");

  isOpen = signal(false);

  templateRef = viewChild<TemplateRef<unknown>>("defaultTemplate");

  private tableItems = contentChildren(TableOfContentsItemComponent, {
    descendants: true,
  });
  private router = inject(Router);

  activeId = computed(() =>
    this.tableItems()
      .find((item) => item.selected())
      ?.idTo()
  );

  private dialog = inject(Dialog);

  constructor() {
    effect(() => {
      const items = this.tableItems();
      items.forEach((item) => {
        item.itemSelected.subscribe(() => {
          this.isOpen.set(false);
          item.selected.set(true);
          items.forEach((other) => {
            if (other !== item) {
              other.selected.set(false);
            }
          });
          this.seekTo(item.idTo());
        });
      });
    });
  }

  classes = computed(() => {
    const classes = ["table-of-contents"];
    classes.push(`table-of-contents--position-${this.position() ?? "default"}`);
    if (this.modalBreakpoint() !== "never") {
      classes.push(
        `table-of-contents--modal-breakpoint-${this.modalBreakpoint()}`
      );
    }
    if (this.isOpen()) {
      classes.push("table-of-contents--modal-active");
    }
    return classes.join(" ");
  });

  footerClasses = computed(() => {
    const classes = ["table-of-contents__footer"];
    classes.push(
      `table-of-contents__footer--modal-breakpoint-${this.modalBreakpoint()}`
    );
    return classes.join(" ");
  });

  // getActive() {
  //   return this.activeId();
  // }

  openMobileModal() {
    const templateRef = this.templateRef();

    if (!templateRef) {
      return;
    }
    const ref = this.dialog.open(templateRef);
    this.isOpen.set(true);

    ref.closed.subscribe(() => {
      this.isOpen.set(false);
    });
  }

  seekTo(id: string) {
    if (!this.scrollOnClick) {
      return;
    }
    if (!id) {
      this.router.navigate([], {
        fragment: undefined,
        queryParamsHandling: "preserve",
      });
      return;
    }
    const targetElement = document.getElementById(id);
    targetElement?.scrollIntoView({ behavior: "smooth" });
    this.router.navigate([], {
      fragment: id,
      queryParamsHandling: "preserve",
    });
  }
}
