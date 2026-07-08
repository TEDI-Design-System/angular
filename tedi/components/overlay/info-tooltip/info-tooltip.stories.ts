import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { InfoTooltipComponent } from "./info-tooltip.component";
import { LabelComponent } from "../../form/label/label.component";
import { LabelRowComponent } from "../../form/label-row/label-row.component";

/**
 * `tedi-info-tooltip` pairs an info button with a tooltip. It projects the tooltip
 * content and exposes the tooltip's position/open behaviour plus the info button's
 * color and accessible name. Use it as a trailing affix inside `tedi-label-row`, or
 * standalone wherever an inline "more information" tooltip is needed.
 */
export default {
  title: "TEDI-Ready/Components/Overlay/InfoTooltip",
  component: InfoTooltipComponent,
  decorators: [
    moduleMetadata({
      imports: [InfoTooltipComponent, LabelComponent, LabelRowComponent],
    }),
  ],
  parameters: {
    status: {
      type: ["devComponent"],
    },
  },
  argTypes: {
    ngContent: {
      name: "ng-content",
      description: "Tooltip content",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    position: {
      control: "select",
      options: [
        "top",
        "top-start",
        "top-end",
        "bottom",
        "bottom-start",
        "bottom-end",
        "left",
        "left-start",
        "left-end",
        "right",
        "right-start",
        "right-end",
      ],
      description: "Position of the tooltip relative to the info button.",
      table: {
        category: "inputs",
        defaultValue: { summary: "top" },
        type: { summary: "TooltipPosition" },
      },
    },
    openWith: {
      control: "radio",
      options: ["hover", "click", "both"],
      description: "How the tooltip can be opened.",
      table: {
        category: "inputs",
        defaultValue: { summary: "both" },
        type: { summary: "TooltipOpenWith" },
      },
    },
    maxWidth: {
      control: "radio",
      options: ["none", "small", "medium", "large"],
      description: "Max width of the tooltip content.",
      table: {
        category: "inputs",
        defaultValue: { summary: "medium" },
        type: { summary: "TooltipWidth" },
      },
    },
    color: {
      control: "radio",
      options: ["primary", "inverted"],
      description: "Color of the info button. Use `inverted` on dark backgrounds.",
      table: {
        category: "inputs",
        defaultValue: { summary: "primary" },
        type: { summary: "primary \ninverted" },
      },
    },
    ariaLabel: {
      control: "text",
      description:
        "Accessible name for the info button. Defaults to the translated info-button label.",
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
  },
} as Meta<InfoTooltipComponent & { ngContent: string }>;

type InfoTooltipStory = StoryObj<InfoTooltipComponent & { ngContent: string }>;

export const Default: InfoTooltipStory = {
  args: {
    ngContent: "Seda välja kasutatakse teie isikusamasuse tuvastamiseks.",
    position: "top",
    openWith: "both",
    maxWidth: "medium",
    color: "primary",
  },
  render: ({ ngContent, ...args }) => ({
    props: args,
    template: `
      <tedi-info-tooltip ${argsToTemplate(args)}>${ngContent}</tedi-info-tooltip>
    `,
  }),
};

export const InLabelRow: InfoTooltipStory = {
  render: () => ({
    template: `
      <tedi-label-row>
        <label tedi-label for="city" [required]="true">Linn</label>
        <tedi-info-tooltip>Sisestage linn, kus te praegu elate.</tedi-info-tooltip>
      </tedi-label-row>
    `,
  }),
};
