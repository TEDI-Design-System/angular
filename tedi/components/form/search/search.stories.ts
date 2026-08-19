import { TitleCasePipe } from "@angular/common";
import { computed, signal } from "@angular/core";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { SearchComponent } from "./search.component";
import {
  SearchFooterTemplateDirective,
  SearchSuggestionTemplateDirective,
} from "./search-templates.directive";
import { SearchFooterActionsComponent } from "./search-footer-actions.component";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { AlertComponent } from "../../notifications/alert/alert.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { TextComponent } from "../../base/text/text.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { DropdownItemValueComponent } from "../../overlay/dropdown/dropdown-item-value/dropdown-item-value.component";
import { DropdownItemValueLabelComponent } from "../../overlay/dropdown/dropdown-item-value/dropdown-item-value-label.component";
import { DropdownItemValueMetaComponent } from "../../overlay/dropdown/dropdown-item-value/dropdown-item-value-meta.component";

const SIZES = ["small", "default", "large"] as const;
const PSEUDO_STATE = ["Default", "Hover", "Active", "Focus"];

const MIN_QUERY_LENGTH = 3;

// Deliberately long, and with many "Mar" entries, so the default query overflows
// the panel's max height and the examples exercise scrolling.
const PEOPLE = [
  "Mari Maasikas",
  "Marelle Mets",
  "Marjanne Meri",
  "Mart Mesi",
  "Martin Saar",
  "Margit Mänd",
  "Marko Mägi",
  "Maris Metsis",
  "Marta Mölder",
  "Marek Muru",
  "Kalle Kask",
  "Kati Kuusk",
  "Tõnu Tamm",
  "Liisa Lepp",
  "Jaan Järv",
  "Piret Pärn",
  "Siim Sepp",
  "Anu Aasa",
  "Rein Rand",
  "Tiiu Tuul",
];

interface RegistryPerson {
  name: string;
  code: string;
}

// Several "Lau" entries on purpose: with the footer present, that default query
// overflows the panel so the examples show the footer staying pinned while the
// list scrolls.
const REGISTRY_PEOPLE: RegistryPerson[] = [
  { name: "Laura Kassisaba", code: "49504080254" },
  { name: "Laur Lepik", code: "38207120211" },
  { name: "Laura Kask", code: "48611230123" },
  { name: "Lauri Laan", code: "38905170234" },
  { name: "Lauris Vaher", code: "37905240312" },
  { name: "Laur Kivi", code: "39207310423" },
  { name: "Laura Ojala", code: "48802190534" },
  { name: "Laine Laas", code: "45711120645" },
  { name: "Mari Maasikas", code: "46803150147" },
  { name: "Marten Mets", code: "39408090456" },
  { name: "Kadri Kuusk", code: "47102280345" },
  { name: "Piret Pärn", code: "46512040567" },
  { name: "Siim Sepp", code: "38703260678" },
  { name: "Anu Aasa", code: "45009110789" },
  { name: "Rein Rand", code: "35406180890" },
  { name: "Tiiu Tuul", code: "44711050901" },
];

/** Matches either field, so the examples search by name *or* personal code. */
function matchRegistry(query: string): RegistryPerson[] {
  const q = query.trim().toLowerCase();

  return REGISTRY_PEOPLE.filter(
    (person) =>
      person.name.toLowerCase().includes(q) || person.code.includes(q),
  );
}


/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.65.83?node-id=4620-82860&m=dev" target="_blank">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/4013b4-search" target="_blank">Zeroheight ↗</a><br />
 *
 * Search wraps `tedi-form-field` + `input[tedi-text-field]` with an optional trailing button.
 * Works with <a href="https://angular.dev/guide/forms/reactive-forms" target="_blank">Reactive forms</a> and <a href="https://angular.dev/guide/forms/template-driven-forms" target="_blank">Template-driven forms</a>.
 */

