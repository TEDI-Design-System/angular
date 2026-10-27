import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { RadioComponent } from "./radio.component";
import { RadioCardComponent } from "../radio-card/radio-card.component";
import { RadioGroupComponent } from "../radio-group/radio-group.component";
import { RadioCardGroupComponent } from "../radio-card-group/radio-card-group.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { TextComponent } from "../../base/text/text.component";
import { LabelComponent } from "../../content/label/label.component";
import { IconComponent } from "../../base/icon/icon.component";
import { TooltipComponent } from "../../overlay/tooltip/tooltip.component";
import { TooltipTriggerComponent } from "../../overlay/tooltip/tooltip-trigger/tooltip-trigger.component";
import { TooltipContentComponent } from "../../overlay/tooltip/tooltip-content/tooltip-content.component";
import { InfoButtonComponent } from "../../buttons/info-button/info-button.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { AlertComponent } from "../../notifications/alert/alert.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.102.102?node-id=65724-11106&m=dev" target="_blank">Radio Figma ↗</a><br />
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.102.102?node-id=65725-251541&m=dev" target="_blank">Radio card Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/93e423-radio" target="_blank">Zeroheight ↗</a>
 */
export default {
  title: "TEDI-Ready/Components/Form/Radio",
  component: RadioComponent,
  decorators: [
    moduleMetadata({
      imports: [
        RadioComponent,
        RadioCardComponent,
        RadioGroupComponent,
        RadioCardGroupComponent,
        RowComponent,
        ColComponent,
        TextComponent,
        LabelComponent,
        IconComponent,
        TooltipComponent,
        TooltipTriggerComponent,
        TooltipContentComponent,
        InfoButtonComponent,
        FeedbackTextComponent,
        AlertComponent,
        ReactiveFormsModule,
      ],
    }),
  ],
  argTypes: {
    size: {
      control: "radio",
      options: ["default", "large"],
      description: "Size of the radio.",
      table: {
        category: "Radio",
        type: {
          summary: "RadioSize",
          detail: "default \nlarge",
        },
        defaultValue: {
          summary: "default",
        },
      },
    },
    invalid: {
      control: "boolean",
      description: "Show the radio in an invalid state.",
      table: {
        category: "Radio",
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "false",
        },
      },
    },
    disabled: {
      control: "boolean",
      description: "Disable the radio.",
      table: {
        category: "Radio",
        type: {
          summary: "boolean",
        },
      },
    },
    variant: {
      control: "radio",
      options: ["primary", "secondary"],
      description: "Visual variant of the radio card.",
      table: {
        category: "Radio Card",
        type: {
          summary: "RadioCardVariant",
          detail: "primary \nsecondary",
        },
        defaultValue: {
          summary: "primary",
        },
      },
    },
    grouped: {
      control: "boolean",
      description: "Show the card as part of a button-group style layout.",
      table: {
        category: "Radio Card",
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "false",
        },
      },
    },
    bordered: {
      control: "boolean",
      description:
        "Show a border on an unselected primary card. Has no effect on grouped cards, which always have a border.",
      table: {
        category: "Radio Card",
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "false",
        },
      },
    },
    showIndicator: {
      control: "boolean",
      description:
        "Show the radio indicator. When false, the radio is visually hidden but stays functional.",
      table: {
        category: "Radio Card",
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "true",
        },
      },
    },
    groupLabel: {
      control: "text",
      description: "Label text displayed above the radio group.",
      table: {
        category: "Radio Group",
        type: {
          summary: "string",
        },
      },
    },
    groupDirection: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Layout direction of the radios.",
      table: {
        category: "Radio Group",
        type: {
          summary: "RadioGroupDirection",
          detail: "horizontal \nvertical",
        },
        defaultValue: {
          summary: "horizontal",
        },
      },
    },
  },
} as Meta<RadioComponent>;

