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
import { ButtonComponent } from "../../buttons/button/button.component";

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
        ButtonComponent,
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
    appendTo: {
      control: "text",
      description:
        "Append floating element to given selector. Use 'body' to append at the end of DOM or empty string to append next to trigger element.",
      table: {
        category: "dropdown",
        type: { summary: "string" },
        defaultValue: { summary: `""` },
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
    ariaHasPopup: {
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
  },
} as Meta<DropdownComponent>;

type Story = StoryObj<
  DropdownComponent & {
    dropdownRole: DropdownRole;
    ariaHasPopup: DropdownTriggerAriaHasPopup;
  }
>;

export const Default: Story = {
  args: {
    position: "bottom-start",
    preventOverflow: true,
    appendTo: "body",
    dropdownRole: "menu",
    ariaHasPopup: "menu",
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-dropdown [position]="position" [preventOverflow]="preventOverflow" [appendTo]="appendTo">
        <button tedi-button tedi-dropdown-trigger [ariaHasPopup]="ariaHasPopup">
          Trigger
        </button>
        <tedi-dropdown-content [dropdownRole]="dropdownRole">
          <li tedi-dropdown-item>Access to health data</li>
          <li tedi-dropdown-item [disabled]="true">Declaration of intent</li>
          <li tedi-dropdown-item [selected]="true">Contacts</li>
        </tedi-dropdown-content>
      </tedi-dropdown>
    `,
  }),
};
