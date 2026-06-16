import {
  Meta,
  StoryObj,
  moduleMetadata,
  argsToTemplate,
} from "@storybook/angular";
import { ComponentInputs } from "../../../types/inputs.type";
import { AttachmentComponent } from "./attachment.component";
import { AttachmentActionsComponent } from "./attachment-actions.component";
import { ProgressBarComponent } from "../../loader/progress-bar/progress-bar.component";
import { FeedbackTextComponent } from "../../form/feedback-text/feedback-text.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { IconComponent } from "../../base/icon/icon.component";
import { TooltipComponent } from "../../overlay/tooltip/tooltip.component";
import { TooltipTriggerComponent } from "../../overlay/tooltip/tooltip-trigger/tooltip-trigger.component";
import { TooltipContentComponent } from "../../overlay/tooltip/tooltip-content/tooltip-content.component";

type StoryArgs = ComponentInputs<AttachmentComponent>;

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.59.78?node-id=30427-154342&m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/9133f7-attachment" target="_blank">Zeroheight ↗</a>
 *
 * Project a `<tedi-progress-bar>` inside the attachment to show upload progress.
 * Configure label, hint, and value formatting on the projected progress bar.
 *
 * Action buttons (download, delete, …) are **not** built in. Project your own
 * neutral icon-only buttons into the actions slot with `tedi-attachment-actions`.
 * Always give each button an `aria-label`. Wrap a button in a `tedi-tooltip`
 * (put `tedi-attachment-actions` on the `tedi-tooltip`) to surface a tooltip.
 */
