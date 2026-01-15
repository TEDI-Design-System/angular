import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";
import { ModalComponent } from "./modal.component";
import { ModalHeaderComponent } from "./modal-header/modal-header.component";
import { ModalContentComponent } from "./modal-content/modal-content.component";
import { ModalFooterComponent } from "./modal-footer/modal-footer.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { LabelComponent } from "../../form/label/label.component";
import { SelectComponent, SelectOptionComponent } from "@tedi-design-system/angular/community";
import { IconComponent } from "../../base/icon/icon.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.23.38?node-id=4626-89579&m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/31221b-modal" target="_blank">Zeroheight ↗</a>
 *
 * ---
 *
 * The modal can be opened or closed using the `open` input (set it to `true` or `false`).
 * You can also control it programmatically using `viewChild`:
 *
 * ```ts
 * modal = viewChild(ModalComponent);
 *
 * toggleModal() {
 *   this.modal.open.update(prev => !prev);
 * }
 * ```
 *
 * The modal layout is composed of the following subcomponents:
 *
 * - ModalHeaderComponent
 * - ModalContentComponent
 * - ModalFooterComponent
 */

export default {
  title: "TEDI-Ready/Components/Overlay/Modal",
  component: ModalComponent,
  decorators: [
    moduleMetadata({
      imports: [
        ModalComponent,
        ModalHeaderComponent,
        ModalContentComponent,
        ModalFooterComponent,
        ButtonComponent,
        LabelComponent,
        SelectComponent,
        SelectOptionComponent,
        IconComponent,
      ],
    }),
  ],
  argTypes: {
    open: {
      control: "boolean",
      description: "Is modal open?",
      table: {
        category: "modal inputs",
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "false",
        },
      },
    },
    size: {
      control: "radio",
      options: ["default", "small"],
      description: "Modal size",
      table: {
        category: "modal inputs",
        type: {
          summary: "ModalSize",
          detail: "default \nsmall",
        },
        defaultValue: {
          summary: "default",
        },
      },
    },
    width: {
      control: "radio",
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "Modal width",
      table: {
        category: "modal inputs",
        type: {
          summary: "ModalWidth",
          detail: "xs \nsm \nmd \nlg \nxl",
        },
        defaultValue: {
          summary: "sm",
        },
      },
    },
    position: {
      control: "radio",
      options: ["center", "left", "right"],
      description: "Position of the modal",
      table: {
        category: "modal inputs",
        type: {
          summary: "ModalPosition",
          detail: "center \nleft \nright",
        },
        defaultValue: {
          summary: "center",
        },
      },
    },
    showClose: {
      control: "boolean",
      description: "Should show closing button?",
      table: {
        category: "modal header inputs",
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "true",
        },
      },
    },
  },
} as Meta<ModalComponent>;

type DefaultStory = StoryObj<
  ModalComponent & {
    showClose: boolean;
  }
>;

export const Default: DefaultStory = {
  args: {
    open: false,
    size: "default",
    width: "sm",
    position: "center",
    showClose: true,
  },
  render: (args) => ({
    props: {
      ...args,
      options: [
        { value: "1", label: "Option 1" },
        { value: "2", label: "Option 2" },
        { value: "3", label: "Option 3" },
        { value: "4", label: "Option 4" },
        { value: "5", label: "Option 5" },
      ],
    },
    template: `
      <button tedi-button (click)="open = true">Open modal</button>
      <tedi-modal [(open)]="open" [size]="size" [width]="width" [position]="position">
        <tedi-modal-header [showClose]="showClose">
          <h1>Title</h1>
        </tedi-modal-header>
        <tedi-modal-content>
          <div>
            <label tedi-label for="select-1">Label</label>
            <tedi-select inputId="select-1" state="default">
              @for (option of options; track option.value) {
                <tedi-select-option [value]="option.value" [label]="option.label" />
              }
            </tedi-select>
          </div>
          <div>
            <label tedi-label for="select-2">Label</label>
            <tedi-select inputId="select-2" state="default">
              @for (option of options; track option.value) {
                <tedi-select-option [value]="option.value" [label]="option.label" />
              }
            </tedi-select>
          </div>
        </tedi-modal-content>
        <tedi-modal-footer style="justify-content: flex-end;">
          <button tedi-button variant="secondary" (click)="open = false">Cancel</button>
          <button tedi-button (click)="open = false">Continue</button>
        </tedi-modal-footer>
      </tedi-modal>
    `,
  }),
};

