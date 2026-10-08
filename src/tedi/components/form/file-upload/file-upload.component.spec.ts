import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { ToastAnnouncerService } from "../../../services/toast/toast-announcer.service";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { BreakpointService } from "../../../services/breakpoint/breakpoint.service";
import { FormFieldComponent } from "../form-field/form-field.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { LabelComponent } from "../../content/label/label.component";
import { FileUploadComponent } from "./file-upload.component";
import { FileUploadFile } from "./file-upload.types";

class TranslationMock {
  translate(key: string, ...args: unknown[]) {
    return args.length ? `${key}:${args.join(",")}` : key;
  }
  track(key: string) {
    return () => key;
  }
}

const isBelowMd = signal(false);

const breakpointMock = {
  isBelowBreakpoint: () => isBelowMd.asReadonly(),
  isAboveBreakpoint: () => signal(false).asReadonly(),
  currentBreakpoint: () => signal(undefined).asReadonly(),
};

const announcer = { announce: jest.fn(), clear: jest.fn(), destroy: jest.fn() };

beforeEach(() => {
  announcer.announce.mockClear();
  isBelowMd.set(false);
});

const announced = async (): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 300 + 150));

  return announcer.announce.mock.calls.at(-1)?.[0] ?? "";
};

const announcedAs = (): string | undefined =>
  announcer.announce.mock.calls.at(-1)?.[1];

