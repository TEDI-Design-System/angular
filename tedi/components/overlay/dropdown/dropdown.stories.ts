import { Component, ViewEncapsulation } from "@angular/core";
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
import { DropdownItemValueComponent } from "./dropdown-item-value/dropdown-item-value.component";
import { DropdownItemValueLabelComponent } from "./dropdown-item-value/dropdown-item-value-label.component";
import { DropdownItemValueMetaComponent } from "./dropdown-item-value/dropdown-item-value-meta.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { IconComponent } from "../../base";

@Component({
  selector: "app-demo-button",
  standalone: true,
  imports: [ButtonComponent],
  template: `<button tedi-button><ng-content /></button>`,
  encapsulation: ViewEncapsulation.None,
})
class DemoWrappingButtonComponent { }

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

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.23.39?node-id=2319-64439&m=dev" target="_blank">Figma ↗</a><br>
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
        DropdownItemValueComponent,
        DropdownItemValueLabelComponent,
        DropdownItemValueMetaComponent,
        ButtonComponent,
        IconComponent,
        DemoWrappingButtonComponent,
      ],
    }),
  ],
  argTypes: {
    value: {
      control: "text",
      description: "Current value of dropdown (used with listbox)",
      table: {
        category: "dropdown",
        type: { summary: "string" },
      },
    },
    position: {
      control: "select",
      options: POSITIONS,
      description:
        "The position of the dropdown relative to the trigger element.",
      table: {
        category: "dropdown",
        type: { summary: "DropdownPosition" },
        defaultValue: { summary: "bottom-start" },
      },
    },
    preventOverflow: {
      control: "boolean",
      description:
        "Should position to opposite direction when overflowing screen?",
      table: {
        category: "dropdown",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    hideOnScroll: {
      control: "boolean",
      description: "Does the dropdown hide when the page scrolls?",
      table: {
        category: "dropdown",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    dropdownRole: {
      control: "radio",
      options: ["menu", "listbox"],
      description:
        "Role for content, use listbox for list and menu for actions",
      table: {
        category: "dropdown-content",
        type: { summary: "DropdownRole", detail: "menu \nlistbox" },
        defaultValue: { summary: "menu" },
      },
    },
    ariaHaspopup: {
      control: "radio",
      options: ["menu", "listbox", "true"],
      description:
        "Defines the aria-haspopup attribute for the trigger, informing assistive technologies whether it opens a menu or listbox. Improves accessibility by describing the type of popup.",
      table: {
        category: "dropdown-trigger",
        type: {
          summary: "DropdownTriggerAriaHasPopup",
          detail: "menu \nlistbox \ntrue",
        },
        defaultValue: { summary: "menu" },
      },
    },
    itemValue: {
      name: "value",
      description: "Item value",
      table: {
        category: "dropdown-item",
        type: { summary: "string" },
      },
    },
    disabled: {
      description: "Is item disabled?",
      table: {
        category: "dropdown-item",
        type: { summary: "boolean" },
      },
    },
    closeOnSelect: {
      description:
        "Whether activating this item closes the dropdown. Set `false` for items that should keep the dropdown open after selection (e.g. multi-select checkboxes).",
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
    dropdownRole: "menu",
    ariaHaspopup: "menu",
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-dropdown [position]="position" [preventOverflow]="preventOverflow" [hideOnScroll]="hideOnScroll">
        <button tedi-button tedi-dropdown-trigger [ariaHaspopup]="ariaHaspopup">
          Trigger
        </button>
        <tedi-dropdown-content [dropdownRole]="dropdownRole">
          <li tedi-dropdown-item>Access to health data</li>
          <li tedi-dropdown-item [disabled]="true">Declaration of intent</li>
          <li tedi-dropdown-item>Contacts</li>
        </tedi-dropdown-content>
      </tedi-dropdown>
    `,
  }),
};

export const WithMeta: Story = {
  name: "With Meta Text",
  args: {
    position: "bottom-start",
    preventOverflow: true,
    dropdownRole: "listbox",
    ariaHaspopup: "listbox",
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-dropdown [position]="position" [preventOverflow]="preventOverflow">
        <button tedi-button tedi-dropdown-trigger [ariaHaspopup]="ariaHaspopup">
          Select location
        </button>
        <tedi-dropdown-content [dropdownRole]="dropdownRole">
          <li tedi-dropdown-item value="tallinn">
            <tedi-dropdown-item-value>
              <tedi-dropdown-item-value-label>Tallinn</tedi-dropdown-item-value-label>
              <tedi-dropdown-item-value-meta>3 timeslots</tedi-dropdown-item-value-meta>
            </tedi-dropdown-item-value>
          </li>
          <li tedi-dropdown-item value="tartu">
            <tedi-dropdown-item-value>
              <tedi-dropdown-item-value-label>Tartu</tedi-dropdown-item-value-label>
              <tedi-dropdown-item-value-meta>5 timeslots</tedi-dropdown-item-value-meta>
            </tedi-dropdown-item-value>
          </li>
          <li tedi-dropdown-item value="parnu">
            <tedi-dropdown-item-value>
              <tedi-dropdown-item-value-label>Pärnu</tedi-dropdown-item-value-label>
              <tedi-dropdown-item-value-meta>2 timeslots</tedi-dropdown-item-value-meta>
            </tedi-dropdown-item-value>
          </li>
        </tedi-dropdown-content>
      </tedi-dropdown>
    `,
  }),
};

export const WithIcons: Story = {
  name: "With Icons",
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
        <button tedi-button tedi-dropdown-trigger [ariaHaspopup]="ariaHaspopup">
          Actions
        </button>
        <tedi-dropdown-content [dropdownRole]="dropdownRole">
          <li tedi-dropdown-item>
            <tedi-dropdown-item-value>
              <tedi-icon name="edit" [size]="18" />
              <tedi-dropdown-item-value-label>Edit</tedi-dropdown-item-value-label>
            </tedi-dropdown-item-value>
          </li>
          <li tedi-dropdown-item>
            <tedi-dropdown-item-value>
              <tedi-icon name="content_copy" [size]="18" />
              <tedi-dropdown-item-value-label>Duplicate</tedi-dropdown-item-value-label>
            </tedi-dropdown-item-value>
          </li>
          <li tedi-dropdown-item>
            <tedi-dropdown-item-value>
              <tedi-icon name="delete" [size]="18" />
              <tedi-dropdown-item-value-label>Delete</tedi-dropdown-item-value-label>
            </tedi-dropdown-item-value>
          </li>
        </tedi-dropdown-content>
      </tedi-dropdown>
    `,
  }),
};

export const VerticalLayout: Story = {
  name: "Vertical Layout",
  args: {
    position: "bottom-start",
    preventOverflow: true,
    dropdownRole: "listbox",
    ariaHaspopup: "listbox",
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-dropdown [position]="position" [preventOverflow]="preventOverflow">
        <button tedi-button tedi-dropdown-trigger [ariaHaspopup]="ariaHaspopup">
          Select access level
        </button>
        <tedi-dropdown-content [dropdownRole]="dropdownRole">
          <li tedi-dropdown-item value="health">
            <tedi-dropdown-item-value layout="vertical">
              <tedi-dropdown-item-value-label>Access to health data</tedi-dropdown-item-value-label>
              <tedi-dropdown-item-value-meta>Doctors will be able to see your health data</tedi-dropdown-item-value-meta>
            </tedi-dropdown-item-value>
          </li>
          <li tedi-dropdown-item value="medications">
            <tedi-dropdown-item-value layout="vertical">
              <tedi-dropdown-item-value-label>Access to medications</tedi-dropdown-item-value-label>
              <tedi-dropdown-item-value-meta>Doctors will be able to see your medications</tedi-dropdown-item-value-meta>
            </tedi-dropdown-item-value>
          </li>
          <li tedi-dropdown-item value="all">
            <tedi-dropdown-item-value layout="vertical">
              <tedi-dropdown-item-value-label>Access to all</tedi-dropdown-item-value-label>
              <tedi-dropdown-item-value-meta>Doctors will be able to see all your information</tedi-dropdown-item-value-meta>
            </tedi-dropdown-item-value>
          </li>
        </tedi-dropdown-content>
      </tedi-dropdown>
    `,
  }),
};

/**
 * When the trigger sits on a component that wraps its own `<button>` (here
 * `<app-demo-button>`), the directive resolves that inner button and applies the
 * `id`, `aria-*`, focus, and keyboard handling there — keeping a single tab stop
 * with correct screen-reader announcements.
 */
export const WithWrappingButtonComponent: Story = {
  name: "Trigger on a Wrapping Button Component",
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
        <app-demo-button tedi-dropdown-trigger [ariaHaspopup]="ariaHaspopup">
          Actions
        </app-demo-button>
        <tedi-dropdown-content [dropdownRole]="dropdownRole">
          <li tedi-dropdown-item>Access to health data</li>
          <li tedi-dropdown-item [disabled]="true">Declaration of intent</li>
          <li tedi-dropdown-item>Contacts</li>
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
        { id: "active", label: "Active", selected: true },
        { id: "inactive", label: "Inactive", selected: false },
        { id: "archived", label: "Archived", selected: false },
        { id: "drafts", label: "Drafts", selected: true, disabled: true },
      ] as Array<{
        id: string;
        label: string;
        selected: boolean;
        disabled?: boolean;
      }>,
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
          Filters
        </button>
        <tedi-dropdown-content [dropdownRole]="dropdownRole">
          @for (filter of filters; track filter.id) {
            <li
              tedi-dropdown-item
              [value]="filter.id"
              [disabled]="!!filter.disabled"
              [closeOnSelect]="false"
              (itemSelect)="toggleFilter(filters, filter.id)"
            >
              <tedi-dropdown-item-value
                type="checkbox"
                [selected]="filter.selected"
                [disabled]="!!filter.disabled"
              >
                <tedi-dropdown-item-value-label>{{ filter.label }}</tedi-dropdown-item-value-label>
              </tedi-dropdown-item-value>
            </li>
          }
        </tedi-dropdown-content>
      </tedi-dropdown>
    `,
  }),
};