export default {
  title: "TEDI-Ready/Components/Helpers/Attachment",
  component: AttachmentComponent,
  decorators: [
    moduleMetadata({
      imports: [
        AttachmentComponent,
        AttachmentActionsComponent,
        ProgressBarComponent,
        FeedbackTextComponent,
        ButtonComponent,
        IconComponent,
        TooltipComponent,
        TooltipTriggerComponent,
        TooltipContentComponent,
      ],
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
    icon: {
      description:
        "Leading file-type icon shown before the file name (Material Symbol name).",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    error: {
      description:
        "Error feedback message. Switches the visual to the error state (red card, error icon next to the name, feedback text below).",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    invalid: {
      description:
        "Apply the error visual without rendering feedback text below the card.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
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

const action = (icon: string, label: string, size?: "small") => `
  <tedi-tooltip>
    <tedi-tooltip-trigger>
      <button tedi-button variant="neutral"${size ? ` size="${size}"` : ""} aria-label="${label}">
        <tedi-icon name="${icon}" [size]="18" />
      </button>
    </tedi-tooltip-trigger>
    <tedi-tooltip-content>${label}</tedi-tooltip-content>
  </tedi-tooltip>
`;

const deleteAction = `<tedi-attachment-actions>${action("delete", "Kustuta")}</tedi-attachment-actions>`;
const downloadAction = `<tedi-attachment-actions>${action("download", "Laadi alla")}</tedi-attachment-actions>`;

const renderWithDelete = (args: StoryArgs) => ({
  props: args,
  template: `<tedi-attachment ${argsToTemplate(args)}>${deleteAction}</tedi-attachment>`,
});

export const Default: Story = {
  render: renderWithDelete,
};

/**
 * Read-only attachments expose only a download action — no delete button.
 */
export const ReadOnly: Story = {
  render: () => ({
    template: `
      <div class="flex flex-column gap-2">
        <tedi-attachment name="Kodukülastusakt_Triin.pdf">${downloadAction}</tedi-attachment>
        <tedi-attachment name="Lisa_5.pdf">${downloadAction}</tedi-attachment>
        <tedi-attachment name="Graafik_2025.pdf">${downloadAction}</tedi-attachment>
      </div>
    `,
  }),
};

/**
 * Project a `<tedi-progress-bar>` to show upload progress. Use a projected
 * `<tedi-feedback-text type="hint">` for the status label; the percentage is
 * rendered automatically.
 */
export const WithProgress: Story = {
  render: () => ({
    template: `
      <div class="flex flex-column gap-2">
        <tedi-attachment name="Kodukülastusakt_Triin.pdf">
          <tedi-progress-bar [value]="34" valuePosition="bottom">
            <tedi-feedback-text text="Üleslaadimine" type="hint" />
          </tedi-progress-bar>
          ${deleteAction}
        </tedi-attachment>
        <tedi-attachment name="Kodukülastusakt_Triin.pdf" fileSize="0,9 MB">
          <tedi-progress-bar [value]="34" valuePosition="bottom" />
          ${deleteAction}
        </tedi-attachment>
        <tedi-attachment name="Kodukülastusakt_Triin.pdf" fileSize="0,9 MB">
          <tedi-progress-bar [value]="34" valuePosition="bottom">
            <tedi-feedback-text text="Üleslaadimine" type="hint" />
          </tedi-progress-bar>
          ${downloadAction}
        </tedi-attachment>
      </div>
    `,
  }),
};

export const WithFileSize: Story = {
  render: renderWithDelete,
  args: {
    fileSize: "0,9 MB",
  },
};

/**
 * Pass a Material Symbol name to `icon` to show a leading file-type icon
 * before the file name.
 */
export const WithIcon: Story = {
  render: () => ({
    template: `
      <div class="flex flex-column gap-2">
        <tedi-attachment name="Kodukülastusakt_Triin.pdf" fileSize="0,9 MB" icon="description">${deleteAction}</tedi-attachment>
        <tedi-attachment name="Kodukülastusakt_Triin.pdf" fileSize="0,9 MB" icon="imagesmode">${deleteAction}</tedi-attachment>
        <tedi-attachment name="Kodukülastusakt_Triin.pdf" fileSize="0,9 MB" icon="imagesmode">${deleteAction}</tedi-attachment>
        <tedi-attachment name="Kodukülastusakt_Triin.pdf" fileSize="0,9 MB" icon="picture_as_pdf">${deleteAction}</tedi-attachment>
      </div>
    `,
  }),
};

/**
 * Leave the actions slot empty to render an attachment with no action buttons.
 */
export const WithoutDeleteButton: Story = {
  render: () => ({
    template: `
      <div class="flex flex-column gap-2">
        <tedi-attachment name="Kodukülastusakt_Triin.pdf" fileSize="0,9 MB" />
        <tedi-attachment name="Kodukülastusakt_Triin.pdf" fileSize="0,9 MB" />
      </div>
    `,
  }),
};

/**
 * Project any combination of neutral icon buttons into the actions slot —
 * view, download, delete, or a mix. The last row uses `size="small"` buttons
 * alongside a progress bar.
 */
export const WithDifferentActions: Story = {
  render: () => ({
    template: `
      <div class="flex flex-column gap-2">
        <tedi-attachment name="Kodukülastusakt_Triin.pdf">
          <tedi-attachment-actions>
            ${action("visibility", "Vaata")}
            ${action("download", "Laadi alla")}
            ${action("delete", "Kustuta")}
          </tedi-attachment-actions>
        </tedi-attachment>
        <tedi-attachment name="Kodukülastusakt_Triin.pdf">
          <tedi-attachment-actions>
            ${action("download", "Laadi alla")}
            ${action("delete", "Kustuta")}
          </tedi-attachment-actions>
        </tedi-attachment>
        <tedi-attachment name="Kodukülastusakt_Triin.pdf">${downloadAction}</tedi-attachment>
        <tedi-attachment name="Kodukülastusakt_Triin.pdf" fileSize="0,9 MB" />
        <tedi-attachment name="Kodukülastusakt_Triin.pdf" fileSize="0,9 MB">
          <tedi-progress-bar [value]="34" valuePosition="bottom">
            <tedi-feedback-text text="Üleslaadimine" type="hint" />
          </tedi-progress-bar>
          <tedi-attachment-actions>
            ${action("download", "Laadi alla", "small")}
            ${action("delete", "Kustuta", "small")}
          </tedi-attachment-actions>
        </tedi-attachment>
      </div>
    `,
  }),
};

export const Mobile: Story = {
  render: () => ({
    template: `
      <div class="flex flex-column gap-3" style="max-width: 350px;">
        <tedi-attachment
          [mobile]="true"
          name="Kodukülastusakt_Triin_natuke_pikema_pealkirjaga.pdf"
          fileSize="0,9 MB"
        >
          <tedi-progress-bar [value]="34" valuePosition="bottom">
            <tedi-feedback-text text="Üleslaadimine" type="hint" />
          </tedi-progress-bar>
          ${deleteAction}
        </tedi-attachment>
        <tedi-attachment
          [mobile]="true"
          name="Kodukülastusakt_Triin_natuke_pikema_pealkirjaga.pdf"
          fileSize="0,9 MB"
        >${deleteAction}</tedi-attachment>
        <tedi-attachment [mobile]="true" name="Kodukülastusakt.pdf" fileSize="0,9 MB">${deleteAction}</tedi-attachment>
        <tedi-attachment [mobile]="true" name="Kodukülastusakt.pdf" fileSize="0,9 MB">${downloadAction}</tedi-attachment>
        <tedi-attachment [mobile]="true" name="Kodukülastusakt.pdf" fileSize="0,9 MB">
          <tedi-attachment-actions>
            ${action("download", "Laadi alla")}
            ${action("delete", "Kustuta")}
          </tedi-attachment-actions>
        </tedi-attachment>
        <tedi-attachment [mobile]="true" name="Kodukülastusakt.pdf" fileSize="0,9 MB">
          <tedi-attachment-actions>
            ${action("download", "Laadi alla")}
            ${action("more_vert", "Rohkem")}
          </tedi-attachment-actions>
        </tedi-attachment>
      </div>
    `,
  }),
};

export const Error: Story = {
  render: () => ({
    template: `
      <div class="flex flex-column gap-3">
        <tedi-attachment name="Kodukülastusakt_Triin.pdf">${deleteAction}</tedi-attachment>
        <tedi-attachment
          name="Kodukülastusakt_Triin.pdf"
          error="Feedback text"
        >${deleteAction}</tedi-attachment>
      </div>
    `,
  }),
};

/**
 * Labeled neutral buttons (icon + text). With visible labels the buttons no
 * longer need tooltips.
 *
 * Add `padded` to the `<tedi-attachment-actions>` container so it adds a gap
 * between the buttons and inline padding — neutral text buttons have no
 * horizontal padding of their own and would otherwise touch the card edge.
 * (Icon-only buttons omit it and sit flush.)
 */
export const LabeledActions: Story = {
  render: () => ({
    template: `
      <tedi-attachment name="Kodukülastusakt_Triin.pdf">
        <tedi-attachment-actions padded>
          <button tedi-button variant="neutral">
            <tedi-icon name="download" [size]="18" />
            Laadi alla
          </button>
          <button tedi-button variant="neutral">
            <tedi-icon name="delete" [size]="18" />
            Kustuta
          </button>
        </tedi-attachment-actions>
      </tedi-attachment>
    `,
  }),
};
