import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { FloatingButtonComponent } from "./floating-button.component";
import { IconComponent } from "tedi/components";

const buttonSizeArray = ["default", "large"];
const buttonStateArray = ["Default", "Hover", "Active", "Focus"];

interface StoryArgs {
  textOffset: string;
}

type StoryFloatingButtonArgs = FloatingButtonComponent & StoryArgs;

const meta: Meta<StoryFloatingButtonArgs> = {
  title: "Community/Buttons/Floating Button",
  component: FloatingButtonComponent,

  decorators: [
    moduleMetadata({
      imports: [FloatingButtonComponent, IconComponent],
    }),
  ],
  args: {
    variant: "primary",
    axis: "horizontal",
    textOffset: "30px",
  },
  argTypes: {
    variant: {
      control: "select",
      description: "Specifies the color theme of the button.",
      options: ["primary", "secondary"],
    },
    axis: {
      control: "radio",
      description: "Button axis, changes the orientation of the button.",
      options: ["horizontal", "vertical"],
    },
    size: {
      control: "radio",
      description: "Button size.",
      options: ["small", "default", "large"],
    },
    // not meant to be user-editable or seen
    textOffset: {
      table: {
        disable: true,
      },
    },
  },
};

export default meta;

type Story = StoryObj<StoryFloatingButtonArgs>;

export const Default: Story = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
    offset: -30,
  },
  render: ({ textOffset: _textOffset, ...args }) => ({
    props: { ...args, debug: () => console.log("floating button clicked!") },
    template: `
    <div style="margin: 2rem;">
      <button tedi-floating-button ${argsToTemplate(args)} (click)="debug()">floating button</button>
    </div>
    `,
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
          <div style="transform: translateY({{textOffset}});">{{size}}</div>
          <button tedi-floating-button [axis]="[axis]" [size]="size">Floating Button</button>
          <button tedi-floating-button [axis]="[axis]" [size]="size">Floating Button <tedi-icon name="arrow_upward" /></button>
          <button tedi-floating-button [axis]="[axis]" [size]="size"><tedi-icon name="arrow_upward" /></button>

          <button tedi-floating-button [axis]="[axis]" variant="secondary" [size]="size">Floating Button</button>
          <button tedi-floating-button [axis]="[axis]" variant="secondary" [size]="size">Floating Button <tedi-icon name="arrow_upward" /></button>
          <button tedi-floating-button [axis]="[axis]" variant="secondary" [size]="size"><tedi-icon name="arrow_upward"/></button>
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
          <div style="transform: translateY({{textOffset}});">{{state}}</div>
          <button tedi-floating-button [axis]="[axis]" [id]="state">Floating Button</button>
          <button tedi-floating-button [axis]="[axis]" [id]="state">Floating Button <tedi-icon name="arrow_upward" /></button>
          <button tedi-floating-button [axis]="[axis]" [id]="state"><tedi-icon name="arrow_upward" /></button>

          <button tedi-floating-button [axis]="[axis]" [id]="state" variant="secondary">Floating Button</button>
          <button tedi-floating-button [axis]="[axis]" [id]="state" variant="secondary">Floating Button <tedi-icon name="arrow_upward" /></button>
          <button tedi-floating-button [axis]="[axis]" [id]="state" variant="secondary"><tedi-icon name="arrow_upward"/></button>
        </div>
      }
    </div>`,
  }),
};

export const sizesHorizontal: Story = {
  ...sizesVertical,
  args: {
    axis: "horizontal",
    textOffset: "0px",
  },
};

export const statesHorizontal: Story = {
  ...statesVertical,
  args: {
    axis: "horizontal",
    textOffset: "0px",
  },
};