export default {
  title: "TEDI-Ready/Components/Form/Search",
  component: SearchComponent,
  decorators: [
    moduleMetadata({
      imports: [
        RowComponent,
        ColComponent,
        TextComponent,
        AlertComponent,
        TitleCasePipe,
        ReactiveFormsModule,
        SearchSuggestionTemplateDirective,
        SearchFooterTemplateDirective,
        SearchFooterActionsComponent,
        SeparatorComponent,
        ButtonComponent,
        DropdownItemValueComponent,
        DropdownItemValueLabelComponent,
        DropdownItemValueMetaComponent,
      ],
    }),
  ],
  argTypes: {
    inputId: {
      description:
        "Unique identifier for the input element, used to associate the label.",
      control: { type: "text" },
      table: { category: "inputs", type: { summary: "string" } },
    },
    label: {
      description:
        "Visible label text. When omitted, provide `ariaLabel` for accessibility.",
      control: { type: "text" },
      table: { category: "inputs", type: { summary: "string" } },
    },
    value: {
      description:
        "Value of the search input. Supports two-way binding and reactive forms.",
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string" },
        defaultValue: { summary: "" },
      },
    },
    placeholder: {
      description: "Placeholder text for the search input.",
      control: { type: "text" },
      table: { category: "inputs", type: { summary: "string" } },
    },
    size: {
      description: "Size of the search field.",
      control: { type: "radio" },
      options: ["default", "small", "large"],
      table: {
        category: "inputs",
        type: { summary: "SearchSize", detail: "default \nsmall \nlarge" },
        defaultValue: { summary: "default" },
      },
    },
    clearable: {
      description:
        "Whether the input shows a clear button once it has a value.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    searchIcon: {
      description: "Icon shown inside the input. Ignored when `button` is set.",
      control: { type: "object" },
      table: {
        category: "inputs",
        type: { summary: "string | FormFieldIcon" },
      },
    },
    disabled: {
      description: "Whether the search field is disabled.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    button: {
      description:
        "When set, renders a trailing search button and hides the inline icon.",
      control: { type: "object" },
      table: { category: "inputs", type: { summary: "SearchButton" } },
    },
    feedbackText: {
      description: "FeedbackText component inputs (hint / validation message).",
      control: { type: "object" },
      table: {
        category: "inputs",
        type: { summary: "ComponentInputs<FeedbackTextComponent>" },
      },
    },
    ariaLabel: {
      description:
        'Accessible name for the search region. Falls back to `label`, then `placeholder`, then the translated "search" label.',
      control: { type: "text" },
      table: { category: "inputs", type: { summary: "string" } },
    },
    suggestions: {
      description:
        "Suggestions to show in the panel, already filtered by the consumer. Bind an empty array to keep combobox behaviour while nothing matches; leave unbound for a plain search field.",
      control: { type: "object" },
      table: { category: "inputs", type: { summary: "T[] | undefined" } },
    },
    bindLabel: {
      description:
        "Property holding the display label when suggestions are objects.",
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string" },
        defaultValue: { summary: "label" },
      },
    },
    minQueryLength: {
      description:
        "Characters required before the panel opens. Below it nothing is shown, not even the no-results row.",
      control: { type: "number" },
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "0" },
      },
    },
    loading: {
      description: "Shows a loading row instead of results.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    panelOpen: {
      description: "Whether the suggestion panel is open.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    searchEvent: {
      description:
        "Emitted when the search is executed (Enter key or button click). Suppressed when Enter accepts a highlighted suggestion.",
      control: false,
      action: "searchEvent",
      table: { category: "outputs", type: { summary: "string" } },
    },
    suggestionSelect: {
      description:
        "Emitted when a suggestion is accepted. The field is filled with its label.",
      control: false,
      action: "suggestionSelect",
      table: { category: "outputs", type: { summary: "T" } },
    },
    clear: {
      description: "Emitted when the clear button is clicked.",
      control: false,
      action: "clear",
      table: { category: "outputs", type: { summary: "void" } },
    },
  },
} as Meta<SearchComponent>;

type Story = StoryObj<SearchComponent>;

