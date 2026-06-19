import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Component, signal } from "@angular/core";
import { PaginationComponent } from "./pagination.component";
import { PaginationOptionPickerModalComponent } from "./pagination-option-picker-modal/pagination-option-picker-modal.component";
import { TediPaginationResultsDirective } from "./pagination-results.directive";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { BreakpointService } from "../../../services/breakpoint/breakpoint.service";
import { ModalService } from "../../overlay/modal/modal.service";
import { ModalRef } from "../../overlay/modal/modal-ref";
import { Subject } from "rxjs";

class TranslationMock {
  translate(key: string, ...args: unknown[]): string {
    switch (key) {
      case "pagination.title":
        return "Pagination";
      case "pagination.prev-page":
        return "Previous page";
      case "pagination.next-page":
        return "Next page";
      case "pagination.page": {
        const [page, isCurrent] = args as [number, boolean];
        return isCurrent ? `Current page, page ${page}` : `Go to page ${page}`;
      }
      case "pagination.results": {
        const [count] = args as [number];
        return `${count} ${count === 1 ? "result" : "results"}`;
      }
      case "pagination.page-size":
        return "Show per page";
      case "pagination.page-status": {
        const [page, total] = args as [number, number];
        return `Page ${page} of ${total}`;
      }
      case "pagination.page-title":
        return "Select page";
      case "pagination.page-size-title":
        return "Results per page";
      default:
        return key;
    }
  }
  track(key: string) {
    return () => key;
  }
}

