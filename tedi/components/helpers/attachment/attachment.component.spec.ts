import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AttachmentComponent } from "./attachment.component";
import { ProgressBarComponent } from "../progress-bar/progress-bar.component";
import { Breakpoint, BreakpointService } from "../../../services/breakpoint/breakpoint.service";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

class TranslationMock {
  translate(key: string) {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

class BreakpointMock {
  isBelow = signal(false);
  isBelowBreakpoint(_: Breakpoint) {
    return this.isBelow.asReadonly();
  }
  isAboveBreakpoint(_: Breakpoint) {
    return signal(false).asReadonly();
  }
  currentBreakpoint() {
    return signal(undefined as Breakpoint | undefined).asReadonly();
  }
  getBreakpointInputs<T>(inputs: T): T {
    return inputs;
  }
}

@Component({
  standalone: true,
  imports: [AttachmentComponent, ProgressBarComponent],
  template: `
    <tedi-attachment
      [name]="name"
      [fileSize]="fileSize"
      [error]="error"
      [invalid]="invalid"
      [removable]="removable"
      [removeLabel]="removeLabel"
      [mobile]="mobile"
      [disabled]="disabled"
      (remove)="onRemove()"
    >
      @if (progress !== undefined) {
        <tedi-progress-bar [value]="progress" />
      }
    </tedi-attachment>
  `,
})
class TestHostComponent {
  name = "doc.pdf";
  fileSize?: string;
  progress?: number;
  error?: string;
  invalid = false;
  removable = true;
  disabled = false;
  removeLabel?: string;
  mobile?: boolean;
  onRemove = jest.fn();
}

describe("AttachmentComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let element: HTMLElement;
  let breakpoint: BreakpointMock;

  beforeEach(async () => {
    breakpoint = new BreakpointMock();
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: BreakpointService, useValue: breakpoint },
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement.querySelector("tedi-attachment")!;
  });

  it("should render the file name", () => {
    expect(element.querySelector(".tedi-attachment__title")?.textContent).toContain("doc.pdf");
  });

  it("should render file size when provided", () => {
    host.fileSize = "0.9 MB";
    fixture.detectChanges();

    expect(element.querySelector(".tedi-attachment__size")?.textContent).toContain("0.9 MB");
  });

  it("should not render file size when omitted", () => {
    expect(element.querySelector(".tedi-attachment__size")).toBeNull();
  });

  it("should not render a progress-bar by default and not add --has-progress", () => {
    expect(element.querySelector("tedi-progress-bar")).toBeNull();
    expect(element.classList).not.toContain("tedi-attachment--has-progress");
    expect(
      element.querySelector(".tedi-attachment__progress--empty"),
    ).toBeTruthy();
  });

  it("should project a tedi-progress-bar into the progress slot and toggle --has-progress", () => {
    host.progress = 42;
    fixture.detectChanges();

    const progressBar = element.querySelector(
      ".tedi-attachment__progress tedi-progress-bar",
    );
    expect(progressBar).toBeTruthy();
    expect(element.classList).toContain("tedi-attachment--has-progress");
    expect(
      element.querySelector(".tedi-attachment__progress--empty"),
    ).toBeNull();

    const progressEl = progressBar?.querySelector("progress") as HTMLProgressElement;
    expect(progressEl.value).toBe(42);
  });

  it("should switch to error visual when `error` is set", () => {
    host.error = "File too large";
    fixture.detectChanges();

    expect(element.classList).toContain("tedi-attachment--error");
    expect(element.querySelector(".tedi-attachment__error-icon")).toBeTruthy();
    expect(element.querySelector("tedi-feedback-text")?.textContent).toContain("File too large");
  });

  it("should not render the feedback line when there is no error", () => {
    expect(element.querySelector("tedi-feedback-text")).toBeNull();
  });

  it("should apply the error visual when `invalid=true` without rendering feedback text", () => {
    host.invalid = true;
    fixture.detectChanges();

    expect(element.classList).toContain("tedi-attachment--error");
    expect(element.querySelector(".tedi-attachment__error-icon")).toBeTruthy();
    expect(element.querySelector("tedi-feedback-text")).toBeNull();
  });

  it("should emit `remove` when the delete button is clicked", () => {
    const button = element.querySelector(".tedi-attachment__remove") as HTMLButtonElement;
    button.click();

    expect(host.onRemove).toHaveBeenCalledTimes(1);
  });

  it("should hide the remove button when removable=false", () => {
    host.removable = false;
    fixture.detectChanges();

    expect(element.querySelector(".tedi-attachment__remove")).toBeNull();
  });

  it("should disable the remove button when disabled=true", () => {
    host.disabled = true;
    fixture.detectChanges();

    const button = element.querySelector(".tedi-attachment__remove") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("should derive a default remove aria-label from the file name", () => {
    const button = element.querySelector(".tedi-attachment__remove") as HTMLButtonElement;
    expect(button.getAttribute("aria-label")).toBe("remove doc.pdf");
  });

  it("should use custom remove label when provided", () => {
    host.removeLabel = "Kustuta";
    fixture.detectChanges();

    const button = element.querySelector(".tedi-attachment__remove") as HTMLButtonElement;
    expect(button.getAttribute("aria-label")).toBe("Kustuta");
  });

  it("should apply the mobile modifier when `mobile=true`", () => {
    host.mobile = true;
    fixture.detectChanges();

    expect(element.classList).toContain("tedi-attachment--mobile");
  });

  it("should auto-apply the mobile modifier when below the breakpoint", () => {
    breakpoint.isBelow.set(true);
    fixture.detectChanges();

    expect(element.classList).toContain("tedi-attachment--mobile");
  });

  it("should let an explicit `mobile=false` override the breakpoint", () => {
    breakpoint.isBelow.set(true);
    host.mobile = false;
    fixture.detectChanges();

    expect(element.classList).not.toContain("tedi-attachment--mobile");
  });
});
