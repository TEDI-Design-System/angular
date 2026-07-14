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
import { FormFieldComponent } from "../../form/form-field/form-field.component";
import { TextFieldComponent } from "../../form/text-field/text-field.component";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { ShowAtDirective } from "../../../directives/show-at/show-at.directive";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

const LANG_COOKIE = "tedi-lang";

const readLangCookie = (): string | undefined =>
  document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${LANG_COOKIE}=`))
    ?.split("=")[1];

const writeLangCookie = (value: string | undefined) => {
  if (value === undefined) {
    document.cookie = `${LANG_COOKIE}=; path=/; max-age=0`;
  } else {
    document.cookie = `${LANG_COOKIE}=${value}; path=/`;
  }
};

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.30.43?node-id=8048-69789&t=aqojgjkZcOYAN35p-0" target="_blank">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/00e937-accordion" target="_blank">Zeroheight ↗</a><br /><br />
 */

export default {
  title: "TEDI-Ready/Content/Accordion",
  // Switch the active locale to Estonian for accordion stories only. Storybook
  // runs `beforeEach` per story, and the returned function restores whatever
  // cookie was there before so other components' stories keep their locale.
  beforeEach: () => {
    const previous = readLangCookie();
    writeLangCookie("et");
    return () => {
      writeLangCookie(previous);
    };
  },
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
        FormFieldComponent,
        TextFieldComponent,
        SeparatorComponent,
        ShowAtDirective,
      ],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    }),
  ],
  parameters: {
    status: {
      type: ["breakpointSupport"],
    },
  },
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
    itemGap: {
      control: { type: "number", min: 0, step: 0.25 },
      description:
        "Vertical gap between sibling Accordion items in rem. " +
        "Forwarded as the `--tedi-accordion-item-gap` CSS variable. " +
        "Defaults to the design-token value `var(--layout-grid-gutters-08)` (0.5rem) when omitted.",
      table: {
        category: "Accordion",
        type: { summary: "number" },
        defaultValue: { summary: "0.5" },
      },
    },
    // Internally keyed `accordionDefaultExpanded` to avoid colliding with the
    // item-level `defaultExpanded` arg below — Storybook's args namespace is
    // flat, so we'd otherwise wire one value into two unrelated inputs. The
    // `name` field restores the displayed key to `defaultExpanded` in the
    // controls/docs table so users see the real API name.
    accordionDefaultExpanded: {
      name: "defaultExpanded",
      control: "boolean",
      description:
        "Group-level default for items' initial expanded state. Items use this value " +
        "when they don't specify their own `defaultExpanded`. " +
        "Per-item overrides (including explicit `false`) take precedence.",
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
    expandedChange: {
      action: "expandedChange",
      description:
        "Emitted whenever the item's expanded state changes. Receives the next expanded state.",
      table: {
        category: "Accordion Item",
        type: { summary: "boolean" },
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
    itemId: {
      control: false,
      description:
        "Stable id used for hash-based deep-linking. Pair with `openOnHashMatch`. " +
        "Not the same as the auto-generated header/content IDs used for ARIA.",
      table: {
        category: "Accordion Item",
        type: { summary: "string" },
      },
    },
    openOnHashMatch: {
      control: false,
      description:
        "Auto-expand the item when `window.location.hash` matches its `itemId`. " +
        "Requires an explicit `itemId` input — no-op for items relying on the auto-generated header/content IDs.",
      table: {
        category: "Accordion Item",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    disabled: {
      control: "boolean",
      description:
        "Disables the item — the header trigger becomes non-interactive and " +
        "the expanded state can no longer be toggled by user interaction. " +
        "The current state is preserved.",
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
    openText: {
      control: "text",
      description:
        "Text shown when the accordion is collapsed. Rendered literally — " +
        "translate at the call site if needed. When omitted, falls back to the translated " +
        "`open` label from `TediTranslationService`.",
      table: {
        category: "Accordion Item Header",
        type: { summary: "string" },
      },
    },
    closeText: {
      control: "text",
      description:
        "Text shown when the accordion is expanded. Rendered literally — " +
        "translate at the call site if needed. When omitted, falls back to the translated " +
        "`close` label from `TediTranslationService`.",
      table: {
        category: "Accordion Item Header",
        type: { summary: "string" },
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
    expandActionArrowType: {
      control: "radio",
      options: ["default", "secondary"],
      description:
        "Chevron style of the default expand action. Only effective when " +
        "`headerClickable` is `false` (otherwise the default expand action " +
        "isn't a `CollapseButton`) and `showExpandLabel` is `false` (only " +
        "icon-only mode honours `arrowType`).",
      table: {
        category: "Accordion Item Header",
        type: { summary: "'default' | 'secondary'" },
        defaultValue: { summary: "default" },
      },
    },
    expandActionSize: {
      control: "radio",
      options: [undefined, "default", "small"],
      description:
        "Visual size of the default expand action. Only effective when " +
        "`headerClickable` is `false`. When omitted, the size is derived " +
        "from `showExpandLabel` — `true` → `default`, `false` → `small`. " +
        "Pass a value to override the derived default.",
      table: {
        category: "Accordion Item Header",
        type: { summary: "'default' | 'small' | undefined" },
      },
    },
    expandActionInverted: {
      control: "boolean",
      description:
        "Use the inverted (light-on-dark) palette for the default expand " +
        "action, for placement on a dark or brand background. Only " +
        "effective when `headerClickable` is `false`.",
      table: {
        category: "Accordion Item Header",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    expandActionUnderline: {
      control: "boolean",
      description:
        "Whether the default expand action's label is underlined. " +
        "Defaults to `false` so the chevron stays the sole affordance. " +
        "Only effective when `headerClickable` is `false` and " +
        "`showExpandLabel` is `true` (icon-only mode never underlines).",
      table: {
        category: "Accordion Item Header",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
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
    headingLevel: {
      control: "select",
      options: [undefined, 1, 2, 3, 4, 5, 6],
      description:
        "Wraps the trigger in a semantic `<h1>`–`<h6>` element following the " +
        "WAI-ARIA Accordion Pattern. The wrapper uses `display: contents` so " +
        "it adds semantic info for assistive technologies without affecting layout.",
      table: {
        category: "Accordion Item Header",
        type: { summary: "1 | 2 | 3 | 4 | 5 | 6 | undefined" },
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
    <span tedi-text color="secondary" modifiers="bold">Kategooria</span>
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
    {{ ${selectedState} ? 'Valitud' : 'Vali' }}
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
    accordionDefaultExpanded: false,
    headerClickable: true,
    titleLayout: "hug",
    showExpandLabel: true,
    showDefaultExpandAction: true,
    expandActionPosition: "end",
    expandActionArrowType: "default",
    expandActionSize: undefined,
    expandActionInverted: false,
    expandActionUnderline: false,
    defaultExpanded: false,
    showIconCard: false,
    selected: false,
    disabled: false,
    headingLevel: undefined,
  },
  render: (args) => ({
    props: {
      ...args,
      toggle(selected: boolean) {
        this["selected"] = selected;
      },
    },
    template: `
      <tedi-accordion
        [allowMultiple]="allowMultiple"
        [defaultExpanded]="accordionDefaultExpanded"
        [itemGap]="itemGap"
      >
        <tedi-accordion-item
          [defaultExpanded]="defaultExpanded"
          [showIconCard]="showIconCard"
          [selected]="selected"
          [disabled]="disabled"
          (expandedChange)="expandedChange($event)"
        >
          ${iconCardTemplate}
          <tedi-accordion-item-header
            [headerClickable]="headerClickable"
            [titleLayout]="titleLayout"
            [openText]="openText"
            [closeText]="closeText"
            [showExpandLabel]="showExpandLabel"
            [showDefaultExpandAction]="showDefaultExpandAction"
            [expandActionPosition]="expandActionPosition"
            [expandActionArrowType]="expandActionArrowType"
            [expandActionSize]="expandActionSize"
            [expandActionInverted]="expandActionInverted"
            [expandActionUnderline]="expandActionUnderline"
            [headerClass]="headerClass"
            [headingLevel]="headingLevel"
          >
            <span tedi-accordion-title>Pealkiri</span>
            ${`
              @if (!headerClickable) {
                ${actionButtonTemplate("selected", "toggle")}
              }
            `}
            <tedi-status-badge tedi-accordion-after-title color="success" text="Kinnitatud" />
          </tedi-accordion-item-header>
          <tedi-accordion-item-content [contentClass]="contentClass">
            ${contentExample}
          </tedi-accordion-item-content>
        </tedi-accordion-item>
        <tedi-accordion-item>
          <tedi-accordion-item-header [expandActionPosition]="'end'">
            <span tedi-accordion-title>Pealkiri 2</span>
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
              <span tedi-accordion-title>Pealkiri</span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header>
              <span tedi-accordion-title>Pealkiri</span>
              <tedi-status-badge tedi-accordion-after-title color="success" text="Kinnitatud" />
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header>
              <span tedi-accordion-title>Pealkiri</span>
              <tedi-icon tedi-accordion-before-title name="description" color="secondary" [size]="18"></tedi-icon>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header>
              <span tedi-accordion-title>Pealkiri</span>
              <tedi-icon tedi-accordion-before-title name="account_circle" color="brand" background="brand-secondary" [size]="16"></tedi-icon>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header [showExpandLabel]="false">
              <span tedi-accordion-title>Pealkiri</span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header expandActionPosition="start" [showExpandLabel]="false">
              <span tedi-accordion-title>Pealkiri</span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header [showExpandLabel]="false">
              <span tedi-accordion-title>Pealkiri</span>
              <span tedi-accordion-end-description tedi-text color="tertiary" modifiers="small">
                Kirjeldus
              </span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header [showExpandLabel]="false">
              <span tedi-accordion-title>Pealkiri</span>
              <span tedi-accordion-start-description tedi-text color="tertiary" modifiers="normal">
                Kirjeldus
              </span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header [showExpandLabel]="false">
              <span tedi-accordion-title>Pealkiri</span>
              <span tedi-accordion-start-description tedi-text color="tertiary" modifiers="normal">
                Kirjeldus
              </span>
              <span tedi-accordion-end-description tedi-text color="tertiary" modifiers="small">
                Kirjeldus
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
              openText="Pealkiri"
              closeText="Pealkiri"
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
              openText="Pealkiri"
              closeText="Pealkiri"
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
                <span tedi-accordion-title>Klõpsatav päis</span>
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item [defaultExpanded]="true">
              <tedi-accordion-item-header>
                <span tedi-accordion-title>Klõpsatav päis</span>
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
                openText="Eraldi nupp alguses"
                closeText="Eraldi nupp alguses"
              />
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item [defaultExpanded]="true">
              <tedi-accordion-item-header
                [headerClickable]="false"
                expandActionPosition="start"
                openText="Eraldi nupp alguses"
                closeText="Eraldi nupp alguses"
              />
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div class="story-row">
          <tedi-accordion>
            <tedi-accordion-item>
              <tedi-accordion-item-header [showExpandLabel]="false">
                <span tedi-accordion-title>Ilma sildita nool</span>
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item [defaultExpanded]="true">
              <tedi-accordion-item-header [showExpandLabel]="false">
                <span tedi-accordion-title>Ilma sildita nool</span>
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
        </div>

        <div class="story-row">
          <tedi-accordion>
            <tedi-accordion-item>
              <tedi-accordion-item-header [showExpandLabel]="false" [expandActionPosition]="'start'">
                <span tedi-accordion-title>Ikoonnool alguses</span>
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item [defaultExpanded]="true">
              <tedi-accordion-item-header [showExpandLabel]="false" [expandActionPosition]="'start'">
                <span tedi-accordion-title>Ikoonnool alguses</span>
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
                openText="Kohandatud tegevusega"
                closeText="Kohandatud tegevusega"
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
                openText="Kohandatud tegevusega"
                closeText="Kohandatud tegevusega"
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
                openText="Valitud olekus"
                closeText="Valitud olekus"
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
                openText="Valitud olekus"
                closeText="Valitud olekus"
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