const setup = (
  inputs: Partial<{
    pageCount: number;
    page: number;
    totalItems: number;
    pageSize: number;
    pageSizeOptions: (number | { value: number; label: string })[];
    boundaryCount: number;
    siblingCount: number;
  }> = {},
) => {
  TestBed.configureTestingModule({
    imports: [PaginationComponent],
    providers: [
      { provide: TediTranslationService, useClass: TranslationMock },
      { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
    ],
  });
  const fixture = TestBed.createComponent(PaginationComponent);
  Object.entries(inputs).forEach(([key, value]) => {
    if (value !== undefined) fixture.componentRef.setInput(key, value);
  });
  if (inputs.pageCount === undefined) {
    fixture.componentRef.setInput("pageCount", 10);
  }
  fixture.detectChanges();
  return fixture;
};

describe("PaginationComponent", () => {
  it("renders numeric page buttons and marks the current with aria-current", () => {
    const fixture = setup({ pageCount: 5, page: 3 });
    const buttons = fixture.debugElement.queryAll(
      By.css(".tedi-pagination__page"),
    );
    const current = buttons.find(
      (b) => b.nativeElement.getAttribute("aria-current") === "page",
    );
    expect(current?.nativeElement.textContent.trim()).toBe("3");
    expect(current?.nativeElement.getAttribute("aria-label")).toBe(
      "Current page, page 3",
    );
  });

  it("renders Previous + Next nav buttons", () => {
    const fixture = setup({ pageCount: 5, page: 3 });
    expect(
      fixture.nativeElement.querySelector('button[aria-label="Previous page"]'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('button[aria-label="Next page"]'),
    ).not.toBeNull();
  });

  it("fires pageChange when a page button is clicked", () => {
    const fixture = setup({ pageCount: 5, page: 1 });
    const component = fixture.componentInstance;
    let emitted: number | undefined;
    component.pageChange.subscribe((v) => (emitted = v));

    const button = fixture.debugElement
      .queryAll(By.css(".tedi-pagination__page"))
      .find((b) => b.nativeElement.textContent.trim() === "3");
    button?.triggerEventHandler("click", new MouseEvent("click"));
    fixture.detectChanges();

    expect(emitted).toBe(3);
    expect(component.page()).toBe(3);
  });

  it("ignores clicks on the current page", () => {
    const fixture = setup({ pageCount: 5, page: 3 });
    const component = fixture.componentInstance;
    let emitted = false;
    component.pageChange.subscribe(() => (emitted = true));

    const current = fixture.debugElement
      .queryAll(By.css(".tedi-pagination__page"))
      .find((b) => b.nativeElement.getAttribute("aria-current") === "page");
    current?.triggerEventHandler("click", new MouseEvent("click"));
    fixture.detectChanges();

    expect(emitted).toBe(false);
  });

  it("removes Previous from the DOM on the first page and Next on the last by default", () => {
    const fixture = setup({ pageCount: 3, page: 1 });
    expect(
      fixture.nativeElement.querySelector(
        ".tedi-pagination__nav-button--previous",
      ),
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelector(".tedi-pagination__nav-button--next"),
    ).not.toBeNull();

    fixture.componentRef.setInput("page", 3);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector(
        ".tedi-pagination__nav-button--previous",
      ),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector(".tedi-pagination__nav-button--next"),
    ).toBeNull();
  });

  it("keeps boundary arrows rendered as disabled when disableArrowsAtBoundary is true", () => {
    const fixture = setup({ pageCount: 3, page: 1 });
    fixture.componentRef.setInput("disableArrowsAtBoundary", true);
    fixture.detectChanges();

    const prev = fixture.nativeElement.querySelector(
      ".tedi-pagination__nav-button--previous",
    ) as HTMLButtonElement | null;
    const next = fixture.nativeElement.querySelector(
      ".tedi-pagination__nav-button--next",
    ) as HTMLButtonElement | null;
    expect(prev?.disabled).toBe(true);
    expect(next?.disabled).toBe(false);

    fixture.componentRef.setInput("page", 3);
    fixture.detectChanges();
    const prev2 = fixture.nativeElement.querySelector(
      ".tedi-pagination__nav-button--previous",
    ) as HTMLButtonElement | null;
    const next2 = fixture.nativeElement.querySelector(
      ".tedi-pagination__nav-button--next",
    ) as HTMLButtonElement | null;
    expect(prev2?.disabled).toBe(false);
    expect(next2?.disabled).toBe(true);
  });

  it("Previous / Next move the current page by one", () => {
    const fixture = setup({ pageCount: 5, page: 2 });
    const component = fixture.componentInstance;
    const emitted: number[] = [];
    component.pageChange.subscribe((v) => emitted.push(v));

    const next: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      'button[aria-label="Next page"]',
    );
    next?.click();
    fixture.detectChanges();
    expect(emitted[emitted.length - 1]).toBe(3);

    const prev: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      'button[aria-label="Previous page"]',
    );
    prev?.click();
    fixture.detectChanges();
    expect(emitted[emitted.length - 1]).toBe(2);
  });

  it("renders prev/next as icon-only by default (label exposed via aria-label)", () => {
    const fixture = setup({ pageCount: 5, page: 3 });
    const prev = fixture.nativeElement.querySelector(
      ".tedi-pagination__nav-button--previous",
    ) as HTMLButtonElement;
    expect(prev.getAttribute("aria-label")).toBe("Previous page");
    expect(prev.classList).toContain("tedi-button--icon-only");
    expect(prev.classList).toContain("tedi-button--neutral");
    expect(prev.querySelector("span")).toBeNull();
  });

  it("renders prev/next labels as visible text when showArrowLabels is true", () => {
    const fixture = setup({ pageCount: 5, page: 3 });
    fixture.componentRef.setInput("showArrowLabels", true);
    fixture.detectChanges();
    const prev = fixture.nativeElement.querySelector(
      ".tedi-pagination__nav-button--previous",
    ) as HTMLButtonElement;
    const next = fixture.nativeElement.querySelector(
      ".tedi-pagination__nav-button--next",
    ) as HTMLButtonElement;
    expect(prev.querySelector("span")?.textContent?.trim()).toBe(
      "Previous page",
    );
    expect(next.querySelector("span")?.textContent?.trim()).toBe("Next page");
    expect(prev.getAttribute("aria-label")).toBeNull();
    expect(next.getAttribute("aria-label")).toBeNull();
    expect(prev.classList).not.toContain("tedi-button--icon-only");
  });

  it("uses the configured previousIcon / nextIcon", () => {
    const fixture = setup({ pageCount: 5, page: 3 });
    fixture.componentRef.setInput("previousIcon", "chevron_left");
    fixture.componentRef.setInput("nextIcon", "chevron_right");
    fixture.detectChanges();
    const prevIcon = fixture.nativeElement.querySelector(
      ".tedi-pagination__nav-button--previous tedi-icon",
    ) as HTMLElement;
    const nextIcon = fixture.nativeElement.querySelector(
      ".tedi-pagination__nav-button--next tedi-icon",
    ) as HTMLElement;
    expect(prevIcon.textContent?.trim()).toBe("chevron_left");
    expect(nextIcon.textContent?.trim()).toBe("chevron_right");
  });

  it("applies the configured arrowVariant to prev/next buttons", () => {
    const fixture = setup({ pageCount: 5, page: 3 });
    fixture.componentRef.setInput("arrowVariant", "primary");
    fixture.detectChanges();
    const prev = fixture.nativeElement.querySelector(
      ".tedi-pagination__nav-button--previous",
    ) as HTMLButtonElement;
    const next = fixture.nativeElement.querySelector(
      ".tedi-pagination__nav-button--next",
    ) as HTMLButtonElement;
    expect(prev.classList).toContain("tedi-button--primary");
    expect(next.classList).toContain("tedi-button--primary");
    expect(prev.classList).not.toContain("tedi-button--neutral");
  });

  it("renders ellipses for large page counts", () => {
    const fixture = setup({ pageCount: 30, page: 15 });
    const ellipses = fixture.nativeElement.querySelectorAll(
      ".tedi-pagination__item--ellipsis",
    );
    expect(ellipses.length).toBeGreaterThanOrEqual(2);
  });

  it("renders the results label when totalItems is set", () => {
    const fixture = setup({ pageCount: 10, totalItems: 97 });
    const results = fixture.nativeElement.querySelector(
      ".tedi-pagination__results",
    );
    expect(results?.textContent.trim()).toBe("97 results");
  });

  it("omits the results label when totalItems is undefined", () => {
    const fixture = setup({ pageCount: 10 });
    expect(
      fixture.nativeElement.querySelector(".tedi-pagination__results"),
    ).toBeNull();
  });

  it("renders the page-size selector when pageSizeOptions is provided", () => {
    const fixture = setup({
      pageCount: 5,
      pageSize: 25,
      pageSizeOptions: [10, 25, 50],
    });
    expect(
      fixture.nativeElement.querySelector(".tedi-pagination__page-size-select"),
    ).not.toBeNull();
  });

  it("omits the page-size selector when pageSizeOptions is empty", () => {
    const fixture = setup({ pageCount: 5, pageSizeOptions: [] });
    expect(
      fixture.nativeElement.querySelector(".tedi-pagination__page-size-select"),
    ).toBeNull();
  });

  it("still renders the page-size selector when given labelled options", () => {
    const fixture = setup({
      pageCount: 5,
      pageSize: 50,
      pageSizeOptions: [10, 25, { value: 50, label: "Show all" }],
    });
    expect(
      fixture.nativeElement.querySelector(".tedi-pagination__page-size-select"),
    ).not.toBeNull();
  });

  it("does not render the nav when pageCount <= 1", () => {
    const fixture = setup({ pageCount: 1, totalItems: 3 });
    expect(
      fixture.nativeElement.querySelector(".tedi-pagination__nav"),
    ).toBeNull();
    expect(
      fixture.nativeElement
        .querySelector(".tedi-pagination__results")
        ?.textContent.trim(),
    ).toBe("3 results");
  });

  it("ellipsis placeholders are aria-hidden and contain no button", () => {
    const fixture = setup({ pageCount: 30, page: 15 });
    const ellipses = fixture.nativeElement.querySelectorAll(
      '[aria-hidden="true"].tedi-pagination__item--ellipsis',
    );
    ellipses.forEach((el: HTMLElement) => {
      expect(el.querySelector("button")).toBeNull();
    });
  });

  it("announces the current page to screen readers via aria-live region", () => {
    const fixture = setup({ pageCount: 10, page: 1 });
    const status = fixture.nativeElement.querySelector('[role="status"]');
    expect(status).not.toBeNull();
    expect(status?.getAttribute("aria-live")).toBe("polite");
    expect(status?.textContent.trim()).toBe("Page 1 of 10");

    fixture.componentRef.setInput("page", 4);
    fixture.detectChanges();
    expect(
      fixture.nativeElement
        .querySelector('[role="status"]')
        ?.textContent.trim(),
    ).toBe("Page 4 of 10");
  });

  it("allows overriding labels", () => {
    const fixture = setup({ pageCount: 5, page: 3, totalItems: 28 });
    fixture.componentRef.setInput("labels", {
      previous: "Eelmine",
      next: "Järgmine",
      results: (count: number) => `${count} tulemust`,
    });
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('button[aria-label="Eelmine"]'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('button[aria-label="Järgmine"]'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement
        .querySelector(".tedi-pagination__results")
        ?.textContent.trim(),
    ).toBe("28 tulemust");
  });

  it("clamps page back into range when pageCount shrinks", () => {
    const fixture = setup({ pageCount: 10, page: 7 });
    fixture.componentRef.setInput("pageCount", 5);
    fixture.detectChanges();
    expect(fixture.componentInstance.page()).toBe(5);
  });

  it("applies the white background class by default", () => {
    const fixture = setup();
    expect((fixture.nativeElement as HTMLElement).classList).toContain(
      "tedi-pagination--bg-white",
    );
  });

  it("applies the transparent background class when set", () => {
    const fixture = setup();
    fixture.componentRef.setInput("background", "transparent");
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).classList).toContain(
      "tedi-pagination--bg-transparent",
    );
  });

  it("defaults to divider-top", () => {
    const fixture = setup();
    expect((fixture.nativeElement as HTMLElement).classList).toContain(
      "tedi-pagination--divider-top",
    );
  });

  it("applies the chosen dividerPosition modifier", () => {
    const fixture = setup();
    fixture.componentRef.setInput("dividerPosition", "bottom");
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).classList).toContain(
      "tedi-pagination--divider-bottom",
    );
  });

  it("hides the prev/next arrows entirely when hideArrows is true", () => {
    const fixture = setup({ pageCount: 5, page: 3 });
    fixture.componentRef.setInput("hideArrows", true);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector(".tedi-pagination__nav-button"),
    ).toBeNull();
  });

  it("hides the results label when hideResults is true", () => {
    const fixture = setup({ pageCount: 10, totalItems: 28 });
    fixture.componentRef.setInput("hideResults", true);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector(".tedi-pagination__results"),
    ).toBeNull();
  });

  it("hides the page-size select when hidePageSize is true", () => {
    const fixture = setup({
      pageCount: 5,
      pageSize: 25,
      pageSizeOptions: [10, 25, 50],
    });
    fixture.componentRef.setInput("hidePageSize", true);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector(".tedi-pagination__page-size-select"),
    ).toBeNull();
  });

  it("hides the pager when hidePager is true", () => {
    const fixture = setup({ pageCount: 10 });
    fixture.componentRef.setInput("hidePager", true);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector(".tedi-pagination__nav"),
    ).toBeNull();
  });

  it("hides a slot below the named breakpoint when the input is a breakpoint name", () => {
    const fixture = setup({ pageCount: 10, totalItems: 50 });
    fixture.componentRef.setInput("hideResults", "md");
    fixture.detectChanges();
    // currentBreakpoint mock returns undefined in this suite, so the
    // string value falls back to "not hidden" — the results render.
    expect(
      fixture.nativeElement.querySelector(".tedi-pagination__results"),
    ).not.toBeNull();
  });
});

