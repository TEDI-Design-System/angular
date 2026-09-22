import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  input,
} from "@angular/core";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";
import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { FileDropzoneComponent } from "./file-dropzone.component";
import { FileDropzoneFileDirective } from "./file-dropzone-file.directive";
import { FileDropzoneFile } from "./file-dropzone.types";
import { AlertComponent } from "../../notifications/alert/alert.component";
import { AttachmentComponent } from "../../helpers/attachment/attachment.component";
import { AttachmentActionsComponent } from "../../helpers/attachment/attachment-actions.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { IconComponent } from "../../base/icon/icon.component";
import { ProgressBarComponent } from "../../loader/progress-bar/progress-bar.component";
import { TextComponent } from "../../base/text/text.component";

const STATES = [
  { id: "Default", label: "Default" },
  { id: "Hover", label: "Hover" },
  { id: "Active", label: "Active" },
  {
    id: "Error",
    label: "Error",
    feedbackText: {
      text: "Fail on liiga suur. Valige mõni teine fail või vähendage suurust.",
      type: "error" as const,
    },
  },
  { id: "DropOver", label: "Drop over", dropOver: true },
  { id: "Disabled", label: "Disabled", disabled: true },
  { id: "Focus", label: "Focus" },
];

/**
 * `drop-over` is live drag state, not an input — the showcase row has to raise a
 * real `dragenter` carrying files for the dropzone to react to it.
 */
@Directive({ selector: "[storyDropOver]", standalone: true })
class StoryDropOverDirective implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly storyDropOver = input(false);

  ngAfterViewInit(): void {
    if (!this.storyDropOver()) return;

    const zone = this.host.nativeElement.querySelector(
      ".tedi-file-dropzone__zone",
    );
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File([""], "example.pdf"));
    zone?.dispatchEvent(
      new DragEvent("dragenter", {
        dataTransfer,
        bubbles: true,
        cancelable: true,
      }),
    );
  }
}

/**
 * Lets a story show the summary the dropzone writes for itself, by actually
 * dropping a file it will reject. A hardcoded `feedbackText` would be a second,
 * stale error line the moment the user selects anything.
 */
@Directive({ selector: "[storyRejectedDrop]", standalone: true })
class StoryRejectedDropDirective implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly storyRejectedDrop = input<string>();

  ngAfterViewInit(): void {
    const name = this.storyRejectedDrop();
    if (!name) return;

    const zone = this.host.nativeElement.querySelector(
      ".tedi-file-dropzone__zone",
    );
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File([""], name));
    ["dragenter", "dragover", "drop"].forEach((type) =>
      zone?.dispatchEvent(
        new DragEvent(type, { dataTransfer, bubbles: true, cancelable: true }),
      ),
    );
  }
}

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.75.90?node-id=11335-185781&m=dev" target="_blank">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/70876f-file-dropzone" target="_blank">Zeroheight ↗</a>
 */
