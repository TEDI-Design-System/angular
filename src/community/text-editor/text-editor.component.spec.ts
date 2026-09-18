import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { QuillModules } from "ngx-quill";
import type Quill from "quill";
import {
  TEDI_TRANSLATION_DEFAULT_TOKEN,
  TediTranslationService,
} from "@tedi-design-system/angular/tedi";
import {
  TEXT_EDITOR_DEFAULT_MODULES,
  TextEditorComponent,
} from "./text-editor.component";

class TranslationMock {
  translate(key: string) {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

/**
 * Stands in for the toolbar Quill would have rendered, in the markup Quill's own
 * `addControls` produces: a `<button>` per plain format, a `value` attribute
 * where one format drives several buttons, and a `.ql-picker` span whose
 * `.ql-picker-label` child is the focusable part.
 */
function buildToolbar(): HTMLElement {
  const container = document.createElement("div");
  container.className = "ql-toolbar";
  container.innerHTML = `
    <span class="ql-formats">
      <button type="button" class="ql-bold" aria-label="bold"></button>
      <button type="button" class="ql-indent" value="+1" aria-label="indent: +1"></button>
      <button type="button" class="ql-formula" aria-label="formula"></button>
      <span class="ql-color ql-picker ql-color-picker">
        <span class="ql-picker-label" role="button"></span>
      </span>
    </span>
  `;

  return container;
}

@Component({
  standalone: true,
  imports: [TextEditorComponent, ReactiveFormsModule],
  template: `<tedi-text-editor
    [formControl]="control"
    [inputId]="inputId"
    [placeholder]="placeholder"
    [minRows]="minRows"
    [modules]="modules"
    [ariaLabel]="ariaLabel"
    [ariaLabelledby]="ariaLabelledby"
  />`,
})
class TestHostComponent {
  control = new FormControl<string>("", { nonNullable: true });
  inputId = "test-text-editor";
  placeholder = "";
  minRows = 10;
  modules: QuillModules = TEXT_EDITOR_DEFAULT_MODULES;
  ariaLabel: string | undefined = undefined;
  ariaLabelledby: string | undefined = undefined;
}

describe("TextEditorComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let component: TextEditorComponent;
  let hostEl: HTMLElement;
  let contentEl: HTMLElement;
  let toolbarEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(
      By.directive(TextEditorComponent),
    );
    component = debugEl.componentInstance;
    hostEl = debugEl.nativeElement;

    // Quill never boots under jsdom: ngx-quill lazily `import()`s it and jest
    // cannot resolve a dynamic import, so `.ql-editor` is never built. Hand the
    // component the element Quill would have given it and assert on that.
    contentEl = document.createElement("div");
    contentEl.className = "ql-editor";
    toolbarEl = buildToolbar();
    component.handleEditorCreated({
      root: contentEl,
      getModule: () => ({ container: toolbarEl }),
    } as unknown as Quill);
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should apply the host class", () => {
    expect(hostEl.classList).toContain("tedi-text-editor");
  });

  it("should default to the shared toolbar module config", () => {
    expect(component.modules()).toEqual(TEXT_EDITOR_DEFAULT_MODULES);
  });

  it("should null out Quill's tab bindings so the editor is not a keyboard trap", () => {
    expect(component.resolvedModules().keyboard).toEqual({
      bindings: { tab: null, indent: null, outdent: null },
    });
  });

  it("should offer list nesting from the toolbar, since Tab no longer indents", () => {
    const toolbar = (
      TEXT_EDITOR_DEFAULT_MODULES.toolbar as Record<string, unknown>[][]
    )[0];

    expect(toolbar).toEqual(
      expect.arrayContaining([{ indent: "-1" }, { indent: "+1" }]),
    );
  });

  it("should keep the resolved toolbar and let a caller's own tab binding win", () => {
    const tab = { key: "Tab", handler: () => true };
    host.modules = {
      toolbar: [["bold"]],
      keyboard: { bindings: { tab } },
    };
    fixture.detectChanges();

    expect(component.resolvedModules()).toEqual({
      toolbar: [["bold"]],
      keyboard: { bindings: { tab, indent: null, outdent: null } },
    });
  });

  it("should expose minRows to the stylesheet as a custom property", () => {
    expect(hostEl.style.getPropertyValue("--_tedi-text-editor-min-rows")).toBe(
      "10",
    );

    host.minRows = 4;
    fixture.detectChanges();

    expect(hostEl.style.getPropertyValue("--_tedi-text-editor-min-rows")).toBe(
      "4",
    );
  });

