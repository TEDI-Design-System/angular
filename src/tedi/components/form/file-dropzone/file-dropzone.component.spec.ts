import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { BreakpointService } from "../../../services/breakpoint/breakpoint.service";
import { FileDropzoneComponent } from "./file-dropzone.component";
import { FileDropzoneFileDirective } from "./file-dropzone-file.directive";
import { FileDropzoneFile } from "./file-dropzone.types";

class TranslationMock {
  translate(key: string, ...args: unknown[]) {
    return args.length ? `${key}:${args.join(",")}` : key;
  }
  track(key: string) {
    return () => key;
  }
}

const breakpointMock = {
  isBelowBreakpoint: () => signal(false).asReadonly(),
};

// `lastModified` is pinned because it defaults to `Date.now()`, which would make
// two fabricated files differ by milliseconds — a real file picked twice carries
// the same mtime, which is what the duplicate check relies on.
const announced = (fixture: ComponentFixture<unknown>): string =>
  (
    fixture.debugElement.query(By.css(".tedi-file-dropzone__announcement"))
      .nativeElement as HTMLElement
  ).textContent?.trim() ?? "";

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

const selectFiles = (fixture: ComponentFixture<unknown>, files: File[]) => {
  const input = fileInput(fixture);
  Object.defineProperty(input, "files", { value: files, configurable: true });
  input.dispatchEvent(new Event("change"));
  fixture.detectChanges();
};

const dispatchDrag = (
  fixture: ComponentFixture<unknown>,
  type: string,
  files: File[] = [],
) => {
  const zone = fixture.debugElement.query(By.css(".tedi-file-dropzone__zone"))
    .nativeElement as HTMLElement;
  const event = new Event(type, { bubbles: true }) as Event & {
    dataTransfer: unknown;
  };
  event.dataTransfer = { files, types: ["Files"], dropEffect: "none" };
  zone.dispatchEvent(event);
  fixture.detectChanges();
  return zone;
};

