import { TitleCasePipe } from "@angular/common";
import {
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  viewChild,
} from "@angular/core";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { SearchComponent } from "./search.component";
import {
  CdkOverlayOrigin,
  ConnectedPosition,
  OverlayModule,
} from "@angular/cdk/overlay";
import { FormFieldComponent } from "../form-field/form-field.component";
import { LabelComponent } from "../label/label.component";
import { TextFieldComponent } from "../text-field/text-field.component";
import { AlertComponent } from "../../notifications/alert/alert.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { TextComponent } from "../../base/text/text.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { SpinnerComponent } from "../../loader/spinner/spinner.component";
import { DropdownItemValueComponent } from "../../overlay/dropdown/dropdown-item-value/dropdown-item-value.component";
import { DropdownItemValueLabelComponent } from "../../overlay/dropdown/dropdown-item-value/dropdown-item-value-label.component";
import { DropdownItemValueMetaComponent } from "../../overlay/dropdown/dropdown-item-value/dropdown-item-value-meta.component";

const SIZES = ["small", "default", "large"] as const;
const PSEUDO_STATE = ["Default", "Hover", "Active", "Focus"];

// Floating panel below the field, flipping above when it would overflow.
const OVERLAY_POSITIONS: ConnectedPosition[] = [
  {
    originX: "start",
    originY: "bottom",
    overlayX: "start",
    overlayY: "top",
    offsetY: 4,
  },
  {
    originX: "start",
    originY: "top",
    overlayX: "start",
    overlayY: "bottom",
    offsetY: -4,
  },
];

const PEOPLE = [
  "Mari Maasikas",
  "Marelle Mets",
  "Marjanne Meri",
  "Mart Mesi",
  "Martin Saar",
  "Kalle Kask",
  "Kati Kuusk",
  "Tõnu Tamm",
  "Liisa Lepp",
  "Jaan Järv",
];

interface HighlightPart {
  text: string;
  match: boolean;
}

/** Splits `text` into segments so the part matching `query` can be bolded. */
function highlightParts(text: string, query: string): HighlightPart[] {
  const q = query.trim();
  const index = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;

  if (index === -1) {
    return [{ text, match: false }];
  }

  const parts: HighlightPart[] = [];
  if (index > 0) {
    parts.push({ text: text.slice(0, index), match: false });
  }
  parts.push({ text: text.slice(index, index + q.length), match: true });
  if (index + q.length < text.length) {
    parts.push({ text: text.slice(index + q.length), match: false });
  }
  return parts;
}

// Live "suggest as you type" needs focus to stay in the input. The floating
// `tedi-dropdown` moves focus into the list when it opens (it is a menu, not a
// combobox), which would interrupt typing — so the typeahead/async examples
// render results in an inline region instead. These shared styles mirror the
// `.tedi-dropdown` surface and item padding so the inline panel looks native.
const LIVE_RESULTS_STYLES = `
  .tedi-search-demo__wrap {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .tedi-search-demo__results {
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: hidden;
    background: var(--dropdown-item-default-background);
    border: 1px solid var(--card-border-primary);
    border-radius: var(--form-select-area-radius);
    box-shadow: 0 1px 5px 0 var(--tedi-alpha-20);
  }

  .tedi-search-demo__option {
    display: block;
    width: 100%;
    padding: var(--dropdown-item-padding-y) var(--dropdown-item-padding-x);
    font: inherit;
    color: inherit;
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: 0;
  }

  .tedi-search-demo__option:hover,
  .tedi-search-demo__option:focus-visible {
    background: var(--dropdown-item-hover-background);
  }

  .tedi-search-demo__status {
    display: flex;
    gap: var(--dropdown-item-inner-spacing);
    align-items: center;
    justify-content: center;
    padding: var(--dropdown-item-padding-y) var(--dropdown-item-padding-x);
  }
`;

/**
 * Suggestions as a proper ARIA combobox: `role="combobox"` on the input with a
 * `role="listbox"` popup. Focus stays in the input, so typing (spaces included)
 * always works; ArrowUp/Down move the highlighted option via
 * `aria-activedescendant`, Enter selects it and Esc closes. Opens on focus,
 * typing or ArrowDown. This is the recommended pattern for a text field with
 * suggestions, rather than the menu-style `tedi-dropdown`.
 */