export const Size: StoryObj<ModalComponent> = {
  render: (args) => ({
    props: {
      ...args,
      openDefault: false,
      openSmall: false,
      options: [
        { value: "1", label: "Option 1" },
        { value: "2", label: "Option 2" },
        { value: "3", label: "Option 3" },
        { value: "4", label: "Option 4" },
        { value: "5", label: "Option 5" },
      ],
    },
    template: `
      <div style="display: flex; gap: 16px;">
        <button tedi-button (click)="openSmall = true">Open small modal</button>
        <button tedi-button (click)="openDefault = true">Open default modal</button>
      </div>
      <tedi-modal size="small" [(open)]="openSmall">
        <tedi-modal-header>
          <h1>Title</h1>
        </tedi-modal-header>
        <tedi-modal-content>
          <div>
            <label tedi-label for="select-1">Label</label>
            <tedi-select inputId="select-1" state="default">
              @for (option of options; track option.value) {
                <tedi-select-option [value]="option.value" [label]="option.label" />
              }
            </tedi-select>
          </div>
          <div>
            <label tedi-label for="select-2">Label</label>
            <tedi-select inputId="select-2" state="default">
              @for (option of options; track option.value) {
                <tedi-select-option [value]="option.value" [label]="option.label" />
              }
            </tedi-select>
          </div>
        </tedi-modal-content>
        <tedi-modal-footer style="justify-content: flex-end;">
          <button tedi-button variant="secondary" (click)="openSmall = false">Cancel</button>
          <button tedi-button (click)="openSmall = false">Continue</button>
        </tedi-modal-footer>
      </tedi-modal>
      <tedi-modal [(open)]="openDefault">
        <tedi-modal-header>
          <h1>Title</h1>
        </tedi-modal-header>
        <tedi-modal-content>
          <div>
            <label tedi-label for="select-1">Label</label>
            <tedi-select inputId="select-1" state="default">
              @for (option of options; track option.value) {
                <tedi-select-option [value]="option.value" [label]="option.label" />
              }
            </tedi-select>
          </div>
          <div>
            <label tedi-label for="select-2">Label</label>
            <tedi-select inputId="select-2" state="default">
              @for (option of options; track option.value) {
                <tedi-select-option [value]="option.value" [label]="option.label" />
              }
            </tedi-select>
          </div>
        </tedi-modal-content>
        <tedi-modal-footer style="justify-content: flex-end;">
          <button tedi-button variant="secondary" (click)="openDefault = false">Cancel</button>
          <button tedi-button (click)="openDefault = false">Continue</button>
        </tedi-modal-footer>
      </tedi-modal>
    `,
  }),
};

