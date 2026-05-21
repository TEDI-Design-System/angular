import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { FilterComponent } from "./filter.component";
import { FilterContentDirective } from "./filter-content.directive";
import { FilterPrependDirective } from "./filter-prepend.directive";
import { FilterGroupComponent } from "./filter-group.component";
import { AlertComponent } from "../notifications/alert/alert.component";
import { ButtonComponent } from "../buttons/button/button.component";
import { RowComponent } from "../helpers/grid/row/row.component";
import { ColComponent } from "../helpers/grid/col/col.component";
import { SeparatorComponent } from "../helpers/separator/separator.component";
import { StatusBadgeComponent } from "../tags/status-badge/status-badge.component";
import { StatusIndicatorComponent } from "../tags/status-indicator/status-indicator.component";
import { TagComponent } from "../tags/tag/tag.component";
import { TextComponent } from "../base/text/text.component";
import { IconComponent } from "../base/icon/icon.component";
import { RadioComponent } from "../form/radio/radio.component";
import { RadioGroupComponent } from "../form/radio-group/radio-group.component";
import { LabelComponent } from "../form/label/label.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.45.70?node-id=4612-83722&m=dev" target="_blank">Figma ↗</a>
 */
export default {
  title: "TEDI-Ready/Components/Filter",
  component: FilterComponent,
  decorators: [
    moduleMetadata({
      imports: [
        AlertComponent,
        ButtonComponent,
        FilterComponent,
        FilterContentDirective,
        FilterPrependDirective,
        FilterGroupComponent,
        IconComponent,
        ReactiveFormsModule,
        RowComponent,
        ColComponent,
        SeparatorComponent,
        StatusBadgeComponent,
        StatusIndicatorComponent,
        TagComponent,
        TextComponent,
        RadioComponent,
        RadioGroupComponent,
        LabelComponent,
      ],
    }),
  ],
  argTypes: {
    text: {
      description: "Filter label text",
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string" },
        defaultValue: { summary: "''" },
      },
    },
    variant: {
      description: "Visual variant of the filter",
      control: { type: "radio" },
      options: ["primary", "secondary"],
      table: {
        category: "inputs",
        type: { summary: "FilterVariant" },
        defaultValue: { summary: "primary" },
      },
    },
    size: {
      description: "Size of the filter",
      control: { type: "radio" },
      options: ["default", "large"],
      table: {
        category: "inputs",
        type: { summary: "FilterSize" },
        defaultValue: { summary: "default" },
      },
    },
    selected: {
      description: "Whether the filter is selected (boolean toggle mode, used when no options are provided)",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    allowMultiple: {
      description:
        "Multi-select mode opens a dropdown with checkbox options. Value is treated as `string[]` when true",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    value: {
      description:
        "Selected value (`string`) or values (`string[]`) depending on `allowMultiple`. Two-way bound",
      control: false,
      table: {
        category: "inputs",
        type: { summary: "string | string[]" },
        defaultValue: { summary: "''" },
      },
    },
    options: {
      description: "Options for the dropdown. Enables single-select mode, or multiselect when combined with multiselect input",
      control: { type: "object" },
      table: {
        category: "inputs",
        type: { summary: "FilterOption[]" },
        defaultValue: { summary: "[]" },
      },
    },
    searchable: {
      description: "Show search field in the dropdown",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    showSelectAll: {
      description: 'Show "Select all" option in the dropdown',
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    showClear: {
      description: 'Show "Clear selection" action in the dropdown',
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    selectAllLabel: {
      description: 'Override for the "Select all" option label. Defaults to the translated string',
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string | undefined" },
        defaultValue: { summary: "translated" },
      },
    },
    clearLabel: {
      description: 'Override for the "Clear selection" action label. Defaults to the translated string',
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string | undefined" },
        defaultValue: { summary: "translated" },
      },
    },
    appendTo: {
      description:
        "Append dropdown to given selector. Use 'body' to append at end of DOM",
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string" },
        defaultValue: { summary: "''" },
      },
    },
    disabled: {
      description:
        "Whether the filter is disabled. Also set by a disabled FormControl or a disabled FilterGroup",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
} as Meta<FilterComponent>;

export const Default: StoryObj<FilterComponent> = {
  args: {
    text: "Teenused",
  },
};

export const Size: StoryObj<FilterComponent> = {
  render: () => ({
    template: `
      <div style="background: var(--general-surface-primary); padding: 24px;">
      <tedi-row [cols]="2" [gapY]="3" alignItems="center">
        <tedi-col><p tedi-text modifiers="bold">Default</p></tedi-col>
        <tedi-col class="flex flex-wrap gap-2">
          <tedi-filter text="Text" [selected]="true" />
          <tedi-filter text="Text" />
          <tedi-filter text="Text" />
          <tedi-filter text="Text" />
        </tedi-col>
        <tedi-col><p tedi-text modifiers="bold">Large</p></tedi-col>
        <tedi-col class="flex flex-wrap gap-2">
          <tedi-filter text="Text" size="large" [selected]="true" />
          <tedi-filter text="Text" size="large" />
          <tedi-filter text="Text" size="large" />
          <tedi-filter text="Text" size="large" />
        </tedi-col>
      </tedi-row>
      </div>
    `,
  }),
};

/**
 * Single value filters include boolean toggles (separate and grouped) and single-select dropdown filters.
 */
export const SingleValueFilter: StoryObj<FilterComponent> = {
  render: () => ({
    props: {
      teenusOptions: [
        { label: "Optometristi vastuvõtt", value: "1" },
        { label: "Silmaarsti vastuvõtt", value: "2" },
        { label: "Hambaarsti vastuvõtt", value: "3" },
      ],
      raviasutusOptions: [
        { label: "Fertilitas", value: "1" },
        { label: "Ida-Tallinna Keskhaigla", value: "2" },
        { label: "Lääne-Tallinna Keskhaigla", value: "3" },
        { label: "Põhja-Eesti Regionaalhaigla", value: "4" },
        { label: "Tallinna Lastehaigla", value: "5" },
        { label: "Tartu Ülikooli Kliinikum", value: "6" },
      ],
    },
    template: `
      <div style="background: var(--general-surface-primary); padding: 24px;">
      <tedi-row cols="1" [gapY]="3">
        <tedi-col class="flex flex-column gap-2">
          <h4 tedi-text >Separate</h4>
          <div class="flex flex-wrap gap-2">
            <tedi-filter text="Vastuvõtud" [selected]="true" />
            <tedi-filter text="Analüüsid" [selected]="true" />
            <tedi-filter text="Uuringud" />
            <tedi-filter text="Vaktsineerimised" />
          </div>
          <div class="flex flex-wrap gap-2">
            <tedi-filter text="Vastuvõtud" variant="secondary" [selected]="true" />
            <tedi-filter text="Analüüsid" variant="secondary" [selected]="true" />
            <tedi-filter text="Uuringud" variant="secondary" />
            <tedi-filter text="Vaktsineerimised" variant="secondary" />
          </div>
          <div class="flex flex-wrap gap-2">
            <tedi-filter text="Vastuvõtud" variant="secondary" [selected]="true">
              <tedi-icon tediFilterPrepend name="medical_services" [size]="18" color="inherit" />
            </tedi-filter>
            <tedi-filter text="Analüüsid" variant="secondary">
              <tedi-icon tediFilterPrepend name="science" [size]="18" color="inherit" />
            </tedi-filter>
            <tedi-filter text="Uuringud" variant="secondary">
              <tedi-icon tediFilterPrepend name="biotech" [size]="18" color="inherit" />
            </tedi-filter>
            <tedi-filter text="Vaktsineerimised" variant="secondary">
              <tedi-icon tediFilterPrepend name="vaccines" [size]="18" color="inherit" />
            </tedi-filter>
          </div>
        </tedi-col>

        <tedi-col class="flex flex-column gap-2">
          <h4 tedi-text >Grouped</h4>
          <div class="flex flex-wrap gap-2">
            <tedi-filter-group>
              <tedi-filter text="Kooskõlastatud" />
              <tedi-filter text="Tagasilükatud" />
            </tedi-filter-group>
            <tedi-filter-group>
              <tedi-filter text="Kooskõlastatud" [selected]="true" />
              <tedi-filter text="Tagasilükatud" />
            </tedi-filter-group>
          </div>
          <div class="flex flex-wrap gap-2">
            <tedi-filter-group>
              <tedi-filter text="Kooskõlastatud" variant="secondary" />
              <tedi-filter text="Tagasilükatud" variant="secondary" />
            </tedi-filter-group>
            <tedi-filter-group>
              <tedi-filter text="Kooskõlastatud" variant="secondary" [selected]="true" />
              <tedi-filter text="Tagasilükatud" variant="secondary" />
            </tedi-filter-group>
          </div>
          <div class="flex flex-wrap gap-2">
            <tedi-filter-group>
              <tedi-filter text="Analüüsid" />
              <tedi-filter text="Doonorlus" />
              <tedi-filter text="Uuringud" />
              <tedi-filter text="Vaktsineerimised" />
            </tedi-filter-group>
          </div>
        </tedi-col>

        <tedi-col class="flex flex-column gap-2">
          <h4 tedi-text >Dropdown label + value</h4>
          <div class="flex flex-wrap gap-2">
            <tedi-filter text="Teenus" [options]="teenusOptions" [preserveLabel]="true" [showClear]="true" appendTo="body" />
          </div>
          <div class="flex flex-wrap gap-2">
            <tedi-filter text="Teenus" variant="secondary" [options]="teenusOptions" [preserveLabel]="true" [showClear]="true" appendTo="body" />
          </div>
        </tedi-col>

        <tedi-col class="flex flex-column gap-2">
          <h4 tedi-text >Dropdown value</h4>
          <div class="flex flex-wrap gap-2">
            <tedi-filter text="Raviasutus" [options]="raviasutusOptions" appendTo="body" />
            <tedi-filter text="Teenus" [options]="teenusOptions" appendTo="body" />
          </div>
          <div class="flex flex-wrap gap-2">
            <tedi-filter text="Raviasutus" variant="secondary" [options]="raviasutusOptions" appendTo="body" />
            <tedi-filter text="Teenus" variant="secondary" [options]="teenusOptions" appendTo="body" />
          </div>
        </tedi-col>
      </tedi-row>
      </div>
    `,
  }),
};

/**
 * Multi value filters use a dropdown with checkboxes, search, select all, and clear functionality.
 */
export const MultiValueFilter: StoryObj<FilterComponent> = {
  render: () => ({
    props: {
      options: [
        { label: "Fertilitas", value: "1" },
        { label: "Ida-Tallinna Keskhaigla", value: "2" },
        { label: "Lääne-Tallinna Keskhaigla", value: "3" },
        { label: "Põhja-Eesti Regionaalhaigla", value: "4" },
        { label: "Tallinna Lastehaigla", value: "5" },
        { label: "Tartu Ülikooli Kliinikum", value: "6" },
      ],
      values1: [] as string[],
      values2: [] as string[],
    },
    template: `
      <div style="background: var(--general-surface-primary); padding: 24px;">
      <tedi-row cols="1" [gapY]="3">
        <tedi-col class="flex flex-wrap gap-2">
          <tedi-filter text="Raviasutus" [allowMultiple]="true" [options]="options" [(value)]="values1" [searchable]="true" [showSelectAll]="true" [showClear]="true" appendTo="body" />
        </tedi-col>
        <tedi-col class="flex flex-wrap gap-2">
          <tedi-filter text="Raviasutus" variant="secondary" [allowMultiple]="true" [options]="options" [(value)]="values2" [searchable]="true" [showSelectAll]="true" [showClear]="true" appendTo="body" />
        </tedi-col>
      </tedi-row>
      </div>
    `,
  }),
};

export const CustomizeContent: StoryObj<FilterComponent> = {
  render: () => ({
    template: `
      <div style="background: var(--general-surface-primary); padding: 24px;">
      <tedi-row cols="1" [gapY]="3">
        <tedi-col class="flex flex-column gap-2">
          <h4 tedi-text >Prepend hidden when selected (default)</h4>
          <tedi-filter-group>
            <tedi-filter text="Unread (3)" variant="secondary" size="large">
              <tedi-status-indicator tediFilterPrepend type="danger" />
            </tedi-filter>
            <tedi-filter text="All" variant="secondary" size="large" />
          </tedi-filter-group>
          <tedi-filter-group>
            <tedi-filter text="Unread (3)" variant="secondary" size="large" [selected]="true">
              <tedi-status-indicator tediFilterPrepend type="danger" />
            </tedi-filter>
            <tedi-filter text="All" variant="secondary" size="large" />
          </tedi-filter-group>
          <tedi-filter-group>
            <tedi-filter text="Submitted" variant="secondary" size="large">
              <tedi-status-badge tediFilterPrepend text="5" color="brand" />
            </tedi-filter>
            <tedi-filter text="Requires attention" variant="secondary" size="large">
              <tedi-status-badge tediFilterPrepend text="7" color="danger" />
            </tedi-filter>
          </tedi-filter-group>
          <tedi-filter-group>
            <tedi-filter text="Submitted" variant="secondary" size="large" [selected]="true">
              <tedi-status-badge tediFilterPrepend text="5" color="brand" />
            </tedi-filter>
            <tedi-filter text="Requires attention" variant="secondary" size="large">
              <tedi-status-badge tediFilterPrepend text="7" color="danger" />
            </tedi-filter>
          </tedi-filter-group>
        </tedi-col>

        <tedi-col class="flex flex-column gap-2">
          <h4 tedi-text >Prepend visible when selected</h4>
          <tedi-filter-group>
            <tedi-filter text="Submitted" variant="secondary" size="large">
              <tedi-status-badge tediFilterPrepend [hideWhenSelected]="false" text="5" color="brand" />
            </tedi-filter>
            <tedi-filter text="Requires attention" variant="secondary" size="large">
              <tedi-status-badge tediFilterPrepend [hideWhenSelected]="false" text="7" color="danger" />
            </tedi-filter>
          </tedi-filter-group>
          <tedi-filter-group>
            <tedi-filter text="Submitted" variant="secondary" size="large" [selected]="true">
              <tedi-status-badge tediFilterPrepend [hideWhenSelected]="false" text="5" color="brand" />
            </tedi-filter>
            <tedi-filter text="Requires attention" variant="secondary" size="large">
              <tedi-status-badge tediFilterPrepend [hideWhenSelected]="false" text="7" color="danger" />
            </tedi-filter>
          </tedi-filter-group>
        </tedi-col>

        <tedi-col class="flex flex-column gap-2">
          <h4 tedi-text >Append</h4>
          <tedi-filter-group>
            <tedi-filter text="Submitted" variant="secondary" size="large">
              <tedi-status-badge tediFilterAppend text="5" color="brand" />
            </tedi-filter>
            <tedi-filter text="Requires attention" variant="secondary" size="large">
              <tedi-status-badge tediFilterAppend text="7" color="danger" />
            </tedi-filter>
          </tedi-filter-group>
          <tedi-filter-group>
            <tedi-filter text="Submitted" variant="secondary" size="large" [selected]="true">
              <tedi-status-badge tediFilterAppend text="5" color="brand" />
            </tedi-filter>
            <tedi-filter text="Requires attention" variant="secondary" size="large">
              <tedi-status-badge tediFilterAppend text="7" color="danger" />
            </tedi-filter>
          </tedi-filter-group>
        </tedi-col>

        <tedi-col class="flex flex-column gap-2">
          <h4 tedi-text >Append with dropdown</h4>
          <tedi-filter
            text="Requires attention"
            variant="secondary"
            size="large"
            [options]="[{ label: 'Option A', value: 'a' }, { label: 'Option B', value: 'b' }]"
            appendTo="body"
          >
            <tedi-status-badge tediFilterAppend text="7" color="danger" />
          </tedi-filter>
        </tedi-col>

        <tedi-col class="flex flex-column gap-2">
          <h4 tedi-text >Prepend icon with append and dropdown</h4>
          <tedi-filter
            text="Requires attention"
            variant="secondary"
            size="large"
            [options]="[{ label: 'Option A', value: 'a' }, { label: 'Option B', value: 'b' }]"
            appendTo="body"
          >
            <tedi-icon tediFilterPrepend name="language" [size]="18" color="inherit" />
            <tedi-status-badge tediFilterAppend text="7" color="danger" />
          </tedi-filter>
        </tedi-col>

      </tedi-row>
      </div>
    `,
  }),
};

export const States: StoryObj<FilterComponent> = {
  parameters: {
    pseudo: {
      hover: ".pseudo-hover .tedi-filter__button",
      active: ".pseudo-active .tedi-filter__button",
      focusVisible: ".pseudo-focus .tedi-filter__button",
    },
  },
  render: () => ({
    props: {
      STATES: ["Default", "Hover", "Active", "Focus", "Selected", "Disabled"],
      options: [
        { label: "Optometristi vastuvõtt", value: "1" },
        { label: "Silmaarsti vastuvõtt", value: "2" },
        { label: "Hambaarsti vastuvõtt", value: "3" },
      ],
    },
    template: `
      <div style="overflow-x: auto; background: var(--general-surface-primary); padding: 24px;">
        <tedi-row [cols]="6" [gapY]="3" alignItems="center" style="min-width: 1200px;">
          <tedi-col><p tedi-text modifiers="bold">State</p></tedi-col>
          <tedi-col><p tedi-text modifiers="bold">Primary</p></tedi-col>
          <tedi-col><p tedi-text modifiers="bold">Primary multiselect</p></tedi-col>
          <tedi-col><p tedi-text modifiers="bold">Secondary</p></tedi-col>
          <tedi-col><p tedi-text modifiers="bold">Secondary multiselect</p></tedi-col>
          <tedi-col><p tedi-text modifiers="bold">Large</p></tedi-col>

          @for (state of STATES; track state) {
            <tedi-col><p tedi-text>{{ state }}</p></tedi-col>
            <tedi-col [class]="'pseudo-' + state.toLowerCase()">
              <tedi-filter text="Filter" [selected]="state === 'Selected'" [disabled]="state === 'Disabled'" />
            </tedi-col>
            <tedi-col [class]="'pseudo-' + state.toLowerCase()">
              <tedi-filter text="Filter" [allowMultiple]="true" [options]="options" [value]="state === 'Selected' ? ['1', '2'] : []" [disabled]="state === 'Disabled'" appendTo="body" />
            </tedi-col>
            <tedi-col [class]="'pseudo-' + state.toLowerCase()">
              <tedi-filter text="Filter" variant="secondary" [selected]="state === 'Selected'" [disabled]="state === 'Disabled'" />
            </tedi-col>
            <tedi-col [class]="'pseudo-' + state.toLowerCase()">
              <tedi-filter text="Filter" variant="secondary" [allowMultiple]="true" [options]="options" [value]="state === 'Selected' ? ['1', '2'] : []" [disabled]="state === 'Disabled'" appendTo="body" />
            </tedi-col>
            <tedi-col [class]="'pseudo-' + state.toLowerCase()">
              <tedi-filter text="Filter" size="large" [selected]="state === 'Selected'" [disabled]="state === 'Disabled'" />
            </tedi-col>
          }
        </tedi-row>
      </div>
    `,
  }),
};

export const CustomDropdownContent: StoryObj<FilterComponent> = {
  render: () => ({
    props: {
      selectedPeriod: "",
      periods: [
        { value: "day", label: "Päev" },
        { value: "week", label: "Nädal" },
        { value: "month", label: "Kuu" },
        { value: "year", label: "Aasta" },
      ],
      getLabel(periods: { value: string; label: string }[], value: string): string {
        return periods.find((p) => p.value === value)?.label ?? "Periood";
      },
    },
    template: `
      <div style="background: var(--general-surface-primary); padding: 24px;">
      <tedi-row cols="1" [gapY]="3">
        <tedi-col class="flex gap-2">
          <tedi-filter
            [text]="getLabel(periods, selectedPeriod)"
            [selected]="!!selectedPeriod"
            [showClear]="true"
            (cleared)="selectedPeriod = ''"
            appendTo="body"
          >
            <div tediFilterContent>
              <tedi-radio-group label="Periood" direction="vertical">
                @for (period of periods; track period.value) {
                  <label tedi-label color="primary" class="flex align-items-center gap-2">
                    <input
                      tedi-radio
                      type="radio"
                      name="period"
                      [value]="period.value"
                      [checked]="selectedPeriod === period.value"
                      (change)="selectedPeriod = period.value"
                    />
                    {{ period.label }}
                  </label>
                }
              </tedi-radio-group>
            </div>
          </tedi-filter>
        </tedi-col>
      </tedi-row>
      </div>
    `,
  }),
};

export const Examples: StoryObj<FilterComponent> = {
  render: () => {
    const vastuvotudControl = new FormControl<boolean>(true);
    const analuusidControl = new FormControl<boolean>(true);
    const uuringudControl = new FormControl<boolean>(false);
    const uuringControl = new FormControl<string>("");
    const raviasutusControl = new FormControl<string[]>([
      "ltk",
      "perh",
    ]);
    const teenusControl = new FormControl<string>("");
    const aegAlatesControl = new FormControl<string>("");
    const typeControl = new FormControl<string | null>("all");
    const teenusControl2 = new FormControl<string>("");
    const categoryControl = new FormControl<string[]>(["vastuvotud", "analuusid"]);
    const typeControl2 = new FormControl<string | null>("all");

    const uuringOptions = [
      { label: "Vereanalüüs", value: "1" },
      { label: "Röntgen", value: "2" },
      { label: "Ultraheli", value: "3" },
      { label: "MRT", value: "4" },
    ];
    const raviasutusOptions = [
      { label: "Fertilitas", value: "fertilitas" },
      { label: "Ida-Tallinna Keskhaigla", value: "itk" },
      { label: "Lääne-Tallinna Keskhaigla", value: "ltk" },
      { label: "Põhja-Eesti Regionaalhaigla", value: "perh" },
      { label: "Tallinna Lastehaigla", value: "tlh" },
      { label: "Tartu Ülikooli Kliinikum", value: "tuk" },
    ];
    const teenusOptions = [
      { label: "Optometristi vastuvõtt", value: "1" },
      { label: "Silmaarsti vastuvõtt", value: "2" },
      { label: "Hambaarsti vastuvõtt", value: "3" },
    ];
    const aegAlatesOptions = [
      { label: "Viimane nädal", value: "1" },
      { label: "Viimane kuu", value: "2" },
      { label: "Viimane aasta", value: "3" },
    ];

    return {
      props: {
        vastuvotudControl,
        analuusidControl,
        uuringudControl,
        uuringControl,
        raviasutusControl,
        teenusControl,
        aegAlatesControl,
        typeControl,
        teenusControl2,
        categoryControl,
        typeControl2,
        uuringOptions,
        raviasutusOptions,
        teenusOptions,
        aegAlatesOptions,
        typeOptions: [
          { label: "Kõik", value: "all" },
          { label: "Aktiivsed", value: "active" },
          { label: "Lõpetatud", value: "done" },
        ],
        categoryOptions: [
          { label: "Vastuvõtud", value: "vastuvotud" },
          { label: "Analüüsid", value: "analuusid" },
          { label: "Uuringud", value: "uuringud" },
          { label: "Vaktsineerimised", value: "vaktsineerimised" },
        ],
        radioFilters: [
          {
            label: "Tüüp", control: typeControl, options: [
              { label: "Kõik", value: "all" },
              { label: "Aktiivsed", value: "active" },
              { label: "Lõpetatud", value: "done" },
            ]
          },
          { label: "Teenus", control: teenusControl, options: teenusOptions },
          { label: "Raviasutus", control: raviasutusControl, options: raviasutusOptions },
        ],
        checkboxFilters: [
          {
            label: "Kategooria", control: categoryControl, options: [
              { label: "Vastuvõtud", value: "vastuvotud" },
              { label: "Analüüsid", value: "analuusid" },
              { label: "Uuringud", value: "uuringud" },
              { label: "Vaktsineerimised", value: "vaktsineerimised" },
            ]
          },
          { label: "Teenus", control: teenusControl2, options: teenusOptions },
        ],
        primaryFilters: [
          {
            label: "Tüüp", control: typeControl2, options: [
              { label: "Kõik", value: "all" },
              { label: "Aktiivsed", value: "active" },
              { label: "Lõpetatud", value: "done" },
            ]
          },
          { label: "Uuring", control: uuringControl, options: uuringOptions },
        ],
        clearAll() {
          [vastuvotudControl, analuusidControl, uuringudControl].forEach((c) => c.setValue(false));
          [uuringControl, teenusControl, aegAlatesControl].forEach((c) => c.setValue(""));
          raviasutusControl.setValue([]);
        },
        filters: [
          { label: "Vastuvõtud", control: vastuvotudControl },
          { label: "Analüüsid", control: analuusidControl },
          { label: "Uuringud", control: uuringudControl },
          { label: "Uuring", control: uuringControl, options: uuringOptions },
          { label: "Raviasutus", control: raviasutusControl, options: raviasutusOptions },
          { label: "Teenus", control: teenusControl, options: teenusOptions },
          { label: "Aeg alates", control: aegAlatesControl, options: aegAlatesOptions },
        ],
        getTags(filters: { label: string; control: FormControl; options?: { label: string; value: string }[] }[]) {
          const tags: { text: string; remove: () => void }[] = [];
          for (const f of filters) {
            const val = f.control.value;
            if (Array.isArray(val)) {
              for (const v of val) {
                const optLabel = f.options?.find((o) => o.value === v)?.label ?? v;
                tags.push({
                  text: `${f.label}: ${optLabel}`,
                  remove: () => f.control.setValue(val.filter((x: string) => x !== v)),
                });
              }
            } else if (typeof val === "boolean" && val) {
              tags.push({ text: f.label, remove: () => f.control.setValue(false) });
            } else if (typeof val === "string" && val) {
              const optLabel = f.options?.find((o) => o.value === val)?.label ?? val;
              tags.push({
                text: `${f.label}: ${optLabel}`,
                remove: () => f.control.setValue(""),
              });
            }
          }
          return tags;
        },
      },
      template: `
        <div style="background: var(--general-surface-primary); padding: 24px;">
        <tedi-row cols="1" [gapY]="3">
          <tedi-col>
            <h1 tedi-text="h1" color="secondary">Taotlused</h1>
          </tedi-col>

          <tedi-col class="flex flex-wrap gap-2 align-items-center">
            <tedi-filter
              text="Vastuvõtud"
              variant="secondary"
              [formControl]="vastuvotudControl"
            />
            <tedi-filter
              text="Analüüsid"
              variant="secondary"
              [formControl]="analuusidControl"
            />
            <tedi-filter
              text="Uuringud"
              variant="secondary"
              [formControl]="uuringudControl"
            />

            <tedi-separator axis="vertical" size="24px" />

            <tedi-filter
              text="Uuring"
              variant="secondary"
              [options]="uuringOptions"
              [formControl]="uuringControl"
              [showClear]="true"
              appendTo="body"
            />
            <tedi-filter
              text="Raviasutus"
              variant="secondary"
              [allowMultiple]="true"
              [options]="raviasutusOptions"
              [formControl]="raviasutusControl"
              [searchable]="true"
              [showSelectAll]="true"
              [showClear]="true"
              appendTo="body"
            />
            <tedi-filter
              text="Teenus"
              variant="secondary"
              [options]="teenusOptions"
              [formControl]="teenusControl"
              [showClear]="true"
              appendTo="body"
            />
            <tedi-filter
              text="Aeg alates"
              variant="secondary"
              [options]="aegAlatesOptions"
              [formControl]="aegAlatesControl"
              [showClear]="true"
              appendTo="body"
            />

            <tedi-separator axis="vertical" size="24px" />

            <button tedi-button variant="neutral" class="text-nowrap" (click)="clearAll()">
              <tedi-icon name="refresh" [size]="18" color="inherit" />
              Tühjenda filtrid
            </button>
          </tedi-col>

          @if (getTags(filters).length) {
            <tedi-col class="flex flex-wrap gap-1">
              @for (tag of getTags(filters); track tag.text) {
                <tedi-tag [closable]="true" (closed)="tag.remove()">{{ tag.text }}</tedi-tag>
              }
            </tedi-col>
          }

          <tedi-col>
            <p tedi-text color="tertiary">64 tulemust</p>
          </tedi-col>

          <tedi-col><tedi-separator /></tedi-col>

          <tedi-col>
            <h1 tedi-text="h1" color="secondary">Andmed</h1>
          </tedi-col>

          <tedi-col class="flex flex-wrap gap-2 align-items-center">
            <tedi-filter-group label="Tüüp" [formControl]="typeControl">
              <tedi-filter text="Kõik" value="all" variant="secondary" />
              <tedi-filter text="Aktiivsed" value="active" variant="secondary" />
              <tedi-filter text="Lõpetatud" value="done" variant="secondary" />
            </tedi-filter-group>

            <tedi-separator axis="vertical" size="24px" />

            <tedi-filter
              text="Teenus"
              variant="secondary"
              [options]="teenusOptions"
              [formControl]="teenusControl"
              [showClear]="true"
              appendTo="body"
            />
            <tedi-filter
              text="Raviasutus"
              variant="secondary"
              [allowMultiple]="true"
              [options]="raviasutusOptions"
              [formControl]="raviasutusControl"
              [searchable]="true"
              [showSelectAll]="true"
              [showClear]="true"
              appendTo="body"
            />
          </tedi-col>

          @if (getTags(radioFilters).length) {
            <tedi-col class="flex flex-wrap gap-1">
              @for (tag of getTags(radioFilters); track tag.text) {
                <tedi-tag [closable]="true" (closed)="tag.remove()">{{ tag.text }}</tedi-tag>
              }
            </tedi-col>
          }

          <tedi-col><tedi-separator /></tedi-col>

          <tedi-col>
            <h1 tedi-text="h1" color="secondary">Menetlusdokumendid</h1>
          </tedi-col>

          <tedi-col class="flex flex-wrap gap-2 align-items-center">
            <tedi-filter-group
              label="Kategooria"
              [allowMultiple]="true"
              [formControl]="categoryControl"
            >
              <tedi-filter text="Vastuvõtud" value="vastuvotud" variant="secondary" />
              <tedi-filter text="Analüüsid" value="analuusid" variant="secondary" />
              <tedi-filter text="Uuringud" value="uuringud" variant="secondary" />
              <tedi-filter text="Vaktsineerimised" value="vaktsineerimised" variant="secondary" />
            </tedi-filter-group>

            <tedi-separator axis="vertical" size="24px" />

            <tedi-filter
              text="Teenus"
              variant="secondary"
              [options]="teenusOptions"
              [formControl]="teenusControl2"
              [showClear]="true"
              appendTo="body"
            />
          </tedi-col>

          @if (getTags(checkboxFilters).length) {
            <tedi-col class="flex flex-wrap gap-1">
              @for (tag of getTags(checkboxFilters); track tag.text) {
                <tedi-tag [closable]="true" (closed)="tag.remove()">{{ tag.text }}</tedi-tag>
              }
            </tedi-col>
          }

          <tedi-col><tedi-separator /></tedi-col>

          <tedi-col>
            <h1 tedi-text="h1" color="secondary">Taotlused</h1>
          </tedi-col>

          <tedi-col class="flex flex-wrap gap-2 align-items-center">
            <tedi-filter-group label="Tüüp" [formControl]="typeControl2">
              <tedi-filter text="Kõik" value="all" />
              <tedi-filter text="Aktiivsed" value="active" />
              <tedi-filter text="Lõpetatud" value="done" />
            </tedi-filter-group>

            <tedi-separator axis="vertical" size="24px" />

            <tedi-filter
              text="Uuring"
              [options]="uuringOptions"
              [formControl]="uuringControl"
              [showClear]="true"
              appendTo="body"
            />
          </tedi-col>

          @if (getTags(primaryFilters).length) {
            <tedi-col class="flex flex-wrap gap-1">
              @for (tag of getTags(primaryFilters); track tag.text) {
                <tedi-tag [closable]="true" (closed)="tag.remove()">{{ tag.text }}</tedi-tag>
              }
            </tedi-col>
          }
        </tedi-row>
        </div>
      `,
    };
  },
};

export const WithReactiveForms: StoryObj<FilterComponent> = {
  render: () => {
    const singleControl = new FormControl<boolean>(false);
    const multiControl = new FormControl<string[]>([]);
    const options = [
      { label: "Optometristi vastuvõtt", value: "1" },
      { label: "Silmaarsti vastuvõtt", value: "2" },
      { label: "Hambaarsti vastuvõtt", value: "3" },
    ];

    const groupSingleControl = new FormControl<string | null>("all");
    const groupMultiControl = new FormControl<string[]>(["urgent"]);

    return {
      props: {
        singleControl,
        multiControl,
        options,
        groupSingleControl,
        groupMultiControl,
        get formData() {
          return {
            single: {
              value: singleControl.value,
              touched: singleControl.touched,
              dirty: singleControl.dirty,
            },
            multi: {
              value: multiControl.value,
              touched: multiControl.touched,
              dirty: multiControl.dirty,
            },
            groupSingle: {
              value: groupSingleControl.value,
              touched: groupSingleControl.touched,
              dirty: groupSingleControl.dirty,
            },
            groupMulti: {
              value: groupMultiControl.value,
              touched: groupMultiControl.touched,
              dirty: groupMultiControl.dirty,
            },
          };
        },
      },
      template: `
        <div style="background: var(--general-surface-primary); padding: 24px;">
        <tedi-row cols="1" [gapY]="3">
          <tedi-col class="flex flex-column gap-2">
            <h4 tedi-text >Standalone single &amp; multi-select</h4>
            <div class="flex gap-2">
              <tedi-filter
                text="Vastuvõtud"
                [formControl]="singleControl"
              />
              <tedi-filter
                text="Teenused"
                [allowMultiple]="true"
                [options]="options"
                [formControl]="multiControl"
                [searchable]="true"
                [showSelectAll]="true"
                [showClear]="true"
                appendTo="body"
              />
            </div>
          </tedi-col>

          <tedi-col class="flex flex-column gap-2">
            <h4 tedi-text >Grouped single-select</h4>
            <tedi-filter-group label="Status" [formControl]="groupSingleControl">
              <tedi-filter text="Kõik" value="all" />
              <tedi-filter text="Aktiivsed" value="active" />
              <tedi-filter text="Lõpetatud" value="done" />
            </tedi-filter-group>
          </tedi-col>
          <tedi-col class="flex flex-column gap-2">
            <h4 tedi-text >Grouped multi-select</h4>
            <tedi-filter-group label="Tags" [allowMultiple]="true" [formControl]="groupMultiControl">
              <tedi-filter text="Kiire" value="urgent" />
              <tedi-filter text="Ülevaatus" value="review" />
              <tedi-filter text="Mustand" value="draft" />
            </tedi-filter-group>
          </tedi-col>
          <tedi-col>
            <tedi-alert type="info" [showClose]="false">
              <pre tedi-text modifiers="small" style="min-height: 600px;">{{ formData | json }}</pre>
            </tedi-alert>
          </tedi-col>
        </tedi-row>
        </div>
      `,
    };
  },
};
