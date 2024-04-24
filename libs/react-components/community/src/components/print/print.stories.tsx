import { Meta, StoryFn, StoryObj } from '@storybook/react';

import Button from '../button/button';
import { VerticalSpacing } from '../vertical-spacing';
import { Print, PrintProps } from './print';

const meta: Meta<typeof Print> = {
  component: Print,
};

export default meta;
type Story = StoryObj<typeof Print>;

const Template: StoryFn<PrintProps> = (args) => (
  <VerticalSpacing>
    <Print {...args}>
      <p>Demo paragraph</p>
    </Print>
    <Print {...args}>
      <Button>Buttons are not printed by default</Button>
    </Print>
  </VerticalSpacing>
);

export const Default: Story = {
  render: Template,
};
