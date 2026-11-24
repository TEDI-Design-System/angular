import {
  Meta,
  StoryFn,
  StoryObj,
  argsToTemplate,
  moduleMetadata,
} from "@storybook/angular";
import { ToggleComponent } from "./toggle.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { LabelComponent } from "../../content/label/label.component";
import { visualTest } from "../../../../../.storybook/visual-test-story";

const PSEUDO_STATE = ["Default", "Hover", "Active", "Focus"];

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.1.6--work-in-progress-?node-id=7123-152108&m=dev" target="_blank">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/7083d0-toggle" target="_blank">Zeroheight ↗</a>
 */

export default {
  title: "TEDI-Ready/Components/Form/Toggle",
  component: ToggleComponent,
  decorators: [
    moduleMetadata({
      imports: [ToggleComponent, RowComponent, ColComponent, LabelComponent],
    }),
  ],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  argTypes: {
    inputId: {
      description:
        "The unique identifier for the input element that is associated with label.",
      control: {
        type: "text",
      },
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    checked: {
      description:
        "Is toggle checked? Supports two-way binding, use with form controls.",
      control: {
        type: "boolean",
      },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    required: {
      description: "Indicates whether the toggle field is required.",
      control: {
        type: "boolean",
      },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    disabled: {
      description: "Is toggle disabled?",
      control: {
        type: "boolean",
      },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    variant: {
      description: "Color variant of the toggle",
      control: {
        type: "radio",
      },
      options: ["primary", "colored"],
      table: {
        category: "inputs",
        type: { summary: "ToggleVariant", detail: "primary \ncolored" },
        defaultValue: { summary: "primary" },
      },
    },
    type: {
      description: "Type of the toggle",
      control: {
        type: "radio",
      },
      options: ["filled", "outlined"],
      table: {
        category: "inputs",
        type: { summary: "ToggleType", detail: "filled \noutlined" },
        defaultValue: { summary: "filled" },
      },
    },
    size: {
      description: "Size of the toggle",
      control: {
        type: "radio",
      },
      options: ["default", "large"],
      table: {
        category: "inputs",
        type: { summary: "ToggleSize", detail: "default \nlarge" },
        defaultValue: { summary: "default" },
      },
    },
    icon: {
      description:
        "Should the toggle show lock icon. Works only with large toggle.",
      control: {
        type: "boolean",
      },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    ariaLabel: {
      description:
        "Accessible label for the toggle, used when there is no visible label.",
      control: {
        type: "text",
      },
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
  },
} as Meta<ToggleComponent>;

export const Default: StoryObj<ToggleComponent> = {
  args: {
    inputId: "example-toggle-1",
    variant: "primary",
    type: "filled",
    size: "default",
  },
  render: (args) => ({
    props: args,
    template: `
      <label for="example-toggle-1" class="sr-only">Default toggle</label>
      <tedi-toggle ${argsToTemplate(args)} />`,
  }),
};

export const Size: StoryObj<ToggleComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="2" [gapY]="3">
        <b>Default</b>
        <label for="example-toggle-2.1" class="sr-only">Default size</label>
        <tedi-toggle inputId="example-toggle-2.1" />
        <b>Large</b>
        <label for="example-toggle-2.2" class="sr-only">Large size</label>
        <tedi-toggle inputId="example-toggle-2.2" size="large" />
      </tedi-row>
    `,
  }),
};

export const LabelPosition: StoryObj<ToggleComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="1" [gapY]="3">
        <div style="display: flex; align-items: center; gap: 8px;">
          <label tedi-label for="example-toggle-3.1">Toggle button</label>
          <tedi-toggle inputId="example-toggle-3.1" />
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <tedi-toggle inputId="example-toggle-3.2" />
          <label tedi-label for="example-toggle-3.2">Toggle button</label>
        </div>
      </tedi-row>
    `,
  }),
};

/**
 * `vtId` gives every toggle a unique id where the matrix repeats in `VisualTest`; the docs stories
 * keep the state name as id so `#Hover` etc. match.
 */
const pseudoStateTemplate =
  (vtId?: string): StoryFn<ToggleComponent> =>
  (args) => {
    const id = (n: number) =>
      vtId ? `'vt-' + state.toLowerCase() + '-${vtId}-${n}'` : "state";

    return {
      props: { ...args, pseudoState: PSEUDO_STATE },
      template: `
    <tedi-row [cols]="1" [gapY]="4">
      <tedi-row *ngFor="let state of pseudoState;" cols="4" alignItems="center">
        <b>{{ state }}</b>
        <tedi-col [width]="3" style="display: flex; flex-wrap: wrap; align-items: center; column-gap: 2rem; row-gap: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <tedi-toggle ${argsToTemplate(args)} [inputId]="${id(1)}" ariaLabel="E-posti teavitused" />
            <tedi-toggle ${argsToTemplate(args)} [inputId]="${id(2)}" ariaLabel="SMS-teavitused" [checked]="true" />
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <tedi-toggle ${argsToTemplate(args)} [inputId]="${id(3)}" size="large" ariaLabel="Meeldetuletused" />
            <tedi-toggle ${argsToTemplate(args)} [inputId]="${id(4)}" size="large" ariaLabel="Uudiskiri" [checked]="true" />
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <tedi-toggle ${argsToTemplate(args)} [inputId]="${id(5)}" size="large" [icon]="true" ariaLabel="Asukoha jagamine" />
            <tedi-toggle ${argsToTemplate(args)} [inputId]="${id(6)}" size="large" [icon]="true" ariaLabel="Andmete jagamine arstiga" [checked]="true" />
          </div>
        </tedi-col>
      </tedi-row>
    </tedi-row>
  `,
    };
  };

export const PrimaryFilled: StoryObj<ToggleComponent> = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },
  args: {
    type: "filled",
    variant: "primary",
  },
  render: pseudoStateTemplate(),
};

export const PrimaryOutlined: StoryObj<ToggleComponent> = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },
  args: {
    type: "outlined",
    variant: "primary",
  },
  render: pseudoStateTemplate(),
};

export const ColoredFilled: StoryObj<ToggleComponent> = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },
  args: {
    type: "filled",
    variant: "colored",
  },
  render: pseudoStateTemplate(),
};

export const ColoredOutlined: StoryObj<ToggleComponent> = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },
  args: {
    type: "outlined",
    variant: "colored",
  },
  render: pseudoStateTemplate(),
};

/** Chromatic snapshot for Toggle: add every new visual variant here too. */
export const VisualTest: StoryObj<ToggleComponent> = {
  tags: ["!dev", "!autodocs"],
  parameters: {
    chromatic: { disableSnapshot: false },
    pseudo: {
      hover: '[id^="vt-hover-"]',
      active: '[id^="vt-active-"]',
      focusVisible: '[id^="vt-focus-"]',
    },
  },
  render: () =>
    visualTest([
      {
        label: "Primary filled",
        story: {
          ...PrimaryFilled,
          render: pseudoStateTemplate("primary-filled"),
        },
      },
      {
        label: "Primary outlined",
        story: {
          ...PrimaryOutlined,
          render: pseudoStateTemplate("primary-outlined"),
        },
      },
      {
        label: "Colored filled",
        story: {
          ...ColoredFilled,
          render: pseudoStateTemplate("colored-filled"),
        },
      },
      {
        label: "Colored outlined",
        story: {
          ...ColoredOutlined,
          render: pseudoStateTemplate("colored-outlined"),
        },
      },
      { label: "Label position", story: LabelPosition },
      { label: "Size", story: Size },
    ]),
};