export const WithIconCard: StoryObj = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-16);">
        <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-08);">
          <tedi-accordion>
            <tedi-accordion-item [showIconCard]="true">
              ${iconCardTemplate}
              <tedi-accordion-item-header>
                <span tedi-accordion-title>Pealkiri</span>
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item [defaultExpanded]="true" [showIconCard]="true">
              ${iconCardTemplate}
              <tedi-accordion-item-header>
                <span tedi-accordion-title>Pealkiri</span>
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
                <span tedi-accordion-title>Pealkiri</span>
              </tedi-accordion-item-header>
              <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
            </tedi-accordion-item>
          </tedi-accordion>
          <tedi-accordion>
            <tedi-accordion-item [defaultExpanded]="true" [showIconCard]="true">
              ${iconCardTemplate}
              <tedi-accordion-item-header [showExpandLabel]="false">
                <span tedi-accordion-title>Pealkiri</span>
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
                openText="Pealkiri"
                closeText="Pealkiri"
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
                openText="Pealkiri"
                closeText="Pealkiri"
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
                openText="Pealkiri"
                closeText="Pealkiri"
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
                openText="Pealkiri"
                closeText="Pealkiri"
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
              <span tedi-accordion-title>Pealkiri</span>
              <tedi-status-badge tedi-accordion-after-title color="brand" text="Avalik" />
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
              <span tedi-accordion-title>Pealkiri</span>
              <tedi-icon tedi-accordion-before-title name="account_circle" color="brand" background="brand-secondary" [size]="16"></tedi-icon>
              <tedi-status-badge tedi-accordion-after-title color="neutral" text="Uus" />
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
              <span tedi-accordion-title>Pealkiri</span>
              <label tedi-label tedi-accordion-end-action color="primary" style="display: inline-flex; align-items: center; gap: var(--layout-grid-gutters-08);">
                <input tedi-checkbox type="checkbox" [checked]="selectedState" (change)="toggleSelect($event)" />
                {{ selectedState ? 'Valitud' : 'Vali' }}
              </label>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header [titleLayout]="'fill'">
              <span tedi-accordion-title>Pealkiri</span>
              <tedi-status-badge tedi-accordion-after-title color="success" text="Kinnitatud" />
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <!--
          The optional decorations (avatar, email, badge, photo, long description) below are
          wrapped in *showAt="'md'" so they disappear on xs/sm. Without this trim the visually
          rich items don't fit a phone-sized viewport — the title + action end up colliding.
          Resize the Storybook viewport to see each variant.
        -->
        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header
              [headerClass]="'custom-title'"
            >
              <span tedi-accordion-title>Mari Maasikas</span>
              <img *showAt="'md'" tedi-accordion-before-title src="custom_accordion_1.png" alt="Accordion example" />
              <span *showAt="'md'" tedi-accordion-start-description tedi-text color="tertiary" modifiers="normal">
                mari.maasikas&#64;gmail.com
              </span>
              <tedi-status-badge *showAt="'md'" tedi-accordion-end-description color="success" text="Kontrollitud" />
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
              <span tedi-accordion-title>Mingi oluline pealkiri</span>
              <img *showAt="'md'" tedi-accordion-after-title src="custom_accordion_2.png" alt="Accordion example" />
              <span *showAt="'md'" tedi-accordion-start-description tedi-text color="tertiary" modifiers="normal" class="custom-description">
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
              <span tedi-accordion-title>Mingi oluline pealkiri</span>
              <img *showAt="'md'" tedi-accordion-before-title src="custom_accordion_2.png" alt="Accordion example" />
              <span *showAt="'md'" tedi-accordion-start-description tedi-text color="primary" modifiers="normal" class="custom-description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </span>
              <button tedi-accordion-end-action tedi-button variant="neutral" (click)="item.toggle()">
                <tedi-icon [name]="item.expanded() ? 'arrow_upward' : 'arrow_downward'"></tedi-icon>
                {{ item.expanded() ? 'Näita vähem' : 'Näita rohkem' }}
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
              <span tedi-accordion-title>Pealkiri 1</span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
          <tedi-accordion-item>
            <tedi-accordion-item-header>
              <span tedi-accordion-title>Pealkiri 2</span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <h4 tedi-text>Multi-expand accordion</h4>
        <tedi-accordion [allowMultiple]="true">
          <tedi-accordion-item>
            <tedi-accordion-item-header>
              <span tedi-accordion-title>Pealkiri 1</span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
          <tedi-accordion-item>
            <tedi-accordion-item-header>
              <span tedi-accordion-title>Pealkiri 2</span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>
      </div>
    `,
  }),
};

export const Disabled: StoryObj = {
  parameters: {
    docs: {
      description: {
        story: `
