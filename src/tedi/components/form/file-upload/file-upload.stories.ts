import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  input,
  signal,
} from "@angular/core";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { FileUploadComponent } from "./file-upload.component";
import { FileUploadFile } from "./file-upload.types";
import { FormFieldComponent } from "../form-field/form-field.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { LabelComponent } from "../../content/label/label.component";
import { AlertComponent } from "../../notifications/alert/alert.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { TextComponent } from "../../base/text/text.component";

const STATES = [
  { label: "Default" },
  { label: "Error", feedback: "error" as const },
  { label: "Success", feedback: "valid" as const },
  { label: "Disabled", disabled: true },
];

/**
 * Selects a file by this name on load, so a story shows the rejection the field
 * writes for itself. A hardcoded `tedi-feedback-text` would be a second, stale
 * error line the moment the user selects anything.
 */
@Directive({ selector: "[storyRejectedFile]", standalone: true })
class StoryRejectedFileDirective implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly storyRejectedFile = input.required<string>();

  ngAfterViewInit(): void {
    const fileInput =
      this.host.nativeElement.querySelector<HTMLInputElement>(
        "input[type=file]",
      );
    if (!fileInput) return;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File([""], this.storyRejectedFile()));
    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event("change"));
  }
}

const TAGS: FileUploadFile[] = [
  { id: "1", name: "taotlus_scan_lk_1.pdf" },
  { id: "2", name: "koolitused_erialane.zip" },
  { id: "3", name: "diplom_2024.pdf" },
  { id: "4", name: "diplom_ulikool_2020.pdf" },
];

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.77.99?node-id=4612-87581&m=dev" target="_blank">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/012bbe-file-upload" target="_blank">Zeroheight ↗</a>
 */
export default {
  title: "TEDI-Ready/Components/Form/FileUpload",
  component: FileUploadComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        FormFieldComponent,
        FeedbackTextComponent,
        LabelComponent,
        AlertComponent,
        RowComponent,
        ColComponent,
        TextComponent,
        ButtonComponent,
        StoryRejectedFileDirective,
      ],
    }),
  ],
  argTypes: {
    files: {
      description:
        "Files held by the field, and the value written by `formControl` / `ngModel`. Bind one-way to seed the list and leave the field owning it, two-way to stay in sync. Bind a stable reference — an inline literal is a new array on every check and discards what the user added.",
      control: false,
      table: {
        category: "inputs",
        type: { summary: "FileUploadFile[]" },
        defaultValue: { summary: "[]" },
      },
    },
    inputId: {
      description:
        "Id of the hidden file input, generated when not set; point the field's `<label tedi-label [for]>` at it so the label opens the picker and names the add button.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    name: {
      description:
        "`name` attribute of the file input. The files do not travel with a native form submit — read them from `files` or the bound control.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    accept: {
      description:
        "Allowed file types as a comma-separated list of extensions and MIME types. Applies to what is picked next — files already listed keep the verdict they were given.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    maxSize: {
      description:
        "Largest accepted file size, in bytes. The restrictions hint renders it in whichever unit reads best. Applies to what is picked next.",
      control: "number",
      table: { category: "inputs", type: { summary: "number" } },
    },
    multiple: {
      description:
        "Whether more than one file can be held. A single-file field replaces its file on the next selection.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    keepRejectedFiles: {
      description:
        "Keeps rejected files in the list, marked invalid, instead of discarding them. The rejection is summarised under the field either way.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    validator: {
      description:
        "A rule of your own for each selected file, run after `accept` and `maxSize` pass. Return the reason a file is rejected, or nothing to accept it.",
      control: false,
      table: {
        category: "inputs",
        type: {
          summary: "FileUploadValidator",
          detail: "(file: File) => string | null | undefined",
        },
      },
    },
    showRestrictions: {
      description:
        "Whether the allowed types and maximum size are summarised in a hint below the field. Rejection errors render either way.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    clearable: {
      description:
        "Whether a clear button removes every file at once. Overrides the wrapping `tedi-form-field`'s `clearable` for this field. Leave unset to inherit it — set `clearable` on the form field instead. Use it for a standalone file upload, where it defaults to `true`.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean | undefined" },
        defaultValue: { summary: "undefined" },
      },
    },
    readOnly: {
      description:
        "Renders only the file list: no border, no add or clear button, no remove button on the tags.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    disabled: {
      description:
        "Disables the field from a parent template. Combined with the reactive-forms disabled state.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    invalid: {
      description:
        "Forces the error state on. Combines with the state derived from reactive forms, the wrapping form field and rejected files.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    size: {
      description:
        "Overrides the wrapping `tedi-form-field`'s `size` for this field. Leave unset to inherit it — set `size` on the form field instead, so the label scales too. Use it for a standalone file upload, where it defaults to `default`.",
      control: { type: "radio" },
      options: [undefined, "default", "small"],
      table: {
        category: "inputs",
        type: {
          summary: "FileUploadSize | undefined",
          detail: "default \nsmall",
        },
        defaultValue: { summary: "undefined" },
      },
    },
    fileRemove: {
      description:
        "Emits each file the user removed, one event per file when clearing. `filesChange` carries the new list.",
      table: { category: "outputs", type: { summary: "FileUploadFile" } },
    },
    filesChange: {
      description: "Emits the new list whenever files are added or removed.",
      table: { category: "outputs", type: { summary: "FileUploadFile[]" } },
    },
  },
  args: {
    inputId: "file-upload",
    name: "file",
  },
  parameters: { controls: { disable: true } },
} as Meta<FileUploadComponent>;