export const Default: StoryObj<RadioComponent & { disabled: boolean }> = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: {
    size: "default",
    invalid: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <label tedi-label color="primary" class="flex align-items-center gap-2">
        <input tedi-radio type="radio" ${argsToTemplate(args)} />
        Tekst
      </label>
    `,
  }),
};

/**
 * Default size is used on desktop, large size is applied automatically on mobile screen sizes.
 * Use in tables where the radio has no text. **Otherwise, prefer using default size.**
 */
export const Size: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="12" [gapY]="3">
        <tedi-col width="9" [md]="{ width: 6 }">
          <p tedi-text modifiers="bold">Default</p>
        </tedi-col>
        <tedi-col width="3" [md]="{ width: 6 }">
          <input tedi-radio type="radio" name="size-demo" aria-label="Vaikimisi" />
        </tedi-col>
        <tedi-col width="9" [md]="{ width: 6 }">
          <div class="flex flex-column gap-3">
            <p tedi-text modifiers="bold">Large</p>
            <tedi-alert type="warning" [showClose]="false">
              <p tedi-text>Applied automatically on mobile screen sizes.</p>
              <p tedi-text modifiers="bold">Otherwise, prefer using default size.</p>
            </tedi-alert>
          </div>
        </tedi-col>
        <tedi-col width="3" [md]="{ width: 6 }">
          <input tedi-radio type="radio" name="size-demo" size="large" aria-label="Suur" />
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const Vertical: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-radio-group label="Tooraine" direction="vertical">
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" name="vertical-demo" />
          Kartul
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" name="vertical-demo" />
          Kapsas
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" name="vertical-demo" checked />
          Peet
        </label>
      </tedi-radio-group>
    `,
  }),
};

export const Horizontal: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-radio-group label="Tooraine">
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" name="horizontal-demo" />
          Kartul
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" name="horizontal-demo" />
          Kapsas
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" name="horizontal-demo" checked />
          Peet
        </label>
      </tedi-radio-group>
    `,
  }),
};

export const Separate: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="1" [gapY]="4">
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" name="separate-demo" />
          Tekst
        </label>
        <label tedi-label color="primary" [required]="true" class="flex align-items-center">
          <input tedi-radio type="radio" style="margin-right: var(--form-checkbox-radio-inner-spacing)" name="separate-required" />
          Tekst
        </label>
        <div class="flex align-items-center gap-1">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="separate-tooltip" />
            Tekst
          </label>
          <tedi-tooltip>
            <tedi-tooltip-trigger>
              <button tedi-info-button></button>
            </tedi-tooltip-trigger>
            <tedi-tooltip-content>
              Tooltip text
            </tedi-tooltip-content>
          </tedi-tooltip>
        </div>
        <div>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="separate-desc" />
            Tekst
          </label>
          <tedi-feedback-text text="Kirjeldus" />
        </div>
      </tedi-row>
    `,
  }),
};

export const Group: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [gapY]="3" [xs]="{cols: 1}" [md]="{cols: 2}">
        <tedi-radio-group label="Tooraine" direction="vertical">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-hint" />
            Kartul
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-hint" />
            Kapsas
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-hint" />
            Peet
          </label>
          <tedi-feedback-text text="Tegemist on veidi veidra valikuga, kuid vähemalt ühe baaselemendi peab valima" />
        </tedi-radio-group>
        <tedi-radio-group label="Tooraine">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-h-hint" />
            Kartul
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-h-hint" />
            Kapsas
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-h-hint" />
            Peet
          </label>
          <tedi-feedback-text text="Eestis levinud köögiviljad" />
        </tedi-radio-group>
        <tedi-radio-group label="Tooraine" direction="vertical">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-error" />
            Kartul
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-error" />
            Kapsas
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-error" />
            Peet
          </label>
          <tedi-feedback-text text="Vähemalt 1 tooraine on kohustuslik valida" type="error" />
        </tedi-radio-group>
        <tedi-radio-group label="Tooraine">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-h-error" />
            Kartul
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-h-error" />
            Kapsas
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-h-error" />
            Peet
          </label>
          <tedi-feedback-text text="Vähemalt 1 tooraine on kohustuslik valida" type="error" />
        </tedi-radio-group>
      </tedi-row>
    `,
  }),
};

/**
 * Radio cards with primary and secondary variants side by side. Primary uses a filled background when selected, secondary uses an outline border.
 */
export const CardsSeparate: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [gapY]="3" [xs]="{cols: 1}" [md]="{cols: 2}">
        <tedi-col class="flex flex-column gap-2">
          <p tedi-text modifiers="bold">Primary</p>
          <tedi-radio-card-group>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-primary" />
              Kartul
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-primary" />
              Kapsas
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-primary" checked />
              Peet
            </label>
          </tedi-radio-card-group>
        </tedi-col>
        <tedi-col class="flex flex-column gap-2">
          <p tedi-text modifiers="bold">Secondary</p>
          <tedi-radio-card-group>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-secondary" />
              Kartul
            </label>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-secondary" />
              Kapsas
            </label>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-secondary" checked />
              Peet
            </label>
          </tedi-radio-card-group>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

/**
 * Radio cards inside a labelled `tedi-radio-group`, with and without an error message.
 */
export const CardsWithLabel: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-wrap gap-4">
        <tedi-radio-group label="Juurvili">
          <tedi-radio-card-group>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="cards-label" checked />
              Kartul
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="cards-label" />
              Peet
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="cards-label" />
              Kapsas
            </label>
          </tedi-radio-card-group>
        </tedi-radio-group>
        <tedi-radio-group label="Juurvili">
          <tedi-radio-card-group>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="cards-label-error" />
              Kartul
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="cards-label-error" />
              Peet
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="cards-label-error" />
              Kapsas
            </label>
          </tedi-radio-card-group>
          <tedi-feedback-text text="Valik on kohustuslik" type="error" />
        </tedi-radio-group>
      </div>
    `,
  }),
};

