import {
  Component,
  forwardRef,
  input,
  linkedSignal,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";
import { OptionContentComponent } from "./option-content.component";
import { OptionContentLabelComponent } from "./option-content-label.component";
import { OptionContentMetaComponent } from "./option-content-meta.component";
import { IconComponent } from "../../base";
import { DropdownItemComponent } from "../../overlay/dropdown/dropdown-item/dropdown-item.component";
import {
  DROPDOWN_API,
  DROPDOWN_CONTENT_API,
  DropdownApi,
  DropdownContentApi,
  DropdownRole,
  DropdownVariant,
} from "../../overlay/dropdown/dropdown.tokens";
import { RowComponent } from "../grid/row/row.component";
import { ColComponent } from "../grid/col/col.component";

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
  focusActiveItem = (): boolean => false;
  hideDropdown = noop;
  closeAndFocusTrigger = noop;
  tabOutOfDropdown = noop;
  dropdownTrigger = noop;
}

const MENU_STYLE =
  "display: flex; flex-direction: column; width: 100%; max-width: 304px; padding: 0; margin: 0; overflow: hidden; " +
  "background: var(--dropdown-item-default-background); border: 1px solid var(--card-border-primary); " +
  "border-radius: var(--form-select-area-radius); box-shadow: 0 1px 5px 0 var(--tedi-alpha-20)";

const STATES = ["Default", "Hover", "Selected", "Disabled", "Focus"] as const;

// "Show code" snippets. The stories render items in a stand-in menu so they can be shown side by
// side; these show how the same items are used in a real dropdown.
const SOURCE = {
  items: `<tedi-dropdown>
  <button tedi-button tedi-dropdown-trigger>Ava menüü</button>
  <tedi-dropdown-content>
    <li tedi-dropdown-item>
      <tedi-option-content>
        <tedi-option-content-label>1st level</tedi-option-content-label>
      </tedi-option-content>
    </li>
    <li tedi-dropdown-item [indent]="1">
      <tedi-option-content>
        <tedi-option-content-label>2nd level</tedi-option-content-label>
      </tedi-option-content>
    </li>
    <li tedi-dropdown-item [indent]="2">
      <tedi-option-content>
        <tedi-option-content-label>3rd level</tedi-option-content-label>
      </tedi-option-content>
    </li>
    <li tedi-dropdown-item [indent]="3">
      <tedi-option-content>
        <tedi-option-content-label>4th level</tedi-option-content-label>
      </tedi-option-content>
    </li>
  </tedi-dropdown-content>
</tedi-dropdown>`,

  checkbox: `<tedi-dropdown>
  <button tedi-button tedi-dropdown-trigger>Asukoht ({{ selectedCount }})</button>
  <tedi-dropdown-content>
    <li tedi-dropdown-item [closeOnSelect]="false" (itemSelect)="toggleAll()">
      <tedi-option-content type="checkbox" [selected]="allSelected" [indeterminate]="someSelected">
        <tedi-option-content-label>Asukohad</tedi-option-content-label>
      </tedi-option-content>
    </li>
    @for (city of cities; track city) {
      <li tedi-dropdown-item [indent]="1" [closeOnSelect]="false" (itemSelect)="toggle(city)">
        <tedi-option-content type="checkbox" [selected]="isSelected(city)">
          <tedi-option-content-label>{{ city }}</tedi-option-content-label>
        </tedi-option-content>
      </li>
    }
  </tedi-dropdown-content>
</tedi-dropdown>`,

  radio: `<tedi-dropdown [(value)]="city">
  <button tedi-button tedi-dropdown-trigger>Linn: {{ city }}</button>
  <tedi-dropdown-content dropdownRole="listbox">
    @for (option of cities; track option) {
      <li tedi-dropdown-item [value]="option">
        <tedi-option-content type="radio" [selected]="city === option">
          <tedi-option-content-label>{{ option }}</tedi-option-content-label>
        </tedi-option-content>
      </li>
    }
  </tedi-dropdown-content>
</tedi-dropdown>`,

  icon: `<tedi-dropdown>
  <button tedi-button tedi-dropdown-trigger>Ava menüü</button>
  <tedi-dropdown-content>
    <li tedi-dropdown-item>
      <tedi-option-content icon="download">
        <tedi-option-content-label>Laadi alla</tedi-option-content-label>
      </tedi-option-content>
    </li>
    <li tedi-dropdown-item>
      <tedi-option-content>
        <tedi-option-content-label>Kontaktid</tedi-option-content-label>
        <tedi-option-content-meta>
          <tedi-icon name="arrow_forward" [size]="16" color="secondary" />
        </tedi-option-content-meta>
      </tedi-option-content>
    </li>
  </tedi-dropdown-content>
</tedi-dropdown>`,

  description: `<tedi-dropdown>
  <button tedi-button tedi-dropdown-trigger>Ava menüü</button>
  <tedi-dropdown-content>
    <li tedi-dropdown-item>
      <tedi-option-content layout="vertical">
        <tedi-option-content-label>Juurdepääs terviseandmetele</tedi-option-content-label>
        <tedi-option-content-meta>Arstid näevad sinu terviseandmeid</tedi-option-content-meta>
      </tedi-option-content>
    </li>
    <li tedi-dropdown-item>
      <tedi-option-content>
        <tedi-option-content-label>Tallinn</tedi-option-content-label>
        <tedi-option-content-meta>3 vaba aega saadaval</tedi-option-content-meta>
      </tedi-option-content>
    </li>
  </tedi-dropdown-content>
</tedi-dropdown>`,

  tree: `<tedi-dropdown>
  <button tedi-button tedi-dropdown-trigger>Ava menüü</button>
  <tedi-dropdown-content variant="tree">
    <li tedi-dropdown-item [indent]="1" [isParent]="true">
      <tedi-option-content>
        <tedi-option-content-label>Parent</tedi-option-content-label>
      </tedi-option-content>
    </li>
    <li tedi-dropdown-item [indent]="1">
      <tedi-option-content>
        <tedi-option-content-label>Child 1</tedi-option-content-label>
      </tedi-option-content>
    </li>
  </tedi-dropdown-content>
</tedi-dropdown>`,

  states: `<tedi-dropdown value="selected">
  <button tedi-button tedi-dropdown-trigger>Ava menüü</button>
  <tedi-dropdown-content dropdownRole="listbox">
    <li tedi-dropdown-item value="selected">
      <tedi-option-content>
        <tedi-option-content-label>Tekst</tedi-option-content-label>
      </tedi-option-content>
    </li>
    <li tedi-dropdown-item value="disabled" [disabled]="true">
      <tedi-option-content>
        <tedi-option-content-label>Tekst</tedi-option-content-label>
      </tedi-option-content>
    </li>
  </tedi-dropdown-content>
</tedi-dropdown>`,

  position: `<tedi-dropdown>
  <button tedi-button tedi-dropdown-trigger>Ava menüü</button>
  <tedi-dropdown-content>
    <li tedi-dropdown-item>
      <tedi-option-content>
        <tedi-option-content-label>Top</tedi-option-content-label>
      </tedi-option-content>
    </li>
    <li tedi-dropdown-item>
      <tedi-option-content>
        <tedi-option-content-label>Middle</tedi-option-content-label>
      </tedi-option-content>
    </li>
    <li tedi-dropdown-item>
      <tedi-option-content>
        <tedi-option-content-label>Bottom</tedi-option-content-label>
      </tedi-option-content>
    </li>
  </tedi-dropdown-content>
</tedi-dropdown>`,
};

