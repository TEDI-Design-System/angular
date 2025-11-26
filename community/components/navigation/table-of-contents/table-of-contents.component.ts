import {
  Component,
  computed,
  contentChild,
  effect,
  inject,
  input,
  signal,
  TemplateRef,
  viewChild,
} from "@angular/core";
import {
  CardComponent,
  CardContentComponent,
} from "community/components/cards";
import { TextComponent, IconComponent, ButtonComponent } from "tedi/components";
import { TableOfContentsService } from "./table-of-contents.service";
import { Dialog } from "@angular/cdk/dialog";
import { NgTemplateOutlet } from "@angular/common";

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

  private tableContentsService = inject(TableOfContentsService);
  private dialog = inject(Dialog);

  constructor() {
    effect(() => {
      this.tableContentsService.scrollOnClick = this.scrollOnClick();
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
    return classes.join(" ");
  });

  footerClasses = computed(() => {
    const classes = ["table-of-contents__footer"];
    classes.push(
      `table-of-contents__footer--modal-breakpoint-${this.modalBreakpoint()}`
    );
    return classes.join(" ");
  });

  getActive() {
    return this.tableContentsService.active();
  }

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
}
