import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";
import { DropdownComponent } from "./dropdown.component";
import { DropdownTriggerDirective } from "./dropdown-trigger/dropdown-trigger.directive";
import { DropdownContentComponent } from "./dropdown-content/dropdown-content.component";
import { DropdownItemComponent } from "./dropdown-item/dropdown-item.component";
import { ButtonComponent } from "../../buttons/button/button.component";

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
} as Meta<DropdownComponent>;

export const Default: StoryObj<DropdownComponent> = {
  args: {
    position: "bottom-start",
    preventOverflow: true,
    appendTo: "body",
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-dropdown [position]="position" [preventOverflow]="preventOverflow" [appendTo]="appendTo">
        <button tedi-button tedi-dropdown-trigger>
          Trigger
        </button>
        <tedi-dropdown-content>
          <li tedi-dropdown-item>Access to health data</li>
          <li tedi-dropdown-item [disabled]="true">Declaration of intent</li>
          <li tedi-dropdown-item [selected]="true">Contacts</li>
        </tedi-dropdown-content>
      </tedi-dropdown>
    `,
  }),
};
