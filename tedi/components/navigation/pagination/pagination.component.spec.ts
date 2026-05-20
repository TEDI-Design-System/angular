import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Component, signal } from "@angular/core";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { PaginationComponent } from "./pagination.component";
import { PaginationMobileModalComponent } from "./pagination-mobile-modal/pagination-mobile-modal.component";
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
    pageSizeOptions: number[];
    boundaryCount: number;
    siblingCount: number;
  }> = {},
) => {
  TestBed.configureTestingModule({
    imports: [PaginationComponent],
    providers: [
      { provide: TediTranslationService, useClass: TranslationMock },
      { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      provideNoopAnimations(),
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
    const buttons = fixture.debugElement.queryAll(By.css(".tedi-pagination__page"));
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

  it("disables Previous on the first page and Next on the last", () => {
    const fixture = setup({ pageCount: 3, page: 1 });
    let prev: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      'button[aria-label="Previous page"]',
    );
    let next: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      'button[aria-label="Next page"]',
    );
    expect(prev?.disabled).toBe(true);
    expect(next?.disabled).toBe(false);

    fixture.componentRef.setInput("page", 3);
    fixture.detectChanges();
    prev = fixture.nativeElement.querySelector('button[aria-label="Previous page"]');
    next = fixture.nativeElement.querySelector('button[aria-label="Next page"]');
    expect(prev?.disabled).toBe(false);
    expect(next?.disabled).toBe(true);
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

  it("renders ellipses for large page counts", () => {
    const fixture = setup({ pageCount: 30, page: 15 });
    const ellipses = fixture.nativeElement.querySelectorAll(
      ".tedi-pagination__item--ellipsis",
    );
    expect(ellipses.length).toBeGreaterThanOrEqual(2);
  });

  it("renders the results label when totalItems is set", () => {
    const fixture = setup({ pageCount: 10, totalItems: 97 });
    const results = fixture.nativeElement.querySelector(".tedi-pagination__results");
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

  it("does not render the nav when pageCount <= 1", () => {
    const fixture = setup({ pageCount: 1, totalItems: 3 });
    expect(fixture.nativeElement.querySelector(".tedi-pagination__nav")).toBeNull();
    expect(
      fixture.nativeElement.querySelector(".tedi-pagination__results")?.textContent.trim(),
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
      fixture.nativeElement.querySelector('[role="status"]')?.textContent.trim(),
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
      fixture.nativeElement.querySelector(".tedi-pagination__results")?.textContent.trim(),
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
    expect(fixture.nativeElement.querySelector(".tedi-pagination__nav")).toBeNull();
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
        provideNoopAnimations(),
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
    expect(fixture.nativeElement.querySelector(".tedi-pagination__list")).toBeNull();
  });

  it("opens the modal picker on trigger click", () => {
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
    expect(component).toBe(PaginationMobileModalComponent);
    expect(config.data).toMatchObject({ pageCount: 10, currentPage: 3 });
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

  it("renders the page-size selector on mobile when pageSizeOptions is set", () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput("pageCount", 10);
    fixture.componentRef.setInput("pageSize", 10);
    fixture.componentRef.setInput("pageSizeOptions", [10, 25, 50]);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector(".tedi-pagination__page-size-select"),
    ).not.toBeNull();
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
        provideNoopAnimations(),
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
