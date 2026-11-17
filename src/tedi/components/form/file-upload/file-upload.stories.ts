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
        "Selected files, and the value of a bound form control. Bind a stable reference: an inline array literal resets the list on every check.",
      control: false,
      table: {
        category: "inputs",
        type: { summary: "FileUploadFile[]" },
        defaultValue: { summary: "[]" },
      },
    },
    inputId: {
      description:
        "Id of the file input, which the field label's `for` points to. Generated when not set.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    name: {
      description:
        "`name` attribute of the file input. The files are not sent with a native form submit.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    accept: {
      description:
        'Allowed file types as comma-separated extensions and MIME types, e.g. `".pdf,image/*"`. Changing it does not recheck files already listed.',
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    maxSize: {
      description:
        "Largest accepted file size, in bytes. Changing it does not recheck files already listed.",
      control: "number",
      table: { category: "inputs", type: { summary: "number" } },
    },
    multiple: {
      description:
        "Whether more than one file can be selected; a single-file field replaces its file on the next selection.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    keepRejectedFiles: {
      description:
        "Keeps rejected files in the list, marked invalid, instead of discarding them.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    validator: {
      description:
        "Custom rule for each selected file, including ones `accept` or `maxSize` rejected, returning the rejection reason, if any. Changing it does not recheck files already listed.",
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
      description: "Shows the allowed types and maximum size in the hint.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    error: {
      description:
        "Error text, shown after the field's own rejection message. Does not change a bound control's validity.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    success: {
      description: "Success text, shown while the field has no error.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    hint: {
      description:
        "Hint text, shown after the allowed types and maximum size. Use it instead of a projected `tedi-feedback-text`, which would add a second hint.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    clearable: {
      description:
        "Whether the clear button shows while files are listed. Falls back to the wrapping `tedi-form-field`'s `clearable`.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean | undefined" },
        defaultValue: { summary: "undefined" },
      },
    },
    readOnly: {
      description: "Shows only the file list, without buttons.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    disabled: {
      description:
        "Disables the field. Combines with the form control's disabled state.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    invalid: {
      description:
        "Marks the field as invalid. Combines with the state derived from the form control and rejected files.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    size: {
      description:
        "Field size. Falls back to the size of a wrapping `tedi-form-field`.",
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
        "Emits each file that leaves the list, whether removed, cleared or replaced, so its upload can be aborted.",
      action: "fileRemove",
      table: { category: "outputs", type: { summary: "FileUploadFile" } },
    },
    filesChange: {
      description: "Emits the new list whenever files are added or removed.",
      action: "filesChange",
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

export const Default: StoryObj = {
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
                <tedi-file-upload
                  [inputId]="state.label"
                  name="file"
                  [disabled]="!!state.disabled"
                  [error]="state.feedback === 'error' ? 'Feedback text' : undefined"
                  [success]="state.feedback === 'valid' ? 'Feedback text' : undefined"
                />
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
 * `accept` and `maxSize` are summarised in the field's hint, and `hint` adds
 * guidance of your own after them. Turn `showRestrictions` off when a projected
 * `tedi-feedback-text` already says it all.
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
            <label tedi-label for="hint-extra">Label</label>
            <tedi-file-upload inputId="hint-extra" name="file" accept=".jpg,.png,.pdf" [maxSize]="1024 ** 2" hint="Lisa allkirjastatud avalduse koopia." />
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
 * Describe the validator's rule in `hint`; the field shows it after the allowed
 * types and size. When the story opens, it selects a `.png` with a space in its
 * name, which breaks two rules.
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
        <tedi-file-upload
          inputId="validator"
          name="file"
          multiple
          accept=".pdf,.txt"
          [maxSize]="100 * 1024"
          [validator]="noSpaces"
          hint="Failinimes ei tohi olla tühikuid."
          storyRejectedFile="taotlus scan lk 1.png"
        />
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
 * The field paints its own surface and renders its own clear button, hint,
 * error and success text, so it works with no wrapper, and a sibling label
 * still names the add button. Wrap it in a `tedi-form-field` to lay out the
 * label and share `size` and `clearable` with it.
 */
export const Standalone: Story = {
  render: () => ({
    template: `
      <label tedi-label for="standalone">Label</label>
      <tedi-file-upload inputId="standalone" name="file" accept=".pdf" />
    `,
  }),
};
