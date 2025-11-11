import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { FloatingButtonComponent } from "./floating-button.component";
import { ButtonComponent } from "tedi/components";

const meta: Meta<FloatingButtonComponent> = {
  title: "Components/Overlay/Floating Button",
  component: FloatingButtonComponent,

  decorators: [
    moduleMetadata({
      imports: [FloatingButtonComponent, ButtonComponent],
    }),
  ],
};

export default meta;

type Story = StoryObj<FloatingButtonComponent>;

export const Default: Story = {
  render: () => ({
    template: `<button tedi-button tedi-floating-button>floating button</button>`,
  }),
};
