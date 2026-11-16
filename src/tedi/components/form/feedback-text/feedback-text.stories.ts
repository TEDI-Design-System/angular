import {
  argsToTemplate,
  Meta,
  StoryObj,
  moduleMetadata,
  StoryFn,
} from "@storybook/angular";
import { FeedbackTextComponent } from "./feedback-text.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { TextComponent } from "../../base/text/text.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.65.83?node-id=9165-62054&m=dev" target="_blank">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/67d4de-feedbacktext" target="_blank">Zeroheight ↗</a>
 */

export default {
  title: "TEDI-Ready/Components/Form/FeedbackText",
  component: FeedbackTextComponent,
  decorators: [
    moduleMetadata({
      imports: [
        FeedbackTextComponent,
        RowComponent,
        ColComponent,
        TextComponent,
      ],
    }),
  ],
  parameters: {
    status: {
      type: ["devComponent"],
    },
    chromatic: { disableSnapshot: true },
  },
  argTypes: {
    text: {
      description: "Helper text",
      control: "text",
      table: {
        category: "inputs",
      },
    },
    type: {
      description: "Type of form-helper.",
      control: "select",
      options: ["hint", "valid", "error"],
      table: {
        category: "inputs",
        type: { summary: "FeedbackTextType", detail: "hint \nvalid \nerror" },
        defaultValue: {
          summary: "hint",
        },
      },
    },
    position: {
      description: "Position of the helper.",
      control: "select",
      options: ["left", "right"],
      table: {
        category: "inputs",
        type: { summary: "FeedbackTextPosition", detail: "left \nright" },
        defaultValue: {
          summary: "left",
        },
      },
    },
  },
} as Meta<FeedbackTextComponent>;

const Template: StoryFn<FeedbackTextComponent> = (args) => ({
  props: args,
  template: `<tedi-feedback-text ${argsToTemplate(args)} />`,
});

export const Default: StoryObj<FeedbackTextComponent> = {
  args: {
    text: "I am a hint text",
  },
  render: Template,
};

export const Error: StoryObj<FeedbackTextComponent> = {
  args: {
    text: "I am an error text",
    type: "error",
  },
  render: Template,
};

export const Valid: StoryObj<FeedbackTextComponent> = {
  args: {
    text: "I am a valid text",
    type: "valid",
  },
  render: Template,
};

export const PositionLeft: StoryObj<FeedbackTextComponent> = {
  args: {
    text: "I am a hint text",
    position: "left",
  },
  render: Template,
};

export const PositionRight: StoryObj<FeedbackTextComponent> = {
  args: {
    text: "I am a hint text",
    position: "right",
  },
  render: Template,
};

/** Chromatic snapshot for FeedbackText: add every new visual variant here too. */
export const VisualTest: StoryObj<FeedbackTextComponent> = {
  tags: ["!dev", "!autodocs"],
  parameters: { chromatic: { disableSnapshot: false } },
  render: () => ({
    template: `
      <tedi-row [cols]="1" [gapY]="3">
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1"><p tedi-text modifiers="bold">Hint</p></tedi-col>
          <tedi-col width="5"><tedi-feedback-text text="I am a hint text" /></tedi-col>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1"><p tedi-text modifiers="bold">Error</p></tedi-col>
          <tedi-col width="5"><tedi-feedback-text text="I am an error text" type="error" /></tedi-col>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1"><p tedi-text modifiers="bold">Valid</p></tedi-col>
          <tedi-col width="5"><tedi-feedback-text text="I am a valid text" type="valid" /></tedi-col>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1"><p tedi-text modifiers="bold">Position right</p></tedi-col>
          <tedi-col width="5"><tedi-feedback-text text="I am a hint text" position="right" /></tedi-col>
        </tedi-row>
      </tedi-row>
    `,
  }),
};