/**
 * `bordered` gives separated primary cards a border in the unselected state.
 */
export const CardsHasBorder: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-radio-card-group [bordered]="true">
        <label tedi-radio-card variant="primary">
          <input tedi-radio type="radio" name="card-bordered" />
          Kartul
        </label>
        <label tedi-radio-card variant="primary">
          <input tedi-radio type="radio" name="card-bordered" />
          Kapsas
        </label>
        <label tedi-radio-card variant="primary">
          <input tedi-radio type="radio" name="card-bordered" checked />
          Peet
        </label>
      </tedi-radio-card-group>
    `,
  }),
};

/**
 * Radio cards in a grouped layout, joined like a button group with shared borders and no gap.
 */
export const CardsGrouped: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [gapY]="3" [xs]="{cols: 1}" [md]="{cols: 2}">
        <tedi-col class="flex flex-column gap-2">
          <p tedi-text modifiers="bold">Primary</p>
          <tedi-radio-card-group [grouped]="true">
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-group-primary" />
              Kartul
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-group-primary" />
              Kapsas
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-group-primary" checked />
              Peet
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-group-primary" />
              Kaalikas
            </label>
          </tedi-radio-card-group>
        </tedi-col>
        <tedi-col class="flex flex-column gap-2">
          <p tedi-text modifiers="bold">Secondary</p>
          <tedi-radio-card-group [grouped]="true">
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-group-secondary" />
              Kartul
            </label>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-group-secondary" checked />
              Kapsas
            </label>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-group-secondary" />
              Peet
            </label>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-group-secondary" />
              Kaalikas
            </label>
          </tedi-radio-card-group>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

/**
 * Radio cards with a description below the label text, shown separate and grouped for both variants.
 */
export const CardsWithDescription: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    styles: [
      `
        .cards-with-description tedi-radio-card-group {
          display: flex;
          align-items: stretch;
        }

        .cards-with-description label[tedi-radio-card] {
          flex: 1 1 12rem;
        }
      `,
    ],
    template: `
    <div class="cards-with-description flex flex-column gap-4">
      <div class="flex flex-column gap-2">
        <p tedi-text modifiers="bold">Primary</p>
        <tedi-radio-card-group [bordered]="true">
          <label tedi-radio-card variant="primary">
            <input tedi-radio type="radio" name="card-desc-primary" />
            Kartul
            <tedi-feedback-text text="Tärkliserikas mugulköögivili, mida kasutatakse laialt toiduks." />
          </label>
          <label tedi-radio-card variant="primary">
            <input tedi-radio type="radio" name="card-desc-primary" checked />
            Peet
            <tedi-feedback-text text="Magusamaitseline juurvili, mida süüakse nii toorelt kui ka kuumtöödeldult." />
          </label>
          <label tedi-radio-card variant="primary">
            <input tedi-radio type="radio" name="card-desc-primary" />
            Kapsas
            <tedi-feedback-text text="Lehtköögivili, mille tihedaid lehti kasutatakse mitmesugustes roogades." />
          </label>
        </tedi-radio-card-group>
      </div>
      <div class="flex flex-column gap-2">
        <p tedi-text modifiers="bold">Primary grouped</p>
        <tedi-radio-card-group [grouped]="true">
          <label tedi-radio-card variant="primary">
            <input tedi-radio type="radio" name="card-desc-primary-grouped" />
            Kartul
            <tedi-feedback-text text="Tärkliserikas mugulköögivili, mida kasutatakse laialt toiduks." />
          </label>
          <label tedi-radio-card variant="primary">
            <input tedi-radio type="radio" name="card-desc-primary-grouped" checked />
            Peet
            <tedi-feedback-text text="Magusamaitseline juurvili, mida süüakse nii toorelt kui ka kuumtöödeldult." />
          </label>
          <label tedi-radio-card variant="primary">
            <input tedi-radio type="radio" name="card-desc-primary-grouped" />
            Kapsas
            <tedi-feedback-text text="Lehtköögivili, mille tihedaid lehti kasutatakse mitmesugustes roogades." />
          </label>
        </tedi-radio-card-group>
      </div>
      <div class="flex flex-column gap-2">
        <p tedi-text modifiers="bold">Secondary</p>
        <tedi-radio-card-group>
          <label tedi-radio-card variant="secondary">
            <input tedi-radio type="radio" name="card-desc-secondary" />
            Kartul
            <tedi-feedback-text text="Tärkliserikas mugulköögivili, mida kasutatakse laialt toiduks." />
          </label>
          <label tedi-radio-card variant="secondary">
            <input tedi-radio type="radio" name="card-desc-secondary" checked />
            Peet
            <tedi-feedback-text text="Magusamaitseline juurvili, mida süüakse nii toorelt kui ka kuumtöödeldult." />
          </label>
          <label tedi-radio-card variant="secondary">
            <input tedi-radio type="radio" name="card-desc-secondary" />
            Kapsas
            <tedi-feedback-text text="Lehtköögivili, mille tihedaid lehti kasutatakse mitmesugustes roogades." />
          </label>
        </tedi-radio-card-group>
      </div>
      <div class="flex flex-column gap-2">
        <p tedi-text modifiers="bold">Secondary grouped</p>
        <tedi-radio-card-group [grouped]="true">
          <label tedi-radio-card variant="secondary">
            <input tedi-radio type="radio" name="card-desc-secondary-grouped" />
            Kartul
            <tedi-feedback-text text="Tärkliserikas mugulköögivili, mida kasutatakse laialt toiduks." />
          </label>
          <label tedi-radio-card variant="secondary">
            <input tedi-radio type="radio" name="card-desc-secondary-grouped" checked />
            Peet
            <tedi-feedback-text text="Magusamaitseline juurvili, mida süüakse nii toorelt kui ka kuumtöödeldult." />
          </label>
          <label tedi-radio-card variant="secondary">
            <input tedi-radio type="radio" name="card-desc-secondary-grouped" />
            Kapsas
            <tedi-feedback-text text="Lehtköögivili, mille tihedaid lehti kasutatakse mitmesugustes roogades." />
          </label>
        </tedi-radio-card-group>
      </div>
    </div>
    `,
  }),
};

/**
 * Radio cards with icons before the label text, with and without a description.
 */
export const CardsWithIcons: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    styles: [
      `
        .cards-with-icons__stretch {
          display: flex;
          align-items: stretch;
        }

        .cards-with-icons__stretch label[tedi-radio-card] {
          flex: 1 1 12rem;
        }
      `,
    ],
    template: `
    <div class="flex flex-column gap-4">
      <tedi-row [gapY]="3" [xs]="{cols: 1}" [md]="{cols: 2}">
        <tedi-col class="flex flex-column gap-2">
          <p tedi-text modifiers="bold">Primary</p>
        <tedi-radio-card-group [bordered]="true">
          <label tedi-radio-card variant="primary">
            <input tedi-radio type="radio" name="card-icon-primary" />
            <tedi-icon name="directions_subway" [size]="18" />
            Trammiga
          </label>
          <label tedi-radio-card variant="primary">
            <input tedi-radio type="radio" name="card-icon-primary" checked />
            <tedi-icon name="directions_walk" [size]="18" />
            Jalgsi
          </label>
          <label tedi-radio-card variant="primary">
            <input tedi-radio type="radio" name="card-icon-primary" />
            <tedi-icon name="directions_car" [size]="18" />
            Autoga
          </label>
        </tedi-radio-card-group>
        </tedi-col>
        <tedi-col class="flex flex-column gap-2">
          <p tedi-text modifiers="bold">Secondary</p>
        <tedi-radio-card-group>
          <label tedi-radio-card variant="secondary">
            <input tedi-radio type="radio" name="card-icon-secondary" />
            <tedi-icon name="directions_subway" [size]="18" />
            Trammiga
          </label>
          <label tedi-radio-card variant="secondary">
            <input tedi-radio type="radio" name="card-icon-secondary" checked />
            <tedi-icon name="directions_walk" [size]="18" />
            Jalgsi
          </label>
          <label tedi-radio-card variant="secondary">
            <input tedi-radio type="radio" name="card-icon-secondary" />
            <tedi-icon name="directions_car" [size]="18" />
            Autoga
          </label>
        </tedi-radio-card-group>
        </tedi-col>
      </tedi-row>
      <div class="flex flex-column gap-2">
        <p tedi-text modifiers="bold">Primary with description</p>
        <tedi-radio-card-group [bordered]="true" class="cards-with-icons__stretch">
          <label tedi-radio-card variant="primary">
            <input tedi-radio type="radio" name="card-icon-desc-primary" />
            <tedi-icon name="directions_subway" [size]="18" />
            Trammiga
            <tedi-feedback-text text="Soovitatud variant, vähendab ummikuid" />
          </label>
          <label tedi-radio-card variant="primary">
            <input tedi-radio type="radio" name="card-icon-desc-primary" checked />
            <tedi-icon name="directions_walk" [size]="18" />
            Jalgsi
            <tedi-feedback-text text="Soovitatud variant, vähendab ummikuid" />
          </label>
          <label tedi-radio-card variant="primary">
            <input tedi-radio type="radio" name="card-icon-desc-primary" />
            <tedi-icon name="directions_car" [size]="18" />
            Autoga
            <tedi-feedback-text text="Kui soovid kiiremini kohale jõuda, tekitab ummikuid" />
          </label>
        </tedi-radio-card-group>
      </div>
      <div class="flex flex-column gap-2">
        <p tedi-text modifiers="bold">Secondary with description</p>
        <tedi-radio-card-group class="cards-with-icons__stretch">
          <label tedi-radio-card variant="secondary">
            <input tedi-radio type="radio" name="card-icon-desc-secondary" />
            <tedi-icon name="directions_subway" [size]="18" />
            Trammiga
            <tedi-feedback-text text="Soovitatud variant, vähendab ummikuid" />
          </label>
          <label tedi-radio-card variant="secondary">
            <input tedi-radio type="radio" name="card-icon-desc-secondary" checked />
            <tedi-icon name="directions_walk" [size]="18" />
            Jalgsi
            <tedi-feedback-text text="Soovitatud variant, vähendab ummikuid" />
          </label>
          <label tedi-radio-card variant="secondary">
            <input tedi-radio type="radio" name="card-icon-desc-secondary" />
            <tedi-icon name="directions_car" [size]="18" />
            Autoga
            <tedi-feedback-text text="Kui soovid kiiremini kohale jõuda, tekitab ummikuid" />
          </label>
        </tedi-radio-card-group>
      </div>
    </div>
    `,
  }),
};

type GridPlace = [row: number, column: number | string];

/**
 * Lays a state matrix out on a grid whose columns never wrap into the row labels.
 * Every item gets a desktop and a mobile grid position, swapped below `md`:
 * `mobileLayout="rows"` puts each row label on its own line above cells that
 * share the width;
 * `mobileLayout="columns"` splits the matrix into one section per column, and
 * leaves out rows that have no cell in that column.
 * Each cell is rendered once, so input ids and radio names stay unique. Card
 * groups in error cells (`.state-matrix__error`) keep their natural width, while
 * the message may widen the column to stay on one line, and wraps only when the
 * matrix runs out of room. `desktopGrid` sets a minimum column width, row height
 * and gaps for the desktop layout.
 */
const stateMatrix = ({
  headers,
  rows,
  alignItems = "start",
  mobileLayout = "rows",
  desktopGrid,
}: {
  headers: string[];
  rows: { label: string; cells: string[] }[];
  alignItems?: "start" | "center";
  mobileLayout?: "rows" | "columns";
  desktopGrid?: {
    columnWidth: string;
    rowHeight: string;
    columnGap: string;
    rowGap: string;
  };
}) => {
  const columns = headers.length;
  const byColumns = mobileLayout === "columns";

  const columnRows = headers.map((_, c) => {
    let next = 0;
    return rows.map(({ cells }) => (cells[c] ? next++ : null));
  });
  const sectionStart = headers.map((_, c) =>
    columnRows
      .slice(0, c)
      .reduce(
        (start, column) =>
          start + column.filter((row) => row !== null).length + 1,
        1,
      ),
  );
  const mobileRow = (c: number, r: number) => {
    const row = columnRows[c][r];
    return row === null ? null : sectionStart[c] + row + 1;
  };

  const item = (
    tag: string,
    content: string,
    desktop: GridPlace | null,
    mobile: GridPlace | null,
    className = "",
  ) => {
    const classes = [
      className,
      desktop ? "" : "state-matrix__mobile-only",
      mobile ? "" : "state-matrix__desktop-only",
    ].join(" ");
    const style = [
      desktop ? `--d-row: ${desktop[0]}; --d-col: ${desktop[1]};` : "",
      mobile ? `--m-row: ${mobile[0]}; --m-col: ${mobile[1]};` : "",
    ].join(" ");
    return `<${tag} class="${classes.trim()}" style="${style.trim()}">${content}</${tag}>`;
  };

  const headerItems = headers.map((header, c) =>
    item(
      "strong",
      header,
      [1, c + 2],
      byColumns ? [sectionStart[c], "1 / -1"] : [1, c + 1],
      byColumns && c > 0 ? "state-matrix__section-title" : "",
    ),
  );

  const rowItems = rows.map(({ label, cells }, r) => {
    const labels = byColumns
      ? headers.map((_, c) => {
          const desktop: GridPlace | null = c === 0 ? [r + 2, 1] : null;
          const row = mobileRow(c, r);
          const mobile: GridPlace | null = row === null ? null : [row, 1];
          return desktop || mobile
            ? item("strong", label, desktop, mobile)
            : "";
        })
      : [
          item(
            "strong",
            label,
            [r + 2, 1],
            [2 * r + 2, "1 / -1"],
            "state-matrix__row-label",
          ),
        ];
    const cellItems = cells.map((cell, c) => {
      const row = byColumns ? mobileRow(c, r) : 2 * r + 3;
      return item(
        "div",
        cell,
        [r + 2, c + 2],
        row === null ? null : [row, byColumns ? 2 : c + 1],
      );
    });
    return [...labels, ...cellItems].join("");
  });

  return `
    <div class="state-matrix state-matrix--${mobileLayout} ${desktopGrid ? "state-matrix--fixed" : ""}" style="--_columns: ${columns}; --_align: ${alignItems}; ${desktopGrid ? `--_column-width: ${desktopGrid.columnWidth}; --_row-height: ${desktopGrid.rowHeight}; --_column-gap: ${desktopGrid.columnGap}; --_row-gap: ${desktopGrid.rowGap};` : ""}">
      <div class="state-matrix__grid">
        ${item("span", "", [1, 1], null)}
        ${headerItems.join("")}
        ${rowItems.join("")}
      </div>
    </div>`;
};

const stateMatrixStyles = [
  `
  .state-matrix__grid {
    display: grid;
    grid-template-columns: max-content repeat(
        var(--_columns),
        minmax(min-content, max-content)
      );
    gap: var(--layout-grid-gutters-16) var(--layout-grid-gutters-24);
    align-items: var(--_align);
  }

  .state-matrix__grid > * {
    grid-row: var(--d-row);
    grid-column: var(--d-col);
  }

  .state-matrix__grid > .state-matrix__mobile-only {
    display: none;
  }

  .state-matrix__error > :first-child {
    width: max-content;
  }

  @media (min-width: 48rem) {
    .state-matrix--fixed .state-matrix__grid {
      grid-template-columns:
        minmax(var(--_column-width), max-content)
        repeat(var(--_columns), minmax(var(--_column-width), max-content));
      grid-auto-rows: minmax(var(--_row-height), auto);
      gap: var(--_row-gap) var(--_column-gap);
    }
  }

  @media (max-width: 47.98rem) {
    .state-matrix--rows .state-matrix__grid {
      grid-template-columns: repeat(var(--_columns), minmax(0, 1fr));
    }

    .state-matrix--columns .state-matrix__grid {
      grid-template-columns: max-content minmax(0, 1fr);
    }

    .state-matrix__grid > * {
      grid-row: var(--m-row);
      grid-column: var(--m-col);
    }

    .state-matrix__grid > .state-matrix__mobile-only {
      display: block;
    }

    .state-matrix__grid > .state-matrix__desktop-only {
      display: none;
    }

    .state-matrix__row-label,
    .state-matrix__section-title {
      margin-top: var(--layout-grid-gutters-08);
    }
  }