export const Default: Story = {
  args: {
    inputId: "search-default",
    label: "Otsing",
    placeholder: "Otsi nime või märksõna järgi",
  },
  render: (args) => ({
    props: args,
    template: `<tedi-search ${argsToTemplate(args)} />`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    props: { SIZES },
    template: `
      <style>
        .tedi-search-sizes {
          overflow: hidden;
          border: 1px solid var(--tedi-neutral-350);
          border-radius: var(--tedi-radius-03);
        }
        .tedi-search-sizes__row {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 14px 16px;
        }
        .tedi-search-sizes__row + .tedi-search-sizes__row {
          border-top: 1px solid var(--tedi-neutral-350);
        }
        /* min-width: 0 lets the field column (and the inputs inside it) shrink
           below their intrinsic width so they never overflow on narrow screens. */
        .tedi-search-sizes__fields {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 0;
        }
        @media (min-width: 36rem) {
          .tedi-search-sizes__row {
            flex-direction: row;
            align-items: center;
          }
          .tedi-search-sizes__label {
            flex: 0 0 5rem;
          }
          .tedi-search-sizes__fields {
            flex: 1 1 auto;
          }
        }
      </style>
      <div class="tedi-search-sizes">
        <div class="tedi-search-sizes__row" *ngFor="let size of SIZES">
          <p tedi-text modifiers="bold" class="tedi-search-sizes__label">{{ size | titlecase }}</p>
          <div class="tedi-search-sizes__fields">
            <tedi-search
              [inputId]="'size-' + size + '-plain'"
              [size]="size"
              label="Otsing"
              [ariaLabel]="'Otsing – ' + size + ', ilma nuputa'"
            />
            <tedi-search
              [inputId]="'size-' + size + '-icon'"
              [size]="size"
              label="Otsing"
              [ariaLabel]="'Otsing – ' + size + ', nupp ikooniga'"
              [button]="{ ariaLabel: 'Otsi' }"
            />
            <tedi-search
              [inputId]="'size-' + size + '-button'"
              [size]="size"
              label="Otsing"
              [ariaLabel]="'Otsing – ' + size + ', nupp ikooni ja tekstiga'"
              [button]="{ text: 'Otsi' }"
            />
          </div>
        </div>
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: {
    pseudo: {
      hover: "#search-states-Hover",
      active: "#search-states-Active",
      focusVisible: "#search-states-Focus",
    },
  },
  render: () => ({
    props: { PSEUDO_STATE },
    template: `
      <tedi-row cols="1" gapY="3">
        <tedi-row *ngFor="let state of PSEUDO_STATE" cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1"><p tedi-text modifiers="bold">{{ state }}</p></tedi-col>
          <tedi-col width="1" [sm]="{ width: 5 }">
            <tedi-search
              [inputId]="'search-states-' + state"
              label="Otsing"
              [ariaLabel]="'Otsing – ' + state"
            />
          </tedi-col>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1"><p tedi-text modifiers="bold">Disabled</p></tedi-col>
          <tedi-col width="1" [sm]="{ width: 5 }">
            <tedi-search inputId="search-states-disabled" label="Otsing" ariaLabel="Otsing – Disabled" [disabled]="true" />
          </tedi-col>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1"><p tedi-text modifiers="bold">Success</p></tedi-col>
          <tedi-col width="1" [sm]="{ width: 5 }">
            <tedi-search inputId="search-states-success" label="Otsing" ariaLabel="Otsing – Success" [feedbackText]="{ text: 'Tagasiside tekst', type: 'valid' }" />
          </tedi-col>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1"><p tedi-text modifiers="bold">Error</p></tedi-col>
          <tedi-col width="1" [sm]="{ width: 5 }">
            <tedi-search inputId="search-states-error" label="Otsing" ariaLabel="Otsing – Error" [feedbackText]="{ text: 'Tagasiside tekst', type: 'error' }" />
          </tedi-col>
        </tedi-row>
      </tedi-row>
    `,
  }),
};

export const Placeholder: Story = {
  render: () => ({
    template: `
      <tedi-search inputId="search-placeholder" label="Otsing" placeholder="Trüki midagi…" />
    `,
  }),
};

/**
 * With `clearable`, a clear (×) button appears once the field has a value and
 * empties it on click.
 */
export const Clearable: Story = {
  render: () => ({
    template: `
      <tedi-search inputId="search-clearable" label="Otsing" [clearable]="true" value="Lorem ipsum" />
    `,
  }),
};

/**
 * Clearable field paired with a search button — the clear (×) empties the field;
 * the button runs the search.
 */
export const ClearableWithButton: Story = {
  name: "Clearable with button",
  render: () => ({
    template: `
      <tedi-search
        inputId="search-clearable-button"
        label="Otsing"
        [clearable]="true"
        value="Lorem ipsum"
        [button]="{ text: 'Otsi' }"
      />
    `,
  }),
};

export const WithHint: Story = {
  name: "With hint",
  render: () => ({
    template: `
      <tedi-search inputId="search-with-hint" label="Otsing" [feedbackText]="{ text: 'Vihjetekst' }" />
    `,
  }),
};

/**
 * Suggestions filter live against the field value, with the matched substring
 * bolded and a "no results" row when nothing matches. Focus stays in the input;
 * ArrowUp/Down highlight an option, Enter accepts it, Esc closes. Enter with
 * nothing highlighted emits `searchEvent` instead.
 *
 * Search does not filter — pass already-filtered `suggestions` and react to
 * `valueChange`, so sync and async work the same way.
 */
export const WithSuggestions: Story = {
  name: "With suggestions",
  render: () => {
    const value = signal("Mar");
    const suggestions = computed(() => {
      const q = value().trim().toLowerCase();
      return q ? PEOPLE.filter((n) => n.toLowerCase().includes(q)) : [];
    });

    return {
      props: { value, suggestions, minQueryLength: MIN_QUERY_LENGTH },
      template: `
        <tedi-search
          inputId="search-suggestions"
          label="Otsi"
          placeholder="Trüki vähemalt 3 tähemärki…"
          [minQueryLength]="minQueryLength"
          [value]="value()"
          [suggestions]="suggestions()"
          (valueChange)="value.set($event)"
        />
      `,
    };
  },
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<tedi-search
  inputId="search"
  label="Otsi"
  [minQueryLength]="3"
  [value]="value()"
  [suggestions]="suggestions()"
  (valueChange)="value.set($event)"
  (suggestionSelect)="onSelect($event)"
/>`,
      },
    },
  },
};

