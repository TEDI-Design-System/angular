import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { ButtonComponent } from "../../buttons/button/button.component";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { IconComponent } from "../../base/icon/icon.component";
import { TextComponent } from "../../base/text/text.component";
import { CardComponent } from "../card/card.component";
import { CardContentComponent } from "../card/card-content/card-content.component";
import { VerticalSpacingDirective } from "../../../directives/vertical-spacing/vertical-spacing.directive";
import { HeadingWithIconComponent } from "./heading-with-icon.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.75.90?node-id=5797-117045&m=dev" target="_BLANK">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/94147f-heading-with-icon" target="_BLANK">Zeroheight ↗</a>
 */

export default {
  title: "TEDI-Ready/Content/HeadingWithIcon",
  component: HeadingWithIconComponent,
  decorators: [
    moduleMetadata({
      imports: [HeadingWithIconComponent, VerticalSpacingDirective],
    }),
  ],
  argTypes: {
    name: {
      description: "Name of the Material Icon.",
      control: "text",
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    element: {
      description:
        "Semantic heading tag. Also sets the typography unless a heading modifier overrides it.",
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6"],
      table: {
        category: "inputs",
        type: { summary: "HeadingModifiers" },
        defaultValue: { summary: "h4" },
      },
    },
    modifiers: {
      description:
        "Single or multiple modifiers to change the heading behavior. A heading modifier styles the heading as that level while `element` keeps the semantics.",
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6", "bold", "italic"],
      table: {
        category: "inputs",
        type: { summary: "TextModifiers[] | TextModifiers" },
      },
    },
    headingColor: {
      description: "Color of the heading text.",
      control: "select",
      options: [
        "primary",
        "secondary",
        "tertiary",
        "white",
        "disabled",
        "brand",
        "success",
        "warning",
        "danger",
        "info",
        "neutral",
        "inherit",
      ],
      table: {
        category: "inputs",
        type: { summary: "TextColor" },
        defaultValue: { summary: "primary" },
      },
    },
    iconColor: {
      description: "Color of the icon.",
      control: "select",
      options: [
        "primary",
        "secondary",
        "tertiary",
        "brand",
        "brand-dark",
        "success",
        "warning",
        "warning-dark",
        "danger",
        "white",
        "inherit",
      ],
      table: {
        category: "inputs",
        type: { summary: "IconColor" },
        defaultValue: { summary: "primary" },
      },
    },
    size: {
      description: "Size of the icon in pixels.",
      control: "select",
      options: [8, 12, 16, 18, 22, 24, 36, 48, "inherit"],
      table: {
        category: "inputs",
        type: { summary: "IconSize" },
        defaultValue: { summary: "24" },
      },
    },
    variant: {
      description: "Whether the icon should be filled or outlined.",
      control: "radio",
      options: ["outlined", "filled"],
      table: {
        category: "inputs",
        type: { summary: "IconVariant" },
        defaultValue: { summary: "outlined" },
      },
    },
  },
} as Meta<HeadingWithIconComponent>;

export const Default: StoryObj<HeadingWithIconComponent> = {
  args: {
    name: "assignment_ind",
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-heading-with-icon ${argsToTemplate(args)}>My family physician</tedi-heading-with-icon>
    `,
  }),
};

export const Colors: StoryObj<HeadingWithIconComponent> = {
  parameters: {
    controls: { disable: true },
  },
  render: () => ({
    template: `
      <div [tediVerticalSpacing]="1">
        <tedi-heading-with-icon name="assignment_ind" headingColor="brand" iconColor="brand">
          My family physician
        </tedi-heading-with-icon>
        <tedi-heading-with-icon name="assignment_ind">
          My family physician
        </tedi-heading-with-icon>
      </div>
    `,
  }),
};

export const Examples: StoryObj<HeadingWithIconComponent> = {
  parameters: {
    controls: { disable: true },
  },
  decorators: [
    moduleMetadata({
      imports: [
        CardComponent,
        CardContentComponent,
        SeparatorComponent,
        ButtonComponent,
        IconComponent,
        TextComponent,
      ],
    }),
  ],
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start">
        <tedi-card style="width: 300px">
          <tedi-card-content>
            <div [tediVerticalSpacing]="0.5">
              <tedi-heading-with-icon name="assignment_ind" headingColor="brand" iconColor="brand">
                My statement of intention
              </tedi-heading-with-icon>
              <div>
                <p tedi-text>For example organ donation and blood transfusion</p>
                <tedi-separator [spacing]="1" />
                <div style="display: flex; justify-content: flex-end">
                  <button tedi-button variant="secondary">View statements of intention</button>
                </div>
              </div>
            </div>
          </tedi-card-content>
        </tedi-card>

        <tedi-card background="brand-primary" style="width: 300px">
          <tedi-card-content>
            <div [tediVerticalSpacing]="0.5">
              <tedi-heading-with-icon name="assignment_ind" headingColor="white" iconColor="white">
                My statement of intention
              </tedi-heading-with-icon>
              <div>
                <p tedi-text color="white">For example organ donation and blood transfusion</p>
                <tedi-separator [spacing]="1" />
                <div style="display: flex; justify-content: flex-end">
                  <button tedi-button variant="secondary-inverted">
                    Book appointment
                    <tedi-icon name="arrow_forward" [size]="18" color="inherit" />
                  </button>
                </div>
              </div>
            </div>
          </tedi-card-content>
        </tedi-card>

        <tedi-card background="brand-primary" style="width: 300px">
          <tedi-card-content>
            <div [tediVerticalSpacing]="0.5">
              <tedi-heading-with-icon name="assignment_ind" headingColor="white" iconColor="white">
                This is a very long heading if there’s a strong need for a longer heading
              </tedi-heading-with-icon>
              <div>
                <p tedi-text color="white">For example organ donation and blood transfusion</p>
                <tedi-separator [spacing]="1" />
                <div style="display: flex; justify-content: flex-end">
                  <button tedi-button variant="secondary-inverted">
                    Book appointment
                    <tedi-icon name="arrow_forward" [size]="18" color="inherit" />
                  </button>
                </div>
              </div>
            </div>
          </tedi-card-content>
        </tedi-card>
      </div>
    `,
  }),
};