const baseProviders = [
  { provide: TediTranslationService, useClass: TranslationMock },
  { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
  { provide: BreakpointService, useValue: breakpointMock },
];

@Component({
  standalone: true,
  imports: [FileDropzoneComponent],
  template: `<tedi-file-dropzone
    inputId="described-by-dropzone"
    aria-describedby="described-by-dropzone external-help"
    [maxSize]="1024 ** 2"
  />`,
})
class DescribedByHostComponent {}

describe("FileDropzoneComponent", () => {
  let fixture: ComponentFixture<FileDropzoneComponent>;
  let component: FileDropzoneComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FileDropzoneComponent],
      providers: baseProviders,
    });
    fixture = TestBed.createComponent(FileDropzoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const text = (selector: string) =>
    fixture.debugElement
      .query(By.css(selector))
      ?.nativeElement.textContent.trim();

  it("creates and shows the translated label", () => {
    expect(component).toBeTruthy();
    expect(text(".tedi-file-dropzone__label")).toBe("file-dropzone.label");
  });

  it("uses a custom label when given", () => {
    fixture.componentRef.setInput("label", "Lohista failid siia");
    fixture.detectChanges();

    expect(text(".tedi-file-dropzone__label")).toBe("Lohista failid siia");
  });

  it("names the input from the dropzone label", () => {
    const input = fileInput(fixture);
    const zone = fixture.debugElement.query(
      By.css("label.tedi-file-dropzone__zone"),
    ).nativeElement as HTMLLabelElement;

    expect(zone.contains(input)).toBe(true);
    expect(zone.textContent).toContain("file-dropzone.label");
  });

  it("gives each instance its own generated id", () => {
    @Component({
      standalone: true,
      imports: [FileDropzoneComponent],
      template: `<tedi-file-dropzone [maxSize]="1" /><tedi-file-dropzone
          [maxSize]="1"
        />`,
    })
    class TwoDropzonesComponent {}

    const pair = TestBed.createComponent(TwoDropzonesComponent);
    pair.detectChanges();

    const [first, second] = pair.debugElement
      .queryAll(By.css("input[type=file]"))
      .map((el) => el.nativeElement as HTMLInputElement);

    expect(first.id).not.toBe(second.id);
    // The feedback ids are derived from it, so a collision would cross-wire
    // one dropzone's aria-describedby to the other's hint.
    expect(first.getAttribute("aria-describedby")).not.toBe(
      second.getAttribute("aria-describedby"),
    );
  });

  it("associates an external label through inputId", () => {
    fixture.componentRef.setInput("inputId", "attachments");
    fixture.detectChanges();

    expect(fileInput(fixture).id).toBe("attachments");
  });

  it("disables the input and marks the host", () => {
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();

    const input = fileInput(fixture);

    expect(input.disabled).toBe(true);
    expect(
      fixture.nativeElement.classList.contains("tedi-file-dropzone--disabled"),
    ).toBe(true);
  });

  it("forwards accept and multiple to the input", () => {
    fixture.componentRef.setInput("accept", ".pdf,.txt");
    fixture.componentRef.setInput("multiple", true);
    fixture.detectChanges();

    const input = fileInput(fixture);

    expect(input.getAttribute("accept")).toBe(".pdf,.txt");
    expect(input.multiple).toBe(true);
  });

  describe("selection", () => {
    it("adds a picked file and announces it", () => {
      selectFiles(fixture, [makeFile("report.pdf")]);

      expect(component.files().map((file) => file.name)).toEqual([
        "report.pdf",
      ]);
      expect(announced(fixture)).toBe("file-upload.added:1");
    });

    it("clears the input value so the same file can be picked again", () => {
      const input = fileInput(fixture);
      selectFiles(fixture, [makeFile("report.pdf")]);

      expect(input.value).toBe("");
    });

    it("replaces the file when not multiple", () => {
      selectFiles(fixture, [makeFile("first.pdf")]);
      selectFiles(fixture, [makeFile("second.pdf")]);

      expect(component.files().map((file) => file.name)).toEqual([
        "second.pdf",
      ]);
    });

    it("skips a file that is already listed", () => {
      fixture.componentRef.setInput("multiple", true);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("report.pdf")]);
      selectFiles(fixture, [makeFile("report.pdf")]);

      expect(component.files().map((file) => file.name)).toEqual([
        "report.pdf",
      ]);
      expect(announced(fixture)).toBe(
        "file-upload.duplicates-skipped:'report.pdf'",
      );
    });

    it("keeps a same-named file that differs in size", () => {
      fixture.componentRef.setInput("multiple", true);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("IMG_0001.jpg", 100)]);
      selectFiles(fixture, [makeFile("IMG_0001.jpg", 250)]);

      expect(component.files().map((file) => file.size)).toEqual([100, 250]);
    });

    it("adds the new files and skips only the repeats in one selection", () => {
      fixture.componentRef.setInput("multiple", true);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("first.pdf")]);
      selectFiles(fixture, [makeFile("first.pdf"), makeFile("second.pdf")]);

      expect(component.files().map((file) => file.name)).toEqual([
        "first.pdf",
        "second.pdf",
      ]);
    });

    it("appends files when multiple", () => {
      fixture.componentRef.setInput("multiple", true);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("first.pdf")]);
      selectFiles(fixture, [makeFile("second.pdf")]);

      expect(component.files().map((file) => file.name)).toEqual([
        "first.pdf",
        "second.pdf",
      ]);
    });
  });

  describe("validation", () => {
    it("rejects a file with a disallowed extension", () => {
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.componentRef.setInput("keepRejectedFiles", false);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("notes.txt", 100, "text/plain")]);

      expect(component.files()).toEqual([]);
      expect(text("tedi-feedback-text.tedi-feedback-text--error")).toContain(
        "file-upload.extension-rejected",
      );
    });

    it("accepts a wildcard MIME group", () => {
      fixture.componentRef.setInput("accept", "image/*");
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("photo.png", 100, "image/png")]);

      expect(component.files().map((file) => file.name)).toEqual(["photo.png"]);
    });

    it("accepts an exact MIME type", () => {
      fixture.componentRef.setInput("accept", "application/pdf");
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("report.pdf")]);

      expect(component.files().map((file) => file.name)).toEqual([
        "report.pdf",
      ]);
    });

    it("rejects a file over maxSize", () => {
      fixture.componentRef.setInput("maxSize", 1024 ** 2);
      fixture.componentRef.setInput("keepRejectedFiles", false);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("big.pdf", 2 * 1024 ** 2)]);

      expect(component.files()).toEqual([]);
      expect(text("tedi-feedback-text.tedi-feedback-text--error")).toContain(
        "file-upload.size-rejected",
      );
    });

    it("keeps rejected files marked invalid with keepRejectedFiles", () => {
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.componentRef.setInput("multiple", true);
      fixture.componentRef.setInput("keepRejectedFiles", true);
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
        fixture.debugElement.queryAll(By.css(".tedi-attachment--error")).length,
      ).toBe(1);
    });

    it("gives each individually rejected file its own message", () => {
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.componentRef.setInput("maxSize", 1024 ** 2);
      fixture.componentRef.setInput("multiple", true);
      fixture.componentRef.setInput("keepRejectedFiles", true);
      fixture.detectChanges();

      selectFiles(fixture, [
        makeFile("bad.txt", 100, "text/plain"),
        makeFile("big.pdf", 2 * 1024 ** 2),
      ]);

      expect(component.files().map((file) => file.error)).toEqual([
        "file-dropzone.file-rejected-extension",
        "file-dropzone.file-rejected-size",
      ]);
      expect(
        fixture.debugElement
          .queryAll(By.css(".tedi-attachment__feedback"))
          .map((el) => el.nativeElement.textContent.trim()),
      ).toEqual([
        "file-dropzone.file-rejected-extension",
        "file-dropzone.file-rejected-size",
      ]);
    });

    it("summarises rejections under the dropzone without keepRejectedFiles", () => {
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.componentRef.setInput("multiple", true);
      fixture.componentRef.setInput("keepRejectedFiles", false);
      fixture.detectChanges();

      selectFiles(fixture, [
        makeFile("ok.pdf"),
        makeFile("bad.txt", 100, "text/plain"),
      ]);

      expect(component.files().map((file) => file.name)).toEqual(["ok.pdf"]);
      expect(
        text(
          "tedi-feedback-text.tedi-feedback-text--error:not(.tedi-attachment__feedback)",
        ),
      ).toContain("file-upload.extension-rejected");
    });

    it("clears the summary on the next selection with no rejections", () => {
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.componentRef.setInput("multiple", true);
      fixture.componentRef.setInput("keepRejectedFiles", false);
      fixture.detectChanges();

      const summary = () =>
        text(
          "tedi-feedback-text.tedi-feedback-text--error:not(.tedi-attachment__feedback)",
        );

      selectFiles(fixture, [makeFile("bad.txt", 100, "text/plain")]);
      expect(summary()).toContain("file-upload.extension-rejected");

      selectFiles(fixture, [makeFile("ok.pdf")]);
      expect(summary()).toBeUndefined();
    });

    it("drops the aggregate error when files carry their own", () => {
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.componentRef.setInput("multiple", true);
      fixture.componentRef.setInput("keepRejectedFiles", true);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("bad.txt", 100, "text/plain")]);

      expect(
        fixture.debugElement.query(
          By.css(
            "tedi-feedback-text.tedi-feedback-text--error:not(.tedi-attachment__feedback)",
          ),
        ),
      ).toBeNull();
      expect(announced(fixture)).toBe(
        "file-upload.extension-rejected:'bad.txt'",
      );
    });

    it("renders a consumer-supplied error on a preloaded file", () => {
      fixture.componentRef.setInput("files", [
        { id: "1", name: "scan.png", isValid: false, error: "Vale formaat" },
      ]);
      fixture.detectChanges();

      expect(text(".tedi-attachment__feedback")).toBe("Vale formaat");
    });

    it("lists a rejected file so the user can see and remove it", () => {
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.componentRef.setInput("keepRejectedFiles", true);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("notes.txt", 100, "text/plain")]);

      expect(text(".tedi-attachment__title")).toBe("notes.txt");
      expect(
        fixture.debugElement.queryAll(By.css(".tedi-attachment--error")).length,
      ).toBe(1);

      (
        fixture.debugElement.query(By.css(".tedi-attachment__actions button"))
          .nativeElement as HTMLButtonElement
      ).click();
      fixture.detectChanges();

      expect(component.files()).toEqual([]);
    });

    it("leaves the border alone when rejected files carry their own reason", () => {
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.componentRef.setInput("multiple", true);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("bad.txt", 100, "text/plain")]);

      expect(component.files().map((file) => file.error)).toEqual([
        "file-dropzone.file-rejected-extension",
      ]);
      expect(
        fixture.debugElement.query(By.css(".tedi-file-dropzone__zone"))
          .nativeElement.classList,
      ).not.toContain("tedi-file-dropzone__zone--invalid");
    });

    it("marks the zone invalid while an error is shown", () => {
      fixture.componentRef.setInput("maxSize", 1024 ** 2);
      fixture.componentRef.setInput("keepRejectedFiles", false);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("big.pdf", 2 * 1024 ** 2)]);

      expect(
        fixture.debugElement.query(By.css(".tedi-file-dropzone__zone"))
          .nativeElement.classList,
      ).toContain("tedi-file-dropzone__zone--invalid");
    });
  });

  describe("feedback", () => {
    it("shows the restrictions hint and the rejection error at the same time", () => {
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.componentRef.setInput("maxSize", 1024 ** 2);
      fixture.componentRef.setInput("keepRejectedFiles", false);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("notes.txt", 100, "text/plain")]);

      const messages = fixture.debugElement.queryAll(
        By.css("tedi-feedback-text"),
      );
      expect(messages.length).toBe(2);
      expect(messages[0].nativeElement.textContent).toContain(
        "file-upload.extension-rejected",
      );
      expect(messages[1].nativeElement.textContent).toContain(
        "file-upload.accept",
      );
    });

    it("renders the size limit in the unit that reads best", () => {
      fixture.componentRef.setInput("maxSize", 500 * 1024);
      fixture.detectChanges();

      expect(text("tedi-feedback-text")).toContain("500 KB");

      fixture.componentRef.setInput("maxSize", 10 * 1024 ** 2);
      fixture.detectChanges();

      expect(text("tedi-feedback-text")).toContain("10 MB");
    });

    it("keeps errors when showRestrictions is off", () => {
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.componentRef.setInput("showRestrictions", false);
      fixture.componentRef.setInput("keepRejectedFiles", false);
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

    it("describes the input by every message below it", () => {
      fixture.componentRef.setInput("maxSize", 1024 ** 2);
      fixture.componentRef.setInput("feedbackText", { text: "Custom hint" });
      fixture.detectChanges();

      const input = fileInput(fixture);
      const id = input.id;

      expect(input.getAttribute("aria-describedby")).toBe(
        `${id}-feedback ${id}-hint`,
      );
    });

    it("merges a consumer's own aria-describedby with its own ids", () => {
      const host = TestBed.createComponent(DescribedByHostComponent);
      host.detectChanges();

      const input = fileInput(host);
      expect(input.getAttribute("aria-describedby")).toBe(
        `described-by-dropzone external-help ${input.id}-hint`,
      );
    });

    it("marks the zone invalid from an error feedbackText", () => {
      fixture.componentRef.setInput("feedbackText", {
        text: "Sobimatu fail",
        type: "error",
      });
      fixture.detectChanges();

      expect(
        fixture.debugElement.query(By.css(".tedi-file-dropzone__zone"))
          .nativeElement.classList,
      ).toContain("tedi-file-dropzone__zone--invalid");
    });
  });

  describe("drag and drop", () => {
    it("marks the zone while a file is dragged over it", () => {
      const zone = dispatchDrag(fixture, "dragenter");
      expect(zone.classList).toContain("tedi-file-dropzone__zone--drop-over");

      dispatchDrag(fixture, "dragleave");
      expect(zone.classList).not.toContain(
        "tedi-file-dropzone__zone--drop-over",
      );
    });

    it("adds dropped files and clears the drop state", () => {
      dispatchDrag(fixture, "dragenter");
      const zone = dispatchDrag(fixture, "drop", [makeFile("dropped.pdf")]);

      expect(component.files().map((file) => file.name)).toEqual([
        "dropped.pdf",
      ]);
      expect(zone.classList).not.toContain(
        "tedi-file-dropzone__zone--drop-over",
      );
    });

    it("validates dropped files, which bypass the accept attribute", () => {
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.componentRef.setInput("keepRejectedFiles", false);
      fixture.detectChanges();

      dispatchDrag(fixture, "drop", [makeFile("bad.txt", 100, "text/plain")]);

      expect(component.files()).toEqual([]);
    });

    it("accepts the drag as a copy so the browser does not open the file", () => {
      const zone = fixture.debugElement.query(
        By.css(".tedi-file-dropzone__zone"),
      ).nativeElement as HTMLElement;
      const event = new Event("dragover", {
        bubbles: true,
        cancelable: true,
      }) as Event & {
        dataTransfer: { types: string[]; dropEffect: string };
      };
      event.dataTransfer = { types: ["Files"], dropEffect: "none" };
      zone.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
      expect(event.dataTransfer.dropEffect).toBe("copy");
    });

    it("ignores drops while disabled", () => {
      fixture.componentRef.setInput("disabled", true);
      fixture.detectChanges();

      dispatchDrag(fixture, "drop", [makeFile("dropped.pdf")]);

      expect(component.files()).toEqual([]);
    });
  });

  describe("file list", () => {
    beforeEach(() => {
      fixture.componentRef.setInput("multiple", true);
      fixture.detectChanges();
      selectFiles(fixture, [makeFile("report.pdf", 1024)]);
    });

    it("labels the list and renders an attachment per file", () => {
      const list = fixture.debugElement.query(
        By.css(".tedi-file-dropzone__files"),
      ).nativeElement as HTMLElement;

      expect(list.getAttribute("aria-label")).toBe(
        "file-dropzone.selected-files",
      );
      expect(list.querySelectorAll("tedi-attachment").length).toBe(1);
    });

    it("hides the file size unless showFileSize is set", () => {
      expect(text(".tedi-attachment__size")).toBeUndefined();

      fixture.componentRef.setInput("showFileSize", true);
      fixture.detectChanges();

      expect(text(".tedi-attachment__size")).toBe("1 KB");
    });

    it("emits the removed file, and only for a real removal", () => {
      const removed: string[] = [];
      component.fileRemove.subscribe((file) => removed.push(file.name ?? ""));

      selectFiles(fixture, [makeFile("second.pdf")]);
      expect(removed).toEqual([]);

      (
        fixture.debugElement.query(By.css(".tedi-attachment__actions button"))
          .nativeElement as HTMLButtonElement
      ).click();
      fixture.detectChanges();

      expect(removed).toEqual(["report.pdf"]);
    });

    it("does not emit while disabled", () => {
      const removed: FileDropzoneFile[] = [];
      component.fileRemove.subscribe((file) => removed.push(file));
      fixture.componentRef.setInput("disabled", true);
      fixture.detectChanges();

      component["removeFile"](component.files()[0]);
      fixture.detectChanges();

      expect(removed).toEqual([]);
      expect(component.files().length).toBe(1);
    });

    it("removes a file through its remove button", () => {
      const remove = fixture.debugElement.query(
        By.css(".tedi-attachment__actions button"),
      ).nativeElement as HTMLButtonElement;

      expect(remove.getAttribute("aria-label")).toBe("remove report.pdf");

      remove.click();
      fixture.detectChanges();

      expect(component.files()).toEqual([]);
      expect(announced(fixture)).toBe("file-upload.removed:report.pdf");
    });

    it("moves focus to the previous file's remove button", async () => {
      fixture.componentRef.setInput("files", [
        { id: "1", name: "a.pdf" },
        { id: "2", name: "b.pdf" },
        { id: "3", name: "c.pdf" },
      ]);
      fixture.detectChanges();

      const buttons = () =>
        fixture.debugElement
          .queryAll(By.css(".tedi-attachment__actions button"))
          .map((el) => el.nativeElement as HTMLButtonElement);

      buttons()[1].click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(document.activeElement).toBe(buttons()[0]);
    });

    it("moves focus to the new first row when the first file goes", async () => {
      fixture.componentRef.setInput("files", [
        { id: "1", name: "a.pdf" },
        { id: "2", name: "b.pdf" },
      ]);
      fixture.detectChanges();

      fixture.debugElement
        .queryAll(By.css(".tedi-attachment__actions button"))[0]
        .nativeElement.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(document.activeElement).toBe(
        fixture.debugElement.query(By.css(".tedi-attachment__actions button"))
          .nativeElement,
      );
    });

    it("returns focus to the drop zone when the last file goes", async () => {
      fixture.debugElement
        .query(By.css(".tedi-attachment__actions button"))
        .nativeElement.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(document.activeElement).toBe(
        fixture.debugElement.query(By.css(".tedi-file-dropzone__input"))
          .nativeElement,
      );
    });
  });

  describe("edge cases", () => {
    const zoneEl = () =>
      fixture.debugElement.query(By.css(".tedi-file-dropzone__zone"))
        .nativeElement as HTMLElement;

    it("ignores a selection that carries no files", () => {
      const input = fileInput(fixture);
      Object.defineProperty(input, "files", {
        value: null,
        configurable: true,
      });
      input.dispatchEvent(new Event("change"));
      fixture.detectChanges();

      expect(component.files()).toEqual([]);
      expect(announced(fixture)).toBe("");
    });

    it("ignores a drop that carries no dataTransfer", () => {
      zoneEl().dispatchEvent(new Event("drop", { bubbles: true }));
      fixture.detectChanges();

      expect(component.files()).toEqual([]);
    });

    it("ignores a drag that carries no dataTransfer", () => {
      zoneEl().dispatchEvent(new Event("dragenter", { bubbles: true }));
      fixture.detectChanges();

      expect(zoneEl().classList).not.toContain(
        "tedi-file-dropzone__zone--drop-over",
      );
    });

    it("ignores a drag of something that is not a file", () => {
      const event = new Event("dragenter", { bubbles: true }) as Event & {
        dataTransfer: unknown;
      };
      event.dataTransfer = { types: ["text/plain"], files: [] };
      zoneEl().dispatchEvent(event);
      fixture.detectChanges();

      expect(zoneEl().classList).not.toContain(
        "tedi-file-dropzone__zone--drop-over",
      );
    });

    it("leaves a non-file dragover to the browser", () => {
      const event = new Event("dragover", {
        bubbles: true,
        cancelable: true,
      }) as Event & { dataTransfer: { types: string[]; dropEffect: string } };
      event.dataTransfer = { types: ["text/plain"], dropEffect: "copy" };
      zoneEl().dispatchEvent(event);
      fixture.detectChanges();

      expect(event.defaultPrevented).toBe(false);
      expect(event.dataTransfer.dropEffect).toBe("copy");
    });

    it("refuses the drag while disabled without letting the browser take it", () => {
      fixture.componentRef.setInput("disabled", true);
      fixture.detectChanges();

      dispatchDrag(fixture, "dragenter", [makeFile("report.pdf")]);
      const overEvent = new Event("dragover", {
        bubbles: true,
        cancelable: true,
      }) as Event & { dataTransfer: { types: string[]; dropEffect: string } };
      overEvent.dataTransfer = { types: ["Files"], dropEffect: "copy" };
      zoneEl().dispatchEvent(overEvent);

      expect(zoneEl().classList).not.toContain(
        "tedi-file-dropzone__zone--drop-over",
      );
      // Claimed, so the browser cannot navigate to the file, but refused.
      expect(overEvent.defaultPrevented).toBe(true);
      expect(overEvent.dataTransfer.dropEffect).toBe("none");
    });

    it("swallows a drop while disabled instead of opening the file", () => {
      fixture.componentRef.setInput("disabled", true);
      fixture.detectChanges();

      const dropEvent = new Event("drop", {
        bubbles: true,
        cancelable: true,
      }) as Event & { dataTransfer: unknown };
      dropEvent.dataTransfer = {
        files: [makeFile("report.pdf")],
        types: ["Files"],
        dropEffect: "none",
      };
      zoneEl().dispatchEvent(dropEvent);
      fixture.detectChanges();

      expect(component.files()).toEqual([]);
      expect(dropEvent.defaultPrevented).toBe(true);
    });

    it("renders a file that has no name", () => {
      fixture.componentRef.setInput("files", [{ id: "1" }]);
      fixture.detectChanges();

      expect(text(".tedi-attachment__title")).toBe("");
      expect(
        fixture.debugElement
          .query(By.css(".tedi-attachment__actions button"))
          .nativeElement.getAttribute("aria-label"),
      ).toBe("remove ");
    });

    it("announces a removal for a file that has no name", () => {
      fixture.componentRef.setInput("files", [{ id: "1" }]);
      fixture.detectChanges();

      (
        fixture.debugElement.query(By.css(".tedi-attachment__actions button"))
          .nativeElement as HTMLButtonElement
      ).click();
      fixture.detectChanges();

      expect(announced(fixture)).toBe("file-upload.removed:");
    });

    it("matches an extensionless file on its MIME type", () => {
      fixture.componentRef.setInput("accept", "text/plain");
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("README", 100, "text/plain")]);

      expect(component.files().map((file) => file.isValid)).toEqual([true]);
    });

    it("rejects an extensionless file when accept lists extensions", () => {
      fixture.componentRef.setInput("accept", ".txt");
      fixture.componentRef.setInput("keepRejectedFiles", false);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("README", 100, "text/plain")]);

      expect(component.files()).toEqual([]);
    });
  });
});

