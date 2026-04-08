import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import {
  AlertComponent,
  ButtonComponent,
  FilterComponent,
  FilterContentDirective,
  FilterGroupComponent,
  RowComponent,
  ColComponent,
  SeparatorComponent,
  StatusBadgeComponent,
  StatusIndicatorComponent,
  TagComponent,
  TextComponent,
} from "@tedi-design-system/angular/tedi";
import { IconComponent } from "../../base/icon/icon.component";
import { RadioComponent } from "../radio/radio.component";
import { RadioGroupComponent } from "../radio-group/radio-group.component";
import { LabelComponent } from "../label/label.component";

export default {
  title: "TEDI-Ready/Components/Form/Filter",
  component: FilterComponent,
  decorators: [
    moduleMetadata({
      imports: [
        AlertComponent,
        ButtonComponent,
        FilterComponent,
        FilterContentDirective,
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
      description: "Whether the filter is selected (single-select mode)",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    multiselect: {
      description:
        "Multi-select mode opens a dropdown with checkbox options",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    values: {
      description: "Selected values in multiselect mode (two-way bound)",
      control: { type: "object" },
      table: {
        category: "inputs",
        type: { summary: "string[]" },
        defaultValue: { summary: "[]" },
      },
    },
    options: {
      description: "Options for multiselect dropdown",
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
      description: 'Label for "Select all" option',
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string" },
        defaultValue: { summary: "Vali kõik" },
      },
    },
    clearLabel: {
      description: 'Label for "Clear selection" action',
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string" },
        defaultValue: { summary: "Tühjenda valik" },
      },
    },
  },
} as Meta<FilterComponent>;

export const Default: StoryObj<FilterComponent> = {
  args: {
    text: "Teenused",
  },
};

export const Multiselect: StoryObj<FilterComponent> = {
  render: () => ({
    props: {
      options: [
        { label: "Fertilitas", value: "1" },
        { label: "Ida-Tallinna Keskhaigla", value: "2" },
        { label: "Lääne-Tallinna Keskhaigla", value: "3" },
        { label: "Põhja-Eesti Regionaalhaigla", value: "4" },
        { label: "Tallinna Lastehaigla", value: "5" },
        { label: "Tartu Ülikooli Kliinikum", value: "6" },
        { label: "Pärnu Haigla", value: "7" },
        { label: "Kuressaare Haigla", value: "8" },
        { label: "Rakvere Haigla", value: "9" },
        { label: "Järvamaa Haigla", value: "10" },
        { label: "Viljandi Haigla", value: "11" },
        { label: "Narva Haigla", value: "12" },
      ],
      values: [] as string[],
    },
    template: `
      <tedi-filter
        text="Raviasutus"
        [multiselect]="true"
        [options]="options"
        [(values)]="values"
        [searchable]="true"
        [showSelectAll]="true"
        [showClear]="true"
             />
    `,
  }),
};

export const SingleSelect: StoryObj<FilterComponent> = {
  render: () => ({
    props: {
      options: [
        { label: "Optometristi vastuvõtt", value: "1" },
        { label: "Silmaarsti vastuvõtt", value: "2" },
        { label: "Hambaarsti vastuvõtt", value: "3" },
      ],
      value: "",
    },
    template: `
      <tedi-filter
        text="Teenus"
        [options]="options"
        [(value)]="value"
        [searchable]="true"
        [showClear]="false"
             />
    `,
  }),
};

export const CustomizeContent: StoryObj<FilterComponent> = {
  render: () => ({
    template: `
      <div class="flex flex-column gap-2">
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
      </div>
    `,
  }),
};

export const GroupedFilters: StoryObj<FilterComponent> = {
  render: () => ({
    template: `
      <tedi-row cols="auto" [gap]="3">
        <tedi-col>
          <tedi-filter-group>
            <tedi-filter text="Kõik" [selected]="true" />
            <tedi-filter text="Aktiivsed" />
            <tedi-filter text="Lõpetatud" />
          </tedi-filter-group>
        </tedi-col>
        <tedi-col>
          <tedi-filter-group>
            <tedi-filter text="Kõik" variant="secondary" [selected]="true" />
            <tedi-filter text="Aktiivsed" variant="secondary" />
            <tedi-filter text="Lõpetatud" variant="secondary" />
          </tedi-filter-group>
        </tedi-col>
      </tedi-row>
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
      STATES: ["Default", "Hover", "Active", "Focus", "Selected"],
      options: [
        { label: "Optometristi vastuvõtt", value: "1" },
        { label: "Silmaarsti vastuvõtt", value: "2" },
        { label: "Hambaarsti vastuvõtt", value: "3" },
      ],
    },
    template: `
      <tedi-row [cols]="6" [gapY]="3" alignItems="center">
        <tedi-col><p tedi-text modifiers="bold">State</p></tedi-col>
        <tedi-col><p tedi-text modifiers="bold">Primary</p></tedi-col>
        <tedi-col><p tedi-text modifiers="bold">Primary multiselect</p></tedi-col>
        <tedi-col><p tedi-text modifiers="bold">Secondary</p></tedi-col>
        <tedi-col><p tedi-text modifiers="bold">Secondary multiselect</p></tedi-col>
        <tedi-col><p tedi-text modifiers="bold">Large</p></tedi-col>

        @for (state of STATES; track state) {
          <tedi-col><p tedi-text>{{ state }}</p></tedi-col>
          <tedi-col [class]="'pseudo-' + state.toLowerCase()">
            <tedi-filter text="Filter" [selected]="state === 'Selected'" />
          </tedi-col>
          <tedi-col [class]="'pseudo-' + state.toLowerCase()">
            <tedi-filter text="Filter" [multiselect]="true" [options]="options" [values]="state === 'Selected' ? ['1', '2'] : []" />
          </tedi-col>
          <tedi-col [class]="'pseudo-' + state.toLowerCase()">
            <tedi-filter text="Filter" variant="secondary" [selected]="state === 'Selected'" />
          </tedi-col>
          <tedi-col [class]="'pseudo-' + state.toLowerCase()">
            <tedi-filter text="Filter" variant="secondary" [multiselect]="true" [options]="options" [values]="state === 'Selected' ? ['1', '2'] : []" />
          </tedi-col>
          <tedi-col [class]="'pseudo-' + state.toLowerCase()">
            <tedi-filter text="Filter" size="large" [selected]="state === 'Selected'" />
          </tedi-col>
        }
      </tedi-row>
    `,
  }),
};

export const CustomContent: StoryObj<FilterComponent> = {
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
      <tedi-row cols="1" [gapY]="3">
        <tedi-col class="flex gap-2">
          <tedi-filter
            [text]="getLabel(periods, selectedPeriod)"
            [selected]="!!selectedPeriod"
            [showClear]="true"
            (cleared)="selectedPeriod = ''"
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
    `,
  }),
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

    return {
      props: { singleControl, multiControl, options },
      template: `
        <tedi-row cols="1" [gapY]="3">
          <tedi-col class="flex gap-2">
            <tedi-filter
              text="Vastuvõtud"
              [formControl]="singleControl"
            />
            <tedi-filter
              text="Teenused"
              [multiselect]="true"
              [options]="options"
              [formControl]="multiControl"
              [searchable]="true"
              [showSelectAll]="true"
              [showClear]="true"
                         />
          </tedi-col>
          <tedi-col>
            <tedi-alert type="info" [showClose]="false">
              <pre tedi-text modifiers="small">{{ {
  single: {
    value: singleControl.value,
    touched: singleControl.touched,
    dirty: singleControl.dirty
  },
  multi: {
    value: multiControl.value,
    touched: multiControl.touched,
    dirty: multiControl.dirty
  }
} | json }}</pre>
            </tedi-alert>
          </tedi-col>
        </tedi-row>
      `,
    };
  },
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
        uuringOptions,
        raviasutusOptions,
        teenusOptions,
        aegAlatesOptions,
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
        <tedi-row cols="1" [gapY]="3">
          <tedi-col>
            <h1 tedi-text="h1" color="secondary">Taotlused</h1>
          </tedi-col>

          <tedi-col class="flex gap-2 align-items-center">
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
                         />
            <tedi-filter
              text="Raviasutus"
              variant="secondary"
              [multiselect]="true"
              [options]="raviasutusOptions"
              [formControl]="raviasutusControl"
              [searchable]="true"
              [showSelectAll]="true"
              [showClear]="true"
                         />
            <tedi-filter
              text="Teenus"
              variant="secondary"
              [options]="teenusOptions"
              [formControl]="teenusControl"
              [showClear]="true"
                         />
            <tedi-filter
              text="Aeg alates"
              variant="secondary"
              [options]="aegAlatesOptions"
              [formControl]="aegAlatesControl"
              [showClear]="true"
                         />

            <tedi-separator axis="vertical" size="24px" />

            <button tedi-button variant="neutral" size="small" class="text-nowrap" (click)="clearAll()">
              <tedi-icon name="refresh" [size]="18" />
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
        </tedi-row>
      `,
    };
  },
};