@Component({
  standalone: true,
  selector: "tedi-search-suggestions-demo",
  imports: [
    FormFieldComponent,
    LabelComponent,
    TextFieldComponent,
    OverlayModule,
  ],
  template: `
    <tedi-form-field>
      <label tedi-label for="search-combobox">Otsi</label>
      <input
        tedi-text-field
        cdkOverlayOrigin
        #origin="cdkOverlayOrigin"
        id="search-combobox"
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-controls="search-combobox-listbox"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-activedescendant]="activeOptionId()"
        [value]="value()"
        (valueChange)="onInput($event)"
        (focus)="openPanel()"
        (blur)="open.set(false)"
        (keydown)="onKeydown($event)"
      />
    </tedi-form-field>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="isOpen()"
      [cdkConnectedOverlayWidth]="panelWidth()"
      [cdkConnectedOverlayPositions]="overlayPositions"
    >
      <ul
        id="search-combobox-listbox"
        role="listbox"
        class="tedi-search-demo__results"
      >
        @for (name of matches(); track name; let i = $index) {
          <li
            role="option"
            [id]="optionId(i)"
            class="tedi-search-demo__option"
            [class.tedi-search-demo__option--active]="i === activeIndex()"
            [attr.aria-selected]="i === activeIndex()"
            (mousedown)="$event.preventDefault()"
            (click)="select(name)"
          >
            {{ name }}
          </li>
        }
      </ul>
    </ng-template>
  `,
  styles: [
    LIVE_RESULTS_STYLES +
      `
      .tedi-search-demo__results {
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .tedi-search-demo__option--active {
        background: var(--dropdown-item-hover-background);
      }
    `,
  ],
})
class SearchSuggestionsDemoComponent {
  private readonly overlayOrigin = viewChild.required(CdkOverlayOrigin);
  readonly overlayPositions = OVERLAY_POSITIONS;
  readonly panelWidth = signal(0);

  readonly value = signal("Mar");
  readonly open = signal(false);
  readonly activeIndex = signal(-1);

  private readonly names = [
    "Mari Maasikas",
    "Marelle Mets",
    "Marjanne Meri",
    "Mart Mesi",
    "Martin Saar",
  ];
  readonly matches = computed(() =>
    this.names.filter((name) =>
      name.toLowerCase().includes(this.value().toLowerCase()),
    ),
  );
  readonly isOpen = computed(() => this.open() && this.matches().length > 0);
  readonly activeOptionId = computed(() =>
    this.isOpen() && this.activeIndex() >= 0
      ? this.optionId(this.activeIndex())
      : null,
  );

  optionId(index: number): string {
    return `search-combobox-opt-${index}`;
  }

  openPanel(): void {
    this.panelWidth.set(
      this.overlayOrigin().elementRef.nativeElement.offsetWidth,
    );
    this.open.set(true);
  }

  onInput(next: string): void {
    this.value.set(next);
    this.activeIndex.set(-1);
    this.openPanel();
  }

  onKeydown(event: KeyboardEvent): void {
    const items = this.matches();
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!this.isOpen()) {
          this.openPanel();
          return;
        }
        this.activeIndex.set(
          this.activeIndex() >= items.length - 1 ? 0 : this.activeIndex() + 1,
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!this.isOpen()) {
          this.openPanel();
          return;
        }
        this.activeIndex.set(
          this.activeIndex() <= 0 ? items.length - 1 : this.activeIndex() - 1,
        );
        break;
      case "Enter":
        if (this.isOpen() && this.activeIndex() >= 0) {
          event.preventDefault();
          this.select(items[this.activeIndex()]);
        }
        break;
      case "Escape":
        this.open.set(false);
        this.activeIndex.set(-1);
        break;
    }
  }

  select(name: string): void {
    this.value.set(name);
    this.open.set(false);
    this.activeIndex.set(-1);
  }
}

/**
 * A single matched result with fallback actions and a hint — e.g. a
 * national-registry person lookup. The result panel renders inline below the
 * field (not in an overlay), so focus flows naturally: Tab from the field moves
 * through the action buttons. Opens on focus, closes on Esc or when focus leaves
 * the field and its panel.
 */