@Component({
  standalone: true,
  imports: [FileDropzoneComponent, ReactiveFormsModule],
  template: `<tedi-file-dropzone
    [formControl]="control"
    accept=".pdf"
    multiple
  />`,
})
class ReactiveFormsHostComponent {
  control = new FormControl<FileDropzoneFile[]>([]);
}

describe("FileDropzoneComponent with reactive forms", () => {
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

  it("writes the control value into the list", () => {
    host.control.setValue([{ id: "1", name: "preloaded.pdf" }]);
    fixture.detectChanges();

    expect(
      fixture.debugElement.query(By.css(".tedi-attachment__title"))
        .nativeElement.textContent,
    ).toContain("preloaded.pdf");
  });

  it("pushes picked files back to the control", () => {
    selectFiles(fixture, [makeFile("report.pdf")]);

    expect(host.control.value?.map((file) => file.name)).toEqual([
      "report.pdf",
    ]);
  });

  it("marks the control touched on blur", () => {
    const input = fileInput(fixture);

    expect(host.control.touched).toBe(false);
    input.dispatchEvent(new Event("blur"));
    fixture.detectChanges();

    expect(host.control.touched).toBe(true);
  });

  it("empties the list when the control is reset", () => {
    selectFiles(fixture, [makeFile("report.pdf")]);
    host.control.reset();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css("tedi-attachment"))).toBeNull();
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
  });

  it("passes once no rejected file is left", () => {
    host.control.setValue([{ id: "1", name: "ok.pdf" }]);
    fixture.detectChanges();

    expect(host.control.valid).toBe(true);
    expect(host.control.errors).toBeNull();
  });

  it("revalidates when the user removes the rejected file", () => {
    selectFiles(fixture, [makeFile("bad.txt", 100, "text/plain")]);
    expect(host.control.invalid).toBe(true);

    (
      fixture.debugElement.query(By.css(".tedi-attachment__actions button"))
        .nativeElement as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(host.control.invalid).toBe(false);
    expect(host.control.value).toEqual([]);
  });

  it("disables the input from the control", () => {
    host.control.disable();
    fixture.detectChanges();

    const input = fileInput(fixture);

    expect(input.disabled).toBe(true);
  });
});

