import {
  Meta,
  StoryObj,
  moduleMetadata,
  argsToTemplate,
} from "@storybook/angular";
import { ComponentInputs } from "../../../types/inputs.type";
import { AttachmentComponent } from "./attachment.component";
import { ProgressBarComponent } from "../progress-bar/progress-bar.component";
import { FeedbackTextComponent } from "../../form/feedback-text/feedback-text.component";

type StoryArgs = ComponentInputs<AttachmentComponent>;

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.45.70?node-id=30427-154342&m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/9133f7-attachment" target="_blank">Zeroheight ↗</a>
 *
 * Project a `<tedi-progress-bar>` inside the attachment to show upload progress.
 * Configure label, hint, and value formatting on the projected progress bar.
 */
export default {
  title: "TEDI-Ready/Components/Helpers/Attachment",
  component: AttachmentComponent,
  decorators: [
    moduleMetadata({
      imports: [AttachmentComponent, ProgressBarComponent, FeedbackTextComponent],
    }),
  ],
  argTypes: {
    name: {
      description: "File name to display.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    fileSize: {
      description: "Pre-formatted file size string (e.g. `\"0.9 MB\"`).",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    error: {
      description:
        "Error feedback message. Switches the visual to the error state (red card, error icon next to the name, feedback text below).",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    removable: {
      description: "Show or hide the delete button.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    disabled: {
      description: "Disable (but still render) the delete button.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    removeLabel: {
      description:
        "Override the delete-button aria-label. Defaults to `remove + name`.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    mobile: {
      description:
        "Manually force the mobile variant. When `undefined`, derived from the viewport breakpoint.",
      control: { type: "radio" },
      options: [undefined, true, false],
      table: { category: "inputs", type: { summary: "boolean | undefined" } },
    },
    mobileBreakpoint: {
      description:
        "Viewport breakpoint below which the mobile variant is auto-applied.",
      control: { type: "radio" },
      options: ["xs", "sm", "md", "lg", "xl", "xxl"],
      table: {
        category: "inputs",
        type: { summary: "Breakpoint" },
        defaultValue: { summary: "sm" },
      },
    },
  },
  args: {
    name: "Kodukülastusakt_Triin.pdf",
  },
} as Meta<AttachmentComponent>;

type Story = StoryObj<AttachmentComponent>;

const renderPlain = (args: StoryArgs) => ({
  props: args,
  template: `<tedi-attachment ${argsToTemplate(args)} />`,
});

export const Default: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <tedi-attachment name="Kodukülastusakt_Triin.pdf" />
        <tedi-attachment name="Lisa_5.pdf" />
        <tedi-attachment name="Graafik_2025.pdf" />
      </div>
    `,
  }),
};

export const WithProgress: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <tedi-attachment name="Kodukülastusakt_Triin.pdf">
          <tedi-progress-bar [value]="34" valuePosition="bottom">
            <tedi-feedback-text text="Üleslaadimine" type="hint" />
          </tedi-progress-bar>
        </tedi-attachment>
        <tedi-attachment name="Kodukülastusakt_Triin.pdf" />
      </div>
    `,
  }),
};

export const WithFileSize: Story = {
  render: renderPlain,
  args: {
    fileSize: "0,9 MB",
  },
};

export const Mobile: Story = {
  render: () => ({
    template: `
      <div style="max-width: 350px; display: flex; flex-direction: column; gap: 16px;">
        <tedi-attachment
          [mobile]="true"
          name="Kodukülastusakt_Triin_natuke_pikema_pealkirjaga.pdf"
          fileSize="0,9 MB"
        >
          <tedi-progress-bar [value]="34" valuePosition="bottom">
            <tedi-feedback-text text="Üleslaadimine" type="hint" />
          </tedi-progress-bar>
        </tedi-attachment>

        <tedi-attachment
          [mobile]="true"
          name="Kodukülastusakt_Triin_natuke_pikema_pealkirjaga.pdf"
          fileSize="0,9 MB"
        />

        <tedi-attachment
          [mobile]="true"
          name="Kodukülastusakt.pdf"
          fileSize="0,9 MB"
        />
      </div>
    `,
  }),
};

export const Error: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <tedi-attachment name="Kodukülastusakt_Triin.pdf" />
        <tedi-attachment
          name="Kodukülastusakt_Triin.pdf"
          error="Feedback text"
        />
      </div>
    `,
  }),
};
