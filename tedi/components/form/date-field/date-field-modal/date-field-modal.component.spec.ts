import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  DateFieldModalComponent,
  DateFieldModalData,
} from "./date-field-modal.component";
import { ModalRef } from "../../../overlay/modal/modal-ref";
import { MODAL_DATA } from "../../../overlay/modal/modal.types";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";

class TranslationMock {
  translate(key: string): string {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

function makeData(
  overrides: Partial<DateFieldModalData> = {},
): DateFieldModalData {
  return {
    value: null,
    currentMonth: new Date(2026, 4, 1),
    mode: "single",
    selectionLevel: "days",
    localeCode: "et-EE",
    showOutsideDays: true,
    numberOfMonths: 1,
    monthYearSelectType: "dropdown",
    required: false,
    disabledMatchers: [],
    availableDays: undefined,
    unavailableDays: undefined,
    shouldDisableMonth: undefined,
    shouldDisableYear: undefined,
    closeOnSelect: true,
    ...overrides,
  };
}

describe("DateFieldModalComponent", () => {
  let fixture: ComponentFixture<DateFieldModalComponent>;
  let component: DateFieldModalComponent;
  let close: jest.Mock;

  function setup(data: DateFieldModalData = makeData()): void {
    close = jest.fn();
    const ref = { close } as unknown as ModalRef<unknown>;
    TestBed.configureTestingModule({
      imports: [DateFieldModalComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        { provide: MODAL_DATA, useValue: data },
        { provide: ModalRef, useValue: ref },
      ],
    });
    fixture = TestBed.createComponent(DateFieldModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it("renders", () => {
    setup();
    expect(component).toBeTruthy();
  });

  it("seeds draft from data.value", () => {
    const value = new Date(2026, 4, 14);
    setup(makeData({ value }));
    expect(component.draft()).toBe(value);
  });

  it("cancel closes with undefined", () => {
    setup();
    component.cancel();
    expect(close).toHaveBeenCalledWith(undefined);
  });

  it("confirm closes with the current draft", () => {
    setup();
    const next = new Date(2026, 4, 14);
    component.draft.set(next);
    component.confirm();
    expect(close).toHaveBeenCalledWith(next);
  });

  it("handleSelect commits when closeOnSelect is true", () => {
    setup(makeData({ closeOnSelect: true }));
    const next = new Date(2026, 4, 14);
    component.draft.set(next);
    component.handleSelect();
    expect(close).toHaveBeenCalledWith(next);
  });

  it("handleSelect does NOT close when closeOnSelect is false", () => {
    setup(makeData({ closeOnSelect: false }));
    const stagedDate = new Date(2026, 4, 14);
    component.draft.set(stagedDate);
    component.handleSelect();
    expect(close).not.toHaveBeenCalled();
    expect(component.draft()).toEqual(stagedDate);
  });
});
