import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import {
  PaginationMobileModalComponent,
  PaginationMobileModalData,
} from "./pagination-mobile-modal.component";
import { ModalComponent } from "../../../overlay/modal/modal.component";
import { ModalRef } from "../../../overlay/modal/modal-ref";
import { MODAL_DATA } from "../../../overlay/modal/modal.types";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";
import { PaginationLabels } from "../pagination.types";

const labels: PaginationLabels = {
  ariaLabel: "Pagination",
  previous: "Previous page",
  next: "Next page",
  pageAriaLabel: (page) => `Go to page ${page}`,
  currentPageAriaLabel: (page) => `Current page, page ${page}`,
  results: (count) => `${count} results`,
  pageSize: "Show per page",
  pageStatus: (page, total) => `Page ${page} of ${total}`,
};

class MockModalComponent {
  open = {
    value: false,
    set: jest.fn(),
  };
}

const setup = (data: Partial<PaginationMobileModalData> = {}) => {
  const modalRef = { close: jest.fn() };
  const modalData: PaginationMobileModalData = {
    pageCount: 5,
    currentPage: 2,
    labels,
    ...data,
  };

  TestBed.configureTestingModule({
    imports: [PaginationMobileModalComponent],
    providers: [
      { provide: ModalComponent, useClass: MockModalComponent },
      { provide: ModalRef, useValue: modalRef },
      { provide: MODAL_DATA, useValue: modalData },
      { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      provideNoopAnimations(),
    ],
  });

  const fixture: ComponentFixture<PaginationMobileModalComponent> =
    TestBed.createComponent(PaginationMobileModalComponent);
  fixture.detectChanges();
  return { fixture, modalRef };
};

describe("PaginationMobileModalComponent", () => {
  it("renders one button per page", () => {
    const { fixture } = setup({ pageCount: 7 });
    const buttons = fixture.debugElement.queryAll(
      By.css(".tedi-pagination-mobile-modal__item"),
    );
    expect(buttons.length).toBe(7);
    expect(buttons.map((b) => b.nativeElement.textContent.trim())).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
    ]);
  });

  it("marks the current page with aria-current and the selected modifier", () => {
    const { fixture } = setup({ pageCount: 5, currentPage: 3 });
    const buttons = fixture.debugElement.queryAll(
      By.css(".tedi-pagination-mobile-modal__item"),
    );
    const current = buttons[2].nativeElement as HTMLButtonElement;
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(current.classList).toContain(
      "tedi-pagination-mobile-modal__item--selected",
    );
    expect(current.getAttribute("aria-label")).toBe("Current page, page 3");

    const other = buttons[0].nativeElement as HTMLButtonElement;
    expect(other.getAttribute("aria-current")).toBeNull();
    expect(other.getAttribute("aria-label")).toBe("Go to page 1");
  });

  it("closes the modal with the selected page when a button is clicked", () => {
    const { fixture, modalRef } = setup({ pageCount: 5, currentPage: 2 });
    const buttons = fixture.debugElement.queryAll(
      By.css(".tedi-pagination-mobile-modal__item"),
    );
    (buttons[3].nativeElement as HTMLButtonElement).click();
    expect(modalRef.close).toHaveBeenCalledWith(4);
  });
});
