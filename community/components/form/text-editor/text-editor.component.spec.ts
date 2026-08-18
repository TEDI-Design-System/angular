import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { By } from "@angular/platform-browser";
import {
  TEXT_EDITOR_DEFAULT_MODULES,
  TextEditorComponent,
} from "./text-editor.component";

@Component({
  standalone: true,
  imports: [TextEditorComponent, ReactiveFormsModule],
  template: `<tedi-text-editor
    [control]="control"
    [inputId]="inputId"
    [placeholder]="placeholder"
  />`,
})
class TestHostComponent {
  control = new FormControl<string | null>(null, Validators.required);
  inputId = "test-text-editor";
  placeholder = "";
}

describe("TextEditorComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let component: TextEditorComponent;
  let editorEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    const editor = fixture.debugElement.query(By.directive(TextEditorComponent));
    component = editor.componentInstance;
    editorEl = fixture.debugElement.query(
      By.css("quill-editor"),
    ).nativeElement;
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should apply the host class", () => {
    const hostEl = fixture.debugElement.query(
      By.directive(TextEditorComponent),
    ).nativeElement;

    expect(hostEl.classList).toContain("tedi-text-editor");
  });

  it("should set the editor id from inputId", () => {
    expect(editorEl.getAttribute("id")).toBe("test-text-editor");
  });

  it("should default to the shared toolbar module config", () => {
    expect(component.modules()).toEqual(TEXT_EDITOR_DEFAULT_MODULES);
  });

  it("should derive required from the control validators", () => {
    expect(component.required()).toBe(true);

    host.control.clearValidators();
    host.control.updateValueAndValidity();
    fixture.detectChanges();

    expect(component.required()).toBe(false);
  });

  it("should mirror aria-required onto the editor", () => {
    expect(editorEl.getAttribute("aria-required")).toBe("true");
  });

  it("should not report errors before the control is touched", () => {
    expect(component.hasErrors).toBe(false);
    expect(editorEl.getAttribute("aria-describedby")).toBe(
      "test-text-editor-feedback-hint",
    );
  });

  it("should report errors once touched and invalid", () => {
    host.control.markAsTouched();
    fixture.detectChanges();

    expect(component.hasErrors).toBe(true);
    expect(editorEl.classList).toContain("tedi-text-editor__editor--error");
    expect(editorEl.getAttribute("aria-describedby")).toBe(
      "test-text-editor-feedback-error",
    );
  });

  it("should apply the disabled class when the control is disabled", () => {
    host.control.disable();
    fixture.detectChanges();

    expect(editorEl.classList).toContain("tedi-text-editor__editor--disabled");
  });

  it("should track focus state", () => {
    expect(component.focused()).toBe(false);

    component.focused.set(true);
    fixture.detectChanges();

    expect(editorEl.classList).toContain("tedi-text-editor__editor--focused");
  });
});
