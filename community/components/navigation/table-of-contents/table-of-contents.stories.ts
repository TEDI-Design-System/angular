import { argsToTemplate, Meta, StoryObj } from "@storybook/angular";
import { TableOfContentsComponent } from "./table-of-contents.component";

const meta: Meta<TableOfContentsComponent> = {
  component: TableOfContentsComponent,
  title: "Community/Navigation/Table of Contents",
  args: {
    items: ["Introduction", "Getting Started", "Components", "API Reference"],
    heading: "Contents",
  },
};

export default meta;

type Story = StoryObj<TableOfContentsComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<tedi-table-of-contents ${argsToTemplate(args)}></tedi-table-of-contents>`,
  }),
};
