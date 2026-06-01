import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import {
  PaginationOptionPickerModalComponent,
  PaginationOptionPickerModalData,
} from "./pagination-option-picker-modal.component";
import { ModalComponent } from "../../../overlay/modal/modal.component";
import { ModalRef } from "../../../overlay/modal/modal-ref";
import { MODAL_DATA } from "../../../overlay/modal/modal.types";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";

class MockModalComponent {
  open = { value: false, set: jest.fn() };
}

const pageOptions = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
    ariaLabel: i + 1 === 2 ? `Current page, page ${i + 1}` : `Go to page ${i + 1}`,
  }));

const setup = (data: Partial<PaginationOptionPickerModalData> = {}) => {
  const modalRef = { close: jest.fn() };
  const modalData: PaginationOptionPickerModalData = {
    options: pageOptions(5),
    selectedValue: 2,
    ...data,
  };

  TestBed.configureTestingModule({
    imports: [PaginationOptionPickerModalComponent],
    providers: [
      { provide: ModalComponent, useClass: MockModalComponent },
      { provide: ModalRef, useValue: modalRef },
      { provide: MODAL_DATA, useValue: modalData },
      { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      provideNoopAnimations(),
    ],
  });

  const fixture: ComponentFixture<PaginationOptionPickerModalComponent> =
    TestBed.createComponent(PaginationOptionPickerModalComponent);
  fixture.detectChanges();
  return { fixture, modalRef };
};

describe("PaginationOptionPickerModalComponent", () => {
  it("renders one button per option", () => {
    const { fixture } = setup({ options: pageOptions(7) });
    const buttons = fixture.debugElement.queryAll(
      By.css(".tedi-pagination-option-picker-modal__item"),
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

  it("marks the selected option with aria-current and the modifier class", () => {
    const { fixture } = setup({ options: pageOptions(5), selectedValue: 3 });
    const buttons = fixture.debugElement.queryAll(
      By.css(".tedi-pagination-option-picker-modal__item"),
    );
    const selected = buttons[2].nativeElement as HTMLButtonElement;
    expect(selected.getAttribute("aria-current")).toBe("true");
    expect(selected.classList).toContain(
      "tedi-pagination-option-picker-modal__item--selected",
    );

    const other = buttons[0].nativeElement as HTMLButtonElement;
    expect(other.getAttribute("aria-current")).toBeNull();
    expect(other.getAttribute("aria-label")).toBe("Go to page 1");
  });

  it("closes the modal with the chosen value when a button is clicked", () => {
    const { fixture, modalRef } = setup({ options: pageOptions(5) });
    const buttons = fixture.debugElement.queryAll(
      By.css(".tedi-pagination-option-picker-modal__item"),
    );
    (buttons[3].nativeElement as HTMLButtonElement).click();
    expect(modalRef.close).toHaveBeenCalledWith(4);
  });

  it("renders the heading when a title is provided", () => {
    const { fixture } = setup({ title: "Select page" });
    const heading = fixture.debugElement.query(By.css("h2"));
    expect(heading?.nativeElement.textContent.trim()).toBe("Select page");
  });

  it("omits the heading when no title is provided", () => {
    const { fixture } = setup({ title: undefined });
    expect(fixture.debugElement.query(By.css("h2"))).toBeNull();
  });

  it("scrolls the selected option into view on init", () => {
    const scrollSpy = jest
      .spyOn(HTMLElement.prototype, "scrollIntoView")
      .mockImplementation(() => {});
    setup({ options: pageOptions(50), selectedValue: 42 });
    expect(scrollSpy).toHaveBeenCalledWith({ block: "center", behavior: "auto" });
    scrollSpy.mockRestore();
  });
});
