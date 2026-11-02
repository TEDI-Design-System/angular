import { Component, Injectable, signal } from "@angular/core";
import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  flush,
  TestBed,
  tick,
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { InteractivityChecker } from "@angular/cdk/a11y";
import { OverlayContainer } from "@angular/cdk/overlay";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { SheetComponent } from "./sheet.component";
import { SheetContentDirective } from "./sheet-content.directive";
import { SheetTriggerDirective } from "./sheet-trigger.directive";
import { SheetCloseDirective } from "./sheet-close.directive";
import {
  SheetHeaderComponent,
  SheetHeaderHeadingLevel,
} from "./sheet-header/sheet-header.component";
import { SheetBodyComponent } from "./sheet-body/sheet-body.component";
import { SheetFooterComponent } from "./sheet-footer/sheet-footer.component";
import { SheetHeaderContentDirective } from "./sheet-header/sheet-header-content.directive";

// jsdom has no layout, so CDK would treat every element as hidden and unfocusable.
@Injectable()
class LayoutlessInteractivityChecker extends InteractivityChecker {
  override isVisible(): boolean {
    return true;
  }
}

class TranslationMock {
  translate(key: string) {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

@Component({
  standalone: true,
  imports: [
    SheetComponent,
    SheetContentDirective,
    SheetTriggerDirective,
    SheetCloseDirective,
    SheetHeaderComponent,
    SheetBodyComponent,
    SheetFooterComponent,
  ],
  template: `
    <tedi-sheet
      [(open)]="open"
      [(collapsed)]="collapsed"
      [closeOnEscape]="closeOnEscape()"
      [closeOnBackdropClick]="closeOnBackdropClick()"
    >
      <button type="button" class="trigger" tediSheetTrigger>Open</button>
      <ng-template
        tediSheetContent
        [showHandle]="showHandle()"
        [keepMounted]="keepMounted()"
        [snapPoints]="snapPoints()"
        [ariaLabel]="ariaLabel()"
        [radius]="radius()"
        [showOverlay]="showOverlay()"
        [trapFocus]="trapFocus()"
        [padding]="padding()"
        [minHeight]="minHeight()"
        [maxHeight]="maxHeight()"
        panelClass="custom-panel"
        (snapPointChange)="snapped = $event"
      >
        <tedi-sheet-header
          [title]="title()"
          [headingLevel]="headingLevel()"
          [collapsible]="collapsible()"
          [closeButton]="closeButton()"
          [variant]="variant()"
          [titlePosition]="titlePosition()"
        >
          <span tedi-sheet-header-start class="start">3</span>
        </tedi-sheet-header>
        <tedi-sheet-body>
          <input class="field" aria-label="Field" cdkFocusInitial />
        </tedi-sheet-body>
        <tedi-sheet-footer align="right">
          <button type="button" class="cancel" tediSheetClose>Cancel</button>
        </tedi-sheet-footer>
      </ng-template>
    </tedi-sheet>
  `,
})
class TestHostComponent {
  open = signal(false);
  collapsed = signal(false);
  closeOnEscape = signal(true);
  closeOnBackdropClick = signal(true);
  showHandle = signal(true);
  keepMounted = signal(false);
  snapPoints = signal<number[] | undefined>(undefined);
  ariaLabel = signal<string | undefined>(undefined);
  radius = signal<"default" | "card" | "none">("default");
  showOverlay = signal(true);
  trapFocus = signal(true);
  padding = signal<"default" | "small">("default");
  minHeight = signal<string | undefined>(undefined);
  maxHeight = signal<string | undefined>(undefined);
  variant = signal<"brand" | "default">("brand");
  titlePosition = signal<"start" | "center">("start");
  title = signal<string | undefined>("Layers");
  headingLevel = signal<SheetHeaderHeadingLevel>("h3");
  collapsible = signal(false);
  closeButton = signal(true);
  snapped: number | null = null;
}

const pointer = (
  type: string,
  init: { x?: number; y: number; pointerType?: string; buttons?: number },
) => {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: init.x ?? 0,
    clientY: init.y,
    button: 0,
    buttons: init.buttons ?? 1,
  });
  Object.defineProperties(event, {
    pointerId: { value: 1 },
    pointerType: { value: init.pointerType ?? "touch" },
  });
  return event;
};

