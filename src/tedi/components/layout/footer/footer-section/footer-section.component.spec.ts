import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FooterSectionComponent } from "./footer-section.component";
import { BreakpointService } from "../../../../services/breakpoint/breakpoint.service";
import { signal } from "@angular/core";

describe("FooterSectionComponent", () => {
  let component: FooterSectionComponent;
  let fixture: ComponentFixture<FooterSectionComponent>;
  let mockBreakpointService: { isBelowBreakpoint: jest.Mock };

  beforeEach(async () => {
    mockBreakpointService = {
      isBelowBreakpoint: jest.fn((breakpoint) => {
        if (breakpoint === "lg") return signal(false);
        if (breakpoint === "sm") return signal(false);
        return signal(false);
      }),
    };

    await TestBed.configureTestingModule({
      imports: [FooterSectionComponent],
      providers: [
        {
          provide: BreakpointService,
          useValue: mockBreakpointService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should set default input values", () => {
    expect(component.icon()).toBeUndefined();
    expect(component.heading()).toBeUndefined();
    expect(component.collapse()).toBe(false);
  });

  it("should set custom input values", () => {
    fixture.componentRef.setInput("icon", "test-icon");
    fixture.componentRef.setInput("heading", "Test Heading");
    fixture.componentRef.setInput("collapse", true);
    fixture.detectChanges();

    expect(component.icon()).toBe("test-icon");
    expect(component.heading()).toBe("Test Heading");
    expect(component.collapse()).toBe(true);
  });

  it("should show icon when icon is provided", () => {
    fixture.componentRef.setInput("icon", "test-icon");
    fixture.detectChanges();

    const iconElement = fixture.nativeElement.querySelector(
      ".tedi-footer-section__icon",
    );
    expect(iconElement).toBeTruthy();
    expect(component.icon()).toBe("test-icon");
  });

  it("should hide icon when below large breakpoint", () => {
    fixture.componentRef.setInput("icon", "test-icon");
    mockBreakpointService.isBelowBreakpoint.mockImplementation((breakpoint) => {
      if (breakpoint === "lg") return signal(true);
      if (breakpoint === "sm") return signal(false);
      return signal(false);
    });
    fixture = TestBed.createComponent(FooterSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const iconElement = fixture.nativeElement.querySelector(
      ".tedi-footer-section__icon",
    );
    expect(iconElement).toBeFalsy();
  });

  it("should toggle collapse state when collapse is enabled and mobile", () => {
    mockBreakpointService.isBelowBreakpoint.mockImplementation((breakpoint) =>
      signal(breakpoint === "sm"),
    );
    fixture = TestBed.createComponent(FooterSectionComponent);
    fixture.componentRef.setInput("heading", "test-heading");
    fixture.componentRef.setInput("collapse", true);
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector(
      ".tedi-footer-section__content-wrapper",
    );
    const button = fixture.nativeElement.querySelector(
      ".tedi-footer-section__button",
    );

    expect(wrapper.classList).toContain(
      "tedi-footer-section__content-wrapper--collapsed",
    );
    expect(button.getAttribute("aria-expanded")).toBe("false");

    button.click();
    fixture.detectChanges();
    expect(wrapper.classList).not.toContain(
      "tedi-footer-section__content-wrapper--collapsed",
    );
    expect(button.getAttribute("aria-expanded")).toBe("true");

    button.click();
    fixture.detectChanges();
    expect(wrapper.classList).toContain(
      "tedi-footer-section__content-wrapper--collapsed",
    );
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });
});