// `lastModified` is pinned because it defaults to `Date.now()`, which would make
// two fabricated files differ by milliseconds — a real file picked twice carries
// the same mtime, which is what the duplicate check relies on.
const makeFile = (
  name: string,
  size = 100,
  type = "application/pdf",
  lastModified = 1_700_000_000_000,
): File => {
  const file = new File(["x"], name, { type, lastModified });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

const fileInput = (fixture: ComponentFixture<unknown>): HTMLInputElement =>
  fixture.debugElement.query(By.css("input[type=file]")).nativeElement;

const addButton = (fixture: ComponentFixture<unknown>): HTMLButtonElement =>
  fixture.debugElement.query(By.css(".tedi-file-upload__add")).nativeElement;

const clearButton = (
  fixture: ComponentFixture<unknown>,
): HTMLButtonElement | null =>
  fixture.debugElement.query(By.css(".tedi-file-upload__clear"))
    ?.nativeElement ?? null;

const fieldOf = (fixture: ComponentFixture<unknown>): HTMLElement =>
  fixture.debugElement.query(By.css(".tedi-file-upload__field")).nativeElement;

const tagRemoveButtons = (
  fixture: ComponentFixture<unknown>,
): HTMLButtonElement[] =>
  fixture.debugElement
    .queryAll(By.css(".tedi-tag .tedi-closing-button"))
    .map((el) => el.nativeElement as HTMLButtonElement);

const selectFiles = (fixture: ComponentFixture<unknown>, files: File[]) => {
  const input = fileInput(fixture);
  Object.defineProperty(input, "files", { value: files, configurable: true });
  input.dispatchEvent(new Event("change"));
  fixture.detectChanges();
};

const baseProviders = [
  { provide: ToastAnnouncerService, useValue: announcer },
  { provide: TediTranslationService, useClass: TranslationMock },
  { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
  { provide: BreakpointService, useValue: breakpointMock },
];

describe("FileUploadComponent", () => {
  let fixture: ComponentFixture<FileUploadComponent>;
  let component: FileUploadComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FileUploadComponent],
      providers: baseProviders,
    });
    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const text = (selector: string) =>
    fixture.debugElement
      .query(By.css(selector))
      ?.nativeElement.textContent.trim();

  const names = () => component.files().map((file) => file.name);

  it("creates with a translated add button and a hidden file input", () => {
    expect(component).toBeTruthy();
    expect(text(".tedi-file-upload__add span")).toBe("file-upload.add");

    const input = fileInput(fixture);
    // The input stays out of the tab order and the tree: the add button is the
    // control.
    expect(input.getAttribute("tabindex")).toBe("-1");
    expect(input.getAttribute("aria-hidden")).toBe("true");
  });

  it("opens the file picker from the add button", () => {
    const click = jest.spyOn(fileInput(fixture), "click");

    addButton(fixture).click();

    expect(click).toHaveBeenCalledTimes(1);
  });

  it("stays inert while disabled", () => {
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();

    const click = jest.spyOn(fileInput(fixture), "click");
    const button = addButton(fixture);

    expect(button.disabled).toBe(true);
    expect(fileInput(fixture).disabled).toBe(true);
    expect(
      fixture.nativeElement.classList.contains("tedi-file-upload--disabled"),
    ).toBe(true);

    component["openPicker"]();
    expect(click).not.toHaveBeenCalled();
  });

  it("gives each instance its own generated id", () => {
    @Component({
      standalone: true,
      imports: [FileUploadComponent],
      template: `<tedi-file-upload [maxSize]="1" /><tedi-file-upload
          [maxSize]="1"
        />`,
    })
    class TwoFieldsComponent {}

    const pair = TestBed.createComponent(TwoFieldsComponent);
    pair.detectChanges();

    const [first, second] = pair.debugElement
      .queryAll(By.css("input[type=file]"))
      .map((el) => el.nativeElement as HTMLInputElement);
    const [firstButton, secondButton] = pair.debugElement
      .queryAll(By.css(".tedi-file-upload__add"))
      .map((el) => el.nativeElement as HTMLElement);

    expect(first.id).not.toBe(second.id);
    // The feedback ids are derived from it, so a collision would cross-wire
    // one field's aria-describedby to the other's hint.
    expect(firstButton.getAttribute("aria-describedby")).not.toBe(
      secondButton.getAttribute("aria-describedby"),
    );
  });

  it("forwards inputId, name, accept and multiple to the input", () => {
    fixture.componentRef.setInput("inputId", "attachments");
    fixture.componentRef.setInput("name", "attachments[]");
    fixture.componentRef.setInput("accept", ".pdf,.txt");
    fixture.componentRef.setInput("multiple", true);
    fixture.detectChanges();

    const input = fileInput(fixture);

    expect(input.id).toBe("attachments");
    expect(input.getAttribute("name")).toBe("attachments[]");
    expect(input.getAttribute("accept")).toBe(".pdf,.txt");
    expect(input.multiple).toBe(true);
  });

  it("names the add button by its own text when no label is wired up", () => {
    expect(addButton(fixture).getAttribute("aria-labelledby")).toBeNull();
  });

  describe("selection", () => {
    it("adds a picked file and announces it", async () => {
      selectFiles(fixture, [makeFile("report.pdf")]);

      expect(names()).toEqual(["report.pdf"]);
      expect(await announced()).toBe("file-upload.added:1");
      expect(announcedAs()).toBe("assertive");
    });

    it("clears the input value so the same file can be picked again", () => {
      const input = fileInput(fixture);
      selectFiles(fixture, [makeFile("report.pdf")]);

      expect(input.value).toBe("");
    });

    it("replaces the file when not multiple", () => {
      selectFiles(fixture, [makeFile("first.pdf")]);
      selectFiles(fixture, [makeFile("second.pdf")]);

      expect(names()).toEqual(["second.pdf"]);
    });

    it("appends files when multiple", () => {
      fixture.componentRef.setInput("multiple", true);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("first.pdf")]);
      selectFiles(fixture, [makeFile("second.pdf")]);

      expect(names()).toEqual(["first.pdf", "second.pdf"]);
    });

    it("skips a file that is already listed and says so", async () => {
      fixture.componentRef.setInput("multiple", true);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("report.pdf")]);
      selectFiles(fixture, [makeFile("report.pdf"), makeFile("other.pdf")]);

      expect(names()).toEqual(["report.pdf", "other.pdf"]);
      // Announced together: separate calls would overwrite each other and only
      // the last would ever be read.
      expect(await announced()).toBe(
        "file-upload.duplicates-skipped:'report.pdf'. file-upload.added:1",
      );
    });

    it("keeps a same-named file that differs in size", () => {
      fixture.componentRef.setInput("multiple", true);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("IMG_0001.jpg", 100)]);
      selectFiles(fixture, [makeFile("IMG_0001.jpg", 250)]);

      expect(component.files().map((file) => file.size)).toEqual([100, 250]);
    });

    it("ignores a selection that carries no files", async () => {
      const input = fileInput(fixture);
      Object.defineProperty(input, "files", {
        value: null,
        configurable: true,
      });
      input.dispatchEvent(new Event("change"));
      fixture.detectChanges();

      expect(component.files()).toEqual([]);
      expect(await announced()).toBe("");
    });
  });

  describe("validation", () => {
    const summary = () => text("tedi-feedback-text.tedi-feedback-text--error");

    it("keeps a rejected file as a danger tag and summarises the rejection", async () => {
      fixture.componentRef.setInput("keepRejectedFiles", true);
      fixture.componentRef.setInput("multiple", true);
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.detectChanges();

      selectFiles(fixture, [
        makeFile("ok.pdf"),
        makeFile("bad.txt", 100, "text/plain"),
      ]);

      expect(component.files().map((file) => file.isValid)).toEqual([
        true,
        false,
      ]);
      expect(
        fixture.debugElement.queryAll(By.css(".tedi-tag--danger")).length,
      ).toBe(1);
      expect(text(".tedi-tag--danger .sr-only")).toBe("(file-upload.failed)");
      expect(summary()).toBe("file-upload.extension-rejected:'bad.txt'");
      expect(fieldOf(fixture).classList).toContain(
        "tedi-field-surface--invalid",
      );
      expect(await announced()).toBe(
        "file-upload.extension-rejected:'bad.txt'. file-upload.added:1",
      );
    });

    it("discards a rejected file by default", () => {
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("notes.txt", 100, "text/plain")]);

      expect(component.files()).toEqual([]);
      expect(summary()).toBe("file-upload.extension-rejected:'notes.txt'");
    });

    it("rejects a file over maxSize", () => {
      fixture.componentRef.setInput("maxSize", 1024 ** 2);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("big.pdf", 2 * 1024 ** 2)]);

      expect(component.files()).toEqual([]);
      expect(summary()).toBe("file-upload.size-rejected:'big.pdf'");
    });

    it("names a file breaking both restrictions once, by its first reason", () => {
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.componentRef.setInput("maxSize", 50);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("notes.txt", 5000, "text/plain")]);

      expect(summary()).toBe("file-upload.extension-rejected:'notes.txt'");
    });

    it("accepts a wildcard MIME group and an exact MIME type", () => {
      fixture.componentRef.setInput("keepRejectedFiles", true);
      fixture.componentRef.setInput("multiple", true);
      fixture.componentRef.setInput("accept", "image/*,application/pdf");
      fixture.detectChanges();

      selectFiles(fixture, [
        makeFile("photo.png", 100, "image/png"),
        makeFile("report.pdf"),
        makeFile("README", 100, "text/plain"),
      ]);

      expect(component.files().map((file) => file.isValid)).toEqual([
        true,
        true,
        false,
      ]);
    });

    it("clears the summary on the next clean selection", () => {
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("bad.txt", 100, "text/plain")]);
      expect(summary()).toBeDefined();

      selectFiles(fixture, [makeFile("ok.pdf")]);
      expect(summary()).toBeUndefined();
    });

    it("clears the summary once the last rejected file is removed", () => {
      fixture.componentRef.setInput("keepRejectedFiles", true);
      fixture.componentRef.setInput("multiple", true);
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.detectChanges();

      selectFiles(fixture, [
        makeFile("ok.pdf"),
        makeFile("bad.txt", 100, "text/plain"),
      ]);
      expect(summary()).toBeDefined();

      tagRemoveButtons(fixture)[1].click();
      fixture.detectChanges();

      expect(names()).toEqual(["ok.pdf"]);
      expect(summary()).toBeUndefined();
    });

    it("clears the summary when the bound control is reset", () => {
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("bad.txt", 100, "text/plain")]);
      expect(summary()).toBeDefined();

      // `reset()` covers the clear button; a form resetting the control comes
      // through `writeValue` instead.
      fixture.componentInstance.writeValue(null);
      fixture.detectChanges();

      expect(summary()).toBeUndefined();
    });

    describe("with a validator", () => {
      const noSpaces = (file: File) =>
        file.name.includes(" ") ? "Failinimes ei tohi olla tühikuid." : null;

      beforeEach(() => {
        fixture.componentRef.setInput("multiple", true);
        fixture.componentRef.setInput("validator", noSpaces);
        fixture.detectChanges();
      });

      it("keeps a file it rejects as a danger tag and names it in the summary", async () => {
        fixture.componentRef.setInput("keepRejectedFiles", true);
        fixture.detectChanges();
        selectFiles(fixture, [makeFile("ok.pdf"), makeFile("my scan.pdf")]);

        expect(component.files().map((file) => file.isValid)).toEqual([
          true,
          false,
        ]);
        expect(
          fixture.debugElement.queryAll(By.css(".tedi-tag--danger")).length,
        ).toBe(1);
        expect(summary()).toBe(
          "Failinimes ei tohi olla tühikuid: 'my scan.pdf'",
        );
        expect(await announced()).toBe(
          "Failinimes ei tohi olla tühikuid: 'my scan.pdf'. file-upload.added:1",
        );
      });

      it("groups the files that fail the same rule", () => {
        selectFiles(fixture, [makeFile("a b.pdf"), makeFile("c d.pdf")]);

        expect(summary()).toBe(
          "Failinimes ei tohi olla tühikuid: 'a b.pdf', 'c d.pdf'",
        );
      });

      it("lists the built-in reasons first and skips the validator for those files", () => {
        const validator = jest.fn(noSpaces);
        fixture.componentRef.setInput("validator", validator);
        fixture.componentRef.setInput("accept", ".pdf");
        fixture.detectChanges();

        selectFiles(fixture, [
          makeFile("bad name.txt", 100, "text/plain"),
          makeFile("my scan.pdf"),
        ]);

        expect(validator).toHaveBeenCalledTimes(1);
        expect(summary()).toBe(
          "file-upload.extension-rejected:'bad name.txt'. " +
            "Failinimes ei tohi olla tühikuid: 'my scan.pdf'",
        );
      });

      it("discards a file it rejects by default", () => {
        fixture.detectChanges();

        selectFiles(fixture, [makeFile("ok.pdf"), makeFile("my scan.pdf")]);

        expect(names()).toEqual(["ok.pdf"]);
        expect(summary()).toBeDefined();
      });

      it("accepts a file when it returns nothing", () => {
        for (const result of [null, undefined, ""]) {
          fixture.componentRef.setInput("validator", () => result);
          fixture.detectChanges();
          selectFiles(fixture, [makeFile(`${String(result)}.pdf`)]);
        }

        expect(component.files().every((file) => file.isValid)).toBe(true);
        expect(summary()).toBeUndefined();
      });
    });

    it("forces the error state from the invalid input", () => {
      fixture.componentRef.setInput("invalid", true);
      fixture.detectChanges();

      expect(fieldOf(fixture).classList).toContain(
        "tedi-field-surface--invalid",
      );
    });
  });

  describe("feedback", () => {
    it("shows the restrictions hint and describes the button by it", () => {
      fixture.componentRef.setInput("accept", ".pdf,.txt");
      fixture.componentRef.setInput("maxSize", 500 * 1024);
      fixture.detectChanges();

      const id = fileInput(fixture).id;

      expect(text("tedi-feedback-text")).toBe(
        "file-upload.accept .pdf, .txt. file-upload.max-size 500 KB",
      );
      expect(addButton(fixture).getAttribute("aria-describedby")).toBe(
        `${id}-hint`,
      );
    });

    it("shows the hint and the rejection error at the same time", () => {
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("notes.txt", 100, "text/plain")]);

      const messages = fixture.debugElement.queryAll(
        By.css("tedi-feedback-text"),
      );
      const id = fileInput(fixture).id;

      expect(messages.length).toBe(2);
      expect(messages[0].nativeElement.textContent).toContain(
        "file-upload.extension-rejected",
      );
      expect(messages[1].nativeElement.textContent).toContain(
        "file-upload.accept",
      );
      expect(addButton(fixture).getAttribute("aria-describedby")).toBe(
        `${id}-error ${id}-hint`,
      );
    });

    it("keeps errors when showRestrictions is off", () => {
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.componentRef.setInput("showRestrictions", false);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("notes.txt", 100, "text/plain")]);

      const messages = fixture.debugElement.queryAll(
        By.css("tedi-feedback-text"),
      );
      expect(messages.length).toBe(1);
      expect(messages[0].nativeElement.textContent).toContain(
        "file-upload.extension-rejected",
      );
    });
  });

  describe("file list", () => {
    it("renders a single file as plain text", () => {
      fixture.componentRef.setInput("files", [{ id: "1", name: "report.pdf" }]);
      fixture.detectChanges();

      expect(text(".tedi-file-upload__name")).toBe("report.pdf");
      expect(fixture.debugElement.query(By.css("tedi-tag"))).toBeNull();
    });

    it("renders several files as closable tags", () => {
      fixture.componentRef.setInput("files", [
        { id: "1", name: "a.pdf" },
        { id: "2", name: "b.pdf" },
      ]);
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css("tedi-tag")).length).toBe(2);
      expect(tagRemoveButtons(fixture).length).toBe(2);
    });

    it("shows a loading file with a spinner and no remove button", () => {
      fixture.componentRef.setInput("files", [
        { id: "1", name: "a.pdf", isLoading: true },
        { id: "2", name: "b.pdf" },
      ]);
      fixture.detectChanges();

      expect(
        fixture.debugElement.queryAll(By.css(".tedi-tag--loading")).length,
      ).toBe(1);
      expect(tagRemoveButtons(fixture).length).toBe(1);
    });

    it("removes a file through its tag, emits it, announces and refocuses the add button", async () => {
      fixture.componentRef.setInput("files", [
        { id: "1", name: "a.pdf" },
        { id: "2", name: "b.pdf" },
      ]);
      fixture.detectChanges();

      const removed: string[] = [];
      component.fileRemove.subscribe((file) => removed.push(file.name ?? ""));

      tagRemoveButtons(fixture)[0].click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(names()).toEqual(["b.pdf"]);
      expect(removed).toEqual(["a.pdf"]);
      // Removal announces synchronously — only the add path is delayed.
      expect(announcer.announce).toHaveBeenLastCalledWith(
        "file-upload.removed:a.pdf",
        "polite",
      );
      expect(document.activeElement).toBe(addButton(fixture));
    });

    it("clears every file at once, emitting each", () => {
      fixture.componentRef.setInput("files", [
        { id: "1", name: "a.pdf" },
        { id: "2", name: "b.pdf" },
      ]);
      fixture.detectChanges();

      const removed: string[] = [];
      component.fileRemove.subscribe((file) => removed.push(file.name ?? ""));

      const clear = clearButton(fixture)!;
      expect(clear.getAttribute("aria-label")).toBe("clear");

      clear.click();
      fixture.detectChanges();

      expect(component.files()).toEqual([]);
      expect(removed).toEqual(["a.pdf", "b.pdf"]);
      expect(clearButton(fixture)).toBeNull();
      expect(announcer.announce).toHaveBeenLastCalledWith(
        "file-upload.cleared",
        "polite",
      );
    });

    it("hides the clear button when clearable is off or the field is disabled", () => {
      fixture.componentRef.setInput("files", [{ id: "1", name: "a.pdf" }]);
      fixture.componentRef.setInput("clearable", false);
      fixture.detectChanges();
      expect(clearButton(fixture)).toBeNull();

      fixture.componentRef.setInput("clearable", true);
      fixture.detectChanges();
      expect(clearButton(fixture)).not.toBeNull();

      fixture.componentRef.setInput("disabled", true);
      fixture.detectChanges();
      expect(clearButton(fixture)).toBeNull();
    });

    it("spells the clear button out below the md breakpoint", () => {
      fixture.componentRef.setInput("files", [{ id: "1", name: "a.pdf" }]);
      isBelowMd.set(true);
      fixture.detectChanges();

      const clear = clearButton(fixture)!;

      expect(clear.classList).toContain("tedi-button");
      expect(clear.textContent).toContain("clear");
      expect(addButton(fixture).classList).toContain("tedi-button--default");
    });

    it("does not remove while disabled", () => {
      fixture.componentRef.setInput("files", [{ id: "1", name: "a.pdf" }]);
      fixture.componentRef.setInput("disabled", true);
      fixture.detectChanges();

      component["removeFile"](component.files()[0]);
      component.reset();

      expect(component.files().length).toBe(1);
    });

    it("falls back to the default when clearable is reset to null", () => {
      fixture.componentRef.setInput("files", [{ id: "1", name: "a.pdf" }]);
      fixture.componentRef.setInput("clearable", false);
      fixture.detectChanges();
      expect(clearButton(fixture)).toBeNull();

      fixture.componentRef.setInput("clearable", null);
      fixture.detectChanges();

      expect(clearButton(fixture)).not.toBeNull();
    });

    it("does nothing when reset with no files", () => {
      const removed: FileUploadFile[] = [];
      component.fileRemove.subscribe((file) => removed.push(file));

      component.reset();

      expect(component.files()).toEqual([]);
      expect(removed).toEqual([]);
      expect(announcer.announce).not.toHaveBeenCalled();
    });

    it("announces the removal of a file that has no name", () => {
      fixture.componentRef.setInput("files", [{ id: "1" }, { id: "2" }]);
      fixture.detectChanges();

      tagRemoveButtons(fixture)[0].click();
      fixture.detectChanges();

      expect(component.files()).toEqual([{ id: "2" }]);
      expect(announcer.announce).toHaveBeenLastCalledWith(
        "file-upload.removed:",
        "polite",
      );
    });
  });

  describe("read-only", () => {
    beforeEach(() => {
      fixture.componentRef.setInput("readOnly", true);
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.componentRef.setInput("files", [
        { id: "1", name: "a.pdf" },
        { id: "2", name: "b.pdf" },
      ]);
      fixture.detectChanges();
    });

    it("renders only the tags", () => {
      expect(fixture.debugElement.queryAll(By.css("tedi-tag")).length).toBe(2);
      expect(tagRemoveButtons(fixture).length).toBe(0);
      expect(
        fixture.debugElement.query(By.css(".tedi-file-upload__field")),
      ).toBeNull();
      expect(fileInput(fixture).disabled).toBe(true);
      expect(
        fixture.debugElement.query(By.css("tedi-feedback-text")),
      ).toBeNull();
    });

    it("ignores reset", () => {
      component.reset();

      expect(component.files().length).toBe(2);
    });
  });
});