`,
];

const stateRows: {
  label: string;
  id: string;
  attrs?: string;
  labelAttrs?: string;
  error?: boolean;
}[] = [
  { label: "Default", id: "Default" },
  { label: "Hover", id: "Hover" },
  { label: "Active", id: "Active" },
  { label: "Disabled", id: "Disabled", attrs: "disabled" },
  { label: "Focus", id: "Focus" },
  {
    label: "Mandatory",
    id: "Mandatory",
    labelAttrs: '[required]="true"',
    error: false,
  },
];

const stateId = (id: string, selected: boolean, error: boolean) =>
  `${id}${error ? "Error" : ""}${selected ? "Selected" : "Unselected"}`;

const stateCell = (
  { id, attrs = "", labelAttrs = "" }: (typeof stateRows)[number],
  selected: boolean,
  error = false,
) => {
  const radioId = stateId(id, selected, error);
  return `
  <div>
    <label tedi-label color="primary" class="flex align-items-center" ${labelAttrs}>
      <input tedi-radio type="radio" style="margin-right: var(--form-checkbox-radio-inner-spacing)" name="state-${radioId}" id="${radioId}" ${selected ? "checked" : ""} ${error ? '[invalid]="true"' : ""} ${attrs} />
      Tekst
    </label>
    ${error ? '<tedi-feedback-text text="Kohustuslik väli" type="error" />' : ""}
  </div>`;
};

const statePseudoIds = (id: string) =>
  [false, true].flatMap((error) =>
    [false, true].map((selected) => `#${stateId(id, selected, error)}`),
  );

