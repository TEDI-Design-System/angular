import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { AccordionComponent } from "./accordion/accordion.component";
import { AccordionItemComponent } from "./accordion-item/accordion-item.component";
import { IconComponent, TextComponent } from "tedi/components/base";
import { ButtonComponent } from "tedi/components/buttons";
import { StatusBadgeComponent } from "community/components/tags";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { CheckboxComponent } from "tedi/components/form";

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
        IconComponent,
        TextComponent,
        ButtonComponent,
        StatusBadgeComponent,
        CheckboxComponent,
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
    showSeparateTitle: {
      control: "boolean",
      description:
        "Controls whether the title is rendered as a separate text in the accordion header.\n" +
        "If false and `showExpandLabel` is true, the title is used as the expand button label.",
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
    showDefaultExpandAction: {
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
    headerClass: {
      control: "text",
      description: "Custom CSS classes for the accordion header.",
      table: {
        category: "Accordion Item",
        type: { summary: "string" },
      },
    },
    bodyClass: {
      control: "text",
      description: "Custom CSS classes for the accordion body.",
      table: {
        category: "Accordion Item",
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
  args: {
    allowMultiple: false,
    headerClickable: true,
    title: "Title",
    titleLayout: "hug",
    showSeparateTitle: true,
    openLabel: "open",
    closeLabel: "close",
    showExpandLabel: true,
    showDefaultExpandAction: true,
    expandActionPosition: "end",
    defaultExpanded: false,
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
      <tedi-accordion [allowMultiple]="allowMultiple">
        <tedi-accordion-item
          [headerClickable]="headerClickable"
          [title]="title"
          [titleLayout]="titleLayout"
          [showSeparateTitle]="showSeparateTitle"
          [openLabel]="openLabel"
          [closeLabel]="closeLabel"
          [showExpandLabel]="showExpandLabel"
          [showDefaultExpandAction]="showDefaultExpandAction"
          [expandActionPosition]="expandActionPosition"
          [defaultExpanded]="defaultExpanded"
          [description]="description"
          [descriptionPosition]="descriptionPosition"
          [showIconCard]="showIconCard"
          [selected]="selected"
          [headerClass]="headerClass"
          [bodyClass]="bodyClass"
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

export const Variants: StoryObj = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-16);">
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
          <tedi-accordion-item [title]="'Title'" [descriptionPosition]="'both'" [description]="'Description'" [showExpandLabel]="false">
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item [title]="'Title'" [descriptionPosition]="'both'" [showExpandLabel]="false">
            <span tedi-accordion-start-description tedi-text color="tertiary" modifiers="normal">
              Description
            </span>
            <span tedi-accordion-end-description tedi-text color="tertiary" modifiers="small">
              Another description
            </span>
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item
            [headerClickable]="false"
            [title]="'Title'"
            [showSeparateTitle]="false"
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
            [showSeparateTitle]="false"
            expandActionPosition="start"
            [selected]="selectedB"
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
          <tedi-accordion-item [title]="'Title'" [headerClickable]="false" [showSeparateTitle]="false" expandActionPosition="start">
            ${contentExample}
          </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item [title]="'Title'" [headerClickable]="false" [showSeparateTitle]="false" expandActionPosition="start" [defaultExpanded]="true">
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
            <tedi-accordion-item [title]="'Title'" [showExpandLabel]="false" [expandActionPosition]="'start'">
              ${contentExample}
            </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item [title]="'Title'" [showExpandLabel]="false" [expandActionPosition]="'start'" [defaultExpanded]="true">
              ${contentExample}
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div class="story-row">
          <tedi-accordion>
            <tedi-accordion-item
              [headerClickable]="false"
              [title]="'Title'"
              [showSeparateTitle]="false"
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
              [showSeparateTitle]="false"
              expandActionPosition="start"
              [defaultExpanded]="true"
              [selected]="selectedB"
            >
              ${actionButtonTemplate("selectedB", "toggleB")}
              ${contentExample}
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div class="story-row">
          <tedi-accordion>
            <tedi-accordion-item
              [headerClickable]="false"
              [title]="'Title'"
              [showSeparateTitle]="false"
              expandActionPosition="start"
              [selected]="selectedC"
            >
              ${actionButtonTemplate("selectedC", "toggleC")}
              ${contentExample}
            </tedi-accordion-item>
          </tedi-accordion>

          <tedi-accordion>
            <tedi-accordion-item
              [headerClickable]="false"
              [title]="'Title'"
              [showSeparateTitle]="false"
              expandActionPosition="start"
              [defaultExpanded]="true"
              [selected]="selectedD"
            >
              ${actionButtonTemplate("selectedD", "toggleD")}
              ${contentExample}
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

export const WithIconCard: StoryObj = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-16);">
        <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-08);">
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

        <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-08);">
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

        <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-08);">
          <tedi-accordion>
            <tedi-accordion-item
              [headerClickable]="false"
              [showIconCard]="true"
              [title]="'Title'"
              [showSeparateTitle]="false"
              expandActionPosition="start"
              [selected]="selectedA"
            >
              ${iconCardTemplate}
              ${actionButtonTemplate("selectedA", "toggleA")}
              ${contentExample}
            </tedi-accordion-item>
          </tedi-accordion>

          <tedi-accordion style="flex: 1;">
            <tedi-accordion-item
              [headerClickable]="false"
              [showIconCard]="true"
              [title]="'Title'"
              [showSeparateTitle]="false"
              expandActionPosition="start"
              [defaultExpanded]="true"
              [selected]="selectedB"
            >
              ${iconCardTemplate}
              ${actionButtonTemplate("selectedB", "toggleB")}
              ${contentExample}
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-08);">
          <tedi-accordion>
            <tedi-accordion-item
              [headerClickable]="false"
              [showIconCard]="true"
              [title]="'Title'"
              [showSeparateTitle]="false"
              expandActionPosition="start"
              [selected]="selectedC"
            >
              ${iconCardTemplate}
              ${actionButtonTemplate("selectedC", "toggleC")}
              ${contentExample}
            </tedi-accordion-item>
          </tedi-accordion>

          <tedi-accordion>
            <tedi-accordion-item
              [headerClickable]="false"
              [showIconCard]="true"
              [title]="'Title'"
              [showSeparateTitle]="false"
              expandActionPosition="start"
              [defaultExpanded]="true"
              [selected]="selectedD"
            >
              ${iconCardTemplate}
              ${actionButtonTemplate("selectedD", "toggleD")}
              ${contentExample}
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
        ::ng-deep .tedi-accordion__header.custom-header,
        ::ng-deep .tedi-accordion__body.custom-body {
          background: var(--card-background-brand-quaternary);
        }

        ::ng-deep .tedi-accordion__header.custom-header {
          .tedi-accordion__start {
            gap: var(--layout-grid-gutters-16);
          }
        }

        ::ng-deep .tedi-accordion__header.custom-title {
          .tedi-accordion__title--main span {
            font-weight: var(--heading-h6-weight);
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
          <tedi-accordion-item
            [title]="'Title'"
            [titleLayout]="'fill'"
          >
            <abr tedi-status-badge tedi-accordion-start-after-title color="brand" status="none">Public</abr>
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item
            [title]="'Title'"
            [titleLayout]="'fill'"
          >
            <tedi-icon tedi-accordion-start-before-title name="account_circle" color="brand" background="brand-secondary" [size]="16"></tedi-icon>
            <abr tedi-status-badge tedi-accordion-start-after-title color="neutral" status="none">New</abr>
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>


        <tedi-accordion>
          <tedi-accordion-item [title]="'Title'" [headerClickable]="false" [showExpandLabel]="false" expandActionPosition="start" [selected]="selectedState">
            <label tedi-label tedi-accordion-end-action color="primary" style="display: inline-flex; align-items: center; gap: var(--layout-grid-gutters-08);">
              <input tedi-checkbox type="checkbox" [checked]="selectedState" (change)="toggleSelect($event)" />
              {{ selectedState ? 'Unselect' : 'Select' }} this value
            </label>
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item
            [title]="'Title'"
            [titleLayout]="'fill'"
          >
            <abr tedi-status-badge tedi-accordion-start-before-title color="success" status="none">Approved</abr>
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item [title]="'Mari Maasikas'" [descriptionPosition]="'both'" [headerClass]="'custom-title'">
            <img tedi-accordion-start-before-title src="custom_accordion_1.png" alt="Accordion example" />
            <span tedi-accordion-start-description tedi-text color="tertiary" modifiers="normal">
              mari.maasikas&#64;gmail.com
            </span>
            <span tedi-accordion-end-description tedi-text color="tertiary" modifiers="small">
              Verified
            </span>
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item
            [title]="'Some important title'"
            [titleLayout]="'fill'"
            [showExpandLabel]="false"
            [headerClass]="'custom-title'"
          >
            <img tedi-accordion-start-after-title src="custom_accordion_2.png" alt="Accordion example" />
            <span tedi-accordion-start-description tedi-text color="tertiary" modifiers="normal" class="custom-description">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </span>
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item
            #item
            [title]="'Some important title'"
            [showDefaultExpandAction]="false"
            [headerClickable]="false"
            [headerClass]="'custom-header custom-title custom-description'"
            [bodyClass]="'custom-body'"
          >
            <img tedi-accordion-start-before-title src="custom_accordion_2.png" alt="Accordion example" />
            <span tedi-accordion-start-description tedi-text color="primary" modifiers="normal" class="custom-description">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </span>
            <button tedi-accordion-end-action tedi-button variant="neutral" (click)="item.toggle()">
              <tedi-icon [name]="item.expanded() ? 'arrow_upward' : 'arrow_downward'"></tedi-icon>
              {{ item.expanded() ? 'Show less' : 'Show more' }}
            </button>
            ${contentExample}
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
          <tedi-accordion-item [title]="'Title 1'">
            ${contentExample}
          </tedi-accordion-item>
          <tedi-accordion-item [title]="'Title 2'">
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>

        <h4 tedi-text>Multi-expand accordion</h4>
        <tedi-accordion [allowMultiple]="true">
          <tedi-accordion-item [title]="'Title 1'">
            ${contentExample}
          </tedi-accordion-item>
          <tedi-accordion-item [title]="'Title 2'">
            ${contentExample}
          </tedi-accordion-item>
        </tedi-accordion>
      </div>
    `,
  }),
};