@Component({
  standalone: true,
  imports: [FileUploadComponent, ReactiveFormsModule],
  template: `<tedi-file-upload
    [formControl]="control"
    accept=".pdf"
    multiple
    keepRejectedFiles
  />`,
})
class ReactiveFormsHostComponent {
  control = new FormControl<FileUploadFile[]>([]);
}

describe("FileUploadComponent with reactive forms", () => {
  let fixture: ComponentFixture<ReactiveFormsHostComponent>;
  let host: ReactiveFormsHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsHostComponent],
      providers: baseProviders,
    });
    fixture = TestBed.createComponent(ReactiveFormsHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => jest.restoreAllMocks());

  it("clears the summary when the control is reset", () => {
    selectFiles(fixture, [makeFile("bad.txt", 100, "text/plain")]);
    fixture.detectChanges();

    const summary = () =>
      fixture.debugElement
        .queryAll(By.css("tedi-feedback-text"))
        .map((el) => (el.nativeElement as HTMLElement).textContent ?? "")
        .find((listed) => listed.includes("rejected"));

    expect(summary()).toBeDefined();

    host.control.reset();
    fixture.detectChanges();

    expect(host.control.value).toBeNull();
    expect(summary()).toBeUndefined();
  });

  it("writes the control value into the list", () => {
    host.control.setValue([{ id: "1", name: "preloaded.pdf" }]);
    fixture.detectChanges();

    expect(
      fixture.debugElement.query(By.css(".tedi-file-upload__name"))
        .nativeElement.textContent,
    ).toContain("preloaded.pdf");
  });

  it("pushes picked files back to the control", () => {
    selectFiles(fixture, [makeFile("report.pdf")]);

    expect(host.control.value?.map((file) => file.name)).toEqual([
      "report.pdf",
    ]);
  });

  it("marks the control touched when the user moves on from the add button", () => {
    jest.spyOn(document, "hasFocus").mockReturnValue(true);
    expect(host.control.touched).toBe(false);

    addButton(fixture).dispatchEvent(new Event("blur"));
    fixture.detectChanges();

    expect(host.control.touched).toBe(true);
  });

  it("stays untouched while the file dialog has focus", () => {
    jest.spyOn(document, "hasFocus").mockReturnValue(false);

    addButton(fixture).dispatchEvent(new Event("blur"));
    fixture.detectChanges();

    expect(host.control.touched).toBe(false);
  });

  it("marks the control touched when the file dialog is cancelled", () => {
    fileInput(fixture).dispatchEvent(new Event("cancel"));
    fixture.detectChanges();

    expect(host.control.touched).toBe(true);
  });

  it("marks the control touched once files are picked", () => {
    selectFiles(fixture, [makeFile("report.pdf")]);

    expect(host.control.touched).toBe(true);
  });

  it("empties the list when the control is reset", () => {
    selectFiles(fixture, [makeFile("report.pdf")]);
    host.control.reset();
    fixture.detectChanges();

    expect(
      fixture.debugElement.query(By.css(".tedi-file-upload__name")),
    ).toBeNull();
  });

  it("fails the control while a rejected file is listed", () => {
    host.control.setValue([
      { id: "1", name: "ok.pdf" },
      { id: "2", name: "bad.png", isValid: false },
    ]);
    fixture.detectChanges();

    expect(host.control.invalid).toBe(true);
    expect(host.control.errors?.["rejectedFiles"]).toEqual([
      expect.objectContaining({ name: "bad.png" }),
    ]);

    host.control.setValue([{ id: "1", name: "ok.pdf" }]);
    fixture.detectChanges();

    expect(host.control.valid).toBe(true);
  });

  it("revalidates when the user removes the rejected file", () => {
    selectFiles(fixture, [
      makeFile("ok.pdf"),
      makeFile("bad.txt", 100, "text/plain"),
    ]);
    expect(host.control.invalid).toBe(true);

    tagRemoveButtons(fixture)[1].click();
    fixture.detectChanges();

    expect(host.control.invalid).toBe(false);
    expect(host.control.value?.length).toBe(1);
  });

  it("disables the field from the control", () => {
    host.control.disable();
    fixture.detectChanges();

    expect(addButton(fixture).disabled).toBe(true);
    expect(fileInput(fixture).disabled).toBe(true);
  });
});

