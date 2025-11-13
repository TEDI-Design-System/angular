import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ThemeHostDirective } from './theme-host.directive';

import ThemeProviderDocs from './theme-host.docs.mdx';
import { ButtonComponent, ColComponent, RowComponent, TextComponent } from '../../components';

const meta: Meta<ThemeHostDirective> = {
  title: 'Tedi-Ready/Providers/ThemeHost',
  component: ThemeHostDirective,
  decorators: [
    moduleMetadata({
      imports: [
        ButtonComponent,
        TextComponent,
        RowComponent,
        ColComponent
      ],
    }),
  ],
  parameters: {
    docs: {
      page: ThemeProviderDocs,
    },
  },
};

export default meta;
type Story = StoryObj<ThemeHostDirective>;

export const Default: Story = {
  render: () => ({
    template: `
      <h2 tedi-text>ThemeHost Directive</h2>
      <p tedi-text>This entire block is wrapped with the theme provider.</p>
      <tedi-row [cols]="5" alignItems="center" [gapX]="1" style="margin-top: 15px;">
       <tedi-col [width]="1">
          <button tedi-button variant="primary">Primary Button</button>
        </tedi-col>
        <tedi-col [width]="1">
          <button tedi-button variant="secondary">Secondary</button>
        </tedi-col>
      </tedi-row>
    `,
  }),
};