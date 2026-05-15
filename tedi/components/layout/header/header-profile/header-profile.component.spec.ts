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
    fixture.componentRef.setInput("label", "John Doe");
    fixture.componentRef.setInput("showPopover", "lg");

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

  describe("resolvedLabel", () => {
    it("returns the custom label as-is when `label` is set", () => {
      expect(component.resolvedLabel()).toBe("John Doe");
    });

    it("falls back to `header.profile` on desktop when `label` is empty", () => {
      jest
        .spyOn(component.breakpointService, "isBelowBreakpoint")
        .mockReturnValue(signal(false));
      const translate = jest
        .spyOn(component.translationService, "translate")
        .mockImplementation(
          ((...args: unknown[]) =>
            `__${args[0]}__`) as unknown as typeof component.translationService.translate,
        );

      fixture.componentRef.setInput("label", "");
      fixture.detectChanges();

      expect(component.resolvedLabel()).toBe("__header.profile__");
      expect(translate).toHaveBeenCalledWith("header.profile");
    });

    it("falls back to `header.profile.mobile` on mobile when `label` is empty", () => {
      jest
        .spyOn(component.breakpointService, "isBelowBreakpoint")
        .mockReturnValue(signal(true));
      const translate = jest
        .spyOn(component.translationService, "translate")
        .mockImplementation(
          ((...args: unknown[]) =>
            `__${args[0]}__`) as unknown as typeof component.translationService.translate,
        );

      fixture.componentRef.setInput("label", "");
      fixture.detectChanges();

      expect(component.resolvedLabel()).toBe("__header.profile.mobile__");
      expect(translate).toHaveBeenCalledWith("header.profile.mobile");
    });

    it("uses the breakpoint-override label when its tier is active", () => {
      jest
        .spyOn(component.breakpointService, "getBreakpointInputs")
        .mockReturnValue({
          label: "Mari Maasikas",
          showPopover: "lg",
        });

      fixture.componentRef.setInput("label", "");
      fixture.componentRef.setInput("md", { label: "Mari Maasikas" });
      fixture.detectChanges();

      expect(component.resolvedLabel()).toBe("Mari Maasikas");
    });
  });

  describe("body scroll lock effect", () => {
    afterEach(() => {
      documentMock.body.style.removeProperty("overflow");
    });

    it("locks body scroll when the modal opens", () => {
      component.modalOpen.set(true);
      fixture.detectChanges();
      expect(documentMock.body.style.overflow).toBe("hidden");
    });

    it("restores body scroll when the modal closes", () => {
      component.modalOpen.set(true);
      fixture.detectChanges();
      component.modalOpen.set(false);
      fixture.detectChanges();
      expect(documentMock.body.style.overflow).toBe("");
    });
  });

  describe("buttonVariant", () => {
    it("should return 'neutral' when below 'md' breakpoint", () => {
      const mockSignal = signal(true);
      jest
        .spyOn(component.breakpointService, "isBelowBreakpoint")
        .mockReturnValue(mockSignal);

      expect(component.buttonVariant()).toBe("neutral");
    });

    it("should return 'neutral' when showLabel is false", () => {
      const mockSignal = signal(false);
      jest
        .spyOn(component.breakpointService, "isBelowBreakpoint")
        .mockReturnValue(mockSignal);
      fixture.componentRef.setInput("showLabel", false);
      fixture.detectChanges();

      expect(component.buttonVariant()).toBe("neutral");
    });

    it("should return 'secondary' when above 'md' breakpoint and showLabel is true", () => {
      const mockSignal = signal(false);
      jest
        .spyOn(component.breakpointService, "isBelowBreakpoint")
        .mockReturnValue(mockSignal);
      fixture.componentRef.setInput("showLabel", true);
      fixture.detectChanges();

      expect(component.buttonVariant()).toBe("secondary");
    });
  });
});