@Component({
  standalone: true,
  imports: [FileUploadComponent, FormsModule],
  template: `<tedi-file-upload [(ngModel)]="files" name="attachments" />`,
})
class NgModelHostComponent {
  files: FileUploadFile[] = [];
}

describe("FileUploadComponent with template-driven forms", () => {
  let fixture: ComponentFixture<NgModelHostComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [NgModelHostComponent],
      providers: baseProviders,
    });
    fixture = TestBed.createComponent(NgModelHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it("writes a picked file back to the bound model", async () => {
    selectFiles(fixture, [makeFile("report.pdf")]);
    await fixture.whenStable();

    expect(fixture.componentInstance.files.map((f) => f.name)).toEqual([
      "report.pdf",
    ]);
  });
});

@Component({
  standalone: true,
  imports: [
    FileUploadComponent,
    FormFieldComponent,
    FeedbackTextComponent,
    LabelComponent,
  ],
  template: `
    <tedi-form-field [size]="size" [clearable]="clearable">
      <label tedi-label for="cv">Laadi fail üles</label>
      <tedi-file-upload
        inputId="cv"
        aria-describedby="external-help"
        [files]="files"
      />
      @if (feedback) {
        <tedi-feedback-text id="cv-feedback" [text]="feedback" [type]="type" />
      }
    </tedi-form-field>
  `,
})
class FormFieldHostComponent {
  size: "default" | "small" = "default";
  clearable = true;
  files: FileUploadFile[] = [{ id: "1", name: "cv.pdf" }];
  feedback = "";
  type: "hint" | "error" | "valid" = "hint";
}

