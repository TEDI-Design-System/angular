import { Meta, StoryObj } from '@storybook/react';

import { VerticalSpacing } from '../../../tedi/components/vertical-spacing';
import Heading from '../typography/heading/heading';
import { Section } from './section';

const meta: Meta<typeof Section> = {
  component: Section,
  title: 'Community/Section',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Section>;

export const Default: Story = {
  args: {
    children: (
      <VerticalSpacing>
        <Heading>Page title</Heading>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer eget convallis quam, eu rhoncus turpis.
          Vestibulum venenatis leo eget felis accumsan, in finibus metus tristique. Curabitur ac quam eu justo consequat
          efficitur quis eget purus. Donec blandit, augue in vehicula tempor, erat nulla tincidunt tellus, ut tincidunt
          purus dolor sed augue.
        </p>
      </VerticalSpacing>
    ),
  },
};