export default {
  title: "TEDI-Ready/Components/Form/FileDropzone",
  component: FileDropzoneComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        FileDropzoneFileDirective,
        AlertComponent,
        AttachmentComponent,
        AttachmentActionsComponent,
        ButtonComponent,
        ProgressBarComponent,
        IconComponent,
        RowComponent,
        ColComponent,
        TextComponent,
        StoryDropOverDirective,
        StoryRejectedDropDirective,
      ],
    }),
  ],
  argTypes: {
    files: {
      description:
        "Files held by the dropzone, and the value written by `formControl` / `ngModel`. Bind one-way to seed the list and leave the dropzone owning it, two-way to stay in sync. Bind a stable reference — an inline literal is a new array on every check and discards what the user added.",
      control: false,
      table: {
        category: "inputs",
        type: { summary: "FileDropzoneFile[]" },
        defaultValue: { summary: "[]" },
      },
    },
    inputId: {
      description: "Id of the file input. Generated when not set.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    name: {
      description:
        "`name` attribute of the file input, for native form submits.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    label: {
      description:
        "Text inside the dropzone, which also names the file input. Falls back to the translated `file-dropzone.label`.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    accept: {
      description:
        "Allowed file types as a comma-separated list of extensions and MIME types. Re-checked on drop, which bypasses the `accept` attribute.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    maxSize: {
      description:
        "Largest accepted file size, in bytes. The restrictions hint renders it in whichever unit reads best.",
      control: "number",
      table: { category: "inputs", type: { summary: "number" } },
    },
    multiple: {
      description:
        "Whether more than one file can be held. A single-file dropzone replaces its file on the next selection.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    keepRejectedFiles: {
      description:
        "Keeps rejected files in the list, each carrying its own reason. Turn it off to discard a rejected file instead and summarise every rejection in one message under the dropzone.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    showRestrictions: {
      description:
        "Whether the allowed types and maximum size are summarised in a hint below the dropzone. Rejection errors render either way.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    showFileSize: {
      description: "Whether each file's size is shown next to its name.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    feedbackText: {
      description:
        "Feedback text below the dropzone. An `error` type also paints the border red.",
      control: "object",
      table: {
        category: "inputs",
        type: { summary: "ComponentInputs<FeedbackTextComponent>" },
      },
    },
    disabled: {
      description: "Disables the dropzone.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    invalid: {
      description:
        "Forces the error state on, or off, regardless of the reactive-forms state.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    fileRemove: {
      description:
        "Emits the file the user removed — `filesChange` carries the new list, this says which entry left it.",
      table: { category: "outputs", type: { summary: "FileDropzoneFile" } },
    },
    filesChange: {
      description: "Emits the new list whenever files are added or removed.",
      table: { category: "outputs", type: { summary: "FileDropzoneFile[]" } },
    },
  },
  args: {
    name: "file-dropzone",
  },
  parameters: { controls: { disable: true } },
  render: (args) => ({
    props: { ...args },
    template: `
      <div style="max-width: 420px">
        <tedi-file-dropzone ${argsToTemplate(args)} />
      </div>
    `,
  }),
} as Meta<FileDropzoneComponent>;

type Story = StoryObj<FileDropzoneComponent>;

export const Default: Story = {
  parameters: { controls: { disable: false } },
};

/**
 * `accept` and `maxSize` are summarised in a hint below the dropzone. Set
 * `showRestrictions` to `false` when the same information is already shown
 * elsewhere, or pass your own `feedbackText`.
 */
export const WithHint: Story = {
  args: {
    accept: ".jpg,.png,.pdf",
    maxSize: 1024 ** 2,
  },
};

export const Multiple: Story = {
  args: {
    multiple: true,
    accept: ".jpg,.png,.pdf",
    maxSize: 1024 ** 2,
    files: [
      { id: "1", name: "report.pdf" },
      { id: "2", name: "report_1.pdf" },
      { id: "3", name: "report_2.pdf" },
    ],
  },
};

export const WithFileSize: Story = {
  args: {
    multiple: true,
    showFileSize: true,
    files: [
      { id: "1", name: "arve_2026_06.pdf", size: 1_200_000 },
      { id: "2", name: "aastaaruanne_2025.pdf", size: 5_400_000 },
    ],
  },
};

/**
 * The default. A rejected file stays in the list carrying its own reason, so the
 * user can see which file failed and remove it. The dropzone's border stays
 * neutral — the failure belongs to the file, not the field.
 */
export const KeepingRejectedFiles: Story = {
  name: "Validation: keeping rejected files",
  args: {
    multiple: true,
    accept: ".pdf,.txt",
    files: [
      { id: "1", name: "Kodukülastusakt_Triin.pdf" },
      { id: "2", name: "Kodukülastusakt_Triin_2.pdf" },
      { id: "3", name: "Kodukülastusakt_Triin_3.pdf" },
      {
        id: "4",
        name: "Kodukülastusakt_Triin.png",
        isValid: false,
        error: "Failiformaat ei ole lubatud",
      },
    ],
  },
};

/**
 * The opt-out. With `keepRejectedFiles` turned off the rejected file is
 * discarded, so only the files that passed remain and the failure is reported
 * once under the dropzone, which turns its border red.
 */
