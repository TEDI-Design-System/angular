import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";
import { TooltipComponent, TooltipPosition } from "./tooltip.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { InfoButtonComponent } from "../../buttons/info-button/info-button.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { VerticalSpacingItemDirective } from "../../../directives/vertical-spacing/vertical-spacing-item.directive";
import { TextComponent } from "../../base/text/text.component";
import { TooltipTriggerComponent } from "./tooltip-trigger/tooltip-trigger.component";
import {
  TooltipContentComponent,
  TooltipWidth,
} from "./tooltip-content/tooltip-content.component";

const MAXWIDTH = ["none", "small", "medium", "large"];
const POSITIONS: TooltipPosition[] = [
  "auto",
  "auto-start",
  "auto-end",
  "top",
  "top-start",
  "top-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "right",
  "right-start",
  "right-end",
  "left",
  "left-start",
  "left-end",
];
const OPEN_WITH = ["hover", "click", "both"];

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-(work-in-progress)?node-id=5797-117363&amp;m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://tedi.tehik.ee/1ee8444b7/p/035e20-tooltip" target="_blank">Zeroheight ↗</a>
 */

export default {
  title: "TEDI-Ready/Components/Overlay/Tooltip",
  component: TooltipComponent,
  decorators: [
    moduleMetadata({
      imports: [
        TooltipComponent,
        TooltipTriggerComponent,
        TooltipContentComponent,
        InfoButtonComponent,
        ButtonComponent,
        RowComponent,
        ColComponent,
        VerticalSpacingItemDirective,
        TextComponent,
      ],
    }),
  ],
  argTypes: {
    position: {
      control: "select",
      description:
        "The position of the tooltip relative to the trigger element.",
      options: POSITIONS,
      table: {
        category: "tooltip",
        type: {
          summary: "TooltipPosition",
          detail: `${POSITIONS.join(" \n")}`,
        },
        defaultValue: {
          summary: "top",
        },
      },
    },
    openWith: {
      control: "radio",
      description: "How tooltip can opened?",
      options: OPEN_WITH,
      table: {
        category: "tooltip",
        type: {
          summary: "TooltipOpenWith",
          detail: "hover \nclick \nboth",
        },
        defaultValue: {
          summary: "both",
        },
      },
    },
    preventOverflow: {
      control: "boolean",
      description:
        "Should position to opposite direction when overflowing screen?",
      table: {
        category: "tooltip",
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "true",
        },
      },
    },
    appendTo: {
      control: "text",
      description:
        "Append floating element to given selector. Use 'body' to append at the end of DOM or empty string to append next to trigger element.",
      table: {
        category: "tooltip",
        type: {
          summary: "string",
        },
        defaultValue: {
          summary: "body",
        },
      },
    },
    timeoutDelay: {
      control: "number",
      description:
        "Delay time (in ms) for closing tooltip when not hovering trigger or content.",
      table: {
        category: "tooltip",
        type: {
          summary: "number",
        },
        defaultValue: {
          summary: "100",
        },
      },
    },
    maxWidth: {
      control: "select",
      options: MAXWIDTH,
      description: "The width of the tooltip.",
      defaultValue: {
        summary: "medium",
      },
      table: {
        category: "tooltip-content inputs",
        type: {
          summary: "TooltipWidth",
          detail: "none \nsmall \nmedium \nlarge",
        },
      },
    },
  },
} as Meta<TooltipComponent>;

type Story = StoryObj<
  TooltipComponent & {
    maxWidth: TooltipWidth;
  }
>;

export const Default: Story = {
  args: {
    position: "top",
    preventOverflow: true,
    appendTo: "body",
    timeoutDelay: 100,
    maxWidth: "medium",
    openWith: "both",
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-tooltip [position]="position" [timeoutDelay]="timeoutDelay" [preventOverflow]="preventOverflow" [appendTo]="appendTo" [openWith]="openWith">
        <tedi-tooltip-trigger>
          <button tedi-info-button></button>
        </tedi-tooltip-trigger>
        <tedi-tooltip-content [maxWidth]="maxWidth">
          This is tooltip content. The quick brown fox jumps over the lazy dog.
        </tedi-tooltip-content>
      </tedi-tooltip>
    `,
  }),
};

export const Positions: Story = {
  name: "Tooltip positions",
  render: (args) => ({
    props: {
      ...args,
      positions: POSITIONS,
    },
    template: `
      <tedi-row [cols]="3" [gapY]="3" justifyItems="center">
        @for (pos of positions; track pos) {
          <tedi-col>
            <tedi-tooltip [position]="pos">
              <tedi-tooltip-trigger>
                {{ pos.charAt(0).toUpperCase() + pos.slice(1) }}
              </tedi-tooltip-trigger>
              <tedi-tooltip-content>
                Tooltip content
              </tedi-tooltip-content>
            </tedi-tooltip>
          </tedi-col>
        }
      </tedi-row>
    `,
  }),
};

export const TextTrigger: Story = {
  render: (args) => ({
    props: args,
    template: `
      <p>
        Tooltip works even inside a text. Hover over
        <tedi-tooltip>
          <tedi-tooltip-trigger>
            this
          </tedi-tooltip-trigger>
          <tedi-tooltip-content>
            If tooltip trigger is a text, it will have an underline.
          </tedi-tooltip-content>
        </tedi-tooltip>
        text to see the tooltip.
      </p>
    `,
  }),
};

export const Widths: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="4">
        <tedi-col>
          <tedi-tooltip>
            <tedi-tooltip-trigger>
              Small tooltip width
            </tedi-tooltip-trigger>
            <tedi-tooltip-content maxWidth="small">
              This is an example for small tooltip. The quick brown fox jumps over the lazy dog.
            </tedi-tooltip-content>
          </tedi-tooltip>
        </tedi-col>
        <tedi-col>
          <tedi-tooltip>
            <tedi-tooltip-trigger>
              Medium tooltip width
            </tedi-tooltip-trigger>
            <tedi-tooltip-content maxWidth="medium">
              This is an example for medium tooltip. The quick brown fox jumps over the lazy dog.
            </tedi-tooltip-content>
          </tedi-tooltip>
        </tedi-col>
        <tedi-col>
          <tedi-tooltip>
            <tedi-tooltip-trigger>
              Large tooltip width
            </tedi-tooltip-trigger>
            <tedi-tooltip-content maxWidth="large">
              This is an example for large tooltip. The quick brown fox jumps over the lazy dog.
            </tedi-tooltip-content>
          </tedi-tooltip>
        </tedi-col>
        <tedi-col>
          <tedi-tooltip>
            <tedi-tooltip-trigger>
              Tooltip with no width limit
            </tedi-tooltip-trigger>
            <tedi-tooltip-content maxWidth="none">
              This is an example for no max width tooltip. The quick brown fox jumps over the lazy dog.
            </tedi-tooltip-content>
          </tedi-tooltip>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const CustomContent: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-tooltip>
        <tedi-tooltip-trigger>
          <span>Trigger</span>
        </tedi-tooltip-trigger>
        <tedi-tooltip-content>
          This <b>tooltip trigger</b> does not have an <u>underline,</u> because it is <i>wrapped in a span.</i>
        </tedi-tooltip-content>
      </tedi-tooltip>
    `,
  }),
};
