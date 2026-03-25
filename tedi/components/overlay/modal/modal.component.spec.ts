import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ModalComponent } from "./modal.component";
import { DOCUMENT } from "@angular/common";
import { PLATFORM_ID } from "@angular/core";

describe("ModalComponent", () => {
  let fixture: ComponentFixture<ModalComponent>;
  let component: ModalComponent;
  let hostEl: HTMLElement;
  let documentRef: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalComponent],
    });

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    hostEl = fixture.nativeElement;
    documentRef = TestBed.inject(DOCUMENT);

    fixture.detectChanges();
    component.ngAfterViewInit();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should have default inputs", () => {
    expect(component.size()).toBe("default");
    expect(component.width()).toBe("sm");
    expect(component.position()).toBe("center");
    expect(component.open()).toBe(false);
    expect(component.closeOnBackdropClick()).toBe(true);
  });

  it("should apply correct default classes", () => {
    const classes = hostEl.getAttribute("class")!;
    expect(classes).toContain("tedi-modal--default");
    expect(classes).toContain("tedi-modal--sm");
    expect(classes).toContain("tedi-modal--center");
    expect(classes).toContain("tedi-modal--sm");
    expect(classes).toContain("tedi-modal--center");
    expect(classes).not.toContain("tedi-modal--top");
    expect(classes).not.toContain("tedi-modal--open");
    expect(classes).not.toContain("tedi-modal--service");
  });

  it("should add 'tedi-modal--open' class when opened", () => {
    fixture.componentRef.setInput("open", true);
    fixture.detectChanges();

    const classes = hostEl.getAttribute("class")!;
    expect(classes).toContain("tedi-modal--open");
  });

  it("should lock body scroll when opened", () => {
    fixture.componentRef.setInput("open", true);
    fixture.detectChanges();

    expect(documentRef.body.style.overflow).toBe("hidden");
  });

  it("should restore body scroll when closed", () => {
    fixture.componentRef.setInput("open", true);
    fixture.detectChanges();

    fixture.componentRef.setInput("open", false);
    fixture.detectChanges();

    expect(documentRef.body.style.overflow).toBe("");
  });

  it("should close modal on Escape key", () => {
    fixture.componentRef.setInput("open", true);
    fixture.detectChanges();

    const escEvent = new KeyboardEvent("keydown", { key: "Escape" });
    documentRef.dispatchEvent(escEvent);

    expect(component.open()).toBe(false);
  });

  it("should restore focus to previously focused element on close", () => {
    const button = documentRef.createElement("button");
    documentRef.body.appendChild(button);
    button.focus();

    fixture.componentRef.setInput("open", true);
    fixture.detectChanges();

    fixture.componentRef.setInput("open", false);
    fixture.detectChanges();

    expect(documentRef.activeElement).toBe(button);

    button.remove();
  });

  it("should apply top and center classes when position is top", () => {
    fixture.componentRef.setInput("position", "top");
    fixture.detectChanges();

    const classes = hostEl.getAttribute("class")!;
    expect(classes).toContain("tedi-modal--top");
    expect(classes).toContain("tedi-modal--center");
  });

  it("should not apply width class for custom width values", () => {
    fixture.componentRef.setInput("width", "80%");
    fixture.detectChanges();

    const classes = hostEl.getAttribute("class")!;
    expect(classes).not.toContain("tedi-modal--80%");
    expect(classes).toContain("tedi-modal--default");
  });

  it("should set max-width style on dialog for custom width", () => {
    fixture.componentRef.setInput("width", "80%");
    fixture.componentRef.setInput("open", true);
    fixture.detectChanges();

    const dialog = hostEl.querySelector(".tedi-modal__dialog") as HTMLElement;
    expect(dialog.style.maxWidth).toBe("80%");
  });

  it("should not set max-width style for preset widths", () => {
    fixture.componentRef.setInput("width", "lg");
    fixture.componentRef.setInput("open", true);
    fixture.detectChanges();

    const dialog = hostEl.querySelector(".tedi-modal__dialog") as HTMLElement;
    expect(dialog.style.maxWidth).toBe("");
  });

  it("should not apply top class for side positions", () => {
    fixture.componentRef.setInput("position", "left");
    fixture.detectChanges();

    const classes = hostEl.getAttribute("class")!;
    expect(classes).not.toContain("tedi-modal--top");
  });

  it("should close on backdrop click by default", () => {
    fixture.componentRef.setInput("open", true);
    fixture.detectChanges();

    component.onBackdropClick();

    expect(component.open()).toBe(false);
  });

  it("should not close on backdrop click when closeOnBackdropClick is false", () => {
    fixture.componentRef.setInput("open", true);
    fixture.componentRef.setInput("closeOnBackdropClick", false);
    fixture.detectChanges();

    component.onBackdropClick();

    expect(component.open()).toBe(true);

    // Cleanup: close modal so body overflow is restored
    fixture.componentRef.setInput("open", false);
    fixture.detectChanges();
  });
});

describe("ModalComponent (server platform)", () => {
  let fixture: ComponentFixture<ModalComponent>;
  let component: ModalComponent;
  let documentRef: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [{ provide: PLATFORM_ID, useValue: "server" }],
    });

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    documentRef = TestBed.inject(DOCUMENT);

    fixture.detectChanges();
  });

  it("should NOT run browser-only effect in constructor", () => {
    expect(documentRef.body.style.overflow).toBe("");
  });

  it("should NOT append modal to body in ngAfterViewInit on server", () => {
    const initialChildren = documentRef.body.childElementCount;
    component.ngAfterViewInit();
    expect(documentRef.body.childElementCount).toBe(initialChildren);
  });

  it("should NOT remove element from body in ngOnDestroy on server", () => {
    const el = fixture.nativeElement;
    documentRef.body.appendChild(el);

    const initialChildren = documentRef.body.childElementCount;
    component.ngOnDestroy();
    expect(documentRef.body.childElementCount).toBe(initialChildren);
    el.remove();
  });
});