/**
 * Asynchronous suggestions — typing debounces a request that shows a spinner via
 * `loading`, then the results. Identical markup to the sync example; only the
 * source of `suggestions` differs.
 *
 * `minQueryLength` is set to 3 here, which is the usual pairing for a remote
 * lookup: the panel stays shut and no request goes out until the query is worth
 * searching for.
 */
export const AsyncSuggestions: Story = {
  name: "Async suggestions (loading)",
  render: () => {
    const value = signal("");
    const loading = signal(false);
    const results = signal<string[]>([]);
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onValueChange = (next: string) => {
      value.set(next);
      clearTimeout(timer);

      if (next.trim().length < MIN_QUERY_LENGTH) {
        loading.set(false);
        results.set([]);
        return;
      }

      loading.set(true);
      timer = setTimeout(() => {
        const q = next.trim().toLowerCase();
        results.set(PEOPLE.filter((n) => n.toLowerCase().includes(q)));
        loading.set(false);
      }, 600);
    };

    return {
      props: { value, loading, results, onValueChange, minQueryLength: MIN_QUERY_LENGTH },
      template: `
        <tedi-search
          inputId="search-async"
          label="Otsi"
          placeholder="Trüki vähemalt 3 tähemärki…"
          [minQueryLength]="minQueryLength"
          [value]="value()"
          [suggestions]="results()"
          [loading]="loading()"
          (valueChange)="onValueChange($event)"
        />
      `,
    };
  },
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<tedi-search
  inputId="search"
  label="Otsi"
  [minQueryLength]="3"
  [value]="value()"
  [suggestions]="results()"
  [loading]="loading()"
  (valueChange)="onValueChange($event)"
/>

// Gate the request on the same threshold so nothing is fetched for short queries.
onValueChange(next: string): void {
  this.value.set(next);
  clearTimeout(this.timer);

  if (next.trim().length < 3) {
    this.loading.set(false);
    this.results.set([]);
    return;
  }

  this.loading.set(true);
  this.timer = setTimeout(() => { /* fetch and set results */ }, 600);
}`,
      },
    },
  },
};

/**
 * Objects instead of strings — `bindLabel` names the display property and
 * `tediSearchSuggestion` renders a richer row. `suggestionSelect` emits the whole
 * object, while the field is filled with the resolved label.
 */
export const WithCustomSuggestionTemplate: Story = {
  name: "With custom suggestion template",
  render: () => {
    const value = signal("Lau");
    const suggestions = computed(() => matchRegistry(value()));

    return {
      props: { value, suggestions, minQueryLength: MIN_QUERY_LENGTH },
      template: `
        <tedi-search
          inputId="search-custom"
          label="Otsi"
          bindLabel="name"
          placeholder="Trüki vähemalt 3 tähemärki…"
          [minQueryLength]="minQueryLength"
          [value]="value()"
          [suggestions]="suggestions()"
          (valueChange)="value.set($event)"
        >
          <ng-template tediSearchSuggestion let-item>
            <tedi-dropdown-item-value>
              <tedi-dropdown-item-value-label>{{ item.name }}</tedi-dropdown-item-value-label>
              <tedi-dropdown-item-value-meta>{{ item.code }}</tedi-dropdown-item-value-meta>
            </tedi-dropdown-item-value>
          </ng-template>
        </tedi-search>
      `,
    };
  },
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<tedi-search inputId="search" label="Otsi" bindLabel="name" [minQueryLength]="3"
  [value]="value()" [suggestions]="suggestions()" (valueChange)="value.set($event)">
  <ng-template tediSearchSuggestion let-item>
    <tedi-dropdown-item-value>
      <tedi-dropdown-item-value-label>{{ item.name }}</tedi-dropdown-item-value-label>
      <tedi-dropdown-item-value-meta>{{ item.code }}</tedi-dropdown-item-value-meta>
    </tedi-dropdown-item-value>
  </ng-template>
</tedi-search>`,
      },
    },
  },
};

