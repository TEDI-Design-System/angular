import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { VerticalStepperComponent } from "./vertical-stepper.component";
import { VerticalStepperItemComponent } from "./vertical-stepper-item/vertical-stepper-item.component";
import { StatusBadgeComponent } from "../../tags/status-badge/status-badge.component";

/**
 * The `vertical-stepper` component is stepper where steps are displayed in vertical sequence.
 *
 * Vertical-stepper component consists of individual `vertical-stepper-item` components. Steps have title and can be used as routes or buttons for non-routed navigation.
 *
 * Step title must be provided as input. Title template can be also provided as element with `item-title` attribute for cases with custom routing logic etc.
 *
 * Steps can also have description/action. They can be provided as element with `item-description` attribute.
 *
 * Steps can also have sub steps. They can be provided as nested `vertical-stepper-item` components.
 */

export default {
  title: "Community/Navigation/VerticalStepper",
  component: VerticalStepperComponent,
  decorators: [
    moduleMetadata({
      imports: [
        VerticalStepperComponent,
        VerticalStepperItemComponent,
        StatusBadgeComponent,
      ],
    }),
  ],
  argTypes: {
    compact: {
      description: "Whether it's the compact variant",
      control: "boolean",
      table: {
        category: "vertical-stepper",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    enumerated: {
      description:
        "Used for compact variant, displays step number infront of the step title",
      control: "boolean",
      table: {
        category: "vertical-stepper",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    ariaLabel: {
      description: "Aria label for stepper",
      control: "text",
      table: {
        category: "vertical-stepper",
        type: { summary: "string" },
      },
    },
    itemTitle: {
      name: "title",
      description:
        "Item title. Title can also be provided by element with `item-title` attribute. Input is required for mobile view",
      control: "text",
      table: {
        category: "vertical-stepper-item",
        type: { summary: "string" },
      },
    },
    itemCompleted: {
      name: "completed",
      description: "Is vertical stepper item completed",
      control: "boolean",
      table: {
        category: "vertical-stepper-item",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    itemError: {
      name: "error",
      description: "Does vertical stepper item have error",
      control: "boolean",
      table: {
        category: "vertical-stepper-item",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    itemSelected: {
      name: "selected",
      description: "Is vertical stepper item selected",
      control: "boolean",
      table: {
        category: "vertical-stepper-item",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    itemDisabled: {
      name: "disabled",
      description: "Is vertical stepper item disabled",
      control: "boolean",
      table: {
        category: "vertical-stepper-item",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    itemInformative: {
      name: "informative",
      description:
        "Is vertical stepper item informative item. For sub items only",
      control: "boolean",
      table: {
        category: "vertical-stepper-item",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    itemOpened: {
      name: "opened",
      description:
        "Is vertical stepper item opened. For parent items with sub items only",
      control: "boolean",
      table: {
        category: "vertical-stepper-item",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    itemRoute: {
      name: "route",
      description:
        "Router link for item. If provided, leaf items title will be an anchor element, else button",
      control: "text",
      table: {
        category: "vertical-stepper-item",
        type: { summary: "RouterLink.routerLink: string | any[] | UrlTree" },
      },
    },
    itemSelect: {
      description: "Event for when item is selected",
      table: {
        category: "vertical-stepper-item",
        type: { summary: "output<void>" },
      },
    },
  },
} as Meta<VerticalStepperComponent>;

export const Default: StoryObj<VerticalStepperComponent> = {
  args: {},
  render: (args) => ({
    props: args,
    template: `
      <tedi-vertical-stepper ${argsToTemplate(args)}>
        <tedi-vertical-stepper-item title="Default with description">
          <span tedi-status-badge color="warning" status="none" item-description>Description</span>
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item
          completed
          title="Completed"
        ></tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item
          error
          title="Error"
        ></tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item selected title="Selected with children">
          <tedi-vertical-stepper-item title="Default child">
          </tedi-vertical-stepper-item>
          <tedi-vertical-stepper-item
            completed
            title="Completed child"
          ></tedi-vertical-stepper-item>
          <tedi-vertical-stepper-item
            error
            title="Error child"
          ></tedi-vertical-stepper-item>
          <tedi-vertical-stepper-item
            selected
            title="Selected child"
          ></tedi-vertical-stepper-item>
          <tedi-vertical-stepper-item disabled title="Disabled child">
          </tedi-vertical-stepper-item>
          <tedi-vertical-stepper-item informative title="Informative child"></tedi-vertical-stepper-item>
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item disabled title="Disabled">
        </tedi-vertical-stepper-item>
      </tedi-vertical-stepper>
    `,
  }),
};

export const Compact: StoryObj<VerticalStepperComponent> = {
  args: {
    compact: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-vertical-stepper ${argsToTemplate(args)}>
        <tedi-vertical-stepper-item title="Default with description">
          <span tedi-status-badge color="warning" status="none" item-description>Description</span>
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item
          completed
          title="Completed"
        ></tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item
          error
          title="Error"
        ></tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item selected title="Selected with children">
          <tedi-vertical-stepper-item title="Default child">
          </tedi-vertical-stepper-item>
          <tedi-vertical-stepper-item
            completed
            title="Completed child"
          ></tedi-vertical-stepper-item>
          <tedi-vertical-stepper-item
            error
            title="Error child"
          ></tedi-vertical-stepper-item>
          <tedi-vertical-stepper-item
            selected
            title="Selected child"
          ></tedi-vertical-stepper-item>
          <tedi-vertical-stepper-item disabled title="Disabled child">
          </tedi-vertical-stepper-item>
          <tedi-vertical-stepper-item informative title="Informative child"></tedi-vertical-stepper-item>
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item disabled title="Disabled">
        </tedi-vertical-stepper-item>
      </tedi-vertical-stepper>
    `,
  }),
};

export const EnumeratedCompact: StoryObj<VerticalStepperComponent> = {
  args: {
    compact: true,
    enumerated: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-vertical-stepper ${argsToTemplate(args)}>
        <tedi-vertical-stepper-item title="Default with description">
          <span tedi-status-badge color="warning" status="none" item-description>Description</span>
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item
          completed
          title="Completed"
        ></tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item
          error
          title="Error"
        ></tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item selected title="Selected with children">
          <tedi-vertical-stepper-item title="Default child">
          </tedi-vertical-stepper-item>
          <tedi-vertical-stepper-item
            completed
            title="Completed child"
          ></tedi-vertical-stepper-item>
          <tedi-vertical-stepper-item
            error
            title="Error child"
          ></tedi-vertical-stepper-item>
          <tedi-vertical-stepper-item
            selected
            title="Selected child"
          ></tedi-vertical-stepper-item>
          <tedi-vertical-stepper-item disabled title="Disabled child">
          </tedi-vertical-stepper-item>
          <tedi-vertical-stepper-item informative title="Informative child"></tedi-vertical-stepper-item>
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item disabled title="Disabled">
        </tedi-vertical-stepper-item>
      </tedi-vertical-stepper>
    `,
  }),
};

export const WithRouterlinks: StoryObj<VerticalStepperComponent> = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "For cases when steps are on multiple routes. Item emits `itemSelect` event when its routerLink becomes active",
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-vertical-stepper ${argsToTemplate(args)}>
        <tedi-vertical-stepper-item title="Link 1" route="link1" selected>
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item title="Link 2" route="link2">
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item title="Link 3" route="link3">
        </tedi-vertical-stepper-item>
      </tedi-vertical-stepper>
    `,
  }),
};

export const ProjectedTitleTemplates: StoryObj<VerticalStepperComponent> = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "For cases when step titles need custom templates or advanced routing logic. For example fragmented navigation. `button` and `a` elements inherit styles",
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-vertical-stepper ${argsToTemplate(args)}>
        <tedi-vertical-stepper-item title="Link 1" selected>
          <a href="#link1" item-title>Link 1</a>
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item title="Link 2">
          <a href="#link2" item-title>Link 2</a>
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item title="Link 3">
          <a href="#link3" item-title>Link 3</a>
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item title="Link 4">
          <a href="#link4" item-title>Link 4</a>
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item title="Link 5">
          <a href="#link5" item-title>Link 5</a>
        </tedi-vertical-stepper-item>
      </tedi-vertical-stepper>
    `,
  }),
};
