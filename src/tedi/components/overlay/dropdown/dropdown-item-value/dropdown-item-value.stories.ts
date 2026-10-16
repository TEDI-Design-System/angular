import {
  Component,
  forwardRef,
  input,
  linkedSignal,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";
import { DropdownItemValueComponent } from "./dropdown-item-value.component";
import { DropdownItemValueLabelComponent } from "./dropdown-item-value-label.component";
import { DropdownItemValueMetaComponent } from "./dropdown-item-value-meta.component";
import { IconComponent } from "../../../base";
import { DropdownItemComponent } from "../dropdown-item/dropdown-item.component";
import {
  DROPDOWN_API,
  DROPDOWN_CONTENT_API,
  DropdownApi,
  DropdownContentApi,
  DropdownRole,
  DropdownVariant,
} from "../dropdown.tokens";
import { RowComponent } from "../../../helpers/grid/row/row.component";
import { ColComponent } from "../../../helpers/grid/col/col.component";

const noop = () => undefined;

/**
 * Renders real `li[tedi-dropdown-item]`s outside an open dropdown, so their states can be shown
 * side by side. Stands in for the dropdown as a `listbox`; `selectedValue` sets which item looks
 * selected.
 */
@Component({
  selector: "ul[app-dropdown-item-showcase]",
  standalone: true,
  template: "<ng-content />",
  encapsulation: ViewEncapsulation.None,
  host: { role: "listbox", "aria-label": "Näidis" },
  providers: [
    {
      provide: DROPDOWN_API,
      useExisting: forwardRef(() => DropdownItemShowcaseComponent),
    },
    {
      provide: DROPDOWN_CONTENT_API,
      useExisting: forwardRef(() => DropdownItemShowcaseComponent),
    },
  ],
})
class DropdownItemShowcaseComponent implements DropdownApi, DropdownContentApi {
  /** Value of the item shown as selected. */
  readonly selectedValue = input<string>();
  readonly variant = input<DropdownVariant>("default");

  // Read-only: clicking an item in a listbox selects it, which would change what the story shows.
  readonly value = Object.assign(
    linkedSignal<string | undefined>(() => this.selectedValue()),
    { set: noop, update: noop },
  );

  readonly dropdownRole = signal<DropdownRole>("listbox");
  readonly isWidget = signal(true);
  readonly containerId = signal("dropdown-item-showcase");

  focusNextItem = noop;
  focusPrevItem = noop;
  focusFirstItem = noop;
  focusLastItem = noop;
  hideDropdown = noop;
  closeAndFocusTrigger = noop;
  tabOutOfDropdown = noop;
  dropdownTrigger = noop;
}

const MENU_STYLE =
  "display: flex; flex-direction: column; width: 100%; max-width: 304px; padding: 0; margin: 0; overflow: hidden; " +
  "background: var(--dropdown-item-default-background); border: 1px solid var(--card-border-primary); " +
  "border-radius: var(--form-select-area-radius); box-shadow: 0 1px 5px 0 var(--tedi-alpha-20)";

const STATES = [
  "Default",
  "Hover",
  "Active",
  "Selected",
  "Disabled",
  "Focus",
] as const;

// "Show code" snippets. The stories render items in a stand-in menu so they can be shown side by
// side; these show how the same items are used in a real dropdown.
const SOURCE = {
  items: `<tedi-dropdown>
  <button tedi-button tedi-dropdown-trigger>Ava menüü</button>
  <tedi-dropdown-content>
    <li tedi-dropdown-item>
      <tedi-dropdown-item-value>
        <tedi-dropdown-item-value-label>Juurdepääs terviseandmetele</tedi-dropdown-item-value-label>
      </tedi-dropdown-item-value>
    </li>
    <li tedi-dropdown-item [indent]="2">
      <tedi-dropdown-item-value>
        <tedi-dropdown-item-value-label>2nd level</tedi-dropdown-item-value-label>
      </tedi-dropdown-item-value>
    </li>
  </tedi-dropdown-content>
</tedi-dropdown>`,

  checkbox: `<tedi-dropdown>
  <button tedi-button tedi-dropdown-trigger>Asukoht ({{ selectedCount }})</button>
  <tedi-dropdown-content>
    <li tedi-dropdown-item [closeOnSelect]="false" (itemSelect)="toggleAll()">
      <tedi-dropdown-item-value type="checkbox" [selected]="allSelected" [indeterminate]="someSelected">
        <tedi-dropdown-item-value-label>Asukohad</tedi-dropdown-item-value-label>
      </tedi-dropdown-item-value>
    </li>
    @for (city of cities; track city) {
      <li tedi-dropdown-item [indent]="2" [closeOnSelect]="false" (itemSelect)="toggle(city)">
        <tedi-dropdown-item-value type="checkbox" [selected]="isSelected(city)">
          <tedi-dropdown-item-value-label>{{ city }}</tedi-dropdown-item-value-label>
        </tedi-dropdown-item-value>
      </li>
    }
  </tedi-dropdown-content>
</tedi-dropdown>`,

  radio: `<tedi-dropdown [(value)]="city">
  <button tedi-button tedi-dropdown-trigger>Linn: {{ city }}</button>
  <tedi-dropdown-content dropdownRole="listbox">
    @for (option of cities; track option) {
      <li tedi-dropdown-item [value]="option">
        <tedi-dropdown-item-value type="radio" [selected]="city === option">
          <tedi-dropdown-item-value-label>{{ option }}</tedi-dropdown-item-value-label>
        </tedi-dropdown-item-value>
      </li>
    }
  </tedi-dropdown-content>
</tedi-dropdown>`,

  icon: `<tedi-dropdown>
  <button tedi-button tedi-dropdown-trigger>Ava menüü</button>
  <tedi-dropdown-content>
    <li tedi-dropdown-item>
      <tedi-dropdown-item-value icon="download">
        <tedi-dropdown-item-value-label>Laadi alla</tedi-dropdown-item-value-label>
      </tedi-dropdown-item-value>
    </li>
    <li tedi-dropdown-item>
      <tedi-dropdown-item-value>
        <tedi-dropdown-item-value-label>Kontaktid</tedi-dropdown-item-value-label>
        <tedi-dropdown-item-value-meta>
          <tedi-icon name="arrow_forward" [size]="16" color="secondary" />
        </tedi-dropdown-item-value-meta>
      </tedi-dropdown-item-value>
    </li>
  </tedi-dropdown-content>
</tedi-dropdown>`,

  description: `<tedi-dropdown>
  <button tedi-button tedi-dropdown-trigger>Ava menüü</button>
  <tedi-dropdown-content>
    <li tedi-dropdown-item>
      <tedi-dropdown-item-value layout="vertical">
        <tedi-dropdown-item-value-label>Juurdepääs terviseandmetele</tedi-dropdown-item-value-label>
        <tedi-dropdown-item-value-meta>Arstid näevad sinu terviseandmeid</tedi-dropdown-item-value-meta>
      </tedi-dropdown-item-value>
    </li>
    <li tedi-dropdown-item>
      <tedi-dropdown-item-value>
        <tedi-dropdown-item-value-label>Tallinn</tedi-dropdown-item-value-label>
        <tedi-dropdown-item-value-meta>3 vaba aega saadaval</tedi-dropdown-item-value-meta>
      </tedi-dropdown-item-value>
    </li>
  </tedi-dropdown-content>
</tedi-dropdown>`,

  tree: `<tedi-dropdown>
  <button tedi-button tedi-dropdown-trigger>Ava menüü</button>
  <tedi-dropdown-content variant="tree">
    <li tedi-dropdown-item [indent]="1" [isParent]="true">
      <tedi-dropdown-item-value>
        <tedi-dropdown-item-value-label>Parent</tedi-dropdown-item-value-label>
      </tedi-dropdown-item-value>
    </li>
    <li tedi-dropdown-item [indent]="1">
      <tedi-dropdown-item-value>
        <tedi-dropdown-item-value-label>Child 1</tedi-dropdown-item-value-label>
      </tedi-dropdown-item-value>
    </li>
  </tedi-dropdown-content>
</tedi-dropdown>`,

  states: `<tedi-dropdown value="selected">
  <button tedi-button tedi-dropdown-trigger>Ava menüü</button>
  <tedi-dropdown-content dropdownRole="listbox">
    <li tedi-dropdown-item value="selected">
      <tedi-dropdown-item-value>
        <tedi-dropdown-item-value-label>Tekst</tedi-dropdown-item-value-label>
      </tedi-dropdown-item-value>
    </li>
    <li tedi-dropdown-item value="disabled" [disabled]="true">
      <tedi-dropdown-item-value>
        <tedi-dropdown-item-value-label>Tekst</tedi-dropdown-item-value-label>
      </tedi-dropdown-item-value>
    </li>
  </tedi-dropdown-content>
</tedi-dropdown>`,

  position: `<tedi-dropdown>
  <button tedi-button tedi-dropdown-trigger>Ava menüü</button>
  <tedi-dropdown-content>
    <li tedi-dropdown-item>
      <tedi-dropdown-item-value>
        <tedi-dropdown-item-value-label>Top</tedi-dropdown-item-value-label>
      </tedi-dropdown-item-value>
    </li>
    <li tedi-dropdown-item>
      <tedi-dropdown-item-value>
        <tedi-dropdown-item-value-label>Middle</tedi-dropdown-item-value-label>
      </tedi-dropdown-item-value>
    </li>
    <li tedi-dropdown-item>
      <tedi-dropdown-item-value>
        <tedi-dropdown-item-value-label>Bottom</tedi-dropdown-item-value-label>
      </tedi-dropdown-item-value>
    </li>
  </tedi-dropdown-content>
</tedi-dropdown>`,
};

const sourceParams = (code: string) => ({
  docs: { source: { language: "html", code } },
});

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.56.78?node-id=9542-70948&m=dev" target="_blank">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/0930a9-dropdown-item" target="_blank">Zeroheight ↗</a>
 */

export default {
  title: "TEDI-Ready/Components/Overlay/DropdownItemValue",
  component: DropdownItemValueComponent,
  decorators: [
    moduleMetadata({
      imports: [
        DropdownItemValueComponent,
        DropdownItemValueLabelComponent,
        DropdownItemValueMetaComponent,
        IconComponent,
        DropdownItemComponent,
        DropdownItemShowcaseComponent,
        RowComponent,
        ColComponent,
      ],
    }),
  ],
  argTypes: {
    type: {
      control: "radio",
      options: ["default", "checkbox", "radio"],
      description: "Type of selection indicator",
      table: {
        type: { summary: "DropdownItemValueType" },
        defaultValue: { summary: "default" },
      },
    },
    layout: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Whether the label and meta sit side by side or stacked.",
      table: {
        type: { summary: "DropdownItemValueLayout" },
        defaultValue: { summary: "horizontal" },
      },
    },
    selected: {
      control: "boolean",
      description: "Whether the checkbox or radio is checked.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    indeterminate: {
      control: "boolean",
      description: "Whether the checkbox is partly checked.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    disabled: {
      control: "boolean",
      description: "Whether the item is disabled.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    icon: {
      control: "text",
      description:
        "Leading icon name, or an object to override its size, colour, type or variant.",
      table: {
        type: { summary: "string | DropdownItemValueIcon" },
      },
    },
    clipContent: {
      control: "boolean",
      description:
        "`tedi-dropdown-item-value-label` input. Whether the label clips overflowing content for text ellipsis. Set `false` when the label holds decorations that sit outside the line box (e.g. status indicator), so they are not cut off.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
  },
  args: {
    type: "default",
    layout: "horizontal",
    selected: false,
    indeterminate: false,
    disabled: false,
    clipContent: true,
  },
} as Meta<DropdownItemValueComponent>;

type Story = StoryObj<DropdownItemValueComponent>;

export const Default: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
    docs: {
      description: {
        story: `
The DropdownItemValue component provides a reusable structure for rendering option content
in both Select and Dropdown components. It supports built-in checkbox/radio indicators
and flexible layouts for label and meta text.

Used in [Dropdown](/docs/tedi-ready-components-overlay-dropdown--docs),
[Select](/docs/tedi-ready-components-form-select--docs),
[Search](/docs/tedi-ready-components-form-search--docs) and
[Popover](/docs/tedi-ready-components-overlay-popover--docs) — see their stories for
examples in context.
`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-dropdown-item-value [type]="type" [layout]="layout" [selected]="selected" [indeterminate]="indeterminate" [disabled]="disabled" [icon]="icon">
        <tedi-dropdown-item-value-label [clipContent]="clipContent">Valik 1</tedi-dropdown-item-value-label>
      </tedi-dropdown-item-value>
    `,
  }),
};

/**
 * Plain items, and a nested set indented by level.
 */
export const Items: Story = {
  parameters: sourceParams(SOURCE.items),
  render: () => ({
    props: {
      menuStyle: MENU_STYLE,
      items: ["Juurdepääs terviseandmetele", "Tahteavaldus", "Kontaktid"],
      levels: [
        { label: "1st level", indent: 0 },
        { label: "2nd level", indent: 2 },
        { label: "3rd level", indent: 4 },
        { label: "3rd level", indent: 4 },
        { label: "4th level", indent: 6 },
      ],
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start">
        <ul app-dropdown-item-showcase [style]="menuStyle">
          @for (item of items; track item) {
            <li tedi-dropdown-item [value]="item">
              <tedi-dropdown-item-value>
                <tedi-dropdown-item-value-label>{{ item }}</tedi-dropdown-item-value-label>
              </tedi-dropdown-item-value>
            </li>
          }
        </ul>
        <ul app-dropdown-item-showcase [style]="menuStyle">
          @for (level of levels; track $index) {
            <li tedi-dropdown-item [value]="'level-' + $index" [indent]="level.indent">
              <tedi-dropdown-item-value>
                <tedi-dropdown-item-value-label>{{ level.label }}</tedi-dropdown-item-value-label>
              </tedi-dropdown-item-value>
            </li>
          }
        </ul>
      </div>
    `,
  }),
};

