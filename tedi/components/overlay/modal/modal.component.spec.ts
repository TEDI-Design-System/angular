import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ModalComponent } from "./modal.component";
import { DOCUMENT } from "@angular/common";

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
  });

  it("should apply correct default classes", () => {
    const classes = hostEl.getAttribute("class")!;
    expect(classes).toContain("tedi-modal--default");
    expect(classes).toContain("tedi-modal--sm");
    expect(classes).toContain("tedi-modal--center");
    expect(classes).not.toContain("tedi-modal--open");
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
});
