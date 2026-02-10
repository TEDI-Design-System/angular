import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { AccordionComponent } from "./accordion/accordion.component";
import { AccordionItemComponent } from "./accordion-item/accordion-item.component";
import { IconComponent, TextComponent } from "tedi/components/base";
import { ButtonComponent } from "tedi/components/buttons";
import { StatusBadgeComponent } from "community/components/tags";

export default {
  title: "TEDI-Ready/Components/Cards/Accordion",
  decorators: [
    moduleMetadata({
      imports: [
        AccordionComponent,
        AccordionItemComponent,
        IconComponent,
        TextComponent,
        ButtonComponent,
        StatusBadgeComponent,
      ],
    }),
  ],
  argTypes: {
    multiple: {
      control: "boolean",
      description: "Whether multiple accordion items can be opened at once.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    title: {
      control: "text",
      description: "The title of the accordion item.",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Title" },
      },
    },
    openLabel: {
      control: "text",
      description: "Label for the open action.",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "open" },
      },
    },
    closeLabel: {
      control: "text",
      description: "Label for the close action.",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "close" },
      },
    },
    showExpandLabel: {
      control: "boolean",
      description: "Whether to show the expand/collapse labels.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    expandLabelInverted: {
      control: "boolean",
      description: "Whether the expand label should be inverted.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    expandIconPosition: {
      control: "radio",
      options: ["start", "end"],
      description: "Position of the expand/collapse icon.",
      table: {
        type: { summary: "'start' | 'end'" },
        defaultValue: { summary: "end" },
      },
    },
    defaultExpanded: {
      control: "boolean",
      description:
        "Whether the accordion item is initially expanded or collapsed.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    description: {
      control: "text",
      description: "The description text of the accordion item.",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "" },
      },
    },
    descriptionPosition: {
      control: "radio",
      options: ["start", "end", "both"],
      description: "Position of the description text.",
      table: {
        type: { summary: "'start' | 'end' | 'both'" },
        defaultValue: { summary: "start" },
      },
    },
    showIconCard: {
      control: "boolean",
      description: "Whether to show the icon card in the accordion item.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    withAction: {
      control: "boolean",
      description:
        "Whether the accordion header contains an additional action element for managing selection state.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    selected: {
      control: "boolean",
      description: "Whether the accordion item is selected.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
} as Meta;

const contentExample = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

const iconCardTemplate = `
  <span tedi-accordion-icon-card>
    <tedi-icon name="business_center" color="secondary" size="24"></tedi-icon>
    <span tedi-text color="secondary" modifiers="bold">Töövõime</span>
  </span>
`;

const actionButtonTemplate = (selectedState: string, toggleFn: string) => `
  <button
    tedi-button
    tedi-accordion-action
    [variant]="${selectedState} ? 'primary' : 'secondary'"
    (click)="$event.stopPropagation(); ${toggleFn}(!${selectedState})"
  >
    @if (${selectedState}) {
      <tedi-icon name="done"></tedi-icon>
    }
    {{ ${selectedState} ? 'Selected' : 'Select' }}
  </button>
`;

export const Default: StoryObj = {
  args: {
    multiple: false,
    title: "Title",
    openLabel: "open",
    closeLabel: "close",
    showExpandLabel: true,
    expandLabelInverted: false,
    expandIconPosition: "end",
    defaultExpanded: false,
    description: "",
    descriptionPosition: "start",
    showIconCard: false,
    withAction: false,
    selected: false,
  },
  render: (args) => ({
    props: {
      ...args,
      toggle(selected: boolean) {
        this["selected"] = selected;
      },
    },
    template: `
      <tedi-accordion [multiple]="multiple">
        <tedi-accordion-item
          [title]="title"
          [openLabel]="openLabel"
          [closeLabel]="closeLabel"
          [showExpandLabel]="showExpandLabel"
          [expandLabelInverted]="expandLabelInverted"
          [expandIconPosition]="expandIconPosition"
          [defaultExpanded]="defaultExpanded"
          [description]="description"
          [descriptionPosition]="descriptionPosition"
          [showIconCard]="showIconCard"
          [withAction]="withAction"
          [selected]="selected"
          (selectToggle)="toggle($event)"
        >
          ${`
            @if (withAction) {
              ${actionButtonTemplate("selected", "toggle")}
            }
          `}
          ${iconCardTemplate}
          ${contentExample}
        </tedi-accordion-item>
        <tedi-accordion-item [title]="'Title 2'" [openLabel]="'open'" [closeLabel]="'close'" [expandIconPosition]="'end'">
          ${contentExample}
        </tedi-accordion-item>
      </tedi-accordion>
    `,
  }),
};

