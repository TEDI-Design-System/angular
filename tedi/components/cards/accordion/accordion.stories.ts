import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { AccordionComponent } from "./accordion/accordion.component";
import { AccordionItemComponent } from "./accordion-item/accordion-item.component";
import { AccordionItemHeaderComponent } from "./accordion-item-header/accordion-item-header.component";
import { AccordionItemContentComponent } from "./accordion-item-content/accordion-item-content.component";
import { IconComponent } from "../../base/icon/icon.component";
import { TextComponent } from "../../base/text/text.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { StatusBadgeComponent } from "../../tags/status-badge/status-badge.component";
import { CheckboxComponent } from "../../form/checkbox/checkbox.component";
import { LabelComponent } from "../../form/label/label.component";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

document.cookie = "tedi-lang=en; path=/;";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.30.43?node-id=8048-69789&t=aqojgjkZcOYAN35p-0" target="_blank">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/00e937-accordion" target="_blank">Zeroheight ↗</a><br /><br />
 */

export default {
  title: "TEDI-Ready/Components/Cards/Accordion",
  decorators: [
    moduleMetadata({
      imports: [
        AccordionComponent,
        AccordionItemComponent,
        AccordionItemHeaderComponent,
        AccordionItemContentComponent,
        IconComponent,
        TextComponent,
        ButtonComponent,
        StatusBadgeComponent,
        CheckboxComponent,
        LabelComponent,
      ],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "en" }],
    }),
  ],
  argTypes: {
    allowMultiple: {
      control: "boolean",
      description: "Whether multiple accordion items can be opened at once.",
      table: {
        category: "Accordion",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
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
    headerClickable: {
      control: "boolean",
      description:
        "Defines whether the entire header acts as the toggle trigger.\n\n" +
        "`true` (default): the header is rendered as a button; clicking anywhere on it toggles the item.\n\n" +
        "`false`: the header is rendered as a non-interactive container. The default expand action is still rendered alongside it unless `showDefaultExpandAction` is also set to `false`. Set `headerClickable=false` when projecting interactive children (action buttons, checkboxes, links) into the header to avoid nesting interactive controls.",
      table: {
        category: "Accordion Item Header",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
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
        category: "Accordion Item Header",
        type: { summary: "'hug' | 'fill'" },
        defaultValue: { summary: "hug" },
      },
    },
    openLabel: {
      control: "text",
      description: "Label for the open action.",
      table: {
        category: "Accordion Item Header",
        type: { summary: "string" },
        defaultValue: { summary: "open" },
      },
    },
    closeLabel: {
      control: "text",
      description: "Label for the close action.",
      table: {
        category: "Accordion Item Header",
        type: { summary: "string" },
        defaultValue: { summary: "close" },
      },
    },
    showExpandLabel: {
      control: "boolean",
      description: "Whether to show the expand/collapse labels.",
      table: {
        category: "Accordion Item Header",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    showDefaultExpandAction: {
      control: "boolean",
      description:
        "Whether to show the default expand/collapse icon. If false, you can add your own expand icon with slots.",
      table: {
        category: "Accordion Item Header",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    expandActionPosition: {
      control: "radio",
      options: ["start", "end"],
      description: "Position of the expand/collapse action.",
      table: {
        category: "Accordion Item Header",
        type: { summary: "'start' | 'end'" },
        defaultValue: { summary: "end" },
      },
    },
    headerClass: {
      control: "text",
      description: "Custom CSS classes for the accordion header.",
      table: {
        category: "Accordion Item Header",
        type: { summary: "string" },
      },
    },
    contentClass: {
      control: "text",
      description: "Custom CSS classes for the accordion content.",
      table: {
        category: "Accordion Item Content",
        type: { summary: "string" },
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
  parameters: {
    docs: {
      description: {
        story: `
The accordion item is composed of three parts, each owning its own configuration:

- \`<tedi-accordion-item>\`: owns the item's state (\`expanded\`) and the inputs shared by header and content (\`selected\`, \`showIconCard\`, \`defaultExpanded\`).
- \`<tedi-accordion-item-header>\`: owns header appearance and interaction (\`titleLayout\`, \`headerClickable\`, expand labels, \`headerClass\`, etc.). Put the title and any extras (action buttons, badges, descriptions) inside this element using the corresponding slot attributes.
- \`<tedi-accordion-item-content>\`: owns content styling (\`contentClass\`). Wraps the collapsible content.


| Selector | Description |
|----------|------------|
| \`[tedi-accordion-title]\` | The accordion title. |
| \`[tedi-accordion-before-title]\` | Custom elements before the title. |
| \`[tedi-accordion-after-title]\` | Custom elements after the title. |
| \`[tedi-accordion-start-action]\` | Custom actions at the start of the header. |
| \`[tedi-accordion-end-action]\` | Custom actions at the end of the header. |
| \`[tedi-accordion-start-description]\` | Description rendered below the title. |
| \`[tedi-accordion-end-description]\` | Description rendered at the end of the header. |
| \`[tedi-accordion-icon-card]\` | Template for rendering the icon card layout (child of \`<tedi-accordion-item>\`). |
      `,
      },
    },
  },
  args: {
    allowMultiple: false,
    headerClickable: true,
    titleLayout: "hug",
    openLabel: "open",
    closeLabel: "close",
    showExpandLabel: true,
    showDefaultExpandAction: true,
    expandActionPosition: "end",
    defaultExpanded: false,
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
      <tedi-accordion [allowMultiple]="allowMultiple">
        <tedi-accordion-item
          [defaultExpanded]="defaultExpanded"
          [showIconCard]="showIconCard"
          [selected]="selected"
        >
          ${iconCardTemplate}
          <tedi-accordion-item-header
            [headerClickable]="headerClickable"
            [titleLayout]="titleLayout"
            [openLabel]="openLabel"
            [closeLabel]="closeLabel"
            [showExpandLabel]="showExpandLabel"
            [showDefaultExpandAction]="showDefaultExpandAction"
            [expandActionPosition]="expandActionPosition"
            [headerClass]="headerClass"
          >
            <span tedi-accordion-title>Title</span>
            ${`
              @if (!headerClickable) {
                ${actionButtonTemplate("selected", "toggle")}
              }
            `}
            <tedi-status-badge tedi-accordion-after-title color="success" text="Approved" />
          </tedi-accordion-item-header>
          <tedi-accordion-item-content [contentClass]="contentClass">
            ${contentExample}
          </tedi-accordion-item-content>
        </tedi-accordion-item>
        <tedi-accordion-item>
          <tedi-accordion-item-header [openLabel]="'open'" [closeLabel]="'close'" [expandActionPosition]="'end'">
            <span tedi-accordion-title>Title 2</span>
          </tedi-accordion-item-header>
          <tedi-accordion-item-content>
            ${contentExample}
          </tedi-accordion-item-content>
        </tedi-accordion-item>
      </tedi-accordion>
    `,
  }),
};

export const Variants: StoryObj = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-16);">
        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header>
              <span tedi-accordion-title>Title</span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header>
              <span tedi-accordion-title>Title</span>
              <tedi-status-badge tedi-accordion-after-title color="success" text="Approved" />
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header>
              <span tedi-accordion-title>Title</span>
              <tedi-icon tedi-accordion-before-title name="description" color="secondary" [size]="18"></tedi-icon>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header>
              <span tedi-accordion-title>Title</span>
              <tedi-icon tedi-accordion-before-title name="account_circle" color="brand" background="brand-secondary" [size]="16"></tedi-icon>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header [showExpandLabel]="false">
              <span tedi-accordion-title>Title</span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header expandActionPosition="start" [showExpandLabel]="false">
              <span tedi-accordion-title>Title</span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header [showExpandLabel]="false">
              <span tedi-accordion-title>Title</span>
              <span tedi-accordion-end-description tedi-text color="tertiary" modifiers="small">
                Description
              </span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header [showExpandLabel]="false">
              <span tedi-accordion-title>Title</span>
              <span tedi-accordion-start-description tedi-text color="tertiary" modifiers="normal">
                Description
              </span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header [showExpandLabel]="false">
              <span tedi-accordion-title>Title</span>
              <span tedi-accordion-start-description tedi-text color="tertiary" modifiers="normal">
                Description
              </span>
              <span tedi-accordion-end-description tedi-text color="tertiary" modifiers="small">
                Description
              </span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item [selected]="selectedA">
            <tedi-accordion-item-header
              [headerClickable]="false"
              expandActionPosition="start"
              openLabel="Title"
              closeLabel="Title"
            >
              ${actionButtonTemplate("selectedA", "toggleA")}
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item [selected]="selectedB">
            <tedi-accordion-item-header
              [headerClickable]="false"
              expandActionPosition="start"
              openLabel="Title"
              closeLabel="Title"
            >
              ${actionButtonTemplate("selectedB", "toggleB")}
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
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

export const ActionTypes: StoryObj = {
  render: () => ({
    template: `
      <style>
        .story-row {
          display: flex;
          gap: var(--layout-grid-gutters-08);
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
      <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-16);">
        <div class="story-row">
          <tedi-accordion>
            <tedi-accordion-item>
              <tedi-accordion-item-header>
                <span tedi-accordion-title>Title</span>
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item [defaultExpanded]="true">
              <tedi-accordion-item-header>
                <span tedi-accordion-title>Title</span>
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div class="story-row">
          <tedi-accordion>
            <tedi-accordion-item>
              <tedi-accordion-item-header
                [headerClickable]="false"
                expandActionPosition="start"
                openLabel="Title"
                closeLabel="Title"
              />
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item [defaultExpanded]="true">
              <tedi-accordion-item-header
                [headerClickable]="false"
                expandActionPosition="start"
                openLabel="Title"
                closeLabel="Title"
              />
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div class="story-row">
          <tedi-accordion>
            <tedi-accordion-item>
              <tedi-accordion-item-header [showExpandLabel]="false">
                <span tedi-accordion-title>Title</span>
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item [defaultExpanded]="true">
              <tedi-accordion-item-header [showExpandLabel]="false">
                <span tedi-accordion-title>Title</span>
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div class="story-row">
          <tedi-accordion>
            <tedi-accordion-item>
              <tedi-accordion-item-header [showExpandLabel]="false" [expandActionPosition]="'start'">
                <span tedi-accordion-title>Title</span>
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item [defaultExpanded]="true">
              <tedi-accordion-item-header [showExpandLabel]="false" [expandActionPosition]="'start'">
                <span tedi-accordion-title>Title</span>
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div class="story-row">
          <tedi-accordion>
            <tedi-accordion-item [selected]="selectedA">
              <tedi-accordion-item-header
                [headerClickable]="false"
                expandActionPosition="start"
                openLabel="Title"
                closeLabel="Title"
              >
                ${actionButtonTemplate("selectedA", "toggleA")}
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>

          <tedi-accordion>
            <tedi-accordion-item [defaultExpanded]="true" [selected]="selectedB">
              <tedi-accordion-item-header
                [headerClickable]="false"
                expandActionPosition="start"
                openLabel="Title"
                closeLabel="Title"
              >
                ${actionButtonTemplate("selectedB", "toggleB")}
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div class="story-row">
          <tedi-accordion>
            <tedi-accordion-item [selected]="selectedC">
              <tedi-accordion-item-header
                [headerClickable]="false"
                expandActionPosition="start"
                openLabel="Title"
                closeLabel="Title"
              >
                ${actionButtonTemplate("selectedC", "toggleC")}
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>

          <tedi-accordion>
            <tedi-accordion-item [defaultExpanded]="true" [selected]="selectedD">
              <tedi-accordion-item-header
                [headerClickable]="false"
                expandActionPosition="start"
                openLabel="Title"
                closeLabel="Title"
              >
                ${actionButtonTemplate("selectedD", "toggleD")}
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
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
  parameters: {
    a11y: {
      config: {
        rules: [{ id: "landmark-unique", enabled: false }],
      },
    },
  },
};

export const WithIconCard: StoryObj = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-16);">
        <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-08);">
          <tedi-accordion>
            <tedi-accordion-item [showIconCard]="true">
              ${iconCardTemplate}
              <tedi-accordion-item-header>
                <span tedi-accordion-title>Title</span>
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item [defaultExpanded]="true" [showIconCard]="true">
              ${iconCardTemplate}
              <tedi-accordion-item-header>
                <span tedi-accordion-title>Title</span>
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-08);">
          <tedi-accordion>
            <tedi-accordion-item [showIconCard]="true">
              ${iconCardTemplate}
              <tedi-accordion-item-header [showExpandLabel]="false">
                <span tedi-accordion-title>Title</span>
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item [defaultExpanded]="true" [showIconCard]="true">
              ${iconCardTemplate}
              <tedi-accordion-item-header [showExpandLabel]="false">
                <span tedi-accordion-title>Title</span>
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-08);">
          <tedi-accordion>
            <tedi-accordion-item [showIconCard]="true" [selected]="selectedA">
              ${iconCardTemplate}
              <tedi-accordion-item-header
                [headerClickable]="false"
                expandActionPosition="start"
                openLabel="Title"
                closeLabel="Title"
              >
                ${actionButtonTemplate("selectedA", "toggleA")}
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>

          <tedi-accordion style="flex: 1;">
            <tedi-accordion-item [defaultExpanded]="true" [showIconCard]="true" [selected]="selectedB">
              ${iconCardTemplate}
              <tedi-accordion-item-header
                [headerClickable]="false"
                expandActionPosition="start"
                openLabel="Title"
                closeLabel="Title"
              >
                ${actionButtonTemplate("selectedB", "toggleB")}
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-08);">
          <tedi-accordion>
            <tedi-accordion-item [showIconCard]="true" [selected]="selectedC">
              ${iconCardTemplate}
              <tedi-accordion-item-header
                [headerClickable]="false"
                expandActionPosition="start"
                openLabel="Title"
                closeLabel="Title"
              >
                ${actionButtonTemplate("selectedC", "toggleC")}
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>

          <tedi-accordion>
            <tedi-accordion-item [defaultExpanded]="true" [showIconCard]="true" [selected]="selectedD">
              ${iconCardTemplate}
              <tedi-accordion-item-header
                [headerClickable]="false"
                expandActionPosition="start"
                openLabel="Title"
                closeLabel="Title"
              >
                ${actionButtonTemplate("selectedD", "toggleD")}
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
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

export const Customized: StoryObj = {
  render: () => ({
    props: {
      selectedState: false,
      toggleSelect(event: Event) {
        const checkbox = event.target as HTMLInputElement;
        this["selectedState"] = checkbox.checked;
      },
    },
    template: `
      <style>
        ::ng-deep .tedi-accordion-item-header.custom-header,
        ::ng-deep .tedi-accordion-item-content.custom-content {
          background: var(--card-background-brand-quaternary);
        }

        ::ng-deep .tedi-accordion-item-header.custom-header {
          .tedi-accordion-item-header__start {
            gap: var(--layout-grid-gutters-16);
          }
        }

        ::ng-deep .tedi-accordion-item-header.custom-title {
          .tedi-accordion-item-header__title-main span {
            font-weight: var(--heading-h6-weight);
          }
        }

        ::ng-deep .tedi-accordion-item-header.custom-icon-rotation {
          .tedi-accordion-item-header__icon--expanded {
            transform: rotateX(180deg);
          }
        }

        .custom-description {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
          align-self: stretch;
          text-align: left;
        }
      </style>
      <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-16);">
        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header [titleLayout]="'fill'">
              <span tedi-accordion-title>Title</span>
              <tedi-status-badge tedi-accordion-after-title color="brand" text="Public" />
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header
              [titleLayout]="'fill'"
              [headerClass]="'custom-icon-rotation'"
            >
              <span tedi-accordion-title>Title</span>
              <tedi-icon tedi-accordion-before-title name="account_circle" color="brand" background="brand-secondary" [size]="16"></tedi-icon>
              <tedi-status-badge tedi-accordion-after-title color="neutral" text="New" />
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>


        <tedi-accordion>
          <tedi-accordion-item [selected]="selectedState">
            <tedi-accordion-item-header
              [headerClickable]="false"
              [showExpandLabel]="false"
              expandActionPosition="start"
            >
              <span tedi-accordion-title>Title</span>
              <label tedi-label tedi-accordion-end-action color="primary" style="display: inline-flex; align-items: center; gap: var(--layout-grid-gutters-08);">
                <input tedi-checkbox type="checkbox" [checked]="selectedState" (change)="toggleSelect($event)" />
                {{ selectedState ? 'Unselect' : 'Select' }} this value
              </label>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header [titleLayout]="'fill'">
              <span tedi-accordion-title>Title</span>
              <tedi-status-badge tedi-accordion-before-title color="success" text="Approved" />
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header
              [headerClass]="'custom-title'"
            >
              <span tedi-accordion-title>Mari Maasikas</span>
              <img tedi-accordion-before-title src="custom_accordion_1.png" alt="Accordion example" />
              <span tedi-accordion-start-description tedi-text color="tertiary" modifiers="normal">
                mari.maasikas&#64;gmail.com
              </span>
              <tedi-status-badge tedi-accordion-end-description color="success" text="Verified" />
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header
              [titleLayout]="'fill'"
              [showExpandLabel]="false"
              [headerClass]="'custom-title'"
            >
              <span tedi-accordion-title>Some important title</span>
              <img tedi-accordion-after-title src="custom_accordion_2.png" alt="Accordion example" />
              <span tedi-accordion-start-description tedi-text color="tertiary" modifiers="normal" class="custom-description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item #item>
            <tedi-accordion-item-header
              [showDefaultExpandAction]="false"
              [headerClickable]="false"
              [headerClass]="'custom-header custom-title custom-description'"
            >
              <span tedi-accordion-title>Some important title</span>
              <img tedi-accordion-before-title src="custom_accordion_2.png" alt="Accordion example" />
              <span tedi-accordion-start-description tedi-text color="primary" modifiers="normal" class="custom-description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </span>
              <button tedi-accordion-end-action tedi-button variant="neutral" (click)="item.toggle()">
                <tedi-icon [name]="item.expanded() ? 'arrow_upward' : 'arrow_downward'"></tedi-icon>
                {{ item.expanded() ? 'Show less' : 'Show more' }}
              </button>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content [contentClass]="'custom-content'">${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>
      </div>
    `,
  }),
};

export const AccordionBehavior: StoryObj = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-16);">
        <h4 tedi-text>Single-expand accordion</h4>
        <tedi-accordion style="margin-bottom: var(--layout-grid-gutters-16);">
          <tedi-accordion-item>
            <tedi-accordion-item-header>
              <span tedi-accordion-title>Title 1</span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
          <tedi-accordion-item>
            <tedi-accordion-item-header>
              <span tedi-accordion-title>Title 2</span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <h4 tedi-text>Multi-expand accordion</h4>
        <tedi-accordion [allowMultiple]="true">
          <tedi-accordion-item>
            <tedi-accordion-item-header>
              <span tedi-accordion-title>Title 1</span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
          <tedi-accordion-item>
            <tedi-accordion-item-header>
              <span tedi-accordion-title>Title 2</span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>
      </div>
    `,
  }),
};