Disabled items keep their current expanded state but reject user interaction.
The header trigger renders as a native \`<button disabled>\` (or with
\`aria-disabled\` for the non-clickable-header variant), so browsers handle
focus, keyboard, and screen-reader announcements for free.

Use \`disabled\` for items whose content is locked behind a state the user
hasn't met yet (incomplete prerequisites, missing permissions, etc.).
        `,
      },
    },
  },
  render: () => ({
    template: `
      <style>
        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--button-sm-height);
          height: var(--button-sm-height);
          border: 1px solid var(--stepper-step-default-border);
          border-radius: 100px;
          background: var(--stepper-step-default-bg);
        }

        .step-number--disabled {
          border-color: var(--stepper-step-disabled-border);
          background: var(--stepper-step-disabled-bg);
        }

        .step-body {
          display: flex;
          flex-direction: column;
          gap: var(--layout-grid-gutters-16);
        }

        .step-form {
          display: flex;
          flex-direction: column;
          gap: var(--layout-grid-gutters-16);
          width: 100%;
          max-width: 400px;
        }

        .step-actions {
          display: flex;
          gap: var(--layout-grid-gutters-08);
        }

        @media (max-width: 480px) {
          .step-actions > * {
            flex: 1;
          }
        }
      </style>
      <tedi-accordion>
        <tedi-accordion-item [defaultExpanded]="true">
          <tedi-accordion-item-header openText="Ava" closeText="Sulge">
            <span tedi-accordion-before-title class="step-number">
              <span tedi-text [modifiers]="['small', 'bold']" color="secondary">1</span>
            </span>
            <span tedi-accordion-title>Minu andmed</span>
          </tedi-accordion-item-header>
          <tedi-accordion-item-content>
            <div class="step-body">
              <div class="step-form">
                <tedi-form-field>
                  <label tedi-label [required]="true" for="first-name">Eesnimi</label>
                  <input tedi-text-field id="first-name" />
                </tedi-form-field>
                <tedi-form-field>
                  <label tedi-label [required]="true" for="last-name">Perenimi</label>
                  <input tedi-text-field id="last-name" />
                </tedi-form-field>
                <tedi-form-field>
                  <label tedi-label [required]="true" for="id-code">Isikukood</label>
                  <input tedi-text-field id="id-code" />
                </tedi-form-field>
              </div>
              <tedi-separator />
              <div class="step-actions">
                <button tedi-button variant="secondary">Tühista</button>
                <button tedi-button variant="primary">Jätka</button>
              </div>
            </div>
          </tedi-accordion-item-content>
        </tedi-accordion-item>

        <tedi-accordion-item [disabled]="true">
          <tedi-accordion-item-header openText="Ava" closeText="Sulge">
            <span tedi-accordion-before-title class="step-number step-number--disabled">
              <span tedi-text [modifiers]="['small', 'bold']" color="disabled">2</span>
            </span>
            <span tedi-accordion-title>Taotlus</span>
          </tedi-accordion-item-header>
          <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
        </tedi-accordion-item>

        <tedi-accordion-item [disabled]="true">
          <tedi-accordion-item-header openText="Ava" closeText="Sulge">
            <span tedi-accordion-before-title class="step-number step-number--disabled">
              <span tedi-text [modifiers]="['small', 'bold']" color="disabled">3</span>
            </span>
            <span tedi-accordion-title>Dokumendid</span>
          </tedi-accordion-item-header>
          <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
        </tedi-accordion-item>
      </tedi-accordion>
    `,
  }),
};