describe("SheetComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let overlayElement: HTMLElement;

  beforeAll(() => {
    HTMLElement.prototype.setPointerCapture ??= () => undefined;
    HTMLElement.prototype.releasePointerCapture ??= () => undefined;
    HTMLElement.prototype.hasPointerCapture ??= () => false;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        {
          provide: InteractivityChecker,
          useClass: LayoutlessInteractivityChecker,
        },
      ],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    overlayElement = TestBed.inject(OverlayContainer).getContainerElement();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  const panel = () =>
    overlayElement.querySelector<HTMLElement>(".tedi-sheet__panel");
  const header = () =>
    overlayElement.querySelector<HTMLElement>(".tedi-sheet-header")!;
  const trigger = () =>
    fixture.nativeElement.querySelector(".trigger") as HTMLButtonElement;

  const openSheet = () => {
    host.open.set(true);
    fixture.detectChanges();
    tick(16);
    fixture.detectChanges();
  };

  const drag = (
    from: Element,
    moves: { x?: number; y: number }[],
    pointerType = "touch",
  ) => {
    from.dispatchEvent(pointer("pointerdown", { y: 0, pointerType }));
    for (const move of moves) {
      from.dispatchEvent(pointer("pointermove", { ...move, pointerType }));
      fixture.detectChanges();
    }
    const last = moves[moves.length - 1];
    from.dispatchEvent(
      pointer("pointerup", { ...last, pointerType, buttons: 0 }),
    );
    fixture.detectChanges();
  };

  it("renders nothing until opened", () => {
    expect(panel()).toBeNull();
  });

  it("opens from the trigger and wires the trigger's ARIA", fakeAsync(() => {
    expect(trigger().getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");

    trigger().click();
    fixture.detectChanges();
    tick(16);
    fixture.detectChanges();

    expect(host.open()).toBe(true);
    expect(panel()).not.toBeNull();
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(trigger().getAttribute("aria-controls")).toBe(panel()!.id);
    flush();
  }));

  it("is a modal dialog labelled by the header title", fakeAsync(() => {
    openSheet();

    const title = overlayElement.querySelector("h3.tedi-sheet-header__title")!;
    expect(panel()!.getAttribute("role")).toBe("dialog");
    expect(panel()!.getAttribute("aria-modal")).toBe("true");
    expect(panel()!.getAttribute("aria-labelledby")).toBe(title.id);
    expect(panel()!.hasAttribute("aria-label")).toBe(false);
    flush();
  }));

  it("uses ariaLabel when there is no title", fakeAsync(() => {
    host.title.set(undefined);
    host.ariaLabel.set("Map layers");
    openSheet();

    expect(panel()!.hasAttribute("aria-labelledby")).toBe(false);
    expect(panel()!.getAttribute("aria-label")).toBe("Map layers");
    flush();
  }));

  it("renders the title at the given heading level", fakeAsync(() => {
    host.headingLevel.set("h2");
    openSheet();

    expect(
      overlayElement
        .querySelector("h2.tedi-sheet-header__title")
        ?.textContent?.trim(),
    ).toBe("Layers");
    flush();
  }));

  it("projects start content into the header", fakeAsync(() => {
    openSheet();

    expect(
      overlayElement.querySelector(".tedi-sheet-header__start .start"),
    ).not.toBeNull();
    flush();
  }));

  it("moves focus into the sheet and returns it to the trigger", fakeAsync(() => {
    trigger().focus();
    trigger().click();
    fixture.detectChanges();
    tick(16);
    fixture.detectChanges();

    expect(document.activeElement).toBe(overlayElement.querySelector(".field"));

    overlayElement
      .querySelector<HTMLElement>(".tedi-sheet-header__close")!
      .click();
    fixture.detectChanges();

    expect(document.activeElement).toBe(trigger());
    flush();
  }));

  it("closes from the close button and removes the panel after the transition", fakeAsync(() => {
    openSheet();

    overlayElement
      .querySelector<HTMLElement>(".tedi-sheet-header__close")!
      .click();
    fixture.detectChanges();

    expect(host.open()).toBe(false);
    expect(panel()!.dataset["status"]).toBe("close");

    tick(300);
    fixture.detectChanges();
    expect(panel()).toBeNull();
  }));

  it("hides the close button with closeButton false", fakeAsync(() => {
    host.closeButton.set(false);
    openSheet();

    expect(
      overlayElement.querySelector(".tedi-sheet-header__close"),
    ).toBeNull();
    flush();
  }));

  it("makes the sheet inert while it animates out", fakeAsync(() => {
    openSheet();
    const overlay = () =>
      overlayElement.querySelector<HTMLElement>(".tedi-sheet__overlay")!;
    expect(overlay().hasAttribute("inert")).toBe(false);

    host.open.set(false);
    fixture.detectChanges();
    expect(overlay().hasAttribute("inert")).toBe(true);

    openSheet();
    expect(overlay().hasAttribute("inert")).toBe(false);
    flush();
  }));

  it("closes from a tediSheetClose element", fakeAsync(() => {
    openSheet();

    overlayElement.querySelector<HTMLElement>(".cancel")!.click();
    fixture.detectChanges();

    expect(host.open()).toBe(false);
    flush();
  }));

  it("closes on Escape unless closeOnEscape is false", fakeAsync(() => {
    host.closeOnEscape.set(false);
    openSheet();

    const escape = () =>
      document.body.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );

    escape();
    fixture.detectChanges();
    expect(host.open()).toBe(true);

    host.closeOnEscape.set(true);
    fixture.detectChanges();
    escape();
    fixture.detectChanges();
    expect(host.open()).toBe(false);
    flush();
  }));

  it("closes on a backdrop click, but not on a click in the panel", fakeAsync(() => {
    openSheet();

    panel()!.click();
    fixture.detectChanges();
    expect(host.open()).toBe(true);

    overlayElement.querySelector<HTMLElement>(".tedi-sheet__overlay")!.click();
    fixture.detectChanges();
    expect(host.open()).toBe(false);
    flush();
  }));

  it("stays open on a backdrop click with closeOnBackdropClick false", fakeAsync(() => {
    host.closeOnBackdropClick.set(false);
    openSheet();

    overlayElement.querySelector<HTMLElement>(".tedi-sheet__overlay")!.click();
    fixture.detectChanges();
    expect(host.open()).toBe(true);
    flush();
  }));

  it("renders visually hidden dismiss buttons that close the sheet", fakeAsync(() => {
    openSheet();

    const dismiss = overlayElement.querySelectorAll<HTMLElement>(
      ".tedi-sheet__dismiss",
    );
    expect(dismiss.length).toBe(2);
    expect(dismiss[0].getAttribute("tabindex")).toBe("-1");

    dismiss[0].click();
    fixture.detectChanges();
    expect(host.open()).toBe(false);
    flush();
  }));

  it("keeps the content mounted and hidden with keepMounted", fakeAsync(() => {
    host.keepMounted.set(true);
    openSheet();

    overlayElement.querySelector<HTMLInputElement>(".field")!.value = "kept";
    host.open.set(false);
    fixture.detectChanges();
    tick(300);
    fixture.detectChanges();

    expect(
      overlayElement.querySelector<HTMLElement>(".tedi-sheet__overlay")!.hidden,
    ).toBe(true);
    expect(
      overlayElement.querySelector<HTMLInputElement>(".field")!.value,
    ).toBe("kept");
    flush();
  }));

  it("applies the card radius", fakeAsync(() => {
    host.radius.set("card");
    openSheet();

    expect(panel()!.classList).toContain("tedi-sheet__panel--radius-card");
    flush();
  }));

  it("applies square corners, small padding, size limits and a panel class", fakeAsync(() => {
    host.radius.set("none");
    host.padding.set("small");
    host.minHeight.set("20rem");
    host.maxHeight.set("30rem");
    openSheet();

    const element = panel()!;
    expect(element.classList).toContain("tedi-sheet__panel--radius-none");
    expect(element.classList).toContain("tedi-sheet__panel--padding-small");
    expect(element.classList).toContain("custom-panel");
    expect(element.style.minHeight).toBe("20rem");
    expect(element.style.maxHeight).toBe("30rem");
    flush();
  }));

  it("drops the minimum height while collapsed", fakeAsync(() => {
    host.minHeight.set("20rem");
    host.collapsed.set(true);
    openSheet();

    expect(panel()!.style.minHeight).toBe("");
    flush();
  }));

  it("sets the header variant and title position classes", fakeAsync(() => {
    host.variant.set("default");
    host.titlePosition.set("center");
    openSheet();

    expect(header().classList).toContain("tedi-sheet-header--default");
    expect(header().classList).toContain("tedi-sheet-header--center");
    flush();
  }));

  describe("docked", () => {
    beforeEach(() => {
      host.showOverlay.set(false);
      host.trapFocus.set(false);
    });

    it("is not modal and has no dismiss buttons", fakeAsync(() => {
      openSheet();

      expect(panel()!.getAttribute("aria-modal")).toBe("false");
      expect(overlayElement.querySelector(".tedi-sheet__dismiss")).toBeNull();
      expect(
        overlayElement.querySelector(".tedi-sheet__overlay--no-overlay"),
      ).not.toBeNull();
      flush();
    }));

    it("closes on a click on the page, but not on the trigger", fakeAsync(() => {
      openSheet();

      trigger().dispatchEvent(new MouseEvent("click", { bubbles: true }));
      fixture.detectChanges();
      // The trigger toggles the sheet itself; the outside-click handler leaves it alone.
      expect(host.open()).toBe(false);

      openSheet();
      document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      fixture.detectChanges();
      expect(host.open()).toBe(false);
      flush();
    }));

    it("stays open on a page click with closeOnBackdropClick false", fakeAsync(() => {
      host.closeOnBackdropClick.set(false);
      openSheet();

      document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      fixture.detectChanges();
      expect(host.open()).toBe(true);
      flush();
    }));

    it("doesn't pull focus back from the page when closed", fakeAsync(() => {
      const outside = document.createElement("button");
      document.body.appendChild(outside);
      trigger().focus();
      openSheet();

      outside.focus();
      host.open.set(false);
      fixture.detectChanges();

      expect(document.activeElement).toBe(outside);
      outside.remove();
      flush();
    }));
  });

  describe("collapsing", () => {
    it("collapses to the header and hides the body and footer", fakeAsync(() => {
      host.collapsible.set(true);
      openSheet();

      const toggle = overlayElement.querySelector<HTMLElement>(
        ".tedi-sheet-header__collapse-toggle",
      )!;
      expect(toggle.getAttribute("aria-label")).toBe("sheet.collapse");

      toggle.click();
      fixture.detectChanges();

      expect(host.collapsed()).toBe(true);
      expect(toggle.getAttribute("aria-label")).toBe("sheet.expand");
      expect(
        overlayElement.querySelector<HTMLElement>(".tedi-sheet-body")!.hidden,
      ).toBe(true);
      expect(
        overlayElement.querySelector<HTMLElement>(".tedi-sheet-footer")!.hidden,
      ).toBe(true);
      flush();
    }));

    it("has no collapse button unless collapsible", fakeAsync(() => {
      openSheet();

      expect(
        overlayElement.querySelector(".tedi-sheet-header__collapse-toggle"),
      ).toBeNull();
      flush();
    }));

    it("expands when the collapsed header is dragged up", fakeAsync(() => {
      host.collapsed.set(true);
      openSheet();

      drag(header(), [{ y: -20 }, { y: -60 }]);

      expect(host.collapsed()).toBe(false);
      flush();
    }));

    it("captures the pointer on press, so a quick flick off the header still drags", fakeAsync(() => {
      host.collapsed.set(true);
      openSheet();
      const capture = jest.spyOn(panel()!, "setPointerCapture");

      header().dispatchEvent(
        pointer("pointerdown", { y: 0, pointerType: "mouse" }),
      );
      expect(capture).toHaveBeenCalledWith(1);

      // A captured pointer's events go to the panel wherever the pointer is.
      panel()!.dispatchEvent(
        pointer("pointermove", { y: -130, pointerType: "mouse" }),
      );
      panel()!.dispatchEvent(
        pointer("pointerup", { y: -130, pointerType: "mouse", buttons: 0 }),
      );
      fixture.detectChanges();

      expect(host.collapsed()).toBe(false);
      flush();
    }));
  });

  describe("dragging", () => {
    it("closes when the header is dragged down past the threshold", fakeAsync(() => {
      openSheet();

      drag(header(), [{ y: 20 }, { y: 140 }]);

      expect(host.open()).toBe(false);
      flush();
    }));

    it("follows the pointer while dragging", fakeAsync(() => {
      openSheet();

      header().dispatchEvent(pointer("pointerdown", { y: 0 }));
      header().dispatchEvent(pointer("pointermove", { y: 50 }));
      fixture.detectChanges();

      expect(panel()!.style.transform).toBe("translateY(50px)");
      flush();
    }));

    it("shows the grabbing cursor from the press until the release", fakeAsync(() => {
      openSheet();

      header().dispatchEvent(pointer("pointerdown", { y: 0 }));
      fixture.detectChanges();
      expect(panel()!.classList).toContain("tedi-sheet__panel--grabbing");

      header().dispatchEvent(pointer("pointerup", { y: 0, buttons: 0 }));
      fixture.detectChanges();
      expect(panel()!.classList).not.toContain("tedi-sheet__panel--grabbing");
      flush();
    }));

    it("keeps the normal cursor on a press that can't drag", fakeAsync(() => {
      openSheet();

      overlayElement
        .querySelector(".tedi-sheet-header__close")!
        .dispatchEvent(pointer("pointerdown", { y: 0 }));
      fixture.detectChanges();

      expect(panel()!.classList).not.toContain("tedi-sheet__panel--grabbing");
      flush();
    }));

    it("springs back after a short drag", fakeAsync(() => {
      openSheet();

      drag(header(), [{ y: 20 }, { y: 60 }]);

      expect(host.open()).toBe(true);
      expect(panel()!.style.transform).toBe("");
      flush();
    }));

    it("ignores a tap that doesn't pass the start threshold", fakeAsync(() => {
      openSheet();

      drag(header(), [{ y: 5 }]);

      expect(host.open()).toBe(true);
      flush();
    }));

    it("ignores a mostly horizontal swipe", fakeAsync(() => {
      openSheet();

      drag(header(), [
        { x: 80, y: 20 },
        { x: 90, y: 200 },
      ]);

      expect(host.open()).toBe(true);
      flush();
    }));

    it("doesn't drag from the close button", fakeAsync(() => {
      openSheet();

      drag(overlayElement.querySelector(".tedi-sheet-header__close")!, [
        { y: 20 },
        { y: 200 },
      ]);

      expect(host.open()).toBe(true);
      flush();
    }));

    it("doesn't drag from the body", fakeAsync(() => {
      openSheet();

      drag(overlayElement.querySelector(".tedi-sheet-body")!, [
        { y: 20 },
        { y: 200 },
      ]);

      expect(host.open()).toBe(true);
      flush();
    }));

    it("doesn't drag without the handle", fakeAsync(() => {
      host.showHandle.set(false);
      openSheet();

      expect(
        overlayElement.querySelector(".tedi-sheet__handle-zone"),
      ).toBeNull();
      drag(header(), [{ y: 20 }, { y: 200 }]);

      expect(host.open()).toBe(true);
      flush();
    }));

    it("cancels the drag when the mouse button is released outside", fakeAsync(() => {
      openSheet();

      header().dispatchEvent(
        pointer("pointerdown", { y: 0, pointerType: "mouse" }),
      );
      header().dispatchEvent(
        pointer("pointermove", { y: 50, pointerType: "mouse" }),
      );
      fixture.detectChanges();
      header().dispatchEvent(
        pointer("pointermove", { y: 60, pointerType: "mouse", buttons: 0 }),
      );
      fixture.detectChanges();

      expect(panel()!.style.transform).toBe("");
      flush();
    }));
  });

  describe("snap points", () => {
    // jsdom drops `dvh` lengths, so read the style the panel is bound to.
    const panelStyle = () => {
      const sheet = fixture.debugElement
        .query(By.directive(SheetComponent))
        .injector.get(SheetComponent);
      return sheet["panelStyle"]();
    };

    beforeEach(() => {
      Object.defineProperty(window, "innerHeight", {
        value: 1000,
        configurable: true,
      });
    });

    it("opens at the tallest snap point", fakeAsync(() => {
      host.snapPoints.set([0.9, 0.4]);
      openSheet();

      expect(panelStyle()["height"]).toBe("90dvh");
      flush();
    }));

    it("snaps to the nearest point after a drag", fakeAsync(() => {
      host.snapPoints.set([0.4, 0.9]);
      openSheet();

      drag(header(), [{ y: 20 }, { y: 450 }]);

      expect(host.snapped).toBe(0.4);
      expect(panelStyle()["height"]).toBe("40dvh");
      flush();
    }));

    it("closes when dragged below the lowest point", fakeAsync(() => {
      host.snapPoints.set([0.4, 0.9]);
      openSheet();

      drag(header(), [{ y: 20 }, { y: 700 }]);

      expect(host.open()).toBe(false);
      flush();
    }));
  });

  it("cleans up the overlay on destroy", fakeAsync(() => {
    openSheet();
    fixture.destroy();

    expect(panel()).toBeNull();
    discardPeriodicTasks();
    flush();
  }));
});

