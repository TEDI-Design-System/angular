import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { FloatingButtonDirective } from "./floating-button.component";
import { ButtonComponent } from "tedi/components";
import { NgFor } from "@angular/common";

const buttonSizeArray = ["medium", "large"];
const buttonStateArray = ["Default", "Hover", "Active", "Focus"];

const meta: Meta<FloatingButtonDirective> = {
  title: "Components/Overlay/Floating Button",
  component: FloatingButtonDirective,

  decorators: [
    moduleMetadata({
      imports: [FloatingButtonDirective, ButtonComponent, NgFor],
    }),
  ],
};

export default meta;

type Story = StoryObj<FloatingButtonDirective>;

export const Default: Story = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },
  render: () => ({
    template: `<button tedi-button tedi-floating-button>floating button</button>`,
  }),
};

export const sizesVertical: Story = {
  ...Default,
  render: (args) => ({
    props: { ...args, buttonSizeArray },
    template: `
    @for(size of buttonSizeArray; track size) {
      <button tedi-button tedi-floating-button axis="vertical" [size]="size">size {{size}}</button>
    }`,
  }),
};

export const statesVertical: Story = {
  ...Default,
  render: (args) => ({
    props: { ...args, buttonStateArray },
    template: `
    @for(state of buttonStateArray; track state) {
      <button tedi-button tedi-floating-button axis="vertical" [id]="state" [size]="size">state {{state}}</button>
    }`,
  }),
};

export const sizesHorizontal: Story = {
  ...Default,
  render: (args) => ({
    props: { ...args, buttonSizeArray },
    template: `
    @for(size of buttonSizeArray; track size) {
      <button tedi-button tedi-floating-button axis="horizontal" [size]="size">size {{size}}</button>
    }`,
  }),
};

export const statesHorizontal: Story = {
  ...Default,
  render: (args) => ({
    props: { ...args, buttonStateArray },
    template: `
    @for(state of buttonStateArray; track state) {
      <button tedi-button tedi-floating-button axis="horizontal" [id]="state" [size]="size">state {{state}}</button>
    }`,
  }),
};