/** Gives the States matrix more room between columns and rows on desktop. */
const statesDesktopGrid = {
  columnWidth: "10.375rem",
  rowHeight: "2.5rem",
  columnGap: "var(--layout-grid-gutters-16)",
  rowGap: "var(--layout-grid-gutters-08)",
};

export const States: StoryObj<RadioComponent> = {
  parameters: {
    pseudo: {
      hover: statePseudoIds("Hover"),
      active: statePseudoIds("Active"),
      focusVisible: statePseudoIds("Focus"),
    },
  },
  render: (args) => ({
    props: args,
    template: stateMatrix({
      headers: ["Unselected", "Selected", "Error unselected", "Error selected"],
      alignItems: "center",
      mobileLayout: "columns",
      desktopGrid: statesDesktopGrid,
      rows: stateRows.map((row) => ({
        label: row.label,
        cells: [
          stateCell(row, false),
          stateCell(row, true),
          row.error === false ? "" : stateCell(row, false, true),
          row.error === false ? "" : stateCell(row, true, true),
        ],
      })),
    }),
    styles: stateMatrixStyles,
  }),
};

type CardColumn = "Unselected" | "Borderless" | "Selected" | "Grouped";

const cardColumns: Record<
  "primary" | "secondary",
  { column: CardColumn; title: string }[]