@Component({
  standalone: true,
  selector: "tedi-search-result-actions-demo",
  imports: [
    FormFieldComponent,
    LabelComponent,
    TextFieldComponent,
    SeparatorComponent,
    ButtonComponent,
    TextComponent,
    DropdownItemValueComponent,
    DropdownItemValueLabelComponent,
    DropdownItemValueMetaComponent,
  ],
  host: {
    "(focusout)": "onFocusOut($event)",
  },
  template: `
    <div class="tedi-search-demo__wrap">
      <tedi-form-field>
        <label tedi-label for="search-result">Otsi</label>
        <input
          tedi-text-field
          id="search-result"
          type="text"
          aria-controls="search-result-panel"
          [attr.aria-expanded]="open()"
          [value]="value()"
          (valueChange)="value.set($event)"
          (focus)="open.set(true)"
          (keydown.escape)="open.set(false)"
        />
      </tedi-form-field>

      @if (open()) {
        <div
          id="search-result-panel"
          role="group"
          aria-label="Otsingutulemus"
          class="tedi-search-demo__results"
        >
          <button
            type="button"
            class="tedi-search-demo__result"
            (click)="open.set(false)"
          >
            <tedi-dropdown-item-value>
              <tedi-dropdown-item-value-label
                >Laura Kassisaba</tedi-dropdown-item-value-label
              >
              <tedi-dropdown-item-value-meta
                >49504080254</tedi-dropdown-item-value-meta
              >
            </tedi-dropdown-item-value>
          </button>

          <tedi-separator color="secondary" />

          <div class="tedi-search-demo__actions">
            <div class="tedi-search-demo__buttons">
              <button tedi-button variant="secondary" size="small">
                Isik teadmata
              </button>
              <button tedi-button variant="secondary" size="small">
                Puudub Eesti isikukood
              </button>
            </div>
            <p tedi-text color="tertiary" [modifiers]="['small', 'center']">
              Rahvastikuregistri andmete päringuks sisesta isikukood täismahus
            </p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    LIVE_RESULTS_STYLES +
      `
      .tedi-search-demo__result {
        display: block;
        width: 100%;
        padding: var(--dropdown-item-padding-y) var(--dropdown-item-padding-x);
        font: inherit;
        color: inherit;
        text-align: left;
        cursor: pointer;
        background: transparent;
        border: 0;
      }

      .tedi-search-demo__result:hover,
      .tedi-search-demo__result:focus-visible {
        background: var(--dropdown-item-hover-background);
      }

      .tedi-search-demo__actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: var(--dropdown-item-padding-y) var(--dropdown-item-padding-x);
      }

      .tedi-search-demo__buttons {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
      }
    `,
  ],
})
class SearchResultActionsDemoComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly value = signal("4954080254");
  readonly open = signal(false);

  onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!next || !this.host.nativeElement.contains(next)) {
      this.open.set(false);
    }
  }
}

/**
 * Live typeahead — results filter as you type and the matched text is bolded.
 * The panel appears once the field is non-empty and shows a "no results" row
 * when nothing matches. Focus stays in the input (inline region, not the
 * floating menu), so typing is never interrupted.
 */
@Component({
  standalone: true,
  selector: "tedi-search-typeahead-demo",
  imports: [SearchComponent, TextComponent],
  template: `
    <div class="tedi-search-demo__wrap">
      <tedi-search
        inputId="search-typeahead"
        label="Otsi"
        placeholder="Hakka nime trükkima…"
        [value]="value()"
        (valueChange)="onChange($event)"
      />
      @if (open() && query().length > 0) {
        <div class="tedi-search-demo__results">
          @if (matches().length > 0) {
            @for (name of matches(); track name) {
              <button
                type="button"
                class="tedi-search-demo__option"
                (click)="select(name)"
              >
                @for (part of highlight(name); track $index) {
                  <span
                    tedi-text
                    [modifiers]="part.match ? 'bold' : undefined"
                    >{{ part.text }}</span
                  >
                }
              </button>
            }
          } @else {
            <div class="tedi-search-demo__status">
              <span tedi-text color="tertiary">Tulemusi ei leitud</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [LIVE_RESULTS_STYLES],
})
class SearchTypeaheadDemoComponent {
  readonly value = signal("");
  readonly open = signal(false);
  readonly query = computed(() => this.value().trim());
  readonly matches = computed(() => {
    const q = this.query().toLowerCase();
    return q ? PEOPLE.filter((name) => name.toLowerCase().includes(q)) : [];
  });

  onChange(next: string): void {
    this.value.set(next);
    this.open.set(true);
  }

  select(name: string): void {
    this.value.set(name);
    this.open.set(false);
  }

  highlight(text: string): HighlightPart[] {
    return highlightParts(text, this.query());
  }
}

/**
 * Asynchronous suggestions — typing debounces a fake request that shows a
 * spinner while "loading", then the matched results (or an empty state).
 */
@Component({
  standalone: true,
  selector: "tedi-search-async-demo",
  imports: [SearchComponent, TextComponent, SpinnerComponent],
  template: `
    <div class="tedi-search-demo__wrap">
      <tedi-search
        inputId="search-async"
        label="Otsi"
        placeholder="Hakka nime trükkima…"
        [value]="value()"
        (valueChange)="onChange($event)"
      />
      @if (open() && query().length > 0) {
        <div class="tedi-search-demo__results">
          @if (loading()) {
            <div class="tedi-search-demo__status">
              <tedi-spinner [size]="16" />
              <span tedi-text color="tertiary">Otsin…</span>
            </div>
          } @else if (results().length > 0) {
            @for (name of results(); track name) {
              <button
                type="button"
                class="tedi-search-demo__option"
                (click)="select(name)"
              >
                @for (part of highlight(name); track $index) {
                  <span
                    tedi-text
                    [modifiers]="part.match ? 'bold' : undefined"
                    >{{ part.text }}</span
                  >
                }
              </button>
            }
          } @else {
            <div class="tedi-search-demo__status">
              <span tedi-text color="tertiary">Tulemusi ei leitud</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [LIVE_RESULTS_STYLES],
})
class SearchAsyncDemoComponent implements OnDestroy {
  readonly value = signal("");
  readonly open = signal(false);
  readonly loading = signal(false);
  readonly results = signal<string[]>([]);
  readonly query = computed(() => this.value().trim());
  private timer?: ReturnType<typeof setTimeout>;

  onChange(next: string): void {
    this.value.set(next);
    this.open.set(true);
    clearTimeout(this.timer);

    if (!next.trim()) {
      this.loading.set(false);
      this.results.set([]);
      return;
    }

    this.loading.set(true);
    this.timer = setTimeout(() => {
      const q = next.trim().toLowerCase();
      this.results.set(PEOPLE.filter((name) => name.toLowerCase().includes(q)));
      this.loading.set(false);
    }, 600);
  }

  select(name: string): void {
    clearTimeout(this.timer);
    this.value.set(name);
    this.loading.set(false);
    this.open.set(false);
  }

  highlight(text: string): HighlightPart[] {
    return highlightParts(text, this.query());
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
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
    searchEvent: {
      description:
        "Emitted when the search is executed (Enter key or button click).",
      control: false,
      action: "searchEvent",
      table: { category: "outputs", type: { summary: "string" } },
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
            <tedi-search [inputId]="'size-' + size + '-plain'" [size]="size" label="Otsing" />
            <tedi-search
              [inputId]="'size-' + size + '-icon'"
              [size]="size"
              label="Otsing"
              [button]="{ ariaLabel: 'Otsi' }"
            />
            <tedi-search
              [inputId]="'size-' + size + '-button'"
              [size]="size"
              label="Otsing"
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
            <tedi-search [inputId]="'search-states-' + state" label="Otsing" />
          </tedi-col>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1"><p tedi-text modifiers="bold">Disabled</p></tedi-col>
          <tedi-col width="1" [sm]="{ width: 5 }">
            <tedi-search inputId="search-states-disabled" label="Otsing" [disabled]="true" />
          </tedi-col>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1"><p tedi-text modifiers="bold">Success</p></tedi-col>
          <tedi-col width="1" [sm]="{ width: 5 }">
            <tedi-search inputId="search-states-success" label="Otsing" [feedbackText]="{ text: 'Tagasiside tekst', type: 'valid' }" />
          </tedi-col>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1"><p tedi-text modifiers="bold">Error</p></tedi-col>
          <tedi-col width="1" [sm]="{ width: 5 }">
            <tedi-search inputId="search-states-error" label="Otsing" [feedbackText]="{ text: 'Tagasiside tekst', type: 'error' }" />
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
 * Suggestions filtered by the current value, shown in a floating panel anchored
 * to the field. Closed by default — it opens on focus or click and closes on
 * outside-click or Esc. Click a match to select it.
 */
export const WithSuggestions: Story = {
  name: "With suggestions",
  render: () => ({
    moduleMetadata: { imports: [SearchSuggestionsDemoComponent] },
    template: `<tedi-search-suggestions-demo />`,
  }),
};

/**
 * A single matched result followed by fallback actions and a hint — e.g. a
 * national-registry person lookup. Closed by default; it opens on focus or click
 * and closes on outside-click or Esc.
 */
export const WithResultAndActions: Story = {
  name: "With result and actions",
  render: () => ({
    moduleMetadata: { imports: [SearchResultActionsDemoComponent] },
    template: `<tedi-search-result-actions-demo />`,
  }),
};

/**
 * Live typeahead — results filter as you type and the matched text is bolded.
 * The panel appears once the field is non-empty and shows a "no results" row
 * when nothing matches. Focus stays in the input (inline region, not the
 * floating menu), so typing is never interrupted.
 */
export const Typeahead: Story = {
  name: "Typeahead (live filtering)",
  render: () => ({
    moduleMetadata: { imports: [SearchTypeaheadDemoComponent] },
    template: `<tedi-search-typeahead-demo />`,
  }),
};

/**
 * Asynchronous suggestions — typing debounces a fake request that shows a
 * spinner while "loading", then the matched results (or an empty state).
 */
export const AsyncSuggestions: Story = {
  name: "Async suggestions (loading)",
  render: () => ({
    moduleMetadata: { imports: [SearchAsyncDemoComponent] },
    template: `<tedi-search-async-demo />`,
  }),
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
