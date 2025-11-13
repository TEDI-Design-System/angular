import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { FloatingButtonComponent } from "./floating-button.component";
import { NgFor } from "@angular/common";

const buttonSizeArray = ["medium", "large"];
const buttonStateArray = ["Default", "Hover", "Active", "Focus"];

const meta: Meta<FloatingButtonComponent> = {
  title: "Community/Buttons/Floating Button",
  component: FloatingButtonComponent,

  decorators: [
    moduleMetadata({
      imports: [FloatingButtonComponent, NgFor],
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
    <div style="display: flex; gap: 1rem; margin: 1rem">
      @for(size of buttonSizeArray; track size) {
        {{size}}<tedi-floating-button axis="vertical" [size]="size">Floating Button</tedi-floating-button>
      }
    </div>`,
  }),
};

export const statesVertical: Story = {
  ...Default,
  render: (args) => ({
    props: { ...args, buttonStateArray },
    template: `
    <div style="display: flex; gap: 1rem; margin: 2rem">
      @for(state of buttonStateArray; track state) {
        {{state}}<tedi-floating-button axis="vertical" [id]="state">Floating Button</tedi-floating-button>
      }
    </div>`,
  }),
};

export const sizesHorizontal: Story = {
  ...Default,
  render: (args) => ({
    props: { ...args, buttonSizeArray },
    template: `
    <div style="display: flex; gap: 1rem; margin: 1rem">
      @for(size of buttonSizeArray; track size) {
        {{size}}<tedi-floating-button axis="horizontal" [size]="size">Floating Button</tedi-floating-button>
      }
    </div>`,
  }),
};

export const statesHorizontal: Story = {
  ...Default,
  render: (args) => ({
    props: { ...args, buttonStateArray },
    template: `
    <div style="display: flex; gap: 1rem; margin: 1rem">
    @for(state of buttonStateArray; track state) {
      {{state}}<tedi-floating-button axis="horizontal" [id]="state">Floating Button</tedi-floating-button>
    }
    </div>`,
  }),
};
