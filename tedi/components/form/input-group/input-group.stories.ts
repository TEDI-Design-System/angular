import { argsToTemplate, Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { InputGroupComponent } from "./input-group.component";
import { InputGroupPrefixDirective } from "./input-group-prefix.directive";
import { InputGroupSuffixDirective } from "./input-group-suffix.directive";
import { FormFieldComponent } from "../form-field/form-field.component";
import { TextFieldComponent } from "../text-field/text-field.component";
import { SelectComponent } from "../select/select.component";
import { DateFieldComponent } from "../date-field/date-field.component";
import { TimeFieldComponent } from "../time-field/time-field.component";
import { LabelComponent } from "../label/label.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { IconComponent } from "../../base/icon/icon.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { TextComponent } from "../../base/text/text.component";
import { VerticalSpacingDirective } from "../../../directives/vertical-spacing/vertical-spacing.directive";
import { DropdownComponent } from "../../overlay/dropdown/dropdown.component";
import { DropdownTriggerDirective } from "../../overlay/dropdown/dropdown-trigger/dropdown-trigger.directive";
import { DropdownContentComponent } from "../../overlay/dropdown/dropdown-content/dropdown-content.component";
import { DropdownItemComponent } from "../../overlay/dropdown/dropdown-item/dropdown-item.component";
import { DropdownItemValueComponent } from "../../overlay/dropdown/dropdown-item-value/dropdown-item-value.component";
import { DropdownItemValueLabelComponent } from "../../overlay/dropdown/dropdown-item-value/dropdown-item-value-label.component";
import { DropdownItemValueMetaComponent } from "../../overlay/dropdown/dropdown-item-value/dropdown-item-value-meta.component";
import { SelectOptionTemplateDirective } from "../select/select-templates.directive";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY?node-id=4968-94396&m=dev" target="_blank">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/18b6b5-input-group" target="_blank">Zeroheight ↗</a>
 *
 * InputGroup is a flexible wrapper that composes a form control with prefixes
 * and suffixes. Project a `label[tedi-label]`, a control (`tedi-form-field`,
 * `tedi-select`, …), optional `[tediInputGroupPrefix]` / `[tediInputGroupSuffix]`
 * addons, and an optional `tedi-feedback-text`.
 *
 * The projected label names a native control through `[for]`. `tedi-select`'s
 * trigger is not a labelable element, so give the label an `id` and pass it to
 * the select's `ariaLabelledby` — that names the combobox and makes the label
 * open the dropdown.
 */
const meta: Meta<InputGroupComponent> = {
  title: "TEDI-Ready/Components/Form/InputGroup",
  component: InputGroupComponent,
  decorators: [
    moduleMetadata({
      imports: [
        InputGroupComponent,
        InputGroupPrefixDirective,
        InputGroupSuffixDirective,
        FormFieldComponent,
        TextFieldComponent,
        SelectComponent,
        DateFieldComponent,
        TimeFieldComponent,
        LabelComponent,
        FeedbackTextComponent,
        ButtonComponent,
        IconComponent,
        RowComponent,
        ColComponent,
        TextComponent,
        VerticalSpacingDirective,
        DropdownComponent,
        DropdownTriggerDirective,
        DropdownContentComponent,
        DropdownItemComponent,
        DropdownItemValueComponent,
        DropdownItemValueLabelComponent,
        DropdownItemValueMetaComponent,
        SelectOptionTemplateDirective,
      ],
    }),
  ],
  argTypes: {
    addons: {
      description:
        "Merges the borders and radii of the addons and the control into a single visual unit. Disable for detached addons such as an action button.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    disabled: {
      description: "Disables the whole group and propagates it to the control.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    invalid: {
      description: "Marks the whole group as invalid. Pair with an error feedback text.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
};

export default meta;

type Story = StoryObj<InputGroupComponent>;

const CURRENCIES = ["EUR", "USD", "GBP", "SEK"];
const DIAL_CODES = ["372", "371", "370", "358"];
const TIMEZONES = ["UTC", "EET", "CET", "EST"];
const ACCOUNTS = [
  { value: "checking", name: "Arvelduskonto", number: "EE38 2200 2210 2014 5685" },
  { value: "savings", name: "Kogumiskonto", number: "EE96 2200 2210 2014 7283" },
  { value: "investment", name: "Investeerimiskonto", number: "EE27 2200 2210 2014 8120" },
];
const MEETINGS = [
  { value: "weekly-sync", label: "Iganädalane koosolek · E 09:00" },
  { value: "product-review", label: "Tooteülevaatus · K 14:00" },
  { value: "all-hands", label: "Üldkoosolek · R 11:00" },
];

export const StartStatic: Story = {
  args: { addons: true, disabled: false, invalid: false },
  render: (args) => ({
    props: args,
    template: `
      <tedi-input-group ${argsToTemplate(args)}>
        <label tedi-label [for]="'start-static'">Aadress</label>
        <span tediInputGroupPrefix>Tänav</span>
        <tedi-form-field>
          <input tedi-text-field id="start-static" />
        </tedi-form-field>
      </tedi-input-group>
    `,
  }),
};

/**
 * An interactive addon (a `tedi-dropdown` in listbox mode) can lead the control.
 * Bind the dropdown's `value` so the trigger reflects — and the menu highlights —
 * the current selection.
 */
export const StartDynamic: Story = {
  render: () => ({
    props: {
      dial: DIAL_CODES[0],
      dials: DIAL_CODES,
      currency: CURRENCIES[0],
      currencies: CURRENCIES,
      accounts: ACCOUNTS,
    },
    template: `
      <tedi-row [cols]="1" [gapY]="2">
        <tedi-row cols="1" [md]="{ cols: 2 }">
          <tedi-col>
            <tedi-input-group>
              <label tedi-label [for]="'start-phone'">Telefoninumber</label>
              <tedi-dropdown tediInputGroupPrefix [(value)]="dial">
                <button type="button" tedi-dropdown-trigger>
                  +{{ dial }} <tedi-icon name="arrow_drop_down" color="inherit" />
                </button>
                <tedi-dropdown-content dropdownRole="listbox">
                  @for (d of dials; track d) {
                    <li tedi-dropdown-item [value]="d">+{{ d }}</li>
                  }
                </tedi-dropdown-content>
              </tedi-dropdown>
              <tedi-form-field>
                <input tedi-text-field id="start-phone" type="tel" />
              </tedi-form-field>
            </tedi-input-group>
          </tedi-col>
        </tedi-row>
        <tedi-row cols="1" [md]="{ cols: 2 }">
          <tedi-col>
            <tedi-input-group>
              <label tedi-label id="start-transfer-label" [for]="'start-transfer'">Maksja konto</label>
              <tedi-dropdown tediInputGroupPrefix [(value)]="currency">
                <button type="button" tedi-dropdown-trigger>
                  {{ currency }} <tedi-icon name="arrow_drop_down" color="inherit" />
                </button>
                <tedi-dropdown-content dropdownRole="listbox">
                  @for (c of currencies; track c) {
                    <li tedi-dropdown-item [value]="c">{{ c }}</li>
                  }
                </tedi-dropdown-content>
              </tedi-dropdown>
              <tedi-select
                inputId="start-transfer"
                ariaLabelledby="start-transfer-label"
                [options]="accounts"
                bindLabel="name"
                bindValue="value"
                placeholder="Vali konto"
                ellipsis="end"
              >
                <ng-template tediSelectOption let-item>
                  <tedi-dropdown-item-value layout="vertical">
                    <tedi-dropdown-item-value-label>{{ item.name }}</tedi-dropdown-item-value-label>
                    <tedi-dropdown-item-value-meta>{{ item.number }}</tedi-dropdown-item-value-meta>
                  </tedi-dropdown-item-value>
                </ng-template>
              </tedi-select>
            </tedi-input-group>
          </tedi-col>
        </tedi-row>
      </tedi-row>
    `,
  }),
};

export const EndStatic: Story = {
  args: { addons: true, disabled: false, invalid: false },
  render: (args) => ({
    props: args,
    template: `
      <tedi-input-group ${argsToTemplate(args)}>
        <label tedi-label [for]="'end-static'">Hind</label>
        <tedi-form-field>
          <input tedi-text-field id="end-static" />
        </tedi-form-field>
        <span tediInputGroupSuffix>EUR</span>
      </tedi-input-group>
    `,
  }),
};

/**
 * The same interactive addon can trail the control. The whole addon is the
 * dropdown trigger, and the selected option stays highlighted in the menu.
 */
export const EndDynamic: Story = {
  render: () => ({
    props: {
      currency: CURRENCIES[0],
      currencies: CURRENCIES,
      timezone: TIMEZONES[0],
      timezones: TIMEZONES,
      meetings: MEETINGS,
    },
    template: `
      <tedi-row [cols]="1" [gapY]="2">
        <tedi-row cols="1" [md]="{ cols: 2 }">
          <tedi-col>
            <tedi-input-group>
              <label tedi-label [for]="'end-cost'">Hind</label>
              <tedi-form-field>
                <input tedi-text-field id="end-cost" type="tel" />
              </tedi-form-field>
              <tedi-dropdown tediInputGroupSuffix [(value)]="currency">
                <button type="button" tedi-dropdown-trigger>
                  {{ currency }} <tedi-icon name="arrow_drop_down" color="inherit" />
                </button>
                <tedi-dropdown-content dropdownRole="listbox">
                  @for (c of currencies; track c) {
                    <li tedi-dropdown-item [value]="c">{{ c }}</li>
                  }
                </tedi-dropdown-content>
              </tedi-dropdown>
            </tedi-input-group>
          </tedi-col>
        </tedi-row>
        <tedi-row cols="1" [md]="{ cols: 2 }">
          <tedi-col>
            <tedi-input-group>
              <label tedi-label id="end-schedule-label" [for]="'end-schedule'">Ajakava</label>
              <tedi-select
                inputId="end-schedule"
                ariaLabelledby="end-schedule-label"
                [options]="meetings"
                placeholder="Vali kohtumine"
                ellipsis="end"
              />
              <tedi-dropdown tediInputGroupSuffix [(value)]="timezone">
                <button type="button" tedi-dropdown-trigger>
                  {{ timezone }} <tedi-icon name="arrow_drop_down" color="inherit" />
                </button>
                <tedi-dropdown-content dropdownRole="listbox">
                  @for (t of timezones; track t) {
                    <li tedi-dropdown-item [value]="t">{{ t }}</li>
                  }
                </tedi-dropdown-content>
              </tedi-dropdown>
            </tedi-input-group>
          </tedi-col>
        </tedi-row>
      </tedi-row>
    `,
  }),
};

const STATES = ["Default", "Hover", "Focus", "Active"];

export const States: StoryObj = {
  render: () => ({
    props: { states: STATES },
    template: `
      <tedi-row [cols]="1" [gapY]="2">
        @for (state of states; track state) {
          <tedi-row cols="1" [md]="{ cols: 12 }" [gapX]="2" [gapY]="1" alignItems="center">
            <tedi-col [width]="12" [md]="{ width: 2 }">
              <p tedi-text modifiers="bold">{{ state }}</p>
            </tedi-col>
            <tedi-col [width]="12" [md]="{ width: 5 }">
              <tedi-input-group>
                <label tedi-label [for]="state + '-start'">Silt</label>
                <span tediInputGroupPrefix>Tänav</span>
                <tedi-form-field>
                  <input tedi-text-field [id]="state + '-start'" />
                </tedi-form-field>
              </tedi-input-group>
            </tedi-col>
            <tedi-col [width]="12" [md]="{ width: 5 }">
              <tedi-input-group>
                <label tedi-label [for]="state + '-end'">Silt</label>
                <tedi-form-field>
                  <input tedi-text-field [id]="state + '-end'" />
                </tedi-form-field>
                <span tediInputGroupSuffix>EUR</span>
              </tedi-input-group>
            </tedi-col>
          </tedi-row>
        }
        <tedi-row cols="1" [md]="{ cols: 12 }" [gapX]="2" [gapY]="1" alignItems="center">
          <tedi-col [width]="12" [md]="{ width: 2 }">
            <p tedi-text modifiers="bold">Disabled</p>
          </tedi-col>
          <tedi-col [width]="12" [md]="{ width: 5 }">
            <tedi-input-group [disabled]="true">
              <label tedi-label [for]="'disabled-start'">Silt</label>
              <span tediInputGroupPrefix>Tänav</span>
              <tedi-form-field>
                <input tedi-text-field id="disabled-start" />
              </tedi-form-field>
            </tedi-input-group>
          </tedi-col>
          <tedi-col [width]="12" [md]="{ width: 5 }">
            <tedi-input-group [disabled]="true">
              <label tedi-label [for]="'disabled-end'">Silt</label>
              <tedi-form-field>
                <input tedi-text-field id="disabled-end" />
              </tedi-form-field>
              <span tediInputGroupSuffix>EUR</span>
            </tedi-input-group>
          </tedi-col>
        </tedi-row>
        <tedi-row cols="1" [md]="{ cols: 12 }" [gapX]="2" [gapY]="1" alignItems="start">
          <tedi-col [width]="12" [md]="{ width: 2 }">
            <p tedi-text modifiers="bold">Error</p>
          </tedi-col>
          <tedi-col [width]="12" [md]="{ width: 5 }">
            <tedi-input-group [invalid]="true">
              <label tedi-label [for]="'error-start'">Silt</label>
              <span tediInputGroupPrefix>Tänav</span>
              <tedi-form-field>
                <input tedi-text-field id="error-start" />
              </tedi-form-field>
              <tedi-feedback-text text="Tagasiside tekst" type="error" />
            </tedi-input-group>
          </tedi-col>
          <tedi-col [width]="12" [md]="{ width: 5 }">
            <tedi-input-group [invalid]="true">
              <label tedi-label [for]="'error-end'">Silt</label>
              <tedi-form-field>
                <input tedi-text-field id="error-end" />
              </tedi-form-field>
              <span tediInputGroupSuffix>EUR</span>
              <tedi-feedback-text text="Tagasiside tekst" type="error" />
            </tedi-input-group>
          </tedi-col>
        </tedi-row>
      </tedi-row>
    `,
  }),
  parameters: {
    pseudo: {
      hover: ["#Hover-start", "#Hover-end"],
      focusVisible: ["#Focus-start", "#Focus-end"],
      active: ["#Active-start", "#Active-end"],
    },
  },
};

/**
 * When an addon is a standalone action (e.g. a button), disable `addons` so it
 * keeps its own styling and does not visually merge into the control.
 */
export const WithButtonAddons: Story = {
  args: { addons: false },
  render: (args) => ({
    props: args,
    template: `
      <div [tediVerticalSpacing]="1">
        <tedi-input-group ${argsToTemplate(args)}>
          <label tedi-label [for]="'promo'">Sooduskood</label>
          <tedi-form-field>
            <input tedi-text-field id="promo" placeholder="Sisesta sooduskood" />
          </tedi-form-field>
          <span tediInputGroupSuffix>
            <button tedi-button>Rakenda</button>
          </span>
        </tedi-input-group>

        <tedi-input-group [addons]="false" [disabled]="true">
          <label tedi-label [for]="'promo-disabled'">Sooduskood (keelatud)</label>
          <tedi-form-field>
            <input tedi-text-field id="promo-disabled" placeholder="Sisesta sooduskood" />
          </tedi-form-field>
          <span tediInputGroupSuffix>
            <button tedi-button [disabled]="true">Rakenda</button>
          </span>
        </tedi-input-group>
      </div>
    `,
  }),
};

/**
 * Feedback text is projected as a `tedi-feedback-text` below the group. Pair an
 * error message with the `invalid` input so the whole group — addon borders and
 * the inner control — reflects the error state.
 */
export const WithFeedbackText: Story = {
  render: () => ({
    template: `
      <div [tediVerticalSpacing]="1">
        <tedi-input-group>
          <label tedi-label [for]="'feedback-hint'">Summa</label>
          <tedi-form-field>
            <input tedi-text-field id="feedback-hint" placeholder="0.00" />
          </tedi-form-field>
          <span tediInputGroupSuffix>EUR</span>
          <tedi-feedback-text text="Sisesta summa eurodes" type="hint" />
        </tedi-input-group>

        <tedi-input-group [invalid]="true">
          <label tedi-label [for]="'feedback-error'">Summa</label>
          <tedi-form-field>
            <input tedi-text-field id="feedback-error" placeholder="0.00" />
          </tedi-form-field>
          <span tediInputGroupSuffix>EUR</span>
          <tedi-feedback-text text="See väli on kohustuslik" type="error" />
        </tedi-input-group>
      </div>
    `,
  }),
};

/**
 * Every supported form control. Text, date, and time fields are wrapped in a
 * `tedi-form-field`; `tedi-select` is projected directly.
 */
export const AllControls: StoryObj = {
  render: () => ({
    props: { accounts: ACCOUNTS },
    template: `
      <tedi-row [cols]="1" [gapY]="2">
        <tedi-col>
          <tedi-input-group>
            <label tedi-label [for]="'all-text'">Tekst</label>
            <span tediInputGroupPrefix>€</span>
            <tedi-form-field>
              <input tedi-text-field id="all-text" placeholder="0.00" />
            </tedi-form-field>
            <span tediInputGroupSuffix>EUR</span>
            <tedi-feedback-text text="Sisesta summa eurodes" type="hint" />
          </tedi-input-group>
        </tedi-col>
        <tedi-col>
          <tedi-input-group [invalid]="true">
            <label tedi-label id="all-select-label" [for]="'all-select'">Valikmenüü</label>
            <span tediInputGroupPrefix>€</span>
            <tedi-select
              inputId="all-select"
              ariaLabelledby="all-select-label"
              [options]="accounts"
              bindLabel="name"
              bindValue="value"
              placeholder="Vali konto"
              state="error"
              ellipsis="end"
            >
              <ng-template tediSelectOption let-item>
                <tedi-dropdown-item-value layout="vertical">
                  <tedi-dropdown-item-value-label>{{ item.name }}</tedi-dropdown-item-value-label>
                  <tedi-dropdown-item-value-meta>{{ item.number }}</tedi-dropdown-item-value-meta>
                </tedi-dropdown-item-value>
              </ng-template>
            </tedi-select>
            <span tediInputGroupSuffix>EUR</span>
            <tedi-feedback-text text="Vali makset kandev konto" type="error" />
          </tedi-input-group>
        </tedi-col>
        <tedi-col>
          <tedi-input-group>
            <label tedi-label [for]="'all-date'">Kuupäev</label>
            <span tediInputGroupPrefix>Alates</span>
            <tedi-form-field>
              <tedi-date-field inputId="all-date" />
            </tedi-form-field>
            <span tediInputGroupSuffix>UTC</span>
            <tedi-feedback-text text="Vali kuupäev kalendrist" type="hint" />
          </tedi-input-group>
        </tedi-col>
        <tedi-col>
          <tedi-input-group>
            <label tedi-label [for]="'all-time'">Kellaaeg</label>
            <span tediInputGroupPrefix>Kell</span>
            <tedi-form-field>
              <tedi-time-field inputId="all-time" />
            </tedi-form-field>
            <span tediInputGroupSuffix>EET</span>
            <tedi-feedback-text text="Vali kellaaeg" type="hint" />
          </tedi-input-group>
        </tedi-col>
      </tedi-row>
    `,
  }),
};