export const HashDeepLinking: StoryObj = {
  parameters: {
    docs: {
      description: {
        story: `
Items with \`openOnHashMatch\` auto-expand when \`window.location.hash\`
matches their \`itemId\`. Useful for FAQs, settings panels, documentation, or
any page where a sharable link should open straight to a specific section.

Click the links below to update the URL hash. The matching item expands
automatically. The listener also reacts to \`hashchange\`, so users
navigating between in-page links will see the corresponding item open as
they go. Combine with \`allowMultiple\` if you want previously opened items
to stay open.

**Note:** \`itemId\` must be set explicitly — \`openOnHashMatch\` is a
no-op for items relying on the auto-generated header/content IDs.
        `,
      },
    },
  },
  render: () => ({
    template: `
      <div>
        <nav
          aria-label="Liigu kodanikuteenuste KKK-jaotise juurde"
          style="display: flex; flex-wrap: wrap; gap: var(--layout-grid-gutters-16); margin-bottom: var(--layout-grid-gutters-16);"
        >
          <a tedi-link href="#id-card">ID-kaardi uuendamine</a>
          <a tedi-link href="#tax-return">Tuludeklaratsiooni esitamine</a>
          <a tedi-link href="#parental-benefits">Vanemahüvitis</a>
        </nav>

        <tedi-accordion [allowMultiple]="true">
          <tedi-accordion-item itemId="id-card" [openOnHashMatch]="true">
            <tedi-accordion-item-header>
              <span tedi-accordion-title>Kuidas uuendada ID-kaarti?</span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
          <tedi-accordion-item itemId="tax-return" [openOnHashMatch]="true">
            <tedi-accordion-item-header>
              <span tedi-accordion-title>Kuidas esitada tuludeklaratsiooni?</span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
          <tedi-accordion-item itemId="parental-benefits" [openOnHashMatch]="true">
            <tedi-accordion-item-header>
              <span tedi-accordion-title>Millistele vanemahüvitistele on mul õigus?</span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>
      </div>
    `,
  }),
};

