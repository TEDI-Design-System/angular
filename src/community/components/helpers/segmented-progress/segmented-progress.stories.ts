import { argsToTemplate, Meta, StoryObj } from "@storybook/angular";
import { SegmentedProgressComponent } from "./segmented-progress.component";

/**
 * Progress bar split into equal segments, one per step. A fractional `value` partly fills the next segment.
 */
export default {
  title: "Community/Helpers/SegmentedProgress",
  component: SegmentedProgressComponent,
  args: {
    segments: 5,
    value: 0.4,
    label: "Töökoha ja tööasendi ergonoomilisuse küsimused",
    valueLabel: "1/6",
  },
  argTypes: {
    segments: { control: { type: "number", min: 1 } },
    value: { control: { type: "number", min: 0, step: 0.1 } },
  },
} as Meta<SegmentedProgressComponent>;

type Story = StoryObj<SegmentedProgressComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<tedi-segmented-progress ${argsToTemplate(args)} />`,
  }),
};

export const WithoutLabels: Story = {
  args: { label: undefined, valueLabel: undefined, ariaLabel: "Progress", value: 2 },
  render: Default.render,
};