export const FooterVariants: StoryObj<ModalComponent> = {
  render: (args) => ({
    props: {
      ...args,
      openDefault: false,
      openLeftRight: false,
      openThreeButtons: false,
      openNoFooter: false,
      options: [
        { value: "1", label: "Option 1" },
        { value: "2", label: "Option 2" },
        { value: "3", label: "Option 3" },
        { value: "4", label: "Option 4" },
        { value: "5", label: "Option 5" },
      ],
    },
    template: `
      <div style="display: flex; gap: 16px;">
        <button tedi-button (click)="openDefault = true">Open modal</button>
        <button tedi-button (click)="openLeftRight = true">Open modal with left right buttons</button>
        <button tedi-button (click)="openThreeButtons = true">Open modal with three buttons</button>
        <button tedi-button (click)="openNoFooter = true">Open modal with no footer</button>
      </div>
      <tedi-modal size="small" [(open)]="openDefault">
        <tedi-modal-header>
          <h1>Title</h1>
        </tedi-modal-header>
        <tedi-modal-content>
          <div>
            <label tedi-label for="select-1">Label</label>
            <tedi-select inputId="select-1" state="default">
              @for (option of options; track option.value) {
                <tedi-select-option [value]="option.value" [label]="option.label" />
              }
            </tedi-select>
          </div>
          <div>
            <label tedi-label for="select-2">Label</label>
            <tedi-select inputId="select-2" state="default">
              @for (option of options; track option.value) {
                <tedi-select-option [value]="option.value" [label]="option.label" />
              }
            </tedi-select>
          </div>
        </tedi-modal-content>
        <tedi-modal-footer style="justify-content: flex-end;">
          <button tedi-button variant="secondary" (click)="openDefault = false">Cancel</button>
          <button tedi-button (click)="openDefault = false">Continue</button>
        </tedi-modal-footer>
      </tedi-modal>
      <tedi-modal [(open)]="openLeftRight">
        <tedi-modal-header>
          <h1>Title</h1>
        </tedi-modal-header>
        <tedi-modal-content>
          <div>
            <label tedi-label for="select-1">Label</label>
            <tedi-select inputId="select-1" state="default">
              @for (option of options; track option.value) {
                <tedi-select-option [value]="option.value" [label]="option.label" />
              }
            </tedi-select>
          </div>
          <div>
            <label tedi-label for="select-2">Label</label>
            <tedi-select inputId="select-2" state="default">
              @for (option of options; track option.value) {
                <tedi-select-option [value]="option.value" [label]="option.label" />
              }
            </tedi-select>
          </div>
        </tedi-modal-content>
        <tedi-modal-footer style="justify-content: space-between;">
          <button tedi-button variant="secondary" (click)="openLeftRight = false">Cancel</button>
          <button tedi-button (click)="openLeftRight = false">Continue</button>
        </tedi-modal-footer>
      </tedi-modal>
      <tedi-modal [(open)]="openThreeButtons">
        <tedi-modal-header>
          <h1>Title</h1>
        </tedi-modal-header>
        <tedi-modal-content>
          <div>
            <label tedi-label for="select-1">Label</label>
            <tedi-select inputId="select-1" state="default">
              @for (option of options; track option.value) {
                <tedi-select-option [value]="option.value" [label]="option.label" />
              }
            </tedi-select>
          </div>
          <div>
            <label tedi-label for="select-2">Label</label>
            <tedi-select inputId="select-2" state="default">
              @for (option of options; track option.value) {
                <tedi-select-option [value]="option.value" [label]="option.label" />
              }
            </tedi-select>
          </div>
        </tedi-modal-content>
        <tedi-modal-footer style="justify-content: space-between;">
          <button tedi-button variant="neutral" (click)="openThreeButtons = false">
            <tedi-icon name="arrow_back" />
            Back
          </button>
          <div style="display: flex; gap: 16px;">
            <button tedi-button variant="secondary" (click)="openThreeButtons = false">Cancel</button>
            <button tedi-button (click)="openThreeButtons = false">Continue</button>
          </div>
        </tedi-modal-footer>
      </tedi-modal>
      <tedi-modal [(open)]="openNoFooter">
        <tedi-modal-header>
          <h1>Title</h1>
        </tedi-modal-header>
        <tedi-modal-content>
          <div>
            <label tedi-label for="select-1">Label</label>
            <tedi-select inputId="select-1" state="default">
              @for (option of options; track option.value) {
                <tedi-select-option [value]="option.value" [label]="option.label" />
              }
            </tedi-select>
          </div>
          <div>
            <label tedi-label for="select-2">Label</label>
            <tedi-select inputId="select-2" state="default">
              @for (option of options; track option.value) {
                <tedi-select-option [value]="option.value" [label]="option.label" />
              }
            </tedi-select>
          </div>
        </tedi-modal-content>
      </tedi-modal>
    `,
  }),
};
