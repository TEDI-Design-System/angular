import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TagComponent, TagType } from "./tag.component";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

describe("TagComponent", () => {
  let component: TagComponent;
  let fixture: ComponentFixture<TagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    }).compileComponents();

    fixture = TestBed.createComponent(TagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should have default values", () => {
    expect(component.loading()).toBe(false);
    expect(component.closable()).toBe(false);
    expect(component.type()).toBe("primary");
  });

  it("should have tedi-tag class", () => {
    expect(fixture.nativeElement.classList).toContain("tedi-tag");
  });

  it("should apply correct type class", () => {
    const types: TagType[] = ["primary", "secondary", "danger"];

    for (const type of types) {
      fixture.componentRef.setInput("type", type);
      fixture.detectChanges();

      expect(fixture.nativeElement.classList).toContain(`tedi-tag--${type}`);
    }
  });

  it("should show danger icon when type is danger", () => {
    fixture.componentRef.setInput("type", "danger");
    fixture.detectChanges();

    const iconElement = fixture.nativeElement.querySelector("tedi-icon");
    expect(iconElement).toBeTruthy();
    expect(iconElement.textContent).toBe("error");
  });

  it("should not show danger icon when type is not danger", () => {
    fixture.componentRef.setInput("type", "primary");
    fixture.detectChanges();

    const iconWrapper = fixture.nativeElement.querySelector(
      ".tedi-tag__icon-wrapper",
    );
    expect(iconWrapper).toBeFalsy();
  });

  it("should show spinner when loading is true", () => {
    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector("tedi-spinner");
    expect(spinner).toBeTruthy();
    expect(fixture.nativeElement.classList).toContain("tedi-tag--loading");
  });

  it("should not show spinner when loading is false", () => {
    fixture.componentRef.setInput("loading", false);
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector("tedi-spinner");
    expect(spinner).toBeFalsy();
  });

  it("should show close button when closable is true", () => {
    fixture.componentRef.setInput("closable", true);
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector(
      "[tedi-closing-button]",
    );
    expect(closeButton).toBeTruthy();
    expect(fixture.nativeElement.classList).toContain("tedi-tag--closable");
  });

  it("should not show close button when closable is false", () => {
    fixture.componentRef.setInput("closable", false);
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector(
      "[tedi-closing-button]",
    );
    expect(closeButton).toBeFalsy();
  });

  it("should not show close button when loading is true even if closable is true", () => {
    fixture.componentRef.setInput("closable", true);
    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector(
      "[tedi-closing-button]",
    );
    const spinner = fixture.nativeElement.querySelector("tedi-spinner");

    expect(closeButton).toBeFalsy();
    expect(spinner).toBeTruthy();
  });

  it("should emit closed event when close button is clicked", () => {
    fixture.componentRef.setInput("closable", true);
    fixture.detectChanges();

    const closedSpy = jest.fn();
    component.closed.subscribe(closedSpy);

    const closeButton = fixture.nativeElement.querySelector(
      "[tedi-closing-button]",
    );
    closeButton.click();
    fixture.detectChanges();

    expect(closedSpy).toHaveBeenCalled();
  });

  it("should render content", () => {
    const contentElement =
      fixture.nativeElement.querySelector(".tedi-tag__content");
    expect(contentElement).toBeTruthy();
  });
});