  describe("as a form control", () => {
    it("should write the control's value through to the editor", () => {
      host.control.setValue("<p>hello</p>");
      fixture.detectChanges();

      expect(component.value()).toBe("<p>hello</p>");
    });

    it("should push editor edits back to the bound control", () => {
      // Quill reaches the component through `innerControl`, which is what
      // `quill-editor`'s own ControlValueAccessor writes into.
      component["innerControl"].setValue("<p>typed</p>");
      fixture.detectChanges();

      expect(component.value()).toBe("<p>typed</p>");
      expect(host.control.value).toBe("<p>typed</p>");
      expect(host.control.dirty).toBe(true);
    });

    it("should mark the control touched on blur", () => {
      expect(host.control.touched).toBe(false);

      component.handleBlur();
      fixture.detectChanges();

      expect(host.control.touched).toBe(true);
      expect(component.focused()).toBe(false);
    });

    it("should follow the control's disabled state", () => {
      expect(component.disabled()).toBe(false);

      host.control.disable();
      fixture.detectChanges();

      expect(component.disabled()).toBe(true);
    });

    it("should clear the value on reset", () => {
      host.control.setValue("<p>hello</p>");
      fixture.detectChanges();

      component.reset();
      fixture.detectChanges();

      expect(host.control.value).toBe("");
    });

    it("should derive required from the control's validators", () => {
      expect(component.required()).toBe(false);

      host.control.setValidators(Validators.required);
      host.control.updateValueAndValidity();
      fixture.detectChanges();

      expect(component.required()).toBe(true);
    });

    it("should only become invalid once the control is touched", () => {
      host.control.setValidators(Validators.required);
      host.control.updateValueAndValidity();
      fixture.detectChanges();

      expect(component.invalid()).toBe(false);

      host.control.markAsTouched();
      fixture.detectChanges();

      expect(component.invalid()).toBe(true);
    });
  });

  describe("character count", () => {
    it("should count visible text, not the Quill markup", () => {
      host.control.setValue("<p><strong>hello</strong></p>");
      fixture.detectChanges();

      expect(component.characterCount()).toBe(5);
    });

    it("should count an entity as the character it renders as", () => {
      host.control.setValue("<p>a&nbsp;b</p>");
      fixture.detectChanges();

      expect(component.characterCount()).toBe(3);
    });

    it("should count the same without a DOMParser (server-side)", () => {
      const parser = globalThis.DOMParser;
      // @ts-expect-error there is no DOMParser on the server; this is that.
      delete globalThis.DOMParser;

      try {
        host.control.setValue("<p><strong>a&nbsp;b</strong> &amp; c</p>");
        fixture.detectChanges();

        expect(component.characterCount()).toBe(7);
      } finally {
        globalThis.DOMParser = parser;
      }
    });

    it("should report zero for an empty editor", () => {
      host.control.setValue("");
      fixture.detectChanges();
      expect(component.characterCount()).toBe(0);

      host.control.setValue("<p><br></p>");
      fixture.detectChanges();
      expect(component.characterCount()).toBe(0);
    });
  });

  describe("accessibility wiring on the editing area", () => {
    it("should put the id on the editing area, not the wrapper", () => {
      expect(contentEl.getAttribute("id")).toBe("test-text-editor");
      expect(hostEl.querySelector("quill-editor")?.hasAttribute("id")).toBe(
        false,
      );
    });

    it("should expose the editing area as a multiline textbox", () => {
      expect(contentEl.getAttribute("role")).toBe("textbox");
      expect(contentEl.getAttribute("aria-multiline")).toBe("true");
    });

    it("should name the editing area from ariaLabel", () => {
      host.ariaLabel = "Description";
      fixture.detectChanges();

      expect(contentEl.getAttribute("aria-label")).toBe("Description");
      expect(contentEl.hasAttribute("aria-labelledby")).toBe(false);
    });

    it("should prefer ariaLabelledby over ariaLabel", () => {
      host.ariaLabel = "Description";
      host.ariaLabelledby = "my-label";
      fixture.detectChanges();

      expect(contentEl.getAttribute("aria-labelledby")).toBe("my-label");
      expect(contentEl.hasAttribute("aria-label")).toBe(false);
    });

    it("should not describe the editor until a wrapper pushes real ids", () => {
      expect(contentEl.hasAttribute("aria-describedby")).toBe(false);

      component.setDescribedBy(["feedback-1", "counter-1"]);
      fixture.detectChanges();

      expect(contentEl.getAttribute("aria-describedby")).toBe(
        "feedback-1 counter-1",
      );
    });

    it("should mirror required and invalid onto the editing area", () => {
      expect(contentEl.hasAttribute("aria-required")).toBe(false);
      expect(contentEl.hasAttribute("aria-invalid")).toBe(false);

      host.control.setValidators(Validators.required);
      host.control.updateValueAndValidity();
      host.control.markAsTouched();
      fixture.detectChanges();

      expect(contentEl.getAttribute("aria-required")).toBe("true");
      expect(contentEl.getAttribute("aria-invalid")).toBe("true");
    });
  });

  describe("toolbar labels", () => {
    const labelOf = (selector: string) => {
      const control = toolbarEl.querySelector(selector);

      return {
        title: control?.getAttribute("title"),
        ariaLabel: control?.getAttribute("aria-label"),
      };
    };

    it("should label a plain format button", () => {
      expect(labelOf(".ql-bold")).toEqual({
        title: "text-editor.bold",
        ariaLabel: "text-editor.bold",
      });
    });

    it("should tell apart the buttons a single format drives", () => {
      expect(labelOf('.ql-indent[value="+1"]')).toEqual({
        title: "text-editor.indent.increase",
        ariaLabel: "text-editor.indent.increase",
      });
    });

    it("should label a picker on its focusable label, not its wrapper span", () => {
      expect(labelOf(".ql-color .ql-picker-label")).toEqual({
        title: "text-editor.color",
        ariaLabel: "text-editor.color",
      });
      expect(toolbarEl.querySelector(".ql-color")?.hasAttribute("title")).toBe(
        false,
      );
    });

    it("should leave a control with no translation on Quill's own name", () => {
      expect(labelOf(".ql-formula")).toEqual({
        title: null,
        ariaLabel: "formula",
      });
    });
  });
});