describe("FileUploadComponent inside tedi-form-field", () => {
  let fixture: ComponentFixture<FormFieldHostComponent>;
  let host: FormFieldHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormFieldHostComponent],
      providers: baseProviders,
    });
    fixture = TestBed.createComponent(FormFieldHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("names the add button by the field label and its own text", () => {
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css("label")).nativeElement;

    expect(label.id).toBe("cv-label");
    expect(addButton(fixture).getAttribute("aria-labelledby")).toBe(
      "cv-label cv-add",
    );
  });

  it("merges the host's aria-describedby with the field's feedback", () => {
    host.feedback = "Vihje";
    fixture.detectChanges();

    expect(addButton(fixture).getAttribute("aria-describedby")).toBe(
      "external-help cv-feedback",
    );
  });

  it("takes its size from the field", () => {
    host.size = "small";
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector(".tedi-file-upload").classList,
    ).toContain("tedi-file-upload--small");
  });

  it("takes error and valid states from the field's feedback", () => {
    host.feedback = "Viga";
    host.type = "error";
    fixture.detectChanges();
    expect(fieldOf(fixture).classList).toContain("tedi-field-surface--invalid");

    host.type = "valid";
    fixture.detectChanges();
    expect(fieldOf(fixture).classList).toContain("tedi-field-surface--valid");
  });

  it("renders its own clear button, driven by the field's clearable", () => {
    expect(
      fixture.debugElement.query(By.css(".tedi-form-field__clear")),
    ).toBeNull();
    expect(clearButton(fixture)).not.toBeNull();

    host.clearable = false;
    fixture.detectChanges();

    expect(clearButton(fixture)).toBeNull();
  });

  it("focuses the add button when the field's padding is clicked", () => {
    const formField = fixture.debugElement.query(
      By.directive(FormFieldComponent),
    ).componentInstance as FormFieldComponent;

    formField.control()?.focus?.();

    expect(document.activeElement).toBe(addButton(fixture));
  });
});

