import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
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

// jsdom returns 0 for layout — stub the viewport size so CDK virtual scroll
// has something to render against. 600px fits the small option counts used in
// these tests at 48px per row.
const stubLayout = () => {
  jest.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(600);
  jest.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(360);
  // Pretend the viewport's internal spacer is already sized — the component
  // polls scrollHeight until it reaches `dataLength * itemSize`, and jsdom
  // would otherwise leave it at 0 and force the full retry-cap wait.
  jest
    .spyOn(HTMLElement.prototype, "scrollHeight", "get")
    .mockReturnValue(1_000_000);
  // jsdom doesn't implement Element.prototype.scrollTo — CDK virtual scroll
  // viewport calls it from `scrollToOffset`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Element.prototype as any).scrollTo = jest.fn();
  jest
    .spyOn(Element.prototype, "getBoundingClientRect")
    .mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 360,
      bottom: 600,
      width: 360,
      height: 600,
      toJSON: () => undefined,
    } as DOMRect);
};

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
    ],
  });

  const fixture: ComponentFixture<PaginationOptionPickerModalComponent> =
    TestBed.createComponent(PaginationOptionPickerModalComponent);
  fixture.detectChanges();
  // CDK virtual scroll renders its visible range on a second CD cycle, after
  // the viewport measures itself.
  fixture.detectChanges();
  return { fixture, modalRef };
};

describe("PaginationOptionPickerModalComponent", () => {
  beforeEach(() => {
    stubLayout();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders one button per option", async () => {
    const { fixture } = setup({ options: pageOptions(7) });
    await fixture.whenStable();
    fixture.detectChanges();
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

  it("marks the selected option with aria-current and the modifier class", async () => {
    const { fixture } = setup({ options: pageOptions(5), selectedValue: 3 });
    await fixture.whenStable();
    fixture.detectChanges();
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

  it("closes the modal with the chosen value when a button is clicked", async () => {
    const { fixture, modalRef } = setup({ options: pageOptions(5) });
    await fixture.whenStable();
    fixture.detectChanges();
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

  it("centers the selected option in the viewport on init", async () => {
    const scrollSpy = jest
      .spyOn(CdkVirtualScrollViewport.prototype, "scrollToOffset")
      .mockImplementation(() => {});
    const { fixture } = setup({ options: pageOptions(50), selectedValue: 42 });
    await fixture.whenStable();
    // selectedIndex 41, itemSize 48px, viewport 600px → (41.5 * 48) - 300 = 1692
    expect(scrollSpy).toHaveBeenCalledWith(1692, "auto");
  });

  it("clamps the scroll offset to 0 when the selected option is near the start", async () => {
    const scrollSpy = jest
      .spyOn(CdkVirtualScrollViewport.prototype, "scrollToOffset")
      .mockImplementation(() => {});
    const { fixture } = setup({ options: pageOptions(50), selectedValue: 1 });
    await fixture.whenStable();
    expect(scrollSpy).toHaveBeenCalledWith(0, "auto");
  });

  it("does not scroll when the selected value is not in the option list", async () => {
    const scrollSpy = jest
      .spyOn(CdkVirtualScrollViewport.prototype, "scrollToOffset")
      .mockImplementation(() => {});
    const { fixture } = setup({ options: pageOptions(5), selectedValue: 99 });
    await fixture.whenStable();
    expect(scrollSpy).not.toHaveBeenCalled();
  });
});