> = {
  primary: [
    { column: "Unselected", title: "Unselected" },
    { column: "Borderless", title: "Unselected borderless" },
    { column: "Selected", title: "Selected" },
    { column: "Grouped", title: "Grouped" },
  ],
  secondary: [
    { column: "Unselected", title: "Unselected" },
    { column: "Selected", title: "Selected" },
    { column: "Grouped", title: "Grouped" },
  ],
};

const cardStates: { label: string; attrs?: string }[] = [
  { label: "Default" },
  { label: "Hover" },
  { label: "Active" },
  { label: "Focus" },
  { label: "Disabled", attrs: "disabled" },
];

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const cardStateId = (variant: string, column: CardColumn, state: string) =>
  `Radio${capitalize(variant)}${column}${state}`;

const cardStatesPseudo = (variant: "primary" | "secondary") => {
  const ids = (state: string) =>
    cardColumns[variant].map(
      ({ column }) => `#${cardStateId(variant, column, state)}`,
    );
  return {
    hover: ids("Hover"),
    active: ids("Active"),
    focusVisible: ids("Focus"),
  };
};

const cardStatesTemplate = (variant: "primary" | "secondary") => {
  const card = (
    name: string,
    selected: boolean,
    id = "",
    attrs = "",
    labelAttrs = "",
  ) => `
          <label tedi-radio-card variant="${variant}" ${labelAttrs}>
            <input tedi-radio type="radio" name="${name}" ${id ? `id="${id}"` : ""} ${selected ? "checked" : ""} ${attrs} />
            Tekst
          </label>`;

  const cell = (column: CardColumn, state: string, attrs = "") => {
    const id = cardStateId(variant, column, state);
    const isError = state === "Error";
    const selected = column === "Selected" || column === "Grouped";
    const bordered = column === "Unselected" ? '[bordered]="true"' : "";

    if (column !== "Grouped" && !isError) {
      return `<div>${card(id, selected, id, attrs, bordered)}</div>`;
    }

    const grouped = column === "Grouped" ? '[grouped]="true"' : "";
    const message = selected
      ? "Valitud väärtus ei sobi ajavahemikuga"
      : "Kohustuslik on valida vähemalt 1 väärtus";
    return `
        <div class="flex flex-column gap-1 state-matrix__error">
          <tedi-radio-card-group ${grouped} ${bordered}>${card(id, selected, isError ? "" : id, attrs)}${card(id, false, "", attrs)}
          </tedi-radio-card-group>
          ${isError ? `<tedi-feedback-text text="${message}" type="error" />` : ""}
        </div>`;
  };

  const columns = cardColumns[variant];
  return stateMatrix({
    headers: columns.map(({ title }) => title),
    alignItems: "center",
    mobileLayout: "columns",
    rows: [...cardStates, { label: "Error" }].map(
      ({ label, attrs }: { label: string; attrs?: string }) => ({
        label,
        cells: columns.map(({ column }) => cell(column, label, attrs)),
      }),
    ),
  });
};

