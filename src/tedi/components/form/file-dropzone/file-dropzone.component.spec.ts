import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { ToastAnnouncerService } from "../../../services/toast/toast-announcer.service";
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
const announcer = { announce: jest.fn(), clear: jest.fn(), destroy: jest.fn() };

beforeEach(() => announcer.announce.mockClear());

/** Last message handed to the root-level announcer. */
/** Waits past the add-path delay, then reads the last announced message. */
const announced = async (): Promise<string> => {
  // Mirrors ADD_ANNOUNCE_DELAY in the component, which is deliberately private.
  await new Promise((resolve) => setTimeout(resolve, 300 + 150));

  return announcer.announce.mock.calls.at(-1)?.[0] ?? "";
};

/** Politeness of the last announcement. */
const announcedAs = (): string | undefined =>
  announcer.announce.mock.calls.at(-1)?.[1];

const zoneOf = (fixture: ComponentFixture<unknown>): HTMLElement =>
  fixture.debugElement.query(By.css('[role="button"].tedi-file-dropzone__zone'))
    .nativeElement as HTMLElement;

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
  { provide: ToastAnnouncerService, useValue: announcer },
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

  it("names the drop zone from the dropzone label", () => {
    const zone = zoneOf(fixture);
    const input = fileInput(fixture);

    expect(zone.textContent).toContain("file-dropzone.label");
    expect(zone.getAttribute("tabindex")).toBe("0");
    // The input stays out of the tab order so that closing the file dialog
    // cannot hand focus back to it — the button is the control.
    expect(input.getAttribute("tabindex")).toBe("-1");
    expect(input.getAttribute("aria-hidden")).toBe("true");
  });

  it("opens the file picker from the drop zone", () => {
    const input = fileInput(fixture);
    const click = jest.spyOn(input, "click");

    // The input is display:none, so the zone has to forward the activation.
    zoneOf(fixture).click();
    expect(click).toHaveBeenCalledTimes(1);

    // A role="button" div has no native keyboard activation.
    for (const key of ["Enter", " "]) {
      zoneOf(fixture).dispatchEvent(
        new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
      );
    }

    expect(click).toHaveBeenCalledTimes(3);
  });

  it("stays inert while disabled", () => {
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();

    const input = fileInput(fixture);
    const click = jest.spyOn(input, "click");
    const zone = zoneOf(fixture);

    expect(zone.getAttribute("tabindex")).toBe("-1");
    expect(zone.getAttribute("aria-disabled")).toBe("true");

    zone.click();
    zone.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );

    expect(click).not.toHaveBeenCalled();
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
    const [firstZone, secondZone] = pair.debugElement
      .queryAll(By.css('[role="button"].tedi-file-dropzone__zone'))
      .map((el) => el.nativeElement as HTMLElement);

    expect(first.id).not.toBe(second.id);
    // The feedback ids are derived from it, so a collision would cross-wire
    // one dropzone's aria-describedby to the other's hint.
    expect(firstZone.getAttribute("aria-describedby")).not.toBe(
      secondZone.getAttribute("aria-describedby"),
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
    it("adds a picked file and announces it", async () => {
      selectFiles(fixture, [makeFile("report.pdf")]);

      expect(component.files().map((file) => file.name)).toEqual([
        "report.pdf",
      ]);
      expect(await announced()).toBe("file-upload.added:1");
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

    it("announces a skip alongside what was added", async () => {
      fixture.componentRef.setInput("multiple", true);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("report.pdf")]);
      selectFiles(fixture, [makeFile("report.pdf"), makeFile("other.pdf")]);

      // Announced together: separate calls would overwrite each other and only
      // the last would ever be read.
      expect(await announced()).toBe(
        "file-upload.duplicates-skipped:'report.pdf'. file-upload.added:1",
      );
    });

    it("announces a rejection, a skip and an addition from one selection", async () => {
      fixture.componentRef.setInput("multiple", true);
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("report.pdf")]);
      selectFiles(fixture, [
        makeFile("report.pdf"),
        makeFile("notes.txt", 100, "text/plain"),
        makeFile("other.pdf"),
      ]);

      expect(await announced()).toBe(
        "file-upload.extension-rejected:'notes.txt'. " +
          "file-upload.duplicates-skipped:'report.pdf'. file-upload.added:1",
      );
    });

    it("announces additions assertively so the file dialog cannot bury them", async () => {
      selectFiles(fixture, [makeFile("report.pdf")]);

      expect(await announced()).toBe("file-upload.added:1");
      expect(announcedAs()).toBe("assertive");
    });

    it("skips a file that is already listed", async () => {
      fixture.componentRef.setInput("multiple", true);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("report.pdf")]);
      selectFiles(fixture, [makeFile("report.pdf")]);

      expect(component.files().map((file) => file.name)).toEqual([
        "report.pdf",
      ]);
      expect(await announced()).toBe(
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

    it("drops the aggregate error when files carry their own", async () => {
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
      expect(await announced()).toBe(
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

    it("reports every restriction a file breaks, not just the first", () => {
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.componentRef.setInput("maxSize", 50);
      fixture.componentRef.setInput("keepRejectedFiles", true);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("notes.txt", 5000, "text/plain")]);

      expect(component.files()[0].error).toBe(
        "file-dropzone.file-rejected-extension. file-dropzone.file-rejected-size",
      );
    });

    it("names a file breaking both restrictions once in the summary", () => {
      fixture.componentRef.setInput("accept", ".pdf");
      fixture.componentRef.setInput("maxSize", 50);
      fixture.componentRef.setInput("keepRejectedFiles", false);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile("notes.txt", 5000, "text/plain")]);

      const summary = text("tedi-feedback-text");

      expect(summary).toContain("'notes.txt'");
      expect(summary.match(/'notes.txt'/g)?.length).toBe(1);
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

      const id = fileInput(fixture).id;

      expect(zoneOf(fixture).getAttribute("aria-describedby")).toBe(
        `${id}-feedback ${id}-hint`,
      );
    });

    it("merges a consumer's own aria-describedby with its own ids", () => {
      const host = TestBed.createComponent(DescribedByHostComponent);
      host.detectChanges();

      const id = fileInput(host).id;

      expect(zoneOf(host).getAttribute("aria-describedby")).toBe(
        `described-by-dropzone external-help ${id}-hint`,
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

    it("removes a file through its remove button", async () => {
      const remove = fixture.debugElement.query(
        By.css(".tedi-attachment__actions button"),
      ).nativeElement as HTMLButtonElement;

      expect(remove.getAttribute("aria-label")).toBe("remove report.pdf");

      remove.click();
      fixture.detectChanges();

      expect(component.files()).toEqual([]);
      expect(await announced()).toBe("file-upload.removed:report.pdf");
      // Polite: no file dialog is involved, so nothing buries it.
      expect(announcedAs()).toBe("polite");
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
        fixture.debugElement.query(By.css(".tedi-file-dropzone__zone"))
          .nativeElement,
      );
    });
  });

  describe("edge cases", () => {
    const zoneEl = () =>
      fixture.debugElement.query(By.css(".tedi-file-dropzone__zone"))
        .nativeElement as HTMLElement;

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

    it("announces a removal for a file that has no name", async () => {
      fixture.componentRef.setInput("files", [{ id: "1" }]);
      fixture.detectChanges();

      (
        fixture.debugElement.query(By.css(".tedi-attachment__actions button"))
          .nativeElement as HTMLButtonElement
      ).click();
      fixture.detectChanges();

      expect(await announced()).toBe("file-upload.removed:");
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
    expect(host.control.touched).toBe(false);
    zoneOf(fixture).dispatchEvent(new Event("blur"));
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
      fixture.debugElement.query(By.css(".tedi-file-dropzone__zone"))
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
