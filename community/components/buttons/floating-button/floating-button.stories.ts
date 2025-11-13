import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { FloatingButtonComponent } from "./floating-button.component";
import { IconComponent } from "tedi/components";

const buttonSizeArray = ["small", "large"];
const buttonStateArray = ["Default", "Hover", "Active", "Focus"];

const meta: Meta<FloatingButtonComponent> = {
  title: "Community/Buttons/Floating Button",
  component: FloatingButtonComponent,

  decorators: [
    moduleMetadata({
      imports: [FloatingButtonComponent, IconComponent],
    }),
  ],
};

export default meta;

type Story = StoryObj<FloatingButtonComponent>;

export const Default: Story = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },
  render: () => ({
    template: `<tedi-floating-button>floating button</tedi-floating-button>`,
  }),
};

export const sizesVertical: Story = {
  ...Default,
  args: {
    axis: "vertical",
  },
  render: (args) => ({
    props: { ...args, buttonSizeArray },
    template: `
    <div style="display: flex; flex-direction: column; gap: 8rem; margin: 2rem; overflow: visible; white-space: nowrap">
      @for(size of buttonSizeArray; track size) {
        <div>
          <div style="width=10px;">{{size}}</div>
          <tedi-floating-button [axis]="[axis]" [size]="size">Floating Button</tedi-floating-button>
          <tedi-floating-button [axis]="[axis]" [size]="size">Floating Button <tedi-icon name="arrow_upward" /></tedi-floating-button>
          <tedi-floating-button [axis]="[axis]" [size]="size"><tedi-icon name="arrow_upward" /></tedi-floating-button>

          <tedi-floating-button [axis]="[axis]" variant="secondary" [size]="size">Floating Button</tedi-floating-button>
          <tedi-floating-button [axis]="[axis]" variant="secondary" [size]="size">Floating Button <tedi-icon name="arrow_upward" /></tedi-floating-button>
          <tedi-floating-button [axis]="[axis]" variant="secondary" [size]="size"><tedi-icon name="arrow_upward"/></tedi-floating-button>
        </div>
      }
    </div>`,
  }),
};

export const statesVertical: Story = {
  ...Default,
  args: {
    axis: "vertical",
  },
  render: (args) => ({
    props: { ...args, buttonStateArray },
    template: `
    <div style="display: flex; flex-direction: column; gap: 8rem; margin: 2rem overflow: visible; white-space: nowrap">
      @for(state of buttonStateArray; track state) {
        <div>
          <div style="width=10px;">{{state}}</div>
          <tedi-floating-button [axis]="[axis]" [id]="state">Floating Button</tedi-floating-button>
          <tedi-floating-button [axis]="[axis]" [id]="state">Floating Button <tedi-icon name="arrow_upward" /></tedi-floating-button>
          <tedi-floating-button [axis]="[axis]" [id]="state"><tedi-icon name="arrow_upward" /></tedi-floating-button>

          <tedi-floating-button [axis]="[axis]" [id]="state" variant="secondary">Floating Button</tedi-floating-button>
          <tedi-floating-button [axis]="[axis]" [id]="state" variant="secondary">Floating Button <tedi-icon name="arrow_upward" /></tedi-floating-button>
          <tedi-floating-button [axis]="[axis]" [id]="state" variant="secondary"><tedi-icon name="arrow_upward"/></tedi-floating-button>
        </div>
      }
    </div>`,
  }),
};

export const sizesHorizontal: Story = {
  ...sizesVertical,
  args: {
    axis: "horizontal",
  },
};

export const statesHorizontal: Story = {
  ...statesVertical,
  args: {
    axis: "horizontal",
  },
};