export const CardStatesPrimary: StoryObj<RadioComponent> = {
  parameters: { pseudo: cardStatesPseudo("primary") },
  render: (args) => ({
    props: args,
    template: cardStatesTemplate("primary"),
    styles: stateMatrixStyles,
  }),
};

export const CardStatesSecondary: StoryObj<RadioComponent> = {
  parameters: { pseudo: cardStatesPseudo("secondary") },
  render: (args) => ({
    props: args,
    template: cardStatesTemplate("secondary"),
    styles: stateMatrixStyles,
  }),
};

/**
 * The group supports two form-binding modes:
 *
 * - **Group-level**: bind `[formControl]` to `<tedi-radio-group>`. The group
 *   coordinates `name`, `checked`, and `disabled` across children. Emits the
 *   selected `value` (string) as a single control.
 * - **Individual-level (Angular native)**: bind `[formControl]` to each
 *   `<input type="radio">` using Angular's built-in `RadioControlValueAccessor`.
 *   All radios sharing the same control coordinate via their `name` attribute.
 */
export const WithReactiveForms: StoryObj<RadioComponent> = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => {
    const statusControl = new FormControl<string | null>("active");
    const planControl = new FormControl<string | null>("pro");
    const priorityControl = new FormControl<string | null>("medium");

    return {
      props: { statusControl, planControl, priorityControl },
      template: `
        <tedi-row cols="1" [gapY]="3">
          <tedi-col>
            <tedi-radio-group label="Staatus" name="status" [formControl]="statusControl">
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-radio type="radio" value="all" />
                Kõik
              </label>
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-radio type="radio" value="active" />
                Aktiivne
              </label>
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-radio type="radio" value="done" />
                Lõpetatud
              </label>
            </tedi-radio-group>
          </tedi-col>

          <tedi-col>
            <tedi-radio-group label="Pakett" name="plan" [formControl]="planControl">
              <tedi-radio-card-group [grouped]="true">
                <label tedi-radio-card variant="primary">
                  <input tedi-radio type="radio" value="basic" />
                  Põhi
                </label>
                <label tedi-radio-card variant="primary">
                  <input tedi-radio type="radio" value="pro" />
                  Pro
                </label>
                <label tedi-radio-card variant="primary">
                  <input tedi-radio type="radio" value="enterprise" />
                  Ettevõte
                </label>
              </tedi-radio-card-group>
            </tedi-radio-group>
          </tedi-col>

          <tedi-col>
            <tedi-radio-group label="Prioriteet">
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-radio type="radio" [formControl]="priorityControl" name="priority" value="low" />
                Madal
              </label>
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-radio type="radio" [formControl]="priorityControl" name="priority" value="medium" />
                Keskmine
              </label>
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-radio type="radio" [formControl]="priorityControl" name="priority" value="high" />
                Kõrge
              </label>
            </tedi-radio-group>
          </tedi-col>

          <tedi-col>
            <tedi-alert type="info" [showClose]="false">
              <pre tedi-text modifiers="small">{{ {
  status: {
    value: statusControl.value,
    touched: statusControl.touched,
    dirty: statusControl.dirty
  },
  plan: {
    value: planControl.value,
    touched: planControl.touched,
    dirty: planControl.dirty
  },
  priority: {
    value: priorityControl.value,
    touched: priorityControl.touched,
    dirty: priorityControl.dirty
  }
} | json }}</pre>
            </tedi-alert>
          </tedi-col>
        </tedi-row>
      `,
    };
  },
};
