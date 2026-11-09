import { Meta, StoryObj } from "@storybook/angular";
import {
  VerticalStepNumberComponent,
  VerticalStepNumberType,
} from "./vertical-step-number.component";

const TYPES: VerticalStepNumberType[] = [
  "default",
  "success",
  "danger",
  "selected",
  "disabled",
];

/**
 * Numbered step circle shared by `VerticalStepper`, `CardStepper` and the
 * card stepper button pattern. Display only: the surrounding control names
 * the step and its status.
 *
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.102.102?node-id=11277-158833&m=dev" target="_blank">Figma ↗</a>
 */
export default {
  title: "TEDI-Ready/Components/Navigation/VerticalStepNumber",
  component: VerticalStepNumberComponent,
  argTypes: {
    number: {
      control: "number",
      description: "Step number shown in the circle.",
      table: { category: "inputs", type: { summary: "number | string" } },
    },
    type: {
      control: "radio",
      options: TYPES,
      description: "Visual state.",
      table: {
        category: "inputs",
        type: { summary: TYPES.map((type) => `"${type}"`).join(" | ") },
        defaultValue: { summary: '"default"' },
      },
    },
  },
} as Meta<VerticalStepNumberComponent>;

type Story = StoryObj<VerticalStepNumberComponent>;

export const Default: Story = {
  args: { number: 1, type: "default" },
};

export const Types: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { TYPES },
    template: `
      <div class="flex gap-3">
        @for (type of TYPES; track type) {
          <tedi-vertical-step-number [number]="1" [type]="type" />
        }
      </div>
    `,
  }),
};