type Story = StoryObj<FileUploadComponent>;

export const Default: Story = {
  parameters: { controls: { disable: false } },
  args: {
    multiple: false,
    keepRejectedFiles: false,
    showRestrictions: true,
    readOnly: false,
    disabled: false,
    invalid: false,
  },
  render: (args) => ({
    props: { ...args },
    template: `
      <tedi-form-field>
        <label tedi-label [for]="inputId">Label</label>
        <tedi-file-upload ${argsToTemplate(args)} />
      </tedi-form-field>
    `,
  }),
};

export const Size: Story = {
  render: () => ({
    template: `
      <tedi-row class="example-list" cols="1" gapY="3">
        <tedi-row cols="1" [sm]="{ cols: 2 }" gap="3" alignItems="center" class="padding-14-16 border-bottom">
          <p tedi-text modifiers="bold">Default</p>
          <tedi-form-field>
            <label tedi-label for="size-default">Label</label>
            <tedi-file-upload inputId="size-default" name="file" />
          </tedi-form-field>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 2 }" gap="3" alignItems="center" class="padding-14-16">
          <p tedi-text modifiers="bold">Small</p>
          <tedi-form-field size="small">
            <label tedi-label for="size-small">Label</label>
            <tedi-file-upload inputId="size-small" name="file" />
          </tedi-form-field>
        </tedi-row>
      </tedi-row>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    props: { STATES },
    template: `
      <tedi-row [cols]="1" [gapY]="3">
        @for (state of STATES; track state.label) {
          <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
            <tedi-col width="1">
              <p tedi-text modifiers="bold">{{ state.label }}</p>
            </tedi-col>
            <tedi-col width="5">
              <tedi-form-field>
                <label tedi-label [for]="state.label">Label</label>
                <tedi-file-upload [inputId]="state.label" name="file" [disabled]="!!state.disabled" />
                @if (state.feedback) {
                  <tedi-feedback-text text="Feedback text" [type]="state.feedback" />
                }
              </tedi-form-field>
            </tedi-col>
          </tedi-row>
        }
      </tedi-row>
    `,
  }),
};

export const SingleFile: Story = {
  render: () => ({
    props: { files: [{ id: "1", name: "taotlus_scan_lk_2.pdf" }] },
    template: `
      <tedi-form-field>
        <label tedi-label for="single">Label</label>
        <tedi-file-upload inputId="single" name="file" [files]="files" />
      </tedi-form-field>
    `,
  }),
};

export const Multiple: Story = {
  render: () => ({
    props: { files: TAGS },
    template: `
      <tedi-form-field>
        <label tedi-label for="multiple">Label</label>
        <tedi-file-upload inputId="multiple" name="file" multiple [files]="files" />
      </tedi-form-field>
    `,
  }),
};

/**
 * `accept` and `maxSize` are summarised in a hint of their own. Turn
 * `showRestrictions` off when a projected `tedi-feedback-text` already says it.
 */
export const WithHint: Story = {
  render: () => ({
    template: `
      <tedi-row cols="1" [gapY]="3">
        <tedi-col>
          <tedi-form-field>
            <label tedi-label for="hint-own">Label</label>
            <tedi-file-upload inputId="hint-own" name="file" accept=".jpg,.png,.pdf" [maxSize]="1024 ** 2" />
          </tedi-form-field>
        </tedi-col>
        <tedi-col>
          <tedi-form-field>
            <label tedi-label for="hint-projected">Label</label>
            <tedi-file-upload inputId="hint-projected" name="file" accept=".jpg,.png,.pdf" [maxSize]="1024 ** 2" [showRestrictions]="false" />
            <tedi-feedback-text text="JPG, PNG, PDF suurusega kuni 1 MB." />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const ReadOnly: Story = {
  render: () => ({
    props: { files: TAGS },
    template: `
      <tedi-form-field>
        <label tedi-label for="read-only">Label</label>
        <tedi-file-upload inputId="read-only" name="file" multiple readOnly [files]="files" />
      </tedi-form-field>
    `,
  }),
};

export const Loading: Story = {
  render: () => ({
    props: {
      files: [
        { id: "1", name: "report.pdf", isLoading: true },
        { id: "2", name: "report_1.pdf" },
      ],
    },
    template: `
      <tedi-form-field>
        <label tedi-label for="loading">Label</label>
        <tedi-file-upload inputId="loading" name="file" multiple [files]="files" />
      </tedi-form-field>
    `,
  }),
};

/**
 * The default: a file that fails `accept`, `maxSize` or `validator` is
 * discarded, and only the error under the field remains.
 */
export const DiscardingRejectedFiles: Story = {
  name: "Validation: discarding rejected files",
  render: () => ({
    props: { files: [{ id: "1", name: "taotlus_scan_lk_2.pdf" }] },
    template: `
      <tedi-form-field>
        <label tedi-label for="rejected-discarded">Label</label>
        <tedi-file-upload inputId="rejected-discarded" name="file" multiple accept=".pdf,.txt" [maxSize]="1024" [files]="files" storyRejectedFile="taotlus_scan_lk_1.png" />
      </tedi-form-field>
    `,
  }),
};

/**
 * With `keepRejectedFiles` a file that fails `accept`, `maxSize` or `validator`
 * stays in the list marked invalid, so the user can see which file failed and
 * remove it.
 */
export const KeepingRejectedFiles: Story = {
  name: "Validation: keeping rejected files",
  render: () => ({
    props: { files: [{ id: "1", name: "taotlus_scan_lk_2.pdf" }] },
    template: `
      <tedi-form-field>
        <label tedi-label for="rejected-kept">Label</label>
        <tedi-file-upload inputId="rejected-kept" name="file" multiple accept=".pdf,.txt" [maxSize]="1024" keepRejectedFiles [files]="files" storyRejectedFile="taotlus_scan_lk_1.png" />
      </tedi-form-field>
    `,
  }),
};

/**
 * The restrictions hint can't describe the rule, so add your own feedback text.
 * Pick a file with a space in its name to try it.
 */
export const WithValidator: Story = {
  render: () => ({
    props: {
      noSpaces: (file: File) =>
        file.name.includes(" ") ? "Failinimes ei tohi olla tühikuid" : null,
    },
    template: `
      <tedi-form-field>
        <label tedi-label for="validator">Label</label>
        <tedi-file-upload inputId="validator" name="file" multiple accept=".pdf,.txt" [validator]="noSpaces" />
        <tedi-feedback-text text="Failinimes ei tohi olla tühikuid." />
      </tedi-form-field>
    `,
  }),
};

/**
 * Bind `files` two-way when the parent changes the list itself — after a
 * successful upload, say. A one-way binding seeds the field once and never
 * reaches it again.
 */
export const ControlledClearing: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => {
    const files = signal<FileUploadFile[]>([
      { id: "1", name: "report.pdf" },
      { id: "2", name: "report_1.pdf" },
      { id: "3", name: "report_2.pdf" },
    ]);

    return {
      props: {
        files,
        clear: () => files.set([]),
        names: () => files().map((file) => file.name),
      },
      template: `
        <tedi-row [cols]="1" [gapY]="3">
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="controlled">Label</label>
              <tedi-file-upload inputId="controlled" name="file" multiple [(files)]="files" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <button tedi-button type="button" (click)="clear()">Clear files</button>
          </tedi-col>
          <tedi-col>
            <tedi-alert type="info" [showClose]="false">
              <pre tedi-text modifiers="small">{{ { files: names() } | json }}</pre>
            </tedi-alert>
          </tedi-col>
        </tedi-row>
      `,
    };
  },
};

/**
 * The field validates itself: with `keepRejectedFiles`, rejected files stay in
 * the value with `isValid: false` and the control fails with a `rejectedFiles`
 * error while one is listed. Still filter on `isValid` before uploading.
 *
 * Resetting the control clears the field, the rejection summary and the error
 * border, so the form can return the field to its starting state.
 */
export const WithReactiveForms: Story = {
  render: () => {
    const control = new FormControl<FileUploadFile[]>([], {
      nonNullable: true,
      validators: [Validators.required],
    });

    return {
      props: {
        control,
        reset: () => control.reset(),
        invalidCount: () =>
          control.value.filter((file) => file.isValid === false).length,
      },
      template: `
        <tedi-row [cols]="1" [gapY]="3">
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="reactive" [required]="true">Label</label>
              <tedi-file-upload inputId="reactive" name="file" multiple accept=".pdf,.txt" [maxSize]="1024 ** 2" keepRejectedFiles [formControl]="control" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <button tedi-button type="button" variant="secondary" (click)="reset()">Reset form</button>
          </tedi-col>
          <tedi-col>
            <tedi-alert type="info" [showClose]="false">
              <pre tedi-text modifiers="small">{{
                {
                  files: control.value.length,
                  invalidFiles: invalidCount(),
                  touched: control.touched,
                  dirty: control.dirty,
                  invalid: control.invalid
                } | json
              }}</pre>
            </tedi-alert>
          </tedi-col>
        </tedi-row>
      `,
    };
  },
};

/**
 * The field paints its own surface and renders its own clear button and
 * restrictions hint, so it works with no wrapper, and a sibling label still
 * names the add button. Wrap it in a `tedi-form-field` for feedback text that
 * sets the error or success border.
 */
export const Standalone: Story = {
  render: () => ({
    template: `
      <label tedi-label for="standalone">Label</label>
      <tedi-file-upload inputId="standalone" name="file" accept=".pdf" />
    `,
  }),
};
