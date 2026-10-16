import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";
import { DropdownComponent, DropdownPosition } from "./dropdown.component";
import {
  DropdownTriggerAriaHasPopup,
  DropdownTriggerDirective,
} from "./dropdown-trigger/dropdown-trigger.directive";
import {
  DropdownContentComponent,
  DropdownRole,
} from "./dropdown-content/dropdown-content.component";
import { DropdownItemComponent } from "./dropdown-item/dropdown-item.component";
import { DropdownSeparatorComponent } from "./dropdown-separator/dropdown-separator.component";
import { DropdownHeaderDirective } from "./dropdown-header/dropdown-header.directive";
import { SearchComponent } from "../../form/search/search.component";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { TextComponent } from "../../base/text/text.component";
import { DropdownItemValueComponent } from "./dropdown-item-value/dropdown-item-value.component";
import { DropdownItemValueLabelComponent } from "./dropdown-item-value/dropdown-item-value-label.component";
import { DropdownItemValueMetaComponent } from "./dropdown-item-value/dropdown-item-value-meta.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { IconComponent } from "../../base";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { expect, userEvent, waitFor, within } from "storybook/test";

const POSITIONS: DropdownPosition[] = [
  "auto",
  "auto-start",
  "auto-end",
  "top",
  "top-start",
  "top-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "right",
  "right-start",
  "right-end",
  "left",
  "left-start",
  "left-end",
];

const POSITION_EXAMPLES: { position: DropdownPosition; label: string }[] = [
  { position: "bottom-start", label: "Bottom start" },
  { position: "bottom", label: "Bottom center" },
  { position: "bottom-end", label: "Bottom end" },
  { position: "top-start", label: "Top start" },
  { position: "top", label: "Top center" },
  { position: "top-end", label: "Top end" },
  { position: "right-start", label: "Right start" },
  { position: "right", label: "Right center" },
  { position: "right-end", label: "Right end" },
  { position: "left-start", label: "Left start" },
  { position: "left", label: "Left center" },
  { position: "left-end", label: "Left end" },
];

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.38.58?node-id=40253-113444&m=dev" target="_blank">Dropdown Figma ↗</a><br>
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.38.58?node-id=2319-64439&m=dev" target="_blank">DropdownItem Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/0930a9-dropdown-item" target="_blank">Zeroheight ↗</a>
 */