@Component({
  standalone: true,
  imports: [
    SheetComponent,
    SheetContentDirective,
    SheetCloseDirective,
    SheetHeaderComponent,
    SheetHeaderContentDirective,
    SheetBodyComponent,
  ],
  template: `
    <tedi-sheet [open]="true">
      <ng-template tediSheetContent ariaLabelledBy="custom-title">
        <tedi-sheet-header title="Ignored" collapsible>
          <div tedi-sheet-header-content>
            <span id="custom-title">Settings</span>
            <button type="button" class="custom-close" tediSheetClose>
              Done
            </button>
          </div>
        </tedi-sheet-header>
        <tedi-sheet-body>Body</tedi-sheet-body>
      </ng-template>
    </tedi-sheet>
  `,
})
class CustomHeaderHostComponent {}

describe("SheetHeaderComponent with custom content", () => {
  let fixture: ComponentFixture<CustomHeaderHostComponent>;
  let overlayElement: HTMLElement;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [CustomHeaderHostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });

    fixture = TestBed.createComponent(CustomHeaderHostComponent);
    overlayElement = TestBed.inject(OverlayContainer).getContainerElement();
    fixture.detectChanges();
    tick(16);
    fixture.detectChanges();
  }));

  afterEach(() => fixture.destroy());

  it("replaces the default layout with the custom content", fakeAsync(() => {
    const header = overlayElement.querySelector(".tedi-sheet-header")!;

    expect(header.querySelector(".tedi-sheet-header__content")).not.toBeNull();
    expect(header.querySelector(".tedi-sheet-header__title")).toBeNull();
    expect(header.querySelector(".tedi-sheet-header__close")).toBeNull();
    expect(
      header.querySelector(".tedi-sheet-header__collapse-toggle"),
    ).toBeNull();
    flush();
  }));

  it("is labelled by the content's own element, not the ignored title", fakeAsync(() => {
    const panel = overlayElement.querySelector(".tedi-sheet__panel")!;
    const sheet = fixture.debugElement
      .query(By.directive(SheetComponent))
      .injector.get(SheetComponent);

    expect(sheet.hasTitle()).toBe(false);
    expect(panel.getAttribute("aria-labelledby")).toBe("custom-title");
    flush();
  }));

  it("keeps the sheet's own controls working inside the custom content", fakeAsync(() => {
    const sheet = fixture.debugElement
      .query(By.directive(SheetComponent))
      .injector.get(SheetComponent);

    overlayElement.querySelector<HTMLElement>(".custom-close")!.click();
    fixture.detectChanges();

    expect(sheet.open()).toBe(false);
    flush();
  }));
});