/**
 * National-registry person lookup — results plus fallback actions in a
 * `tediSearchFooter`. The footer also shows when nothing matched, which is where
 * those actions matter most. Filtering matches name or personal code.
 */
export const WithResultAndActions: Story = {
  name: "With result and actions",
  render: () => {
    const value = signal("4950");
    const suggestions = computed(() => matchRegistry(value()));

    return {
      props: { value, suggestions, minQueryLength: MIN_QUERY_LENGTH },
      template: `
        <tedi-search
          inputId="search-result"
          label="Otsi"
          bindLabel="name"
          [clearable]="true"
          [minQueryLength]="minQueryLength"
          [value]="value()"
          [suggestions]="suggestions()"
          (valueChange)="value.set($event)"
        >
          <ng-template tediSearchSuggestion let-item>
            <span tedi-text modifiers="bold">{{ item.name }}</span>
            <tedi-separator axis="vertical" variant="dot-only" dotSize="extra-small" color="secondary" />
            <span tedi-text color="tertiary">{{ item.code }}</span>
          </ng-template>

          <ng-template tediSearchFooter>
            <tedi-search-footer-actions>
              <button tedi-button variant="secondary">Isik teadmata</button>
              <button tedi-button variant="secondary">Puudub Eesti isikukood</button>
            </tedi-search-footer-actions>
            <p tedi-text color="tertiary" [modifiers]="['small', 'center']">
              Rahvastikuregistri andmete päringuks sisesta isikukood täismahus
            </p>
          </ng-template>
        </tedi-search>
      `,
    };
  },
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<tedi-search
  inputId="search"
  label="Otsi"
  bindLabel="name"
  [minQueryLength]="3"
  [value]="value()"
  [suggestions]="suggestions()"
  (valueChange)="value.set($event)"
  (suggestionSelect)="onSelect($event)"
>
  <ng-template tediSearchSuggestion let-item>
    <span tedi-text modifiers="bold">{{ item.name }}</span>
    <tedi-separator axis="vertical" variant="dot-only" dotSize="extra-small" color="secondary" />
    <span tedi-text color="tertiary">{{ item.code }}</span>
  </ng-template>

  <ng-template tediSearchFooter>
    <tedi-search-footer-actions>
      <button tedi-button variant="secondary">Isik teadmata</button>
      <button tedi-button variant="secondary">Puudub Eesti isikukood</button>
    </tedi-search-footer-actions>
    <p tedi-text color="tertiary" [modifiers]="['small', 'center']">
      Rahvastikuregistri andmete päringuks sisesta isikukood täismahus
    </p>
  </ng-template>
</tedi-search>

// There is no searchFn input — Search never filters, so matching is your own
// computed. Widen the predicate to search as many fields as you need.
readonly value = signal("");

readonly suggestions = computed(() => {
  const query = this.value().trim().toLowerCase();

  return this.people.filter(
    (person) =>
      person.name.toLowerCase().includes(query) ||
      person.code.includes(query),
  );
});`,
      },
    },
  },
};


export const WithReactiveForms: Story = {
  render: () => {
    const control = new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    });

    return {
      props: { control },
      template: `
        <tedi-row [cols]="1" [gap]="3">
          <tedi-col>
            <tedi-search inputId="search-reactive" label="Otsing" [formControl]="control" />
          </tedi-col>
          <tedi-col>
            <tedi-alert type="info" [showClose]="false">
              <pre tedi-text modifiers="small">{{ { value: control.value, touched: control.touched, dirty: control.dirty } | json }}</pre>
            </tedi-alert>
          </tedi-col>
        </tedi-row>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "Search implements `ControlValueAccessor`, so it slots into reactive forms like any control. The block below echoes the live control state.",
      },
    },
  },
};

/**
 * Always prefer a native `<label>` element for form controls.
 * If the label must not be visible in the UI, hide it visually using an `sr-only`
 * (or equivalent) class rather than removing it. This preserves correct semantics
 * and provides the most reliable experience for screen reader users.
 * Use `ariaLabel` only as a fallback when a real `<label>` cannot be rendered.
 * This follows WCAG 2.1 and EN 301 549 9.2.5.3.
 */
export const AccessibilityNoVisibleLabel: Story = {
  name: "Accessibility: no visible label",
  render: () => ({
    template: `
      <tedi-search
        inputId="search-accessible"
        placeholder="Otsi tooteid või teenuseid..."
        ariaLabel="Otsi tooteid või teenuseid"
      />
    `,
  }),
};
