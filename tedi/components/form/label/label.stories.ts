import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { LabelComponent } from "./label.component";
import { LabelRowComponent } from "../label-row/label-row.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { InfoTooltipComponent } from "../../overlay/info-tooltip/info-tooltip.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-(work-in-progress)?node-id=2137-19322&m=dev" target="_blank">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/64479c-label" target="_blank">Zeroheight ↗</a>
 */

export default {
  title: "TEDI-Ready/Components/Form/Label",
  component: LabelComponent,
  decorators: [
    moduleMetadata({
      imports: [
        LabelComponent,
        LabelRowComponent,
        RowComponent,
        ColComponent,
        InfoTooltipComponent,
      ],
    }),
  ],
  argTypes: {
    ngContent: {
      name: "ng-content",
      description: "Label text",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    size: {
      control: "radio",
      options: ["small", "default"],
      description: "Defines the size of the label.",
      table: {
        category: "inputs",
        defaultValue: { summary: "default" },
        type: { summary: "LabelSize", detail: "default \nsmall" },
      },
    },
    required: {
      control: "boolean",
      description: "Marks the label as required.",
      table: {
        category: "inputs",
        defaultValue: { summary: "false" },
        type: {
          summary: "boolean",
        },
      },
    },
    color: {
      control: "radio",
      description: "Color of the label",
      options: ["primary", "secondary"],
      table: {
        category: "inputs",
        type: {
          summary: "LabelColor",
          detail: "primary \nsecondary",
        },
        defaultValue: { summary: "secondary" },
      },
    },
  },
} as Meta<LabelComponent>;

type LabelStory = StoryObj<LabelComponent & { ngContent: string }>;

export const Default: LabelStory = {
  args: {
    ngContent: "Label",
    size: "default",
    color: "secondary",
  },
  render: ({ ngContent, ...args }) => ({
    props: args,
    template: `
      <label tedi-label ${argsToTemplate(args)}>${ngContent}</label>
    `,
  }),
};

export const Size: StoryObj<LabelComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="2" [gapY]="3">
        <b>Default</b>
        <div style="display: flex; gap: 1rem;">
          <label tedi-label>Label</label>
          <label tedi-label>
            <b>Label</b>
          </label>
        </div>
        <b>Small</b>
        <div style="display: flex; gap: 1rem;">
          <label tedi-label size="small">Label</label>
          <label tedi-label size="small">
            <b>Label</b>
          </label>
        </div>
      </tedi-row>
    `,
  }),
};

/**
 * If a tooltip is needed, use the `tedi-label-row` component together with `tedi-info-tooltip`.
 */
export const Structure: LabelStory = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="1" [gapY]="3">
        <tedi-col>
          <label tedi-label for="ingredient-1">Toimeaine</label>
        </tedi-col>
        <tedi-col>
          <label tedi-label for="ingredient-2" [required]="true">Toimeaine</label>
        </tedi-col>
        <tedi-col>
          <tedi-label-row>
            <label tedi-label for="ingredient-3">Toimeaine</label>
            <tedi-info-tooltip>Vihje sisu</tedi-info-tooltip>
          </tedi-label-row>
        </tedi-col>
        <tedi-col>
          <tedi-label-row>
            <label tedi-label for="ingredient-4" [required]="true">Toimeaine</label>
            <tedi-info-tooltip>Vihje sisu</tedi-info-tooltip>
          </tedi-label-row>
        </tedi-col>
      </tedi-row>
    `,
  }),
};
