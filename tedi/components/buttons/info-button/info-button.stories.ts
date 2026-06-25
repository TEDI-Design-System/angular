import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { InfoButtonComponent } from "./info-button.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { TextColor, TextComponent } from "../../base/text/text.component";

const PSEUDO_STATE = ["Default", "Hover", "Active", "Focus"];

type TemplateType = InfoButtonComponent & { titleColor?: TextColor };

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-(work-in-progress)?node-id=4514-72997&m=dev" target="_blank">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/0341c9-info-button" target="_blank">Zeroheight ↗</a>
 *
 * This is a simple info button component that can be used to display additional information when hovered over. It's mosty used together wihh tooltips or popovers.
 * It can be used in various contexts, such as forms, dashboards, or any other UI where additional information is needed.
 */

export default {
  title: "TEDI-Ready/Components/Buttons/InfoButton",
  argTypes: {
    "aria-label": {
      control: "text",
      description: "ARIA label",
    },
    color: {
      control: "radio",
      options: ["primary", "inverted"],
      description: "Color variant. Use `inverted` on dark or colored backgrounds.",
    },
  },
  args: {
    "aria-label": undefined,
    color: "primary",
  },
  component: InfoButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [InfoButtonComponent, RowComponent, ColComponent, TextComponent],
    }),
  ],
} as Meta<InfoButtonComponent>;

export const Default: StoryObj<InfoButtonComponent> = {
  render: (args) => ({
    props: args,
    template: `
        <button tedi-info-button ${argsToTemplate(args)}></button>
      `,
  }),
};

const StatesTemplate: StoryObj<TemplateType>["render"] = ({
  titleColor = "primary",
  ...args
}) => ({
  props: { ...args, titleColor, pseudoState: PSEUDO_STATE },
  template: `
    <tedi-row [cols]="1" [gapY]="5">
      <tedi-col *ngFor="let state of pseudoState;" style="max-width: 200px; display: grid; grid-template-columns: repeat(2, 1fr);">
        <p tedi-text modifiers="bold" [color]="titleColor">{{ state }}</p>
        <button tedi-info-button ${argsToTemplate(args)} [id]="state"></button>
      </tedi-col>
    </tedi-row>
  `,
});

export const States: StoryObj<TemplateType> = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },
  render: StatesTemplate,
};

export const Inverted: StoryObj<TemplateType> = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },
  args: {
    color: "inverted",
    titleColor: "white",
  },
  render: StatesTemplate,
  globals: {
    backgrounds: {
      value: "brand",
    },
  },
};