const CHECKBOX_GROUPS = [
  { label: "Asukohad", children: ["Tallinn", "Tartu"] },
  { label: "Arstid", children: ["Mari Allikas", "Tõnu Liblikas"] },
  { label: "Haiglad", children: ["PERH", "ITK", "Fertilitas"] },
];

const CHECKBOX_LEVELS = ["1st level", "2nd level", "3rd level", "4th level"];

/**
 * Checkbox items for multi-select: groups whose checkbox reflects their items (checked, or
 * indeterminate when only some are), a flat list, and a nested set indented by level.
 */
export const WithCheckbox: Story = {
  parameters: sourceParams(SOURCE.checkbox),
  render: () => {
    const checked = signal<string[]>(["Tartu"]);
    const isChecked = (key: string) => checked().includes(key);

    return {
      props: {
        menuStyle: MENU_STYLE,
        groups: CHECKBOX_GROUPS,
        levels: CHECKBOX_LEVELS,
        isChecked,
        allChecked: (keys: string[]) => keys.every(isChecked),
        someChecked: (keys: string[]) =>
          keys.some(isChecked) && !keys.every(isChecked),
        toggle: (key: string) =>
          checked.update((current) =>
            current.includes(key)
              ? current.filter((k) => k !== key)
              : [...current, key],
          ),
        toggleAll: (keys: string[]) => {
          const on = !keys.every(isChecked);
          checked.update((current) =>
            on
              ? [...current, ...keys.filter((k) => !current.includes(k))]
              : current.filter((k) => !keys.includes(k)),
          );
        },
      },
      template: `
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start">
          <ul app-dropdown-item-showcase [style]="menuStyle">
            @for (group of groups; track group.label) {
              <li tedi-dropdown-item [value]="group.label" [closeOnSelect]="false" (itemSelect)="toggleAll(group.children)">
                <tedi-dropdown-item-value
                  type="checkbox"
                  [selected]="allChecked(group.children)"
                  [indeterminate]="someChecked(group.children)"
                >
                  <tedi-dropdown-item-value-label>{{ group.label }}</tedi-dropdown-item-value-label>
                </tedi-dropdown-item-value>
              </li>
              @for (child of group.children; track child) {
                <li tedi-dropdown-item [value]="child" [indent]="2" [closeOnSelect]="false" (itemSelect)="toggle(child)">
                  <tedi-dropdown-item-value type="checkbox" [selected]="isChecked(child)">
                    <tedi-dropdown-item-value-label>{{ child }}</tedi-dropdown-item-value-label>
                  </tedi-dropdown-item-value>
                </li>
              }
            }
          </ul>
          <ul app-dropdown-item-showcase [style]="menuStyle">
            @for (group of groups; track group.label) {
              <li tedi-dropdown-item [value]="'flat-' + group.label" [closeOnSelect]="false" (itemSelect)="toggle('flat-' + group.label)">
                <tedi-dropdown-item-value type="checkbox" [selected]="isChecked('flat-' + group.label)">
                  <tedi-dropdown-item-value-label>{{ group.label }}</tedi-dropdown-item-value-label>
                </tedi-dropdown-item-value>
              </li>
            }
          </ul>
          <ul app-dropdown-item-showcase [style]="menuStyle">
            @for (level of levels; track $index) {
              <li tedi-dropdown-item [value]="'level-' + $index" [indent]="$index * 2" [closeOnSelect]="false" (itemSelect)="toggle('level-' + $index)">
                <tedi-dropdown-item-value type="checkbox" [selected]="isChecked('level-' + $index)">
                  <tedi-dropdown-item-value-label>{{ level }}</tedi-dropdown-item-value-label>
                </tedi-dropdown-item-value>
              </li>
            }
          </ul>
        </div>
      `,
    };
  },
};