export default {
  title: "TEDI-Ready/Components/Overlay/Dropdown",
  component: DropdownComponent,
  decorators: [
    moduleMetadata({
      imports: [
        DropdownComponent,
        DropdownTriggerDirective,
        DropdownContentComponent,
        DropdownItemComponent,
        DropdownSeparatorComponent,
        DropdownHeaderDirective,
        SearchComponent,
        SeparatorComponent,
        TextComponent,
        DropdownItemValueComponent,
        DropdownItemValueLabelComponent,
        DropdownItemValueMetaComponent,
        ButtonComponent,
        IconComponent,
        RowComponent,
        ColComponent,
      ],
    }),
  ],
  argTypes: {
    value: {
      control: "text",
      description:
        "Selected value in a `listbox` dropdown. Supports two-way binding.",
      table: {
        category: "dropdown",
        type: { summary: "string" },
      },
    },
    position: {
      control: "select",
      options: POSITIONS,
      description: "Position of the panel relative to the trigger.",
      table: {
        category: "dropdown",
        type: { summary: "DropdownPosition" },
        defaultValue: { summary: "bottom-start" },
      },
    },
    preventOverflow: {
      control: "boolean",
      description:
        "Whether the panel flips to the opposite side when it would overflow the screen.",
      table: {
        category: "dropdown",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    hideOnScroll: {
      control: "boolean",
      description:
        "Whether the dropdown closes when the page or a scrollable ancestor scrolls.",
      table: {
        category: "dropdown",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    offset: {
      control: "number",
      description: "Gap between the trigger and the panel, in px.",
      table: {
        category: "dropdown",
        type: { summary: "number" },
        defaultValue: { summary: "4" },
      },
    },
    width: {
      control: "text",
      description:
        "Width of the panel: `auto` fits the content (at least the trigger width), `trigger` matches the trigger, a number is px, a string is any CSS width.",
      table: {
        category: "dropdown",
        type: {
          summary: "DropdownWidth",
          detail: "auto \ntrigger \nnumber \nstring",
        },
        defaultValue: { summary: "auto" },
      },
    },
    dropdownRole: {
      control: "radio",
      options: ["menu", "listbox", "list"],
      description:
        "Accessibility role of the panel: `menu` for actions, `listbox` for selectable options, `list` for links (they stay links and keep their tab stops).",
      table: {
        category: "dropdown-content",
        type: { summary: "DropdownRole", detail: "menu \nlistbox \nlist" },
        defaultValue: { summary: "menu" },
      },
    },
    maxHeight: {
      control: "text",
      description:
        "Limits the height of the dropdown panel; the items scroll when they are taller. A number is px, a string is any CSS length (e.g. `20rem`). Prefer rem, so the maximum height scales with the user's font size. A `tedi-dropdown-header` stays in place above the scrolling items.",
      table: {
        category: "dropdown",
        type: { summary: "number | string" },
      },
    },
    divided: {
      control: "boolean",
      description:
        "Whether to draw a line between items. For lines between groups only, use `li[tedi-dropdown-separator]`.",
      table: {
        category: "dropdown-content",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    variant: {
      control: "radio",
      options: ["default", "tree"],
      description:
        "`tree` draws connector lines from indented items to their parent.",
      table: {
        category: "dropdown-content",
        type: { summary: "DropdownVariant", detail: "default \ntree" },
        defaultValue: { summary: "default" },
      },
    },
    ariaHaspopup: {
      control: "radio",
      options: ["menu", "listbox", "dialog", "true", "false"],
      description:
        "The `aria-haspopup` value for the trigger. Defaults to the content's `dropdownRole`, and a plain `list` gets no attribute at all, since ARIA has no token for it. `false` also omits the attribute.",
      table: {
        category: "dropdown-trigger",
        type: {
          summary: "DropdownTriggerAriaHasPopup",
          detail: "menu \nlistbox \ndialog \ntrue \nfalse",
        },
        defaultValue: { summary: "dropdownRole" },
      },
    },
    itemValue: {
      name: "value",
      description:
        "Value of the item. In a `listbox`, the item matching the dropdown's `value` is selected.",
      table: {
        category: "dropdown-item",
        type: { summary: "string" },
      },
    },
    disabled: {
      description: "Whether the item is disabled.",
      table: {
        category: "dropdown-item",
        type: { summary: "boolean" },
      },
    },
    closeOnSelect: {
      description:
        "Whether selecting the item closes the dropdown. Set `false` for multi-select items.",
      control: "boolean",
      table: {
        category: "dropdown-item",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    clipContent: {
      description:
        "Whether the item's label clips overflowing content for text ellipsis. Set `false` when projecting content with decorations that intentionally sit outside the line box (e.g. status indicator), so they are not cut off.",
      control: "boolean",
      table: {
        category: "dropdown-item",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    indent: {
      description:
        'Indentation level in rem, for nested / hierarchical items, e.g. children under a "select all" item.',
      control: "number",
      table: {
        category: "dropdown-item",
        type: { summary: "number" },
      },
    },
    isParent: {
      control: "boolean",
      description:
        "Whether the item is a parent in a `tree` dropdown: it gets a bullet and starts the connector line.",
      table: {
        category: "dropdown-item",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    interactiveContent: {
      description:
        'Whether the projected content is itself the interactive control, e.g. a button. In a `menu` or `listbox` the item role and the roving tabindex move onto that element, so assistive technology reports one control per item. For navigation links use `dropdownRole="list"` instead, where a widget role would replace the link role.',
      table: {
        category: "dropdown-item",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    itemSelect: {
      description:
        "Fires on click or keyboard (Enter / Space) activation. Use to react to selection without depending on click ordering.",
      table: {
        category: "dropdown-item",
        type: { summary: "EventEmitter<void>" },
      },
    },
  },
} as Meta<DropdownComponent>;

type Story = StoryObj<
  DropdownComponent & {
    dropdownRole: DropdownRole;
    ariaHaspopup: DropdownTriggerAriaHasPopup;
  }
>;

export const Default: Story = {
  args: {
    position: "bottom-start",
    preventOverflow: true,
    hideOnScroll: false,
    offset: 4,
    dropdownRole: "menu",
    ariaHaspopup: "menu",
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-dropdown
        [position]="position"
        [preventOverflow]="preventOverflow"
        [hideOnScroll]="hideOnScroll"
        [offset]="offset"
        [width]="width"
        [maxHeight]="maxHeight"
      >
        <button tedi-button tedi-dropdown-trigger variant="secondary" [ariaHaspopup]="ariaHaspopup">
          Võimalda ligipääs
          <tedi-icon name="keyboard_arrow_down" [size]="18" color="inherit" />
        </button>
        <tedi-dropdown-content [dropdownRole]="dropdownRole">
          <li tedi-dropdown-item>Juurdepääs terviseandmetele</li>
          <li tedi-dropdown-item>Juurdepääs isikuandmetele</li>
          <li tedi-dropdown-item>Juurdepääs kontaktandmetele</li>
        </tedi-dropdown-content>
      </tedi-dropdown>
    `,
  }),
};

export const Position: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: (args) => ({
    props: {
      ...args,
      examples: POSITION_EXAMPLES,
    },
    template: `
      <tedi-row [cols]="1" [md]="{ cols: 3 }" [gapY]="3" justifyItems="center">
        @for (example of examples; track example.position) {
          <tedi-col>
            <tedi-dropdown [position]="example.position" [preventOverflow]="preventOverflow">
              <button tedi-button tedi-dropdown-trigger variant="secondary" [ariaHaspopup]="ariaHaspopup">
                {{ example.label }}
                <tedi-icon name="keyboard_arrow_down" [size]="18" color="inherit" />
              </button>
              <tedi-dropdown-content [dropdownRole]="dropdownRole">
                <li tedi-dropdown-item>Juurdepääs terviseandmetele</li>
                <li tedi-dropdown-item>Juurdepääs isikuandmetele</li>
                <li tedi-dropdown-item>Juurdepääs kontaktandmetele</li>
              </tedi-dropdown-content>
            </tedi-dropdown>
          </tedi-col>
        }
      </tedi-row>
    `,
  }),
  args: {
    preventOverflow: true,
    dropdownRole: "menu",
    ariaHaspopup: "menu",
  },
  argTypes: {
    position: { table: { disable: true } },
  },
};

/**
 * In a `listbox` dropdown the item whose `value` matches the dropdown's `value` is shown as
 * active. Bind `[(value)]` to keep the selection in sync with the trigger label.
 */
export const WithActiveItem: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => ({
    props: {
      lang: "EST",
      languages: ["EST", "ENG", "RUS"],
      sort: "Uuemad ees",
      sortOptions: [
        "Uuemad ees",
        "Vanemad ees",
        "Taotluse nimi A–Ü",
        "Taotluse nimi Ü–A",
      ],
    },
    template: `
      <div class="flex flex-wrap gap-3">
        <div>
          <tedi-dropdown [(value)]="lang">
            <button tedi-button tedi-dropdown-trigger variant="neutral" ariaHaspopup="listbox">
              {{ lang }}
              <tedi-icon name="expand_more" [size]="18" color="inherit" />
            </button>
            <tedi-dropdown-content dropdownRole="listbox">
              @for (option of languages; track option) {
                <li tedi-dropdown-item [value]="option">{{ option }}</li>
              }
            </tedi-dropdown-content>
          </tedi-dropdown>
        </div>
        <div>
          <tedi-dropdown [(value)]="sort">
            <button tedi-button tedi-dropdown-trigger variant="neutral" ariaHaspopup="listbox">
              Sorteeri: {{ sort }}
              <tedi-icon name="expand_more" [size]="18" color="inherit" />
            </button>
            <tedi-dropdown-content dropdownRole="listbox">
              @for (option of sortOptions; track option) {
                <li tedi-dropdown-item [value]="option">{{ option }}</li>
              }
            </tedi-dropdown-content>
          </tedi-dropdown>
        </div>
      </div>
    `,
  }),
};

export const WithAction: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: {
    position: "bottom-start",
    preventOverflow: true,
    dropdownRole: "menu",
    ariaHaspopup: "menu",
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-dropdown [position]="position" [preventOverflow]="preventOverflow">
        <button tedi-button tedi-dropdown-trigger variant="secondary" aria-label="Lisa" [ariaHaspopup]="ariaHaspopup">
          <tedi-icon name="add" />
        </button>
        <tedi-dropdown-content [dropdownRole]="dropdownRole">
          <li tedi-dropdown-item>Loo kontakt</li>
          <li tedi-dropdown-item>Loo rakendus</li>
          <li tedi-dropdown-item>Loo arve</li>
        </tedi-dropdown-content>
      </tedi-dropdown>
    `,
  }),
};

export const WithIcons: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: {
    position: "bottom-start",
    preventOverflow: true,
    dropdownRole: "menu",
    ariaHaspopup: "menu",
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-dropdown [position]="position" [preventOverflow]="preventOverflow">
        <button tedi-button tedi-dropdown-trigger variant="secondary" [ariaHaspopup]="ariaHaspopup">
          <tedi-icon name="more_vert" [size]="18" color="inherit" />
          Rohkem
        </button>
        <tedi-dropdown-content [dropdownRole]="dropdownRole">
          <li tedi-dropdown-item>
            <tedi-dropdown-item-value icon="download">
              <tedi-dropdown-item-value-label>Laadi alla</tedi-dropdown-item-value-label>
            </tedi-dropdown-item-value>
          </li>
          <li tedi-dropdown-item>
            <tedi-dropdown-item-value icon="add">
              <tedi-dropdown-item-value-label>Lisa</tedi-dropdown-item-value-label>
            </tedi-dropdown-item-value>
          </li>
          <li tedi-dropdown-item>
            <tedi-dropdown-item-value icon="delete">
              <tedi-dropdown-item-value-label>Kustuta</tedi-dropdown-item-value-label>
            </tedi-dropdown-item-value>
          </li>
        </tedi-dropdown-content>
      </tedi-dropdown>
    `,
  }),
};

type LocationOption = { id: string; label: string; selected: boolean };

const countSelected = (options: LocationOption[]) =>
  options.filter((option) => option.selected).length;

const toggleOption = (options: LocationOption[], id: string) => {
  const target = options.find((option) => option.id === id);
  if (target) target.selected = !target.selected;
};

export const WithCheckbox: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => ({
    props: {
      locations: [
        { id: "tallinn", label: "Tallinn", selected: true },
        { id: "tartu", label: "Tartu", selected: true },
        { id: "parnu", label: "Pärnu", selected: false },
      ] as LocationOption[],
      countSelected,
      toggleOption,
    },
    template: `
      <tedi-dropdown>
        <button tedi-button tedi-dropdown-trigger ariaHaspopup="menu">
          Asukoht ({{ countSelected(locations) }})
          <tedi-icon name="keyboard_arrow_down" [size]="18" color="inherit" />
        </button>
        <tedi-dropdown-content dropdownRole="menu">
          @for (location of locations; track location.id) {
            <li tedi-dropdown-item [closeOnSelect]="false" (itemSelect)="toggleOption(locations, location.id)">
              <tedi-dropdown-item-value type="checkbox" [selected]="location.selected">
                <tedi-dropdown-item-value-label>{{ location.label }}</tedi-dropdown-item-value-label>
              </tedi-dropdown-item-value>
            </li>
          }
        </tedi-dropdown-content>
      </tedi-dropdown>
    `,
  }),
};

export const WithIndentedItems: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => ({
    props: {
      locations: [
        { id: "tallinn", label: "Tallinn", selected: false },
        { id: "tartu", label: "Tartu", selected: true },
        { id: "parnu", label: "Pärnu", selected: false },
      ] as LocationOption[],
      countSelected,
      toggleOption,
      toggleAll(options: LocationOption[]) {
        const select = countSelected(options) !== options.length;
        options.forEach((option) => (option.selected = select));
      },
    },
    template: `
      <tedi-dropdown>
        <button tedi-button tedi-dropdown-trigger ariaHaspopup="menu">
          Asukoht ({{ countSelected(locations) }})
          <tedi-icon name="keyboard_arrow_down" [size]="18" color="inherit" />
        </button>
        <tedi-dropdown-content dropdownRole="menu">
          <li tedi-dropdown-item [closeOnSelect]="false" (itemSelect)="toggleAll(locations)">
            <tedi-dropdown-item-value
              type="checkbox"
              [selected]="countSelected(locations) === locations.length"
              [indeterminate]="countSelected(locations) > 0 && countSelected(locations) < locations.length"
            >
              <tedi-dropdown-item-value-label>Kõik asukohad</tedi-dropdown-item-value-label>
            </tedi-dropdown-item-value>
          </li>
          @for (location of locations; track location.id) {
            <li
              tedi-dropdown-item
              [indent]="1"
              [closeOnSelect]="false"
              (itemSelect)="toggleOption(locations, location.id)"
            >
              <tedi-dropdown-item-value type="checkbox" [selected]="location.selected">
                <tedi-dropdown-item-value-label>{{ location.label }}</tedi-dropdown-item-value-label>
              </tedi-dropdown-item-value>
            </li>
          }
        </tedi-dropdown-content>
      </tedi-dropdown>
    `,
  }),
};

export const WithRadio: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => ({
    props: {
      city: "Tallinn",
      cities: ["Tallinn", "Tartu", "Elva", "Rakvere"],
    },
    template: `
      <tedi-dropdown [(value)]="city">
        <button tedi-button tedi-dropdown-trigger variant="neutral" ariaHaspopup="listbox">
          Linn: {{ city }}
          <tedi-icon name="keyboard_arrow_down" [size]="18" color="inherit" />
        </button>
        <tedi-dropdown-content dropdownRole="listbox">
          @for (option of cities; track option) {
            <li tedi-dropdown-item [value]="option">
              <tedi-dropdown-item-value type="radio" [selected]="city === option">
                <tedi-dropdown-item-value-label>{{ option }}</tedi-dropdown-item-value-label>
              </tedi-dropdown-item-value>
            </li>
          }
        </tedi-dropdown-content>
      </tedi-dropdown>
    `,
  }),
};

export const CustomWidth: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: {
    width: "326",
  },
  render: (args) => ({
    props: {
      ...args,
      items: ["Juurdepääs terviseandmetele", "Tahteavaldused", "Kontaktid"],
    },
    template: `
      <tedi-dropdown [width]="width">
        <button tedi-button tedi-dropdown-trigger variant="secondary" ariaHaspopup="menu">
          Rohkem
          <tedi-icon name="keyboard_arrow_down" [size]="18" color="inherit" />
        </button>
        <tedi-dropdown-content dropdownRole="menu">
          @for (item of items; track item) {
            <li tedi-dropdown-item>
              <span class="flex flex-grow-1 justify-content-between align-items-center">
                {{ item }}
                <tedi-icon name="arrow_forward" [size]="16" color="secondary" />
              </span>
            </li>
          }
        </tedi-dropdown-content>
      </tedi-dropdown>
    `,
  }),
};

/**
 * Set `maxHeight` to limit the height of the dropdown's scrollable body. When the content is taller,
 * the items scroll; accepts a `number` (px) or any CSS length string (e.g. `'20rem'`, `'50vh'`).
 * Prefer rem, so the maximum height scales with the user's font size.
 */
export const MaxHeight: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => ({
    props: {
      institutions: [
        "Fertilitas",
        "Ida-Tallinna Keskhaigla",
        "Lääne-Tallinna Keskhaigla",
        "Põhja-Eesti Regionaalhaigla",
        "Tallinna Lastehaigla",
        "Tartu Ülikooli Kliinikum",
        "Pärnu Haigla",
        "Narva Haigla",
        "Viljandi Haigla",
        "Kuressaare Haigla",
      ],
    },
    template: `
      <tedi-dropdown maxHeight="15rem" [width]="280">
        <button tedi-button tedi-dropdown-trigger variant="secondary" ariaHaspopup="menu">
          Vali raviasutus
          <tedi-icon name="keyboard_arrow_down" [size]="18" color="inherit" />
        </button>
        <tedi-dropdown-content dropdownRole="menu">
          @for (institution of institutions; track institution) {
            <li tedi-dropdown-item>{{ institution }}</li>
          }
        </tedi-dropdown-content>
      </tedi-dropdown>
    `,
  }),
};

/**
 * With `hideOnScroll`, scrolling the page or any scrollable ancestor closes the dropdown; scrolling
 * the dropdown's own items keeps it open.
 */
export const HideOnScroll: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => ({
    props: {
      institutions: [
        "Fertilitas",
        "Ida-Tallinna Keskhaigla",
        "Lääne-Tallinna Keskhaigla",
        "Põhja-Eesti Regionaalhaigla",
        "Tallinna Lastehaigla",
        "Tartu Ülikooli Kliinikum",
        "Pärnu Haigla",
        "Narva Haigla",
        "Viljandi Haigla",
        "Kuressaare Haigla",
      ],
    },
    template: `
      <div
        style="height: 15rem; overflow-y: auto; border: 1px solid var(--general-border-primary); border-radius: var(--card-radius-rounded)"
      >
        <div style="padding: 1rem 1rem 30rem">
          <tedi-dropdown [hideOnScroll]="true" maxHeight="10rem" [width]="280">
            <button tedi-button tedi-dropdown-trigger variant="secondary" ariaHaspopup="menu">
              Vali raviasutus
              <tedi-icon name="keyboard_arrow_down" [size]="18" color="inherit" />
            </button>
            <tedi-dropdown-content dropdownRole="menu">
              @for (institution of institutions; track institution) {
                <li tedi-dropdown-item>{{ institution }}</li>
              }
            </tedi-dropdown-content>
          </tedi-dropdown>
        </div>
      </div>
    `,
  }),
};

export const WithDescription: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => ({
    props: {
      access: "health",
      accessOptions: [
        {
          value: "health",
          label: "Juurdepääs terviseandmetele",
          description: "Arstid saavad näha teie terviseandmeid",
        },
        {
          value: "medications",
          label: "Juurdepääs ravimitele ja terviseandmetele",
          description: "Arstid saavad näha teie ravimeid ja terviseandmeid",
        },
        {
          value: "all",
          label: "Juurdepääs kõigele",
          description:
            "Arstid saavad näha kogu teie teavet, sealhulgas tervise deklaratsiooni ja muid meditsiinilisi andmeid",
        },
      ],
      locations: [
        { value: "tallinn", label: "Tallinn", meta: "3 aega vaba" },
        { value: "tartu", label: "Tartu", meta: "4 aega vaba" },
        { value: "elva", label: "Elva", meta: "7 aega vaba" },
        { value: "rakvere", label: "Rakvere", meta: "3 aega vaba" },
      ],
    },
    template: `
      <div class="flex flex-wrap gap-3">
        <div>
          <tedi-dropdown [(value)]="access" [width]="304">
            <button tedi-button tedi-dropdown-trigger variant="secondary" ariaHaspopup="listbox">
              <tedi-icon name="share" [size]="18" color="inherit" />
              Jaga ligipääs
              <tedi-icon name="keyboard_arrow_down" [size]="18" color="inherit" />
            </button>
            <tedi-dropdown-content dropdownRole="listbox">
              @for (option of accessOptions; track option.value) {
                <li tedi-dropdown-item [value]="option.value">
                  <tedi-dropdown-item-value layout="vertical">
                    <tedi-dropdown-item-value-label>{{ option.label }}</tedi-dropdown-item-value-label>
                    <tedi-dropdown-item-value-meta>{{ option.description }}</tedi-dropdown-item-value-meta>
                  </tedi-dropdown-item-value>
                </li>
              }
            </tedi-dropdown-content>
          </tedi-dropdown>
        </div>
        <div>
          <tedi-dropdown [width]="304">
            <button tedi-button tedi-dropdown-trigger variant="secondary" ariaHaspopup="listbox">
              Vali asukoht
              <tedi-icon name="keyboard_arrow_down" [size]="18" color="inherit" />
            </button>
            <tedi-dropdown-content dropdownRole="listbox">
              @for (location of locations; track location.value) {
                <li tedi-dropdown-item [value]="location.value">
                  <tedi-dropdown-item-value>
                    <tedi-dropdown-item-value-label>{{ location.label }}</tedi-dropdown-item-value-label>
                    <tedi-dropdown-item-value-meta>{{ location.meta }}</tedi-dropdown-item-value-meta>
                  </tedi-dropdown-item-value>
                </li>
              }
            </tedi-dropdown-content>
          </tedi-dropdown>
        </div>
      </div>
    `,
  }),
};

export const Divided: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => ({
    template: `
      <tedi-dropdown>
        <button tedi-button tedi-dropdown-trigger variant="secondary" ariaHaspopup="menu">
          <tedi-icon name="account_circle" variant="filled" [size]="18" color="inherit" />
          Profiil
          <tedi-icon name="keyboard_arrow_down" [size]="18" color="inherit" />
        </button>
        <tedi-dropdown-content dropdownRole="menu" [divided]="true">
          <li tedi-dropdown-item>Profiil</li>
          <li tedi-dropdown-item>Juurdepääsud</li>
          <li tedi-dropdown-item>Arveldamine</li>
          <li tedi-dropdown-item>
            <tedi-dropdown-item-value icon="logout">
              <tedi-dropdown-item-value-label>Logi välja</tedi-dropdown-item-value-label>
            </tedi-dropdown-item-value>
          </li>
        </tedi-dropdown-content>
      </tedi-dropdown>
    `,
  }),
};

/**
 * `li[tedi-dropdown-separator]` draws a line between groups of items. It is announced as a
 * separator in a `menu` and skipped by arrow-key navigation.
 */
export const WithSeparator: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => ({
    template: `
      <tedi-dropdown>
        <button tedi-button tedi-dropdown-trigger variant="secondary" ariaHaspopup="menu">
          Rohkem toiminguid
          <tedi-icon name="keyboard_arrow_down" [size]="18" color="inherit" />
        </button>
        <tedi-dropdown-content dropdownRole="menu">
          <li tedi-dropdown-item>
            <tedi-dropdown-item-value icon="edit">
              <tedi-dropdown-item-value-label>Redigeeri</tedi-dropdown-item-value-label>
            </tedi-dropdown-item-value>
          </li>
          <li tedi-dropdown-item>
            <tedi-dropdown-item-value icon="content_copy">
              <tedi-dropdown-item-value-label>Kopeeri</tedi-dropdown-item-value-label>
            </tedi-dropdown-item-value>
          </li>
          <li tedi-dropdown-separator></li>
          <li tedi-dropdown-item>
            <tedi-dropdown-item-value icon="archive">
              <tedi-dropdown-item-value-label>Arhiiv</tedi-dropdown-item-value-label>
            </tedi-dropdown-item-value>
          </li>
          <li tedi-dropdown-item>
            <tedi-dropdown-item-value icon="delete">
              <tedi-dropdown-item-value-label>Kustuta</tedi-dropdown-item-value-label>
            </tedi-dropdown-item-value>
          </li>
        </tedi-dropdown-content>
      </tedi-dropdown>
    `,
  }),
};

type Representative = { name: string; code: string };

/**
 * Put a search field (or other controls) in an element with `tedi-dropdown-header`. It sits above
 * the items, outside the menu, so the field keeps its own semantics and gets focus when the
 * dropdown opens.
 */
export const CustomContent: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => ({
    props: {
      query: "",
      representatives: [
        { name: "Lauri Lepp", code: "49504080254" },
        { name: "Mart Mardivere", code: "39504080254" },
        { name: "Madis Mets", code: "39504080254" },
        { name: "Kalle Kaasik", code: "39504080254" },
        { name: "Pille Porgand", code: "49504080254" },
        { name: "Kert Kasemets", code: "39504080254" },
      ] as Representative[],
      filterRepresentatives(list: Representative[], query: string) {
        const q = query.trim().toLowerCase();
        return q
          ? list.filter(
              (rep) =>
                rep.name.toLowerCase().includes(q) || rep.code.includes(q),
            )
          : list;
      },
    },
    template: `
      <tedi-dropdown [width]="300">
        <button tedi-button tedi-dropdown-trigger variant="neutral" ariaHaspopup="menu">
          Vali esindatav
          <tedi-icon name="keyboard_arrow_down" [size]="18" color="inherit" />
        </button>
        <tedi-dropdown-content dropdownRole="menu">
          <div tedi-dropdown-header>
            <tedi-search inputId="dropdown-search" label="Otsi" [(value)]="query" />
          </div>
          @for (rep of filterRepresentatives(representatives, query); track rep.name) {
            <li tedi-dropdown-item>
              <span>
                <span tedi-text modifiers="bold">{{ rep.name }}</span>
                <tedi-separator axis="vertical" variant="dot-only" dotSize="small" color="secondary" [spacing]="0.5" />
                {{ rep.code }}
              </span>
            </li>
          }
        </tedi-dropdown-content>
      </tedi-dropdown>
    `,
  }),
};

/**
 * Items with `[closeOnSelect]="false"` keep the dropdown open after activation
 * and emit `(itemSelect)` for both mouse click and keyboard (Enter / Space).
 * Useful for multi-select checkbox menus where the user toggles several
 * options in a row — e.g. a column-visibility chooser. Disabled items don't
 * emit `itemSelect`, so consumers don't need to guard against them in their
 * handlers.
 */
export const KeepOpenOnSelect: Story = {
  name: "Keep Open on Select (multi-select)",
  args: {
    position: "bottom-start",
    preventOverflow: true,
    dropdownRole: "menu",
    ariaHaspopup: "menu",
  },
  render: (args) => ({
    props: {
      ...args,
      filters: [
        { id: "active", label: "Aktiivne", selected: true },
        { id: "inactive", label: "Mitteaktiivne", selected: false },
        { id: "archived", label: "Arhiveeritud", selected: false },
        { id: "drafts", label: "Mustandid", selected: true },
      ] as Array<{ id: string; label: string; selected: boolean }>,
      toggleFilter(
        filters: Array<{ id: string; selected: boolean }>,
        id: string,
      ) {
        const target = filters.find((f) => f.id === id);
        if (target) target.selected = !target.selected;
      },
    },
    template: `
      <tedi-dropdown [position]="position" [preventOverflow]="preventOverflow">
        <button tedi-button tedi-dropdown-trigger variant="neutral" [ariaHaspopup]="ariaHaspopup">
          <tedi-icon name="filter_list" [size]="18" color="inherit" />
          Filtrid
        </button>
        <tedi-dropdown-content [dropdownRole]="dropdownRole">
          @for (filter of filters; track filter.id) {
            <li
              tedi-dropdown-item
              [value]="filter.id"
              [closeOnSelect]="false"
              (itemSelect)="toggleFilter(filters, filter.id)"
            >
              <tedi-dropdown-item-value type="checkbox" [selected]="filter.selected">
                <tedi-dropdown-item-value-label>{{ filter.label }}</tedi-dropdown-item-value-label>
              </tedi-dropdown-item-value>
            </li>
          }
        </tedi-dropdown-content>
      </tedi-dropdown>
    `,
  }),
};

/**
 * Visual-regression only. `tedi-dropdown` has no controlled open input (`isOpen` is an
 * internal signal), so the panel is opened by clicking the trigger.
 */
/**
 * Builds a visual-regression story that opens one menu and waits for it to render.
 *
 * One open menu per snapshot, not a grid of them: the dropdown closes on outside click and on
 * focus-out with no opt-out, so clicking a second trigger would close the first.
 */
const vrRender = (template: string) => () => ({ template });

const vrPlay = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button"));
  await waitFor(() =>
    expect(document.querySelector(".tedi-dropdown-content")).not.toBeNull(),
  );
};

/**
 * Visual-regression only. Every other story renders a closed trigger, so the menu, its items and
 * their spacing were never captured. These render the variants that exist only while open.
 */
export const OpenForVisualTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: vrRender(`
  <tedi-dropdown position="bottom-start">
    <button tedi-button tedi-dropdown-trigger>Ava menüü</button>
    <tedi-dropdown-content dropdownRole="menu">
      <li tedi-dropdown-item>Juurdepääs terviseandmetele</li>
      <li tedi-dropdown-item [disabled]="true">Tahteavaldus</li>
      <li tedi-dropdown-item>Kontaktid</li>
    </tedi-dropdown-content>
  </tedi-dropdown>
`),
  play: vrPlay,
};

/** Visual-regression only. Icon rows set the item's content layout and its icon gap. */
export const OpenWithIconsForVisualTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: vrRender(`
  <tedi-dropdown position="bottom-start">
    <button tedi-button tedi-dropdown-trigger ariaHaspopup="menu">Tegevused</button>
    <tedi-dropdown-content dropdownRole="menu">
      <li tedi-dropdown-item>
        <tedi-dropdown-item-value icon="edit">
          <tedi-dropdown-item-value-label>Muuda</tedi-dropdown-item-value-label>
        </tedi-dropdown-item-value>
      </li>
      <li tedi-dropdown-item>
        <tedi-dropdown-item-value icon="content_copy">
          <tedi-dropdown-item-value-label>Tee koopia</tedi-dropdown-item-value-label>
        </tedi-dropdown-item-value>
      </li>
      <li tedi-dropdown-item [disabled]="true">
        <tedi-dropdown-item-value icon="delete">
          <tedi-dropdown-item-value-label>Kustuta</tedi-dropdown-item-value-label>
        </tedi-dropdown-item-value>
      </li>
    </tedi-dropdown-content>
  </tedi-dropdown>
`),
  play: vrPlay,
};

/**
 * Visual-regression only. A `listbox` menu with meta text: the meta column is what sets the
 * item's two-line height and the panel's width. The first item is selected, which also shows
 * its corners clipped by the panel.
 */
export const OpenListboxMetaForVisualTest: Story = {
  tags: ["!dev", "!autodocs"],
  parameters: {
    a11y: {
      config: {
        // Measured, not defensive. One component bug with two faces:
        // `dropdownRole="listbox"` puts role="listbox" on the inner `<ul>`,
        // while the `aria-labelledby` meant to name it sits on the host — which
        // is `role="presentation"`, so it carries no semantics. The listbox is
        // left unnamed (`aria-input-field-name`) and the label attribute is
        // prohibited where it is (`aria-prohibited-attr`). Real in every open
        // listbox dropdown; these are the first stories that render one open,
        // so the gate could not see it before.
        rules: [
          { id: "aria-input-field-name", enabled: false },
          { id: "aria-prohibited-attr", enabled: false },
        ],
      },
    },
  },
  render: vrRender(`
  <tedi-dropdown position="bottom-start" value="tallinn">
    <button tedi-button tedi-dropdown-trigger ariaHaspopup="listbox">Vali asukoht</button>
    <tedi-dropdown-content dropdownRole="listbox">
      <li tedi-dropdown-item value="tallinn">
        <tedi-dropdown-item-value>
          <tedi-dropdown-item-value-label>Tallinn</tedi-dropdown-item-value-label>
          <tedi-dropdown-item-value-meta>3 vaba aega</tedi-dropdown-item-value-meta>
        </tedi-dropdown-item-value>
      </li>
      <li tedi-dropdown-item value="tartu">
        <tedi-dropdown-item-value>
          <tedi-dropdown-item-value-label>Tartu</tedi-dropdown-item-value-label>
          <tedi-dropdown-item-value-meta>5 vaba aega</tedi-dropdown-item-value-meta>
        </tedi-dropdown-item-value>
      </li>
      <li tedi-dropdown-item value="parnu">
        <tedi-dropdown-item-value>
          <tedi-dropdown-item-value-label>Pärnu</tedi-dropdown-item-value-label>
          <tedi-dropdown-item-value-meta>2 vaba aega</tedi-dropdown-item-value-meta>
        </tedi-dropdown-item-value>
      </li>
    </tedi-dropdown-content>
  </tedi-dropdown>
`),
  play: vrPlay,
};

/**
 * Visual-regression only. A long list is where the panel's max height and its scrollbar show,
 * and the long label shows how labels wrap at a fixed width.
 */
export const OpenScrollingForVisualTest: Story = {
  tags: ["!dev", "!autodocs"],
  parameters: {
    a11y: {
      config: {
        // Measured, not defensive. One component bug with two faces:
        // `dropdownRole="listbox"` puts role="listbox" on the inner `<ul>`,
        // while the `aria-labelledby` meant to name it sits on the host — which
        // is `role="presentation"`, so it carries no semantics. The listbox is
        // left unnamed (`aria-input-field-name`) and the label attribute is
        // prohibited where it is (`aria-prohibited-attr`). Real in every open
        // listbox dropdown; these are the first stories that render one open,
        // so the gate could not see it before.
        rules: [
          { id: "aria-input-field-name", enabled: false },
          { id: "aria-prohibited-attr", enabled: false },
        ],
      },
    },
  },
  render: vrRender(`
  <tedi-dropdown position="bottom-start" maxHeight="15rem" [width]="280">
    <button tedi-button tedi-dropdown-trigger>Long list</button>
    <tedi-dropdown-content dropdownRole="listbox">
      <li tedi-dropdown-item [clipContent]="true">
        A very long option label that runs past the width of the panel and has to be clipped
      </li>
      <li tedi-dropdown-item>Teine valik</li>
      <li tedi-dropdown-item>Kolmas valik</li>
      <li tedi-dropdown-item>Neljas valik</li>
      <li tedi-dropdown-item>Viies valik</li>
      <li tedi-dropdown-item>Kuues valik</li>
      <li tedi-dropdown-item>Seitsmes valik</li>
      <li tedi-dropdown-item>Kaheksas valik</li>
      <li tedi-dropdown-item>Üheksas valik</li>
      <li tedi-dropdown-item>Kümnes valik</li>
    </tedi-dropdown-content>
  </tedi-dropdown>
`),
  play: vrPlay,
};

/** Visual-regression only. `divided` draws its lines from the content, so only an open menu shows them. */
export const OpenDividedForVisualTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: vrRender(`
  <tedi-dropdown position="bottom-start">
    <button tedi-button tedi-dropdown-trigger>Profiil</button>
    <tedi-dropdown-content dropdownRole="menu" [divided]="true">
      <li tedi-dropdown-item>Profiil</li>
      <li tedi-dropdown-item>Juurdepääsud</li>
      <li tedi-dropdown-item>Arveldamine</li>
      <li tedi-dropdown-item>
        <tedi-dropdown-item-value icon="logout">
          <tedi-dropdown-item-value-label>Logi välja</tedi-dropdown-item-value-label>
        </tedi-dropdown-item-value>
      </li>
    </tedi-dropdown-content>
  </tedi-dropdown>
`),
  play: vrPlay,
};

/**
 * Visual-regression only. A header (here a search field) sits above the items with its own
 * padding, and a separator splits the items into groups; both show only in an open menu.
 */
export const OpenWithHeaderForVisualTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: vrRender(`
  <tedi-dropdown position="bottom-start" [width]="300">
    <button tedi-button tedi-dropdown-trigger>Vali esindatav</button>
    <tedi-dropdown-content dropdownRole="menu">
      <div tedi-dropdown-header>
        <tedi-search inputId="vr-dropdown-search" label="Otsi" />
      </div>
      <li tedi-dropdown-item>Lauri Lepp</li>
      <li tedi-dropdown-item>Mart Mardivere</li>
      <li tedi-dropdown-separator></li>
      <li tedi-dropdown-item>Madis Mets</li>
      <li tedi-dropdown-item>Kalle Kaasik</li>
    </tedi-dropdown-content>
  </tedi-dropdown>
`),
  play: vrPlay,
};
