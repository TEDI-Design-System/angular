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
    expect(component.ellipsis()).toBe(false);
  });

  it("does not render an ellipsis by default", () => {
    expect(fixture.nativeElement.classList).not.toContain("tedi-tag--ellipsis");
    expect(fixture.nativeElement.querySelector("tedi-ellipsis")).toBeNull();
  });

  it("renders a trailing ellipsis for ellipsis='end'", () => {
    fixture.componentRef.setInput("ellipsis", "end");
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain("tedi-tag--ellipsis");
    expect(fixture.nativeElement.querySelector("tedi-ellipsis")).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector(".tedi-ellipsis__content--start"),
    ).toBeNull();
  });

  it("renders a leading ellipsis for ellipsis='start'", () => {
    fixture.componentRef.setInput("ellipsis", "start");
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain("tedi-tag--ellipsis");
    expect(
      fixture.nativeElement.querySelector(".tedi-ellipsis__content--start"),
    ).not.toBeNull();
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

    const iconWrapper = fixture.nativeElement.querySelector(".tedi-tag__icon-wrapper");
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

    const closeButton = fixture.nativeElement.querySelector("[tedi-closing-button]");
    expect(closeButton).toBeTruthy();
    expect(fixture.nativeElement.classList).toContain("tedi-tag--closable");
  });

  it("should not show close button when closable is false", () => {
    fixture.componentRef.setInput("closable", false);
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector("[tedi-closing-button]");
    expect(closeButton).toBeFalsy();
  });

  it("should not show close button when loading is true even if closable is true", () => {
    fixture.componentRef.setInput("closable", true);
    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector("[tedi-closing-button]");
    const spinner = fixture.nativeElement.querySelector("tedi-spinner");

    expect(closeButton).toBeFalsy();
    expect(spinner).toBeTruthy();
  });

  it("should emit closed event when close button is clicked", () => {
    fixture.componentRef.setInput("closable", true);
    fixture.detectChanges();

    const closedSpy = jest.fn();
    component.closed.subscribe(closedSpy);

    const closeButton = fixture.nativeElement.querySelector("[tedi-closing-button]");
    closeButton.click();
    fixture.detectChanges();

    expect(closedSpy).toHaveBeenCalled();
  });

  it("should render content", () => {
    const contentElement = fixture.nativeElement.querySelector(".tedi-tag__content");
    expect(contentElement).toBeTruthy();
  });

  it("keeps the spinner hidden from assistive tech and announces loading via the live region", () => {
    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();

    // The spinner is decorative: a labelled spinner would be a *second* live
    // region and double-announce alongside the tag's own status region.
    const spinner = fixture.nativeElement.querySelector("tedi-spinner");
    expect(spinner.getAttribute("aria-hidden")).toBe("true");
    expect(spinner.getAttribute("aria-label")).toBeNull();
  });

  it("keeps an empty status live region in the DOM while idle", () => {
    // The region must pre-exist the state change: a role="status" node inserted
    // already-complete is not announced by Windows Chrome/Firefox, iOS Safari or
    // TalkBack. Only a text change inside a present region is.
    const region = fixture.nativeElement.querySelector(
      ".sr-only[role='status']",
    );
    expect(region).toBeTruthy();
    expect(region.getAttribute("aria-live")).toBe("polite");
    expect(region.getAttribute("aria-atomic")).toBe("true");
    expect(region.textContent.trim()).toBe("");
  });

  it("puts the loading text into the existing status region when loading starts", () => {
    const region = fixture.nativeElement.querySelector(
      ".sr-only[role='status']",
    );

    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();

    // Same node as before the change — the region is never re-created.
    expect(fixture.nativeElement.querySelector(".sr-only[role='status']")).toBe(
      region,
    );
    expect(region.textContent.trim()).toBe("Laadimine");
  });

  it("clears the status region when loading finishes", () => {
    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();
    fixture.componentRef.setInput("loading", false);
    fixture.detectChanges();

    const region = fixture.nativeElement.querySelector(
      ".sr-only[role='status']",
    );
    expect(region.textContent.trim()).toBe("");
  });

  it("names the remove button 'Eemalda' and describes it with the tag text", () => {
    fixture.componentRef.setInput("closable", true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector("[tedi-closing-button]");
    expect(button.getAttribute("aria-label")).toBe("Eemalda");
    // The tag text is the *description*, which distinguishes which tag is being
    // removed when several are on screen. TalkBack does not surface a name
    // computed via aria-labelledby, so the name stays a plain aria-label.
    expect(button.getAttribute("aria-describedby")).toBe(component.uniqueId);
    expect(button.getAttribute("aria-labelledby")).toBeNull();
  });

  it("does not render a hidden label source for the remove button", () => {
    fixture.componentRef.setInput("closable", true);
    fixture.detectChanges();

    // Nothing referenced by aria-labelledby survives, so no hidden span either.
    expect(fixture.nativeElement.querySelector("span[hidden]")).toBeNull();
  });
});