export const DiscardingRejectedFiles: Story = {
  name: "Validation: discarding rejected files",
  args: {
    accept: ".pdf,.txt",
    maxSize: 1024 ** 2,
    multiple: true,
    keepRejectedFiles: false,
    files: [
      { id: "1", name: "Kodukülastusakt_Triin.pdf" },
      { id: "2", name: "Kodukülastusakt_Triin_2.pdf" },
    ],
  },
  render: (args) => ({
    props: { ...args },
    template: `
      <div style="max-width: 420px">
        <tedi-file-dropzone ${argsToTemplate(args)} storyRejectedDrop="Kodukülastusakt_Triin.png" />
      </div>
    `,
  }),
};

/**
 * An `*tediFileDropzoneFile` template replaces the built-in attachment row. It
 * receives each file and a `remove` callback, so anything the `tedi-attachment`
 * supports — a leading icon, a progress bar, per-file feedback, extra
 * actions — can be composed per file.
 */
export const WithCustomFileTemplate: Story = {
  render: () => {
    const files: FileDropzoneFile[] = [
      { id: "1", name: "arve_2026_06.pdf", size: 1_200_000 },
      { id: "2", name: "aastaaruanne_2025.pdf", size: 24_500, isValid: false },
      { id: "3", name: "esitlus.mp4", size: 140_000_000, isLoading: true },
    ];

    return {
      props: { files, progress: 64 },
      template: `
      <div style="max-width: 420px">
        <tedi-file-dropzone multiple [files]="files" accept=".pdf,.mp4">
          <ng-template tediFileDropzoneFile let-file let-remove="remove" let-removeLabel="removeLabel">
            <tedi-attachment
              [name]="file.name"
              icon="description"
              [error]="file.isValid === false ? 'Fail on liiga suur. Lubatud on failid suurusega kuni 1 MB' : undefined"
            >
              @if (file.isLoading) {
                <tedi-progress-bar [value]="progress" />
              }
              <tedi-attachment-actions>
                <button tedi-button variant="neutral" [attr.aria-label]="removeLabel" (click)="remove()">
                  <tedi-icon name="delete" [size]="18" color="inherit" />
                </button>
              </tedi-attachment-actions>
            </tedi-attachment>
          </ng-template>
        </tedi-file-dropzone>
      </div>
      `,
    };
  },
};

export const States: Story = {
  parameters: {
    // The states live on the dropzone's inner label, not on the component host,
    // and the addon only rewrites `:hover` to a class on the styled element
    // itself — so these selectors have to reach that label.
    pseudo: {
      hover: "#Hover .tedi-file-dropzone__zone",
      active: "#Active .tedi-file-dropzone__zone",
      focusVisible: "#Focus input",
    },
  },
  render: () => ({
    props: { STATES },
    template: `
      <tedi-row [cols]="1" [gapY]="4">
        @for (state of STATES; track state.id) {
          <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
            <tedi-col width="1">
              <p tedi-text modifiers="bold">{{ state.label }}</p>
            </tedi-col>
            <tedi-col width="5">
              <tedi-file-dropzone
                [id]="state.id"
                [inputId]="state.id + '-input'"
                [maxSize]="30 * 1024 ** 2"
                [disabled]="!!state.disabled"
                [feedbackText]="state.feedbackText"
                [storyDropOver]="!!state.dropOver"
              />
            </tedi-col>
          </tedi-row>
        }
      </tedi-row>
    `,
  }),
};

/**
 * Rejected files stay in the value with `isValid: false`, so the control holds
 * what the user picked rather than a silently filtered subset. The dropzone
 * validates itself, so the control fails with a `rejectedFiles` error while one
 * is listed — no validator of your own needed. Still filter on `isValid` before
 * uploading.
 */
export const WithReactiveForms: Story = {
  render: () => {
    const control = new FormControl<FileDropzoneFile[]>([], {
      nonNullable: true,
      validators: [Validators.required],
    });

    return {
      props: {
        control,
        invalidCount: () =>
          control.value.filter((file) => file.isValid === false).length,
      },
      template: `
        <tedi-row [cols]="1" [gapY]="3">
          <tedi-col>
            <tedi-file-dropzone
              multiple
              accept=".pdf,.txt"
              [maxSize]="1024 ** 2"
              [formControl]="control"
            />
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
