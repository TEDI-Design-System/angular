import { argsToTemplate, type Meta, type StoryObj } from "@storybook/angular";

import { CollapseComponent } from "./collapse.component";
import {
  VISUAL_TEST_VIEWPORTS,
  visualTest,
  VisualTestStory,
} from "../../../../../.storybook/visual-test-story";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.0.4-(work-in-progress)?node-id=15433-138256&amp;m=dev" target="_BLANK" class="sbdocs sbdocs-a css-ajfpqr">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/9469bf-collapse" target="_BLANK" class="sbdocs sbdocs-a css-ajfpqr">Zeroheight ↗</a>
 * <hr>
 * <p>Collapse component is used to hide or show content.</p>
 */

const meta = {
  title: "TEDI-Ready/Content/Collapse",
  component: CollapseComponent,
  parameters: { chromatic: { disableSnapshot: true } },
  args: {
    defaultOpen: false,
    hideCollapseText: false,
    arrowType: "default",
    size: "default",
    inverted: false,
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["default", "small"],
      description:
        "Visual size of the toggle button. `small` uses 14px text and a 24px icon button.",
      table: {
        defaultValue: { summary: "default" },
      },
    },
    inverted: {
      control: "boolean",
      description:
        "Render with inverted colors (white text/icon, tinted state backgrounds) for use on a brand-coloured surface.",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    openText: {
      control: "text",
      description:
        "The title for the collapsible section. Rendered inside the toggle button.",
      table: {
        type: { summary: "string" },
      },
    },
    closeText: {
      control: "text",
      description:
        "Text shown on the toggle button when the content is expanded.",
      table: {
        type: { summary: "string" },
      },
    },
    defaultOpen: {
      control: "boolean",
      description: "Optional prop to set the collapse open by default.",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    hideCollapseText: {
      control: "boolean",
      description: "To show or hide the openText and closeText",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    arrowType: {
      control: "radio",
      options: ["default", "secondary"],
      description:
        "You are able to toggle different arrow styles. Arrow type 'secondary' will add a circle over the icon.",
      table: {
        defaultValue: { summary: "default" },
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-collapse ${argsToTemplate(args)}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora rerum
        perspiciatis consectetur blanditiis maxime, optio minus amet similique!
        Et, saepe placeat. Omnis obcaecati corrupti repellat enim asperiores sunt
        quam laudantium voluptate optio deserunt distinctio harum dolores, iure
        unde nemo reprehenderit!
      </tedi-collapse>
    `,
  }),
} as Meta<CollapseComponent>;

export default meta;

type Story = StoryObj<CollapseComponent>;

export const Default: Story = {
  args: {
    openText: "Open",
    closeText: "Close",
  },
};

export const IconNeutralButton: Story = {
  args: {
    arrowType: "default",
    hideCollapseText: true,
  },
};

export const IconSecondaryButton: Story = {
  args: {
    arrowType: "secondary",
    hideCollapseText: true,
  },
};

export const InitiallyOpen: Story = {
  args: {
    defaultOpen: true,
    openText: "Open",
    closeText: "Close",
  },
};

export const Small: Story = {
  args: {
    size: "small",
    openText: "Open",
    closeText: "Close",
  },
};

export const WithTextInverted: Story = {
  args: {
    inverted: true,
    openText: "Open",
    closeText: "Close",
  },
  globals: {
    backgrounds: {
      value: "brand",
    },
  },
};

export const IconOnlyInverted: Story = {
  args: {
    inverted: true,
    hideCollapseText: true,
    openText: "Open",
    closeText: "Close",
  },
  globals: {
    backgrounds: {
      value: "brand",
    },
  },
};

/** Renders a docs story that sits on the `brand` background inside `bg bg-primary`. */
const onBrand = (story: Story): VisualTestStory => ({
  args: story.args,
  render: (args: never, context: never) => {
    const result = (story.render ?? meta.render)!(args, context);
    return {
      ...result,
      template: `<div class="bg bg-primary">${result.template}</div>`,
    };
  },
});

/** Chromatic snapshot for Collapse: add every new visual variant here too. */
export const VisualTest: Story = {
  tags: ["!dev", "!autodocs"],
  parameters: {
    chromatic: { disableSnapshot: false, viewports: VISUAL_TEST_VIEWPORTS },
    controls: { disable: true },
  },
  render: () =>
    visualTest(
      [
        { label: "Default", story: Default },
        { label: "Icon neutral button", story: IconNeutralButton },
        { label: "Icon secondary button", story: IconSecondaryButton },
        { label: "Initially open", story: InitiallyOpen },
        { label: "Small", story: Small },
        { label: "With text inverted", story: onBrand(WithTextInverted) },
        { label: "Icon only inverted", story: onBrand(IconOnlyInverted) },
      ],
      { args: meta.args, render: meta.render },
    ),
};