const sourceParams = (code: string) => ({
  docs: { source: { language: "html", code } },
});

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.108.103?m=dev&node-id=12185-156201" target="_blank">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/0930a9-dropdown-item" target="_blank">Zeroheight ↗</a>
 *
 * Layout only: place it inside an interactive parent such as `li[tedi-dropdown-item]`, which owns
 * the role, selection and keyboard handling.
 */

export default {
  title: "TEDI-Ready/Components/Helpers/OptionContent",
  component: OptionContentComponent,
  decorators: [
    moduleMetadata({
      imports: [
        OptionContentComponent,
        OptionContentLabelComponent,
        OptionContentMetaComponent,
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
        type: { summary: "OptionContentType" },
        defaultValue: { summary: "default" },
      },
    },
    layout: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Whether the label and meta sit side by side or stacked.",
      table: {
        type: { summary: "OptionContentLayout" },
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
        type: { summary: "string | OptionContentIcon" },
      },
    },
    clipContent: {
      control: "boolean",
      description:
        "`tedi-option-content-label` input. Cuts a label too long for the item off with an ellipsis; `false` lets it wrap and keeps decorations outside the line box, such as a status indicator, visible.",
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
} as Meta<OptionContentComponent>;

type Story = StoryObj<OptionContentComponent>;

export const Default: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-option-content [type]="type" [layout]="layout" [selected]="selected" [indeterminate]="indeterminate" [disabled]="disabled" [icon]="icon">
        <tedi-option-content-label [clipContent]="clipContent">Valik 1</tedi-option-content-label>
      </tedi-option-content>
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
        { label: "2nd level", indent: 1 },
        { label: "3rd level", indent: 2 },
        { label: "3rd level", indent: 2 },
        { label: "4th level", indent: 3 },
      ],
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start">
        <ul app-dropdown-item-showcase [style]="menuStyle">
          @for (item of items; track item) {
            <li tedi-dropdown-item [value]="item">
              <tedi-option-content>
                <tedi-option-content-label>{{ item }}</tedi-option-content-label>
              </tedi-option-content>
            </li>
          }
        </ul>
        <ul app-dropdown-item-showcase [style]="menuStyle">
          @for (level of levels; track $index) {
            <li tedi-dropdown-item [value]="'level-' + $index" [indent]="level.indent">
              <tedi-option-content>
                <tedi-option-content-label>{{ level.label }}</tedi-option-content-label>
              </tedi-option-content>
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
                <tedi-option-content
                  type="checkbox"
                  [selected]="allChecked(group.children)"
                  [indeterminate]="someChecked(group.children)"
                >
                  <tedi-option-content-label>{{ group.label }}</tedi-option-content-label>
                </tedi-option-content>
              </li>
              @for (child of group.children; track child) {
                <li tedi-dropdown-item [value]="child" [indent]="1" [closeOnSelect]="false" (itemSelect)="toggle(child)">
                  <tedi-option-content type="checkbox" [selected]="isChecked(child)">
                    <tedi-option-content-label>{{ child }}</tedi-option-content-label>
                  </tedi-option-content>
                </li>
              }
            }
          </ul>
          <ul app-dropdown-item-showcase [style]="menuStyle">
            @for (group of groups; track group.label) {
              <li tedi-dropdown-item [value]="'flat-' + group.label" [closeOnSelect]="false" (itemSelect)="toggle('flat-' + group.label)">
                <tedi-option-content type="checkbox" [selected]="isChecked('flat-' + group.label)">
                  <tedi-option-content-label>{{ group.label }}</tedi-option-content-label>
                </tedi-option-content>
              </li>
            }
          </ul>
          <ul app-dropdown-item-showcase [style]="menuStyle">
            @for (level of levels; track $index) {
              <li tedi-dropdown-item [value]="'level-' + $index" [indent]="$index" [closeOnSelect]="false" (itemSelect)="toggle('level-' + $index)">
                <tedi-option-content type="checkbox" [selected]="isChecked('level-' + $index)">
                  <tedi-option-content-label>{{ level }}</tedi-option-content-label>
                </tedi-option-content>
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
              <tedi-option-content type="radio" [selected]="selected() === city">
                <tedi-option-content-label>{{ city }}</tedi-option-content-label>
              </tedi-option-content>
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
              <tedi-option-content>
                <tedi-option-content-label>{{ link }}</tedi-option-content-label>
                <tedi-option-content-meta>
                  <tedi-icon name="arrow_forward" [size]="16" color="secondary" />
                </tedi-option-content-meta>
              </tedi-option-content>
            </li>
          }
        </ul>
        <ul app-dropdown-item-showcase [style]="menuStyle">
          @for (action of actions; track action.label) {
            <li tedi-dropdown-item [value]="action.label">
              <tedi-option-content [icon]="action.icon">
                <tedi-option-content-label>{{ action.label }}</tedi-option-content-label>
              </tedi-option-content>
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
              <tedi-option-content layout="vertical">
                <tedi-option-content-label>{{ option.label }}</tedi-option-content-label>
                <tedi-option-content-meta>{{ option.description }}</tedi-option-content-meta>
              </tedi-option-content>
            </li>
          }
        </ul>
        <ul app-dropdown-item-showcase [style]="menuStyle">
          @for (location of locations; track location.label) {
            <li tedi-dropdown-item [value]="location.label">
              <tedi-option-content>
                <tedi-option-content-label>{{ location.label }}</tedi-option-content-label>
                <tedi-option-content-meta>{{ location.meta }}</tedi-option-content-meta>
              </tedi-option-content>
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
            <tedi-option-content>
              <tedi-option-content-label>Parent</tedi-option-content-label>
            </tedi-option-content>
          </li>
          @for (child of children; track child) {
            <li tedi-dropdown-item [value]="child" [indent]="1">
              <tedi-option-content>
                <tedi-option-content-label>{{ child }}</tedi-option-content-label>
              </tedi-option-content>
            </li>
          }
        </ul>
        <ul app-dropdown-item-showcase variant="tree" [style]="menuStyle">
          @for (group of groups; track group) {
            <li tedi-dropdown-item [value]="group + '-parent'" [indent]="1" [isParent]="true">
              <tedi-option-content>
                <tedi-option-content-label>Parent</tedi-option-content-label>
              </tedi-option-content>
            </li>
            @for (child of children; track child) {
              <li tedi-dropdown-item [value]="group + '-' + child" [indent]="1">
                <tedi-option-content>
                  <tedi-option-content-label>{{ child }}</tedi-option-content-label>
                </tedi-option-content>
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
            <tedi-option-content>
              <tedi-option-content-label>{{ position.label }}</tedi-option-content-label>
            </tedi-option-content>
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
                <tedi-option-content>
                  <tedi-option-content-label>Tekst</tedi-option-content-label>
                </tedi-option-content>
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
                <tedi-option-content icon="download">
                  <tedi-option-content-label>Tekst</tedi-option-content-label>
                </tedi-option-content>
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
                <tedi-option-content>
                  <tedi-option-content-label>Tekst</tedi-option-content-label>
                  <tedi-option-content-meta>Tekst</tedi-option-content-meta>
                </tedi-option-content>
              </li>
            </ul>
          </tedi-col>
        }
      </tedi-row>
    `,
  }),
};