export const SemanticHeadings: StoryObj = {
  parameters: {
    docs: {
      description: {
        story: `
\`headingLevel\` wraps the header trigger in a semantic \`<h1>\`–\`<h6>\`
element per the WAI-ARIA Accordion Pattern. The wrapper uses
\`display: contents\` so it adds *no* visual change — it only contributes
to the document outline that assistive technologies, table-of-contents
generators, and SEO crawlers rely on.

Use it whenever the accordion participates in a heading hierarchy: FAQs,
documentation, policy pages, dashboards with sectioned content — anywhere
the document outline matters for screen-reader navigation, table-of-contents
generators, or SEO. Pick a level that fits the surrounding content
(typically one level deeper than the section's own heading — \`<h2>\`
section → \`<h3>\` accordion items).

Inspect the DOM to confirm: each header is wrapped in a real \`<h3>\`,
but the rendered look matches the surrounding accordion items exactly.
        `,
      },
    },
  },
  render: () => ({
    template: `
      <section>
        <h2 tedi-text style="margin-bottom: var(--layout-grid-gutters-16);">Sinu kehtivad retseptid</h2>

        <tedi-accordion [allowMultiple]="true">
          <tedi-accordion-item>
            <tedi-accordion-item-header [headingLevel]="3">
              <span tedi-accordion-title>HJERTEMAGNYL TBL 150MG+21MG N100</span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
          <tedi-accordion-item>
            <tedi-accordion-item-header [headingLevel]="3">
              <span tedi-accordion-title>AMLODIPINE ACTAVIS</span>
              <span tedi-accordion-start-description tedi-text color="tertiary" modifiers="normal">
                Amlodipiin 5mg
              </span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
          <tedi-accordion-item>
            <tedi-accordion-item-header [headingLevel]="3">
              <span tedi-accordion-title>ATORVASTATIN KRKA</span>
              <span tedi-accordion-start-description tedi-text color="tertiary" modifiers="normal">
                Atorvastatiin 20mg
              </span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>${contentExample}</tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>
      </section>
    `,
  }),
};
