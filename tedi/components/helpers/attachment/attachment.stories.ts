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
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.56.78?node-id=51174-101981&m=dev" target="_blank">Figma ↗</a><br>
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

const actions = `
  <tedi-attachment-actions>
    <tedi-tooltip>
      <tedi-tooltip-trigger>
        <button tedi-button variant="neutral" aria-label="Lae alla">
          <tedi-icon name="download" [size]="18" />
        </button>
      </tedi-tooltip-trigger>
      <tedi-tooltip-content>Lae alla</tedi-tooltip-content>
    </tedi-tooltip>
    <tedi-tooltip>
      <tedi-tooltip-trigger>
        <button tedi-button variant="neutral" aria-label="Kustuta">
          <tedi-icon name="delete" [size]="18" />
        </button>
      </tedi-tooltip-trigger>
      <tedi-tooltip-content>Kustuta</tedi-tooltip-content>
    </tedi-tooltip>
  </tedi-attachment-actions>
`;

const renderWithActions = (args: StoryArgs) => ({
  props: args,
  template: `<tedi-attachment ${argsToTemplate(args)}>${actions}</tedi-attachment>`,
});

export const Default: Story = {
  render: renderWithActions,
};

export const List: Story = {
  render: () => ({
    template: `
      <div class="flex flex-column gap-2">
        <tedi-attachment name="Kodukülastusakt_Triin.pdf">${actions}</tedi-attachment>
        <tedi-attachment name="Lisa_5.pdf">${actions}</tedi-attachment>
        <tedi-attachment name="Graafik_2025.pdf">${actions}</tedi-attachment>
      </div>
    `,
  }),
};

export const WithProgress: Story = {
  render: () => ({
    template: `
      <div class="flex flex-column gap-2">
        <tedi-attachment name="Kodukülastusakt_Triin.pdf">
          <tedi-progress-bar [value]="34" valuePosition="bottom">
            <tedi-feedback-text text="Üleslaadimine" type="hint" />
          </tedi-progress-bar>
          ${actions}
        </tedi-attachment>
        <tedi-attachment name="Kodukülastusakt_Triin.pdf">${actions}</tedi-attachment>
      </div>
    `,
  }),
};

export const WithFileSize: Story = {
  render: renderWithActions,
  args: {
    fileSize: "0,9 MB",
  },
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

/**
 * Project small action buttons by setting `size="small"` on each button. They
 * stay vertically centered in the card.
 */
export const SmallButtons: Story = {
  render: () => ({
    template: `
      <tedi-attachment name="Kodukülastusakt_Triin.pdf">
        <tedi-attachment-actions>
          <tedi-tooltip>
            <tedi-tooltip-trigger>
              <button tedi-button variant="neutral" size="small" aria-label="Vaata">
                <tedi-icon name="visibility" [size]="18" />
              </button>
            </tedi-tooltip-trigger>
            <tedi-tooltip-content>Vaata</tedi-tooltip-content>
          </tedi-tooltip>
          <tedi-tooltip>
            <tedi-tooltip-trigger>
              <button tedi-button variant="neutral" size="small" aria-label="Laadi alla">
                <tedi-icon name="download" [size]="18" />
              </button>
            </tedi-tooltip-trigger>
            <tedi-tooltip-content>Laadi alla</tedi-tooltip-content>
          </tedi-tooltip>
          <tedi-tooltip>
            <tedi-tooltip-trigger>
              <button tedi-button variant="neutral" size="small" aria-label="Kustuta">
                <tedi-icon name="delete" [size]="18" />
              </button>
            </tedi-tooltip-trigger>
            <tedi-tooltip-content>Kustuta</tedi-tooltip-content>
          </tedi-tooltip>
        </tedi-attachment-actions>
      </tedi-attachment>
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
          ${actions}
        </tedi-attachment>

        <tedi-attachment
          [mobile]="true"
          name="Kodukülastusakt_Triin_natuke_pikema_pealkirjaga.pdf"
          fileSize="0,9 MB"
        >${actions}</tedi-attachment>

        <tedi-attachment
          [mobile]="true"
          name="Kodukülastusakt.pdf"
          fileSize="0,9 MB"
        >${actions}</tedi-attachment>
      </div>
    `,
  }),
};

export const Error: Story = {
  render: () => ({
    template: `
      <div class="flex flex-column gap-3">
        <tedi-attachment name="Kodukülastusakt_Triin.pdf">${actions}</tedi-attachment>
        <tedi-attachment
          name="Kodukülastusakt_Triin.pdf"
          error="Feedback text"
        >${actions}</tedi-attachment>
      </div>
    `,
  }),
};