@Component({
  standalone: true,
  imports: [FileDropzoneComponent, FileDropzoneFileDirective],
  template: `
    <tedi-file-dropzone multiple>
      <ng-template
        tediFileDropzoneFile
        let-file
        let-remove="remove"
        let-removeLabel="removeLabel"
      >
        <span class="custom-row">{{ file.name }}</span>
        <button
          type="button"
          class="custom-remove"
          [attr.aria-label]="removeLabel"
          (click)="remove()"
        >
          Remove
        </button>
      </ng-template>
    </tedi-file-dropzone>
  `,
})
class TemplateHostComponent {}

describe("FileDropzoneComponent with a custom file template", () => {
  let fixture: ComponentFixture<TemplateHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemplateHostComponent],
      providers: baseProviders,
    });
    fixture = TestBed.createComponent(TemplateHostComponent);
    fixture.detectChanges();
    selectFiles(fixture, [makeFile("report.pdf")]);
  });

  it("renders the projected template instead of the attachment", () => {
    expect(
      fixture.debugElement.query(By.css(".custom-row")).nativeElement
        .textContent,
    ).toContain("report.pdf");
    expect(fixture.debugElement.query(By.css("tedi-attachment"))).toBeNull();
  });

  it("hands the template a translated label for its remove control", () => {
    expect(
      fixture.debugElement
        .query(By.css(".custom-remove"))
        .nativeElement.getAttribute("aria-label"),
    ).toBe("remove report.pdf");
  });

  it("accepts any context shape at compile time", () => {
    // The guard exists purely so `let-file` is typed inside the template; it is
    // never consulted at runtime, so nothing else would execute it.
    expect(
      FileDropzoneFileDirective.ngTemplateContextGuard(
        null as never,
        undefined,
      ),
    ).toBe(true);
  });

  it("removes the file through the template context", () => {
    (
      fixture.debugElement.query(By.css(".custom-remove"))
        .nativeElement as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css(".custom-row"))).toBeNull();
  });
});

