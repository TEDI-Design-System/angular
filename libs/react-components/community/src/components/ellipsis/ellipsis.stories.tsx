import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import Ellipsis, { EllipsisProps } from './ellipsis';

export default {
  title: 'components/Ellipsis',
  component: Ellipsis,
} as Meta;

const Template: StoryFn<EllipsisProps> = (args) => (
  <div style={{ maxWidth: 200 }}>
    <Ellipsis {...args} />
  </div>
);

export const Default = {
  render: Template,

  args: {
    children: (
      <span>
        Any inline <b>content (even bold)</b>, that is too long for the wrapper
        <span className="text-small"> and dont fit in x number of rows</span>
      </span>
    ),
  },
};