export const WithRadio: Story = {
  parameters: sourceParams(SOURCE.radio),
  render: () => {
    const selected = signal("Tallinn");

    return {
      props: {
        menuStyle: MENU_STYLE,
        cities: ["Tallinn", "Tartu", "Elva", "Rakvere"],
        selected,
      },
      template: `
        <ul app-dropdown-item-showcase [style]="menuStyle">
          @for (city of cities; track city) {
            <li tedi-dropdown-item [value]="city" [closeOnSelect]="false" (itemSelect)="selected.set(city)">
              <tedi-dropdown-item-value type="radio" [selected]="selected() === city">
                <tedi-dropdown-item-value-label>{{ city }}</tedi-dropdown-item-value-label>
              </tedi-dropdown-item-value>
            </li>
          }
        </ul>
      `,
    };
  },
};

export const WithIcon: Story = {
  parameters: sourceParams(SOURCE.icon),
  render: () => ({
    props: {
      menuStyle: MENU_STYLE,
      links: ["Juurdepääs terviseandmetele", "Tahteavaldus", "Kontaktid"],
      actions: [
        { icon: "download", label: "Laadi alla" },
        { icon: "add", label: "Lisa" },
        { icon: "delete", label: "Kustuta" },
      ],
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start">
        <ul app-dropdown-item-showcase [style]="menuStyle">
          @for (link of links; track link) {
            <li tedi-dropdown-item [value]="link">
              <tedi-dropdown-item-value>
                <tedi-dropdown-item-value-label>{{ link }}</tedi-dropdown-item-value-label>
                <tedi-dropdown-item-value-meta>
                  <tedi-icon name="arrow_forward" [size]="16" color="secondary" />
                </tedi-dropdown-item-value-meta>
              </tedi-dropdown-item-value>
            </li>
          }
        </ul>
        <ul app-dropdown-item-showcase [style]="menuStyle">
          @for (action of actions; track action.label) {
            <li tedi-dropdown-item [value]="action.label">
              <tedi-dropdown-item-value [icon]="action.icon">
                <tedi-dropdown-item-value-label>{{ action.label }}</tedi-dropdown-item-value-label>
              </tedi-dropdown-item-value>
            </li>
          }
        </ul>
      </div>
    `,
  }),
};

export const WithDescription: Story = {
  parameters: sourceParams(SOURCE.description),
  render: () => ({
    props: {
      menuStyle: MENU_STYLE,
      accessOptions: [
        {
          value: "selected",
          label: "Juurdepääs terviseandmetele",
          description: "Arstid näevad sinu terviseandmeid",
        },
        {
          value: "medications",
          label: "Juurdepääs ravimitele ja terviseandmetele",
          description: "Arstid näevad sinu ravimeid ja terviseandmeid",
        },
        {
          value: "all",
          label: "Juurdepääs kõigele",
          description:
            "Arstid näevad kõiki sinu andmeid, sh terviseteatist ja muud meditsiinilist teavet",
        },
      ],
      locations: [
        { label: "Tallinn", meta: "3 vaba aega saadaval" },
        { label: "Tartu", meta: "4 vaba aega saadaval" },
        { label: "Elva", meta: "7 vaba aega saadaval" },
        { label: "Rakvere", meta: "3 vaba aega saadaval" },
      ],
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start">
        <ul app-dropdown-item-showcase selectedValue="selected" [style]="menuStyle">
          @for (option of accessOptions; track option.value) {
            <li tedi-dropdown-item [value]="option.value">
              <tedi-dropdown-item-value layout="vertical">
                <tedi-dropdown-item-value-label>{{ option.label }}</tedi-dropdown-item-value-label>
                <tedi-dropdown-item-value-meta>{{ option.description }}</tedi-dropdown-item-value-meta>
              </tedi-dropdown-item-value>
            </li>
          }
        </ul>
        <ul app-dropdown-item-showcase [style]="menuStyle">
          @for (location of locations; track location.label) {
            <li tedi-dropdown-item [value]="location.label">
              <tedi-dropdown-item-value>
                <tedi-dropdown-item-value-label>{{ location.label }}</tedi-dropdown-item-value-label>
                <tedi-dropdown-item-value-meta>{{ location.meta }}</tedi-dropdown-item-value-meta>
              </tedi-dropdown-item-value>
            </li>
          }
        </ul>
      </div>
    `,
  }),
};

/**
 * Tree variant: indented items draw connector lines to their parent. Left: the parent sits at
 * the top level; right: each parent is indented onto the line (`[indent]="1"` + `isParent`), so
 * the line branches from the parent's bullet.
 */
export const WithTree: Story = {
  parameters: sourceParams(SOURCE.tree),
  render: () => ({
    props: {
      menuStyle: MENU_STYLE,
      children: ["Child 1", "Child 2", "Child 3"],
      groups: ["first", "second"],
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start">
        <ul app-dropdown-item-showcase variant="tree" [style]="menuStyle">
          <li tedi-dropdown-item value="parent">
            <tedi-dropdown-item-value>
              <tedi-dropdown-item-value-label>Parent</tedi-dropdown-item-value-label>
            </tedi-dropdown-item-value>
          </li>
          @for (child of children; track child) {
            <li tedi-dropdown-item [value]="child" [indent]="1">
              <tedi-dropdown-item-value>
                <tedi-dropdown-item-value-label>{{ child }}</tedi-dropdown-item-value-label>
              </tedi-dropdown-item-value>
            </li>
          }
        </ul>
        <ul app-dropdown-item-showcase variant="tree" [style]="menuStyle">
          @for (group of groups; track group) {
            <li tedi-dropdown-item [value]="group + '-parent'" [indent]="1" [isParent]="true">
              <tedi-dropdown-item-value>
                <tedi-dropdown-item-value-label>Parent</tedi-dropdown-item-value-label>
              </tedi-dropdown-item-value>
            </li>
            @for (child of children; track child) {
              <li tedi-dropdown-item [value]="group + '-' + child" [indent]="1">
                <tedi-dropdown-item-value>
                  <tedi-dropdown-item-value-label>{{ child }}</tedi-dropdown-item-value-label>
                </tedi-dropdown-item-value>
              </li>
            }
          }
        </ul>
      </div>
    `,
  }),
};

/**
 * The first and last items follow the dropdown's rounded corners; items in between stay square.
 * Shown with all items hovered.
 */
export const Position: Story = {
  parameters: {
    ...sourceParams(SOURCE.position),
    pseudo: {
      hover: ["#Position-top", "#Position-middle", "#Position-bottom"],
    },
  },
  render: () => ({
    props: {
      positions: [
        { id: "top", label: "Top" },
        { id: "middle", label: "Middle" },
        { id: "bottom", label: "Bottom" },
      ],
    },
    template: `
      <ul
        app-dropdown-item-showcase
        style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 304px; padding: 0; margin: 0; overflow: hidden; border-radius: var(--dropdown-item-radius)"
      >
        @for (position of positions; track position.id) {
          <li tedi-dropdown-item [id]="'Position-' + position.id" [value]="position.id">
            <tedi-dropdown-item-value>
              <tedi-dropdown-item-value-label>{{ position.label }}</tedi-dropdown-item-value-label>
            </tedi-dropdown-item-value>
          </li>
        }
      </ul>
    `,
  }),
};

export const States: Story = {
  parameters: {
    ...sourceParams(SOURCE.states),
    pseudo: {
      hover: ["#Hover-label", "#Hover-icon", "#Hover-meta"],
      active: ["#Active-label", "#Active-icon", "#Active-meta"],
      focusVisible: ["#Focus-label", "#Focus-icon", "#Focus-meta"],
    },
  },
  render: () => ({
    props: { states: STATES },
    template: `
      <tedi-row [cols]="1" [md]="{ cols: 4 }" [gapX]="3" [gapY]="2" alignItems="center">
        @for (state of states; track state) {
          <tedi-col><strong>{{ state }}</strong></tedi-col>
          <tedi-col>
            <ul app-dropdown-item-showcase selectedValue="selected" style="padding: 0; margin: 0">
              <li
                tedi-dropdown-item
                [id]="state + '-label'"
                [value]="state === 'Selected' ? 'selected' : state + '-label'"
                [disabled]="state === 'Disabled'"
              >
                <tedi-dropdown-item-value>
                  <tedi-dropdown-item-value-label>Tekst</tedi-dropdown-item-value-label>
                </tedi-dropdown-item-value>
              </li>
            </ul>
          </tedi-col>
          <tedi-col>
            <ul app-dropdown-item-showcase selectedValue="selected" style="padding: 0; margin: 0">
              <li
                tedi-dropdown-item
                [id]="state + '-icon'"
                [value]="state === 'Selected' ? 'selected' : state + '-icon'"
                [disabled]="state === 'Disabled'"
              >
                <tedi-dropdown-item-value icon="download">
                  <tedi-dropdown-item-value-label>Tekst</tedi-dropdown-item-value-label>
                </tedi-dropdown-item-value>
              </li>
            </ul>
          </tedi-col>
          <tedi-col>
            <ul app-dropdown-item-showcase selectedValue="selected" style="padding: 0; margin: 0">
              <li
                tedi-dropdown-item
                [id]="state + '-meta'"
                [value]="state === 'Selected' ? 'selected' : state + '-meta'"
                [disabled]="state === 'Disabled'"
              >
                <tedi-dropdown-item-value>
                  <tedi-dropdown-item-value-label>Tekst</tedi-dropdown-item-value-label>
                  <tedi-dropdown-item-value-meta>Tekst</tedi-dropdown-item-value-meta>
                </tedi-dropdown-item-value>
              </li>
            </ul>
          </tedi-col>
        }
      </tedi-row>
    `,
  }),
};
