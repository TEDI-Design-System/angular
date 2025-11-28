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
  OnDestroy,
  AfterContentInit,
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
import { Subscription } from "rxjs";

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
export class TableOfContentsComponent implements OnDestroy, AfterContentInit {
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

  /**
   * Should the component track scroll and update active item
   */
  scrollAware = input<boolean>(true);

  isSeeking = false;
  seekingTimeout: NodeJS.Timeout | undefined;

  isOpen = signal(false);

  templateRef = viewChild<TemplateRef<unknown>>("defaultTemplate");

  private intersectionObservers: IntersectionObserver[] = [];
  private itemSubscriptions: Subscription[] = [];

  private tableItems = contentChildren(TableOfContentsItemComponent, {
    descendants: true,
  });
  private router = inject(Router);
  private dialog = inject(Dialog);

  activeElement = computed(() =>
    this.tableItems().find((item) => item.selected())
  );

  activeId = computed(() => this.activeElement()?.idTo());

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

  constructor() {
    effect(() => {
      const items = this.tableItems();
      this.cleanupItemSubscriptions();
      this.hookItems(items);
    });
  }

  ngAfterContentInit(): void {
    const items = this.tableItems();
    this.cleanupObservers();
    this.hookObservers(items);
  }

  ngOnDestroy(): void {
    this.cleanupObservers();
    this.cleanupItemSubscriptions();
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

  seekTo(id: string) {
    if (!this.scrollOnClick) {
      return;
    }

    this.isSeeking = true;

    clearTimeout(this.seekingTimeout);
    this.seekingTimeout = setTimeout(() => {
      this.isSeeking = false;
    }, 500);

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

  private hookItems(items: readonly TableOfContentsItemComponent[]) {
    items.forEach((item) => {
      const sub = item.itemSelected.subscribe(() => {
        this.isOpen.set(false);
        item.selected.set(true);

        items.forEach((other) => {
          if (other !== item) {
            other.selected.set(false);
          }
        });
        this.seekTo(item.idTo());
      });

      this.itemSubscriptions.push(sub);
    });
  }

  private hookObservers(items: readonly TableOfContentsItemComponent[]) {
    const observer = new IntersectionObserver(() => this.observerCallback(), {
      rootMargin: "0px 0px 0px 0px",
    });

    items.forEach((item) => {
      const id = item.idTo();
      if (!id) {
        return;
      }
      const element = document.getElementById(id);
      if (!element) {
        return;
      }

      observer.observe(element);
    });

    this.intersectionObservers.push(observer);
  }

  observerCallback() {
    if (!this.scrollAware() || this.isSeeking) {
      return;
    }
    const items = [...this.tableItems()];

    // select the topmost screen item
    items.sort((a, b) => {
      const aElement = document.getElementById(a.idTo());
      const bElement = document.getElementById(b.idTo());
      if (!aElement || !bElement) {
        return 0;
      }
      const aRect = aElement.getBoundingClientRect();
      const bRect = bElement.getBoundingClientRect();
      return aRect.top - bRect.top;
    });

    for (const item of items) {
      const element = document.getElementById(item.idTo());
      if (!element) {
        continue;
      }
      const rect = element.getBoundingClientRect();
      const top = rect.top;
      const bottom = rect.bottom;

      if (top >= 0 && bottom <= window.innerHeight) {
        this.activeElement()?.selected.set(false);
        item.selected.set(true);
        break;
      }
    }
  }

  private cleanupItemSubscriptions() {
    this.itemSubscriptions.forEach((sub) => sub.unsubscribe());
    this.itemSubscriptions = [];
  }

  private cleanupObservers() {
    this.intersectionObservers.forEach((obs) => obs.disconnect());
    this.intersectionObservers = [];
  }
}