export const Header: StoryObj = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <tedi-accordion>
          <tedi-accordion-item title="Title">
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item title="Title">
            <abr tedi-status-badge tedi-accordion-start-after-title color="success" status="none">Approved</abr>
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item title="Title">
            <tedi-icon tedi-accordion-start-before-title name="description" color="secondary" [size]="18"></tedi-icon>
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item title="Title">
            <tedi-icon tedi-accordion-start-before-title name="account_circle" color="brand" background="brand-secondary" [size]="16"></tedi-icon>
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item title="Title" [showExpandLabel]="false">
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item
            title="Title"
            expandIconPosition="start"
            [showExpandLabel]="false"
          >
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item title="Title" [description]="'Description'" [descriptionPosition]="'end'" [showExpandLabel]="false">
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item title="Title" [description]="'Description'" [showExpandLabel]="false">
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item title="Title" [descriptionPosition]="'both'" [showExpandLabel]="false">
            ${contentExample}

            <span tedi-accordion-description-start tedi-text color="tertiary" modifiers="normal">
              Description
            </span>

            <span tedi-accordion-description-end tedi-text color="tertiary" modifiers="normal">
              Another description
            </span>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item
            title="Title"
            [selected]="selectedA"
            [withAction]="true"
            (selectToggle)="toggleA($event)"
          >
            ${actionButtonTemplate("selectedA", "toggleA")}
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item
            title="Title"
            [selected]="selectedB"
            (selectToggle)="toggleB($event)"
            [withAction]="true"
          >
            ${actionButtonTemplate("selectedB", "toggleB")}
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>
      </div>
    `,
    props: {
      selectedA: false,
      selectedB: true,
      toggleA(selected: boolean) {
        this["selectedA"] = selected;
      },
      toggleB(selected: boolean) {
        this["selectedB"] = selected;
      },
    },
  }),
};

export const HeaderWithBody: StoryObj = {
  render: () => ({
    template: `
      <style>
        .story-row {
          display: flex;
          gap: 8px;
        }

        .story-row > tedi-accordion {
          flex: 1;
        }

        @media (max-width: 768px) {
          .story-row {
            flex-direction: column;
          }
        }
      </style>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div class="story-row">
          <tedi-accordion>
          <tedi-accordion-item title="Title">
            ${contentExample}
          </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item title="Title" [defaultExpanded]="true">
              ${contentExample}
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div class="story-row">
          <tedi-accordion>
          <tedi-accordion-item title="Title" [showExpandLabel]="false">
            ${contentExample}
          </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item title="Title" [defaultExpanded]="true" [showExpandLabel]="false">
              ${contentExample}
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div class="story-row">
          <tedi-accordion>
            <tedi-accordion-item
              title="Title"
              [selected]="selectedA"
              [withAction]="true"
              (selectToggle)="toggleA($event)"
            >
              ${contentExample}
              ${actionButtonTemplate("selectedA", "toggleA")}
            </tedi-accordion-item>
          </tedi-accordion>

          <tedi-accordion>
            <tedi-accordion-item
              title="Title"
              [defaultExpanded]="true"
              [selected]="selectedB"
              [withAction]="true"
              (selectToggle)="toggleB($event)"
            >
              ${contentExample}
              ${actionButtonTemplate("selectedB", "toggleB")}
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div class="story-row">
          <tedi-accordion>
            <tedi-accordion-item
              title="Title"
              [selected]="selectedC"
              [withAction]="true"
              (selectToggle)="toggleC($event)"
            >
              ${contentExample}
              ${actionButtonTemplate("selectedC", "toggleC")}
            </tedi-accordion-item>
          </tedi-accordion>

          <tedi-accordion>
            <tedi-accordion-item
              title="Title"
              [defaultExpanded]="true"
              [selected]="selectedD"
              [withAction]="true"
              (selectToggle)="toggleD($event)"
            >
              ${contentExample}
              ${actionButtonTemplate("selectedD", "toggleD")}
            </tedi-accordion-item>
          </tedi-accordion>
        </div>
      </div>
    `,
    props: {
      selectedA: false,
      selectedB: false,
      selectedC: true,
      selectedD: true,

      toggleA(selected: boolean) {
        this["selectedA"] = selected;
      },
      toggleB(selected: boolean) {
        this["selectedB"] = selected;
      },
      toggleC(selected: boolean) {
        this["selectedC"] = selected;
      },
      toggleD(selected: boolean) {
        this["selectedD"] = selected;
      },
    },
  }),
};

export const AccordionWithIconCard: StoryObj = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <tedi-accordion>
            <tedi-accordion-item title="Title" [showIconCard]="true">
              ${iconCardTemplate}
              ${contentExample}
            </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item title="Title" [defaultExpanded]="true" [showIconCard]="true">
              ${iconCardTemplate}
              ${contentExample}
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <tedi-accordion>
            <tedi-accordion-item title="Title" [showExpandLabel]="false" [showIconCard]="true">
              ${iconCardTemplate}
              ${contentExample}
            </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item title="Title" [defaultExpanded]="true" [showExpandLabel]="false" [showIconCard]="true">
              ${iconCardTemplate}
              ${contentExample}
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <tedi-accordion>
            <tedi-accordion-item
              [showIconCard]="true"
              title="Title"
              [selected]="selectedA"
              [withAction]="true"
              (selectToggle)="toggleA($event)"
            >
              ${iconCardTemplate}
              ${contentExample}
              ${actionButtonTemplate("selectedA", "toggleA")}
            </tedi-accordion-item>
          </tedi-accordion>

          <tedi-accordion style="flex: 1;">
            <tedi-accordion-item
              [showIconCard]="true"
              title="Title"
              [defaultExpanded]="true"
              [selected]="selectedB"
              [withAction]="true"
              (selectToggle)="toggleB($event)"
            >
              ${iconCardTemplate}
              ${contentExample}
              ${actionButtonTemplate("selectedB", "toggleB")}
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <tedi-accordion>
            <tedi-accordion-item
              [showIconCard]="true"
              title="Title"
              [withAction]="true"
              [selected]="selectedC"
              (selectToggle)="toggleC($event)"
            >
              ${iconCardTemplate}
              ${contentExample}
              ${actionButtonTemplate("selectedC", "toggleC")}
            </tedi-accordion-item>
          </tedi-accordion>

          <tedi-accordion>
            <tedi-accordion-item
              [showIconCard]="true"
              title="Title"
              [defaultExpanded]="true"
              [withAction]="true"
              [selected]="selectedD"
              (selectToggle)="toggleD($event)"
            >
              ${iconCardTemplate}
              ${contentExample}
              ${actionButtonTemplate("selectedD", "toggleD")}
            </tedi-accordion-item>
          </tedi-accordion>
        </div>
      </div>
    `,
    props: {
      selectedA: false,
      selectedB: false,
      selectedC: true,
      selectedD: true,

      toggleA(selected: boolean) {
        this["selectedA"] = selected;
      },
      toggleB(selected: boolean) {
        this["selectedB"] = selected;
      },
      toggleC(selected: boolean) {
        this["selectedC"] = selected;
      },
      toggleD(selected: boolean) {
        this["selectedD"] = selected;
      },
    },
  }),
};
