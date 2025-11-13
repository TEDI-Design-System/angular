import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { FloatingButtonComponent } from "./floating-button.component";
import { IconComponent } from "tedi/components";

const buttonSizeArray = ["medium", "large"];
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
  render: (args) => ({
    props: { ...args, buttonSizeArray },
    template: `
    <div style="display: flex; flex-direction: column; gap: 8rem; margin: 2rem">
      @for(size of buttonSizeArray; track size) {
        <div>
          <p>{{size}}</p>
          <tedi-floating-button axis="vertical" [size]="size">Floating Button</tedi-floating-button>
          <tedi-floating-button axis="vertical" [size]="size">Floating Button <tedi-icon name="arrow_upward" /></tedi-floating-button>
          <tedi-floating-button axis="vertical" [size]="size"><tedi-icon name="arrow_upward" /></tedi-floating-button>

          <tedi-floating-button axis="vertical" variant="secondary" [size]="size">Floating Button</tedi-floating-button>
          <tedi-floating-button axis="vertical" variant="secondary" [size]="size">Floating Button <tedi-icon name="arrow_upward" /></tedi-floating-button>
          <tedi-floating-button axis="vertical" variant="secondary" [size]="size"><tedi-icon name="arrow_upward" /></tedi-floating-button>
        </div>
      }
    </div>`,
  }),
};

export const statesVertical: Story = {
  ...Default,
  render: (args) => ({
    props: { ...args, buttonStateArray },
    template: `
    <div style="display: flex; flex-direction: column; gap: 8rem; margin: 2rem">
      @for(state of buttonStateArray; track state) {
        <div>
          <p>{{state}}</p>
          <tedi-floating-button axis="vertical" [id]="state">Floating Button</tedi-floating-button>
          <tedi-floating-button axis="vertical" [id]="state"><tedi-icon name="arrow_upward" /></tedi-floating-button>

          <tedi-floating-button axis="vertical" variant="secondary" [id]="state">Floating Button</tedi-floating-button>
          <tedi-floating-button axis="vertical" variant="secondary" [id]="state">Floating Button <tedi-icon name="arrow_upward" /></tedi-floating-button>
        </div>
      }
    </div>`,
  }),
};

export const sizesHorizontal: Story = {
  ...Default,
  render: (args) => ({
    props: { ...args, buttonSizeArray },
    template: `
    <div style="display: flex; flex-direction: column; gap: 8rem; margin: 2rem">
      @for(size of buttonSizeArray; track size) {
        <div>
          {{size}}
          <tedi-floating-button axis="horizontal" [size]="size">Floating Button</tedi-floating-button>
          <tedi-floating-button axis="horizontal" variant="secondary" [size]="size">Floating Button</tedi-floating-button>
          <tedi-floating-button axis="horizontal" variant="secondary" [size]="size">Floating Button <tedi-icon name="arrow_upward" /></tedi-floating-button>
          <tedi-floating-button axis="horizontal" variant="secondary" [size]="size"><tedi-icon name="arrow_upward" /></tedi-floating-button>
        </div>
      }
    </div>`,
  }),
};

export const statesHorizontal: Story = {
  ...Default,
  render: (args) => ({
    props: { ...args, buttonStateArray },
    template: `
    <div style="display: flex; gap: 1rem; margin: 2rem">
    @for(state of buttonStateArray; track state) {
      {{state}}<tedi-floating-button axis="horizontal" [id]="state">Floating Button</tedi-floating-button>
    }
    </div>`,
  }),
};