@Component({
  standalone: true,
  imports: [FileUploadComponent, FormFieldComponent, LabelComponent],
  template: `
    <tedi-form-field>
      <label tedi-label for="docs">Failid</label>
      <tedi-file-upload
        inputId="docs"
        multiple
        [readOnly]="readOnly"
        [files]="files"
      />
    </tedi-form-field>
  `,
})
class ReadOnlyHostComponent {
  readOnly = true;
  files: FileUploadFile[] = [
    { id: "1", name: "a.pdf" },
    { id: "2", name: "b.pdf" },
  ];
}

describe("FileUploadComponent read-only list", () => {
  let fixture: ComponentFixture<ReadOnlyHostComponent>;

  const list = () =>
    fixture.debugElement.query(By.css(".tedi-file-upload__tags"))
      .nativeElement as HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReadOnlyHostComponent],
      providers: baseProviders,
    });
    fixture = TestBed.createComponent(ReadOnlyHostComponent);
    fixture.detectChanges();
    fixture.detectChanges();
  });

  it("keeps the list role Safari drops from a bullet-less list", () => {
    expect(list().getAttribute("role")).toBe("list");
  });

  it("keeps the label's target in the page", () => {
    const label = fixture.debugElement.query(By.css("label"))
      .nativeElement as HTMLLabelElement;

    expect(label.control).toBe(fileInput(fixture));
  });

  it("names the list by the field label", () => {
    const label = fixture.debugElement.query(By.css("label")).nativeElement;

    expect(label.id).toBe("docs-label");
    expect(list().getAttribute("aria-labelledby")).toBe("docs-label");
  });

  it("names a single file by the field label as a list of one", () => {
    fixture.componentInstance.files = [{ id: "1", name: "a.pdf" }];
    fixture.detectChanges();

    expect(list().getAttribute("role")).toBe("list");
    expect(list().getAttribute("aria-labelledby")).toBe("docs-label");
    expect(list().querySelectorAll("li").length).toBe(1);
    expect(
      list().querySelector(".tedi-file-upload__name")?.textContent,
    ).toContain("a.pdf");
    expect(list().querySelector("tedi-tag")).toBeNull();
  });

  it("shows a single editable file as plain text, outside a list", () => {
    fixture.componentInstance.files = [{ id: "1", name: "a.pdf" }];
    fixture.componentInstance.readOnly = false;
    fixture.detectChanges();

    expect(
      fixture.debugElement.query(By.css(".tedi-file-upload__tags")),
    ).toBeNull();
    expect(
      fixture.debugElement.query(By.css(".tedi-file-upload__name")),
    ).not.toBeNull();
  });

  it("leaves the list unnamed while the field is editable", () => {
    fixture.componentInstance.readOnly = false;
    fixture.detectChanges();
    fixture.detectChanges();

    expect(list().getAttribute("aria-labelledby")).toBeNull();
    expect(addButton(fixture).getAttribute("aria-labelledby")).toBe(
      "docs-label docs-add",
    );
  });
});
