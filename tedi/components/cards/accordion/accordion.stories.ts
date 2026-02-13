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
  parameters: {
    docs: {
      description: {
        component: `
<a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.30.43?node-id=8048-69789&t=aqojgjkZcOYAN35p-0" target="_blank">Figma ↗</a><br />
<a href="https://www.tedi.ee/1ee8444b7/p/00e937-accordion" target="_blank">Zeroheight ↗</a><br /><br />

### Slots

| Selector | Description |
|----------|------------|
| \`[tedi-accordion-start-action]\` | Custom actions at the start of the header. |
| \`[tedi-accordion-start-before-title]\` | Custom elements before the title. |
| \`[tedi-accordion-start-after-title]\` | Custom elements after the title. |
| \`[tedi-accordion-end-action]\` | Custom actions at the end of the header. |
| \`[tedi-accordion-start-description]\` | Custom description content rendered below the title. |
| \`[tedi-accordion-end-description]\` | Custom description content rendered at the end of the header. |
| \`[tedi-accordion-icon-card]\` | Template for rendering the icon card layout. |
      `,
      },
    },
  },
  argTypes: {
    multiple: {
      control: "boolean",
      description: "Whether multiple accordion items can be opened at once.",
      table: {
        category: "Accordion",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    headerClickable: {
      control: "boolean",
      description:
        "Defines whether the entire header acts as the toggle trigger.\n\n" +
        "`true` (default): clicking anywhere on the header toggles the item.\n\n" +
        "`false`: the header does not toggle automatically. You must provide a custom toggle control inside the header (e.g. button or link).",
      table: {
        category: "Accordion Item",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    title: {
      control: "text",
      description: "The title of the accordion item.",
      table: {
        category: "Accordion Item",
        type: { summary: "string" },
        defaultValue: { summary: "Title" },
      },
    },
    titleLayout: {
      control: "radio",
      options: ["hug", "fill"],
      description:
        "Controls how the title stretches.\n\n" +
        "`hug`: wraps tightly around content.\n\n" +
        "`fill`: expands to available space and pushes trailing elements to the end.",
      table: {
        category: "Accordion Item",
        type: { summary: "'hug' | 'fill'" },
        defaultValue: { summary: "hug" },
      },
    },
    showDefaultTitle: {
      control: "boolean",
      description:
        "Controls whether the default title text is rendered inside the header.",
      table: {
        category: "Accordion Item",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    openLabel: {
      control: "text",
      description: "Label for the open action.",
      table: {
        category: "Accordion Item",
        type: { summary: "string" },
        defaultValue: { summary: "open" },
      },
    },
    closeLabel: {
      control: "text",
      description: "Label for the close action.",
      table: {
        category: "Accordion Item",
        type: { summary: "string" },
        defaultValue: { summary: "close" },
      },
    },
    showExpandLabel: {
      control: "boolean",
      description: "Whether to show the expand/collapse labels.",
      table: {
        category: "Accordion Item",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    showExpandIcon: {
      control: "boolean",
      description:
        "Whether to show the default expand/collapse icon. If false, you can add your own expand icon with slots.",
      table: {
        category: "Accordion Item",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    expandActionPosition: {
      control: "radio",
      options: ["start", "end"],
      description: "Position of the expand/collapse action.",
      table: {
        category: "Accordion Item",
        type: { summary: "'start' | 'end'" },
        defaultValue: { summary: "end" },
      },
    },
    defaultExpanded: {
      control: "boolean",
      description:
        "Whether the accordion item is initially expanded or collapsed.",
      table: {
        category: "Accordion Item",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    description: {
      control: "text",
      description:
        "The description text of the accordion item. If you need to have different descriptions, use slots.",
      table: {
        category: "Accordion Item",
        type: { summary: "string" },
        defaultValue: { summary: "" },
      },
    },
    descriptionPosition: {
      control: "radio",
      options: ["start", "end", "both"],
      description: "Position of the description text.",
      table: {
        category: "Accordion Item",
        type: { summary: "'start' | 'end' | 'both'" },
        defaultValue: { summary: "start" },
      },
    },
    showIconCard: {
      control: "boolean",
      description: "Whether to show the icon card.",
      table: {
        category: "Accordion Item",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    selected: {
      control: "boolean",
      description:
        "Whether the accordion item is selected. Applies a visual 'selected' state to the accordion item.",
      table: {
        category: "Accordion Item",
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
    tedi-accordion-end-action
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
    headerClickable: true,
    title: "Title",
    titleLayout: "hug",
    showDefaultTitle: true,
    openLabel: "open",
    closeLabel: "close",
    showExpandLabel: true,
    showExpandIcon: true,
    expandActionPosition: "end",
    defaultExpanded: false,
    description: "",
    descriptionPosition: "start",
    showIconCard: false,
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
          [headerClickable]="headerClickable"
          [title]="title"
          [titleLayout]="titleLayout"
          [showDefaultTitle]="showDefaultTitle"
          [openLabel]="openLabel"
          [closeLabel]="closeLabel"
          [showExpandLabel]="showExpandLabel"
          [showExpandIcon]="showExpandIcon"
          [expandActionPosition]="expandActionPosition"
          [defaultExpanded]="defaultExpanded"
          [description]="description"
          [descriptionPosition]="descriptionPosition"
          [showIconCard]="showIconCard"
          [selected]="selected"
        >
          ${`
            @if (!headerClickable) {
              ${actionButtonTemplate("selected", "toggle")}
            }
          `}
          <abr tedi-status-badge tedi-accordion-start-after-title color="success" status="none">Approved</abr>
          ${iconCardTemplate}
          ${contentExample}
        </tedi-accordion-item>
        <tedi-accordion-item [title]="'Title 2'" [openLabel]="'open'" [closeLabel]="'close'" [expandActionPosition]="'end'">
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
          <tedi-accordion-item [title]="'Title'">
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item [title]="'Title'">
            <abr tedi-status-badge tedi-accordion-start-after-title color="success" status="none">Approved</abr>
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item [title]="'Title'">
            <tedi-icon tedi-accordion-start-before-title name="description" color="secondary" [size]="18"></tedi-icon>
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item [title]="'Title'">
            <tedi-icon tedi-accordion-start-before-title name="account_circle" color="brand" background="brand-secondary" [size]="16"></tedi-icon>
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item [title]="'Title'" [showExpandLabel]="false">
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item [title]="'Title'" expandActionPosition="start" [showExpandLabel]="false">
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item [title]="'Title'" [description]="'Description'" [descriptionPosition]="'end'" [showExpandLabel]="false">
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item [title]="'Title'" [description]="'Description'" [showExpandLabel]="false">
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item [title]="'Title'" [descriptionPosition]="'both'" [showExpandLabel]="false">
            ${contentExample}

            <span tedi-accordion-start-description tedi-text color="tertiary" modifiers="normal">
              Description
            </span>

            <span tedi-accordion-end-description tedi-text color="tertiary" modifiers="small">
              Another description
            </span>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item
            [headerClickable]="false"
            [title]="'Title'"
            [showDefaultTitle]="false"
            expandActionPosition="start"
            [selected]="selectedA"
          >
            ${actionButtonTemplate("selectedA", "toggleA")}
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item
            [headerClickable]="false"
            [title]="'Title'"
            [showDefaultTitle]="false"
            expandActionPosition="start"
            [selected]="selectedB"
          >
            ${actionButtonTemplate("selectedB", "toggleB")}
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item #item [title]="'Title'" [showExpandLabel]="false" [showExpandIcon]="false" [headerClickable]="false" [selected]="selectedC">
            <img tedi-accordion-start-before-title src="accordion_example.png" alt="Accordion example" />
            <button tedi-accordion-end-action tedi-button variant="neutral" (click)="item.toggle()">
              <tedi-icon name="arrow_downward"></tedi-icon>
              Custom
            </button>
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
          <tedi-accordion-item [title]="'Title'">
            ${contentExample}
          </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item [title]="'Title'" [defaultExpanded]="true">
              ${contentExample}
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div class="story-row">
          <tedi-accordion>
          <tedi-accordion-item [title]="'Title'" [showExpandLabel]="false">
            ${contentExample}
          </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item [title]="'Title'" [defaultExpanded]="true" [showExpandLabel]="false">
              ${contentExample}
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div class="story-row">
          <tedi-accordion>
            <tedi-accordion-item
              [headerClickable]="false"
              [title]="'Title'"
              [showDefaultTitle]="false"
              expandActionPosition="start"
              [selected]="selectedA"
            >
              ${contentExample}
              ${actionButtonTemplate("selectedA", "toggleA")}
            </tedi-accordion-item>
          </tedi-accordion>

          <tedi-accordion>
            <tedi-accordion-item
              [headerClickable]="false"
              [title]="'Title'"
              [showDefaultTitle]="false"
              expandActionPosition="start"
              [defaultExpanded]="true"
              [selected]="selectedB"
            >
              ${contentExample}
              ${actionButtonTemplate("selectedB", "toggleB")}
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div class="story-row">
          <tedi-accordion>
            <tedi-accordion-item
              [headerClickable]="false"
              [title]="'Title'"
              [showDefaultTitle]="false"
              expandActionPosition="start"
              [selected]="selectedC"
            >
              ${contentExample}
              ${actionButtonTemplate("selectedC", "toggleC")}
            </tedi-accordion-item>
          </tedi-accordion>

          <tedi-accordion>
            <tedi-accordion-item
              [headerClickable]="false"
              [title]="'Title'"
              [showDefaultTitle]="false"
              expandActionPosition="start"
              [defaultExpanded]="true"
              [selected]="selectedD"
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
            <tedi-accordion-item [title]="'Title'" [showIconCard]="true">
              ${iconCardTemplate}
              ${contentExample}
            </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item [title]="'Title'" [defaultExpanded]="true" [showIconCard]="true">
              ${iconCardTemplate}
              ${contentExample}
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <tedi-accordion>
            <tedi-accordion-item [title]="'Title'" [showExpandLabel]="false" [showIconCard]="true">
              ${iconCardTemplate}
              ${contentExample}
            </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item [title]="'Title'" [defaultExpanded]="true" [showExpandLabel]="false" [showIconCard]="true">
              ${iconCardTemplate}
              ${contentExample}
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <tedi-accordion>
            <tedi-accordion-item
              [headerClickable]="false"
              [showIconCard]="true"
              [title]="'Title'"
              [showDefaultTitle]="false"
              expandActionPosition="start"
              [selected]="selectedA"
            >
              ${iconCardTemplate}
              ${contentExample}
              ${actionButtonTemplate("selectedA", "toggleA")}
            </tedi-accordion-item>
          </tedi-accordion>

          <tedi-accordion style="flex: 1;">
            <tedi-accordion-item
              [headerClickable]="false"
              [showIconCard]="true"
              [title]="'Title'"
              [showDefaultTitle]="false"
              expandActionPosition="start"
              [defaultExpanded]="true"
              [selected]="selectedB"
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
              [headerClickable]="false"
              [showIconCard]="true"
              [title]="'Title'"
              [showDefaultTitle]="false"
              expandActionPosition="start"
              [selected]="selectedC"
            >
              ${iconCardTemplate}
              ${contentExample}
              ${actionButtonTemplate("selectedC", "toggleC")}
            </tedi-accordion-item>
          </tedi-accordion>

          <tedi-accordion>
            <tedi-accordion-item
              [headerClickable]="false"
              [showIconCard]="true"
              [title]="'Title'"
              [showDefaultTitle]="false"
              expandActionPosition="start"
              [defaultExpanded]="true"
              [selected]="selectedD"
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
