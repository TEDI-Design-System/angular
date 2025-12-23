import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA, signal } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { HeaderProfileComponent } from "./header-profile.component";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";

describe("HeaderProfileComponent", () => {
  let fixture: ComponentFixture<HeaderProfileComponent>;
  let component: HeaderProfileComponent;
  let documentMock: Document;

  beforeEach(() => {
    documentMock = document;

    TestBed.configureTestingModule({
      imports: [HeaderProfileComponent],
      providers: [
        { provide: DOCUMENT, useValue: documentMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HeaderProfileComponent);
    component = fixture.componentInstance;

    // set required inputs
    fixture.componentRef.setInput("name", "John Doe");
    fixture.componentRef.setInput("showDropdown", "lg");

    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should have default modalOpen state false", () => {
    expect(component.modalOpen()).toBe(false);
  });

  it("should toggle modalOpen on handleModalOpen()", () => {
    component.handleModalOpen();
    expect(component.modalOpen()).toBe(true);
    component.handleModalOpen();
    expect(component.modalOpen()).toBe(false);
  });

  it("should close modal when clicking outside after AfterContentInit", () => {
    // initialize listeners
    component.ngAfterContentInit();

    // open modal
    component.modalOpen.set(true);
    expect(component.modalOpen()).toBe(true);

    // dispatch click inside
    const insideTarget = fixture.nativeElement as HTMLElement;
    insideTarget.click();
    expect(component.modalOpen()).toBe(true);

    // dispatch click outside
    const outsideEvent = new MouseEvent("click", { bubbles: true });
    documentMock.body.dispatchEvent(outsideEvent);

    expect(component.modalOpen()).toBe(false);
  });

  describe("buttonVariant", () => {
    it("should return 'neutral' when below 'sm' breakpoint", () => {
      const mockSignal = signal(true);
      jest
        .spyOn(component.breakpointService, "isBelowBreakpoint")
        .mockReturnValue(mockSignal);

      expect(component.buttonVariant()).toBe("neutral");
    });

    it("should return 'neutral' when name is empty", () => {
      const mockSignal = signal(false);
      jest
        .spyOn(component.breakpointService, "isBelowBreakpoint")
        .mockReturnValue(mockSignal);
      fixture.componentRef.setInput("name", "");
      fixture.detectChanges();

      expect(component.buttonVariant()).toBe("neutral");
    });

    it("should return 'secondary' when above 'sm' breakpoint and name is provided", () => {
      const mockSignal = signal(false);
      jest
        .spyOn(component.breakpointService, "isBelowBreakpoint")
        .mockReturnValue(mockSignal);
      fixture.componentRef.setInput("name", "John Doe");
      fixture.detectChanges();

      expect(component.buttonVariant()).toBe("secondary");
    });
  });
});