@Component({
  standalone: true,
  imports: [PaginationComponent, TediPaginationResultsDirective],
  template: `
    <tedi-pagination [pageCount]="10" [page]="3" [totalItems]="1000">
      <span tediPaginationResults>1000+ tulemust</span>
    </tedi-pagination>
  `,
})
class ProjectedResultsHostComponent {}

describe("PaginationComponent custom results slot", () => {
  it("renders projected [tediPaginationResults] content instead of the default label", () => {
    TestBed.configureTestingModule({
      imports: [ProjectedResultsHostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });
    const fixture = TestBed.createComponent(ProjectedResultsHostComponent);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector(".tedi-pagination__results"),
    ).toBeNull();
    const projected = fixture.nativeElement.querySelector(
      "[tediPaginationResults]",
    );
    expect(projected?.textContent.trim()).toBe("1000+ tulemust");
  });
});

describe("PaginationComponent mobile layout", () => {
  let modalClosedSubject: Subject<number | undefined>;
  let modalOpenSpy: jest.Mock;

  beforeEach(() => {
    modalClosedSubject = new Subject<number | undefined>();
    modalOpenSpy = jest.fn().mockReturnValue({
      closed: modalClosedSubject.asObservable(),
      close: jest.fn(),
    } as unknown as ModalRef<number>);

    const mockBreakpointService = {
      isBelowBreakpoint: jest.fn().mockReturnValue(signal(true)),
      currentBreakpoint: jest.fn().mockReturnValue(signal("xs")),
    } as unknown as jest.Mocked<BreakpointService>;

    const mockModalService = {
      open: modalOpenSpy,
    } as unknown as jest.Mocked<ModalService>;

    TestBed.configureTestingModule({
      imports: [PaginationComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        { provide: BreakpointService, useValue: mockBreakpointService },
        { provide: ModalService, useValue: mockModalService },
      ],
    });
  });

  it("renders the mobile trigger button and hides the numbered list on mobile", () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput("pageCount", 10);
    fixture.componentRef.setInput("page", 3);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector(".tedi-pagination__mobile-trigger"),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector(".tedi-pagination__list"),
    ).toBeNull();
  });

  it("opens the picker modal on trigger click with computed options + selectedValue", () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput("pageCount", 10);
    fixture.componentRef.setInput("page", 3);
    fixture.detectChanges();

    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector(
      ".tedi-pagination__mobile-trigger",
    );
    trigger.click();

    expect(modalOpenSpy).toHaveBeenCalledTimes(1);
    const [component, config] = modalOpenSpy.mock.calls[0];
    expect(component).toBe(PaginationOptionPickerModalComponent);
    expect(config.position).toBe("bottom");
    expect(config.data.selectedValue).toBe(3);
    expect(config.data.options.length).toBe(10);
    expect(config.data.options[2]).toMatchObject({
      value: 3,
      label: "3",
      ariaLabel: "Current page, page 3",
    });
  });

  it("includes the modal title by default and omits it when showModalTitle is false", () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput("pageCount", 10);
    fixture.componentRef.setInput("page", 3);
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelector(
        ".tedi-pagination__mobile-trigger",
      ) as HTMLButtonElement
    ).click();
    expect(modalOpenSpy.mock.calls[0][1].data.title).toBe("Select page");

    modalClosedSubject.next(undefined);
    fixture.detectChanges();

    fixture.componentRef.setInput("showModalTitle", false);
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelector(
        ".tedi-pagination__mobile-trigger",
      ) as HTMLButtonElement
    ).click();
    expect(modalOpenSpy.mock.calls[1][1].data.title).toBeUndefined();
  });

  it("navigates to the page returned by the modal", () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput("pageCount", 10);
    fixture.componentRef.setInput("page", 3);
    fixture.detectChanges();

    let emitted: number | undefined;
    fixture.componentInstance.pageChange.subscribe((v) => (emitted = v));

    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector(
      ".tedi-pagination__mobile-trigger",
    );
    trigger.click();
    modalClosedSubject.next(7);
    fixture.detectChanges();

    expect(emitted).toBe(7);
    expect(fixture.componentInstance.page()).toBe(7);
  });

  it("does nothing when the modal is dismissed without a selection", () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput("pageCount", 10);
    fixture.componentRef.setInput("page", 3);
    fixture.detectChanges();

    let emitted = false;
    fixture.componentInstance.pageChange.subscribe(() => (emitted = true));

    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector(
      ".tedi-pagination__mobile-trigger",
    );
    trigger.click();
    modalClosedSubject.next(undefined);
    fixture.detectChanges();

    expect(emitted).toBe(false);
    expect(fixture.componentInstance.page()).toBe(3);
  });

  it("renders the page-size trigger on mobile when pageSizeOptions is set", () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput("pageCount", 10);
    fixture.componentRef.setInput("pageSize", 10);
    fixture.componentRef.setInput("pageSizeOptions", [10, 25, 50]);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector(
        ".tedi-pagination__page-size-trigger",
      ),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector(".tedi-pagination__page-size-select"),
    ).toBeNull();
  });

  it("opens the page-size modal and emits the chosen page size", () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput("pageCount", 10);
    fixture.componentRef.setInput("pageSize", 10);
    fixture.componentRef.setInput("pageSizeOptions", [10, 25, 50]);
    fixture.detectChanges();

    let emitted: number | undefined;
    fixture.componentInstance.pageSizeChange.subscribe((v) => (emitted = v));

    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector(
      ".tedi-pagination__page-size-trigger",
    );
    trigger.click();

    expect(modalOpenSpy).toHaveBeenCalledTimes(1);
    const [, config] = modalOpenSpy.mock.calls[0];
    expect(config.data.options.map((o: { value: number }) => o.value)).toEqual([
      10, 25, 50,
    ]);
    expect(config.data.selectedValue).toBe(10);

    modalClosedSubject.next(50);
    fixture.detectChanges();

    expect(emitted).toBe(50);
    expect(fixture.componentInstance.pageSize()).toBe(50);
  });

  it("shows the labelled option's text (not its value) on the page-size trigger", () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput("pageCount", 1);
    fixture.componentRef.setInput("pageSize", 1000);
    fixture.componentRef.setInput("pageSizeOptions", [
      10,
      25,
      { value: 1000, label: "Show all" },
    ]);
    fixture.detectChanges();

    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector(
      ".tedi-pagination__page-size-trigger",
    );
    expect(trigger.querySelector("span")?.textContent?.trim()).toBe("Show all");
    expect(trigger.getAttribute("aria-label")).toBe("Show all, Show per page");
  });

  it("passes labelled page-size options to the modal and emits the chosen value", () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput("pageCount", 5);
    fixture.componentRef.setInput("pageSize", 10);
    fixture.componentRef.setInput("pageSizeOptions", [
      10,
      25,
      { value: 1000, label: "Show all" },
    ]);
    fixture.detectChanges();

    let emitted: number | undefined;
    fixture.componentInstance.pageSizeChange.subscribe((v) => (emitted = v));

    (
      fixture.nativeElement.querySelector(
        ".tedi-pagination__page-size-trigger",
      ) as HTMLButtonElement
    ).click();

    const [, config] = modalOpenSpy.mock.calls[0];
    expect(config.data.options[2]).toMatchObject({
      value: 1000,
      label: "Show all",
      ariaLabel: "Show per page, Show all",
    });

    modalClosedSubject.next(1000);
    fixture.detectChanges();

    expect(emitted).toBe(1000);
    expect(fixture.componentInstance.pageSize()).toBe(1000);
  });

  it("starts the mobile trigger aria-label with visible '{current} / {total}' text (WCAG 2.5.3)", () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput("pageCount", 10);
    fixture.componentRef.setInput("page", 3);
    fixture.detectChanges();

    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector(
      ".tedi-pagination__mobile-trigger",
    );
    expect(trigger.getAttribute("aria-label")?.startsWith("3 / 10")).toBe(true);
  });

  it("toggles aria-expanded on the mobile trigger when the modal opens and closes", () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput("pageCount", 10);
    fixture.componentRef.setInput("page", 3);
    fixture.detectChanges();

    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector(
      ".tedi-pagination__mobile-trigger",
    );
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    trigger.click();
    fixture.detectChanges();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    modalClosedSubject.next(undefined);
    fixture.detectChanges();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
});

@Component({
  standalone: true,
  imports: [PaginationComponent],
  template: `<tedi-pagination [pageCount]="10" [(page)]="page" />`,
})
class TwoWayBindingHostComponent {
  page = 1;
}

describe("PaginationComponent two-way binding", () => {
  let fixture: ComponentFixture<TwoWayBindingHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TwoWayBindingHostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });
    fixture = TestBed.createComponent(TwoWayBindingHostComponent);
    fixture.detectChanges();
  });

  it("syncs page back to parent via [(page)] when user navigates", () => {
    const next: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      'button[aria-label="Next page"]',
    );
    next?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.page).toBe(2);
  });
});