@Component({
  standalone: true,
  imports: [FileDropzoneComponent, FormsModule],
  template: `<tedi-file-dropzone
    [(ngModel)]="files"
    name="attachments"
    multiple
  />`,
})
class NgModelHostComponent {
  files: FileDropzoneFile[] = [];
}

@Component({
  standalone: true,
  imports: [FileDropzoneComponent, FileDropzoneFileDirective],
  template: `
    <tedi-file-dropzone multiple>
      <ng-template tediFileDropzoneFile let-file let-remove="remove">
        <span class="plain-row" (click)="remove()">{{ file.name }}</span>
      </ng-template>
    </tedi-file-dropzone>
  `,
})
class FocuslessTemplateHostComponent {}

describe("FileDropzoneComponent with a template that has no focusable row", () => {
  it("falls back to the drop zone when the previous row cannot take focus", async () => {
    TestBed.configureTestingModule({
      imports: [FocuslessTemplateHostComponent],
      providers: baseProviders,
    });
    const fixture = TestBed.createComponent(FocuslessTemplateHostComponent);
    fixture.detectChanges();
    selectFiles(fixture, [makeFile("a.pdf"), makeFile("b.pdf")]);
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css(".plain-row"));
    expect(rows.length).toBe(2);

    (rows[1].nativeElement as HTMLElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(document.activeElement).toBe(
      fixture.debugElement.query(By.css(".tedi-file-dropzone__input"))
        .nativeElement,
    );
  });
});

describe("FileDropzoneComponent with template-driven forms", () => {
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

  it("renders a model value set by the host", async () => {
    fixture.componentInstance.files = [{ id: "1", name: "preloaded.pdf" }];
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.debugElement.query(By.css(".tedi-attachment__title"))
        .nativeElement.textContent,
    ).toContain("preloaded.pdf");
  });
});
