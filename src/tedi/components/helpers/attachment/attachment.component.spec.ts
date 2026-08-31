import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AttachmentComponent } from "./attachment.component";
import { AttachmentActionsComponent } from "./attachment-actions.component";
import { ProgressBarComponent } from "../../loader/progress-bar/progress-bar.component";
import {
  Breakpoint,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";
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
  imports: [
    AttachmentComponent,
    AttachmentActionsComponent,
    ProgressBarComponent,
  ],
  template: `
    <tedi-attachment
      [name]="name"
      [fileSize]="fileSize"
      [icon]="icon"
      [error]="error"
      [invalid]="invalid"
      [direction]="direction"
    >
      @if (progress !== undefined) {
        <tedi-progress-bar [value]="progress" />
      }
      @if (showActions) {
        <tedi-attachment-actions [padded]="padded">
          <button type="button" class="test-action">Delete</button>
        </tedi-attachment-actions>
      }
    </tedi-attachment>
  `,
})
class TestHostComponent {
  name = "doc.pdf";
  fileSize?: string;
  icon?: string;
  progress?: number;
  error?: string;
  invalid = false;
  direction?: "horizontal" | "vertical";
  showActions = false;
  padded = false;
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
    expect(
      element.querySelector(".tedi-attachment__title")?.textContent,
    ).toContain("doc.pdf");
  });

  it("should render file size when provided", () => {
    host.fileSize = "0.9 MB";
    fixture.detectChanges();

    expect(
      element.querySelector(".tedi-attachment__size")?.textContent,
    ).toContain("0.9 MB");
  });

  it("should not render file size when omitted", () => {
    expect(element.querySelector(".tedi-attachment__size")).toBeNull();
  });

  it("should not render a leading icon by default", () => {
    expect(element.querySelector(".tedi-attachment__icon")).toBeNull();
  });

  it("should render a leading icon when `icon` is set", () => {
    host.icon = "picture_as_pdf";
    fixture.detectChanges();

    const icon = element.querySelector(
      ".tedi-attachment__title-group .tedi-attachment__icon",
    );
    expect(icon).toBeTruthy();
    expect(icon?.classList).toContain("material-symbols");
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

    const progressEl = progressBar?.querySelector(
      "progress",
    ) as HTMLProgressElement;
    expect(progressEl.value).toBe(42);
  });

  it("should project an actions container into the actions slot", () => {
    host.showActions = true;
    fixture.detectChanges();

    const group = element.querySelector(
      ".tedi-attachment__actions .tedi-attachment-actions",
    );
    expect(group).toBeTruthy();
    expect(group?.querySelector(".test-action")).toBeTruthy();
  });

  it("should toggle the actions group `--padded` modifier via the `padded` input", () => {
    host.showActions = true;
    fixture.detectChanges();

    const group = element.querySelector(".tedi-attachment-actions")!;
    expect(group.classList).not.toContain("tedi-attachment-actions--padded");

    host.padded = true;
    fixture.detectChanges();
    expect(group.classList).toContain("tedi-attachment-actions--padded");
  });

  it("should switch to error visual when `error` is set", () => {
    host.error = "File too large";
    fixture.detectChanges();

    expect(element.classList).toContain("tedi-attachment--error");
    expect(element.querySelector(".tedi-attachment__error-icon")).toBeTruthy();
    expect(element.querySelector("tedi-feedback-text")?.textContent).toContain(
      "File too large",
    );
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

  it("should apply the vertical modifier when `direction='vertical'`", () => {
    host.direction = "vertical";
    fixture.detectChanges();

    expect(element.classList).toContain("tedi-attachment--vertical");
  });

  it("should auto-apply the vertical modifier when below the breakpoint", () => {
    breakpoint.isBelow.set(true);
    fixture.detectChanges();

    expect(element.classList).toContain("tedi-attachment--vertical");
  });

  it("should let an explicit `direction='horizontal'` override the breakpoint", () => {
    breakpoint.isBelow.set(true);
    host.direction = "horizontal";
    fixture.detectChanges();

    expect(element.classList).not.toContain("tedi-attachment--vertical");
  });
});
