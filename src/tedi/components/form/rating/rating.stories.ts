import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { FormsModule } from "@angular/forms";
import { RatingComponent, RatingType } from "./rating.component";
import { TextComponent } from "../../base/text/text.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { CardComponent } from "../../content/card/card.component";
import { CardContentComponent } from "../../content/card/card-content/card-content.component";
import { LabelComponent } from "../../content/label/label.component";
import { CheckboxComponent } from "../checkbox/checkbox.component";
import { CheckboxCardComponent } from "../checkbox-card/checkbox-card.component";
import { CheckboxCardGroupComponent } from "../checkbox-card-group/checkbox-card-group.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { FormFieldComponent } from "../form-field/form-field.component";
import { TextareaComponent } from "../textarea/textarea.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.76.92?node-id=15548-139124&m=dev" target="_blank">Figma ↗</a>
 */

const STAR_LABELS = [
  "Ei jäänud üldse rahule",
  "Ei jäänud rahule",
  "Osaliselt rahul",
  "Jäin rahule",
  "Jäin väga rahule",
];
const ICON_LABELS = ["Väga halb", "Halb", "Keskmine", "Hea", "Väga hea"];
const NUMBER_LABELS = Array.from({ length: 10 }, (_, index) =>
  index === 0 ? "Väga halb" : index === 9 ? "Suurepärane" : "",
);

export default {
  title: "TEDI-Ready/Components/Form/Rating",
  component: RatingComponent,
  decorators: [
    moduleMetadata({
      imports: [
        FormsModule,
        TextComponent,
        ButtonComponent,
        CardComponent,
        CardContentComponent,
        LabelComponent,
        CheckboxComponent,
        CheckboxCardComponent,
        CheckboxCardGroupComponent,
        FeedbackTextComponent,
        FormFieldComponent,
        TextareaComponent,
      ],
    }),
  ],
  parameters: {
    status: { type: ["breakpointSupport"] },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.76.92?node-id=15548-139124&m=dev",
    },
  },
  args: {
    label: "Hinnang",
    type: "star",
    value: 0,
    disabled: false,
    readOnly: false,
    showRatingsCountLabel: true,
    readOnlyVariant: "summary",
    orientation: "horizontal",
  },
  argTypes: {
    label: { control: "text" },
    type: { control: "radio", options: ["star", "number", "icon"] },
    count: {
      control: { type: "number", min: 1 },
      description:
        "Number of items. Defaults to 5 (`star` / `icon`) or 10 (`number`).",
    },
    value: { control: { type: "number", min: 0, step: 0.5 } },
    itemLabels: {
      control: "object",
      description:
        "Per-item labels (length = `count`): accessible names and captions.",
    },
    icons: {
      control: "object",
      description:
        'Material Symbol glyph(s): an array for `type="icon"`, a single string for `type="star"`.',
    },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    ratingsCount: {
      control: { type: "number", min: 0 },
      description: "Number of ratings shown in the `readOnly` summary.",
    },
    showRatingsCountLabel: { control: "boolean" },
    name: { control: "text" },
    readOnlyVariant: { control: "radio", options: ["summary", "scale"] },
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description:
        "Accepts a `BreakpointInput`, e.g. `{ xs: 'vertical', md: 'horizontal' }`.",
    },
  },
  render: (args) => ({
    props: args,
    template: `<tedi-rating ${argsToTemplate(args)} />`,
  }),
} as Meta<RatingComponent>;

type Story = StoryObj<RatingComponent>;

const rowLabel = (value: number, max: number) =>
  value === 0 ? "No rating" : `${value} of ${max}`;

const scaleShowcase = (
  type: RatingType,
  max: number,
  itemLabels?: string[],
): Story => ({
  parameters: { controls: { disable: true } },
  render: () => ({
    props: {
      rows: Array.from({ length: max + 1 }, (_, value) => ({
        value,
        label: rowLabel(value, max),
      })),
      type,
      max,
      itemLabels,
    },
    // Row label sits on top on mobile (so the scale gets the full width) and moves to a left column from md up.
    template: `
      <div class="flex flex-column gap-3">
        @for (row of rows; track row.value) {
          <div class="flex flex-column flex-md-row gap-3 align-items-start">
            <div style="width: 5rem; flex-shrink: 0"><p tedi-text modifiers="bold">{{ row.label }}</p></div>
            <tedi-rating [type]="type" [count]="max" [value]="row.value" [itemLabels]="itemLabels" [label]="row.label" />
          </div>
        }
        <div class="flex flex-column flex-md-row gap-3 align-items-start">
          <div style="width: 5rem; flex-shrink: 0"><p tedi-text modifiers="bold">Read only</p></div>
          <div class="flex flex-column gap-2">
            <tedi-rating [type]="type" [count]="max" readOnly [value]="3.5" [ratingsCount]="271" [label]="type + ' read-only, with raters'" />
            <tedi-rating [type]="type" [count]="max" readOnly [value]="3.5" [ratingsCount]="271" [showRatingsCountLabel]="false" [label]="type + ' read-only, count only'" />
            <tedi-rating [type]="type" [count]="max" readOnly [value]="3.5" [label]="type + ' read-only, no count'" />
          </div>
        </div>
      </div>
    `,
  }),
});

export const Default: Story = {};

export const Stars: Story = scaleShowcase("star", 5, STAR_LABELS);

export const Numbers: Story = scaleShowcase("number", 10, NUMBER_LABELS);

export const Icons: Story = scaleShowcase("icon", 5, ICON_LABELS);

export const States: Story = {
  parameters: {
    controls: { disable: true },
    pseudo: {
      hover: '[id^="rating-hover"] label',
      focusVisible: '[id^="rating-focus"] input',
    },
  },
  render: () => ({
    // One table (as in Figma) so every state row lines up across the three types.
    props: {
      types: ["star", "number", "icon"],
      rows: [
        { label: "Default" },
        { label: "Hover", state: "hover" },
        { label: "Disabled", disabled: true },
        { label: "Focus", state: "focus" },
      ],
      capitalize: (type: string) => type[0].toUpperCase() + type.slice(1),
    },
    template: `
      <div style="overflow-x: auto">
        <table style="border-collapse: collapse">
          <thead>
            <tr>
              <td></td>
              @for (type of types; track type) {
                <th colspan="2" scope="colgroup" style="padding: 0.5rem 1rem; text-align: left">
                  <h3 tedi-text modifiers="h5">{{ capitalize(type) }}</h3>
                </th>
              }
            </tr>
            <tr>
              <th><span class="sr-only">State</span></th>
              @for (type of types; track type) {
                @for (column of ["Default", "Selected"]; track column) {
                  <th scope="col" style="padding: 0.5rem 1rem; text-align: left">
                    <span tedi-text modifiers="bold">{{ column }}</span>
                  </th>
                }
              }
            </tr>
          </thead>
          <tbody>
            @for (row of rows; track row.label) {
              <tr [attr.id]="row.state ? 'rating-' + row.state : null">
                <th scope="row" style="padding: 0.5rem 1rem 0.5rem 0; text-align: left">
                  <span tedi-text modifiers="bold">{{ row.label }}</span>
                </th>
                @for (type of types; track type) {
                  @for (selected of [0, 1]; track selected) {
                    <td style="padding: 0.5rem 1rem; vertical-align: middle">
                      <tedi-rating
                        [type]="type"
                        [count]="1"
                        [value]="selected"
                        [disabled]="!!row.disabled"
                        [icons]="type === 'icon' ? ['sentiment_satisfied'] : undefined"
                        [label]="type + ' ' + row.label + ' ' + (selected ? 'selected' : 'default')"
                      />
                    </td>
                  }
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    `,
  }),
};

/**
 * `orientation="vertical"` stacks the scale and puts each icon beside its caption, so long labels fit
 * on narrow (mobile) layouts where the horizontal row would overflow.
 */
export const VerticalIcons: Story = {
  name: "Vertical (icons)",
  parameters: { controls: { disable: true } },
  render: () => ({
    props: {
      labels: [
        "Väga halb kogemus",
        "Halb kogemus",
        "Keskmine kogemus",
        "Hea kogemus",
        "Väga hea kogemus",
      ],
    },
    template: `<tedi-rating type="icon" orientation="vertical" [itemLabels]="labels" [value]="4" label="Teenuse hinnang" />`,
  }),
};

/**
 * Two-way binding with `[(value)]`; the component also works with `ngModel` and reactive forms.
 */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { value: 2, labels: STAR_LABELS },
    template: `
      <div class="flex flex-column gap-3">
        <tedi-rating [(value)]="value" [itemLabels]="labels" label="Hinnang" />
        <span tedi-text>Valitud: {{ value || "—" }}</span>
      </div>
    `,
  }),
};

/**
 * The read-only `scale` variant renders the whole star scale with the boundary star filled to the
 * fraction (e.g. `3,5` → three full, one half, one empty), followed by the summary text. Use it to
 * show an aggregate rating inline; the default `summary` variant shows a single star instead.
 */
export const ReadOnlyScale: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { values: [4.8, 3.5, 2.5, 1.2] },
    template: `
      <div class="flex flex-column gap-3">
        @for (value of values; track value) {
          <tedi-rating readOnly readOnlyVariant="scale" [value]="value" [ratingsCount]="271" label="Teenuse hinnang" />
        }
      </div>
    `,
  }),
};

/**
 * Swap glyphs via `icons`:
 * - `type="icon"` takes an array (one per item) for a single-highlight scale, here a weather scale.
 * - `type="star"` takes a single string to change the cumulative glyph (e.g. a pointier `star` or a
 *   `favorite` heart), keeping the fill and hover/focus behaviour.
 *
 * Pair with `itemLabels` for accessible names / captions.
 */
export const CustomIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: {
      weather: ["thunderstorm", "rainy", "cloud", "partly_cloudy_day", "sunny"],
      iconLabels: ICON_LABELS,
      starLabels: STAR_LABELS,
    },
    template: `
      <div class="flex flex-column gap-3">
        <tedi-rating type="icon" [icons]="weather" [itemLabels]="iconLabels" [value]="4" label="Ilmahinnang" />
        <tedi-rating icons="star" [value]="3" [itemLabels]="starLabels" label="Pointier star" />
        <tedi-rating icons="favorite" [value]="4" label="Favourite" />
      </div>
    `,
  }),
};

export const FeedbackFormExample: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: {
      rating: 1,
      submitted: false,
      labels: STAR_LABELS,
      reasons: [
        { id: "reason-error", label: "Näen veateadet", checked: true },
        { id: "reason-wrong", label: "Andmed on valed" },
        { id: "reason-missing", label: "Andmed puuduvad" },
        { id: "reason-no-right", label: "Õigus puudub" },
        { id: "reason-not-found", label: "Ei leidnud, mida otsisin" },
        { id: "reason-complex", label: "Keeruline" },
        { id: "reason-other", label: "Muu põhjus" },
      ],
    },
    template: `
      <tedi-card>
        <tedi-card-content>
          @if (submitted) {
            <div class="flex flex-column align-items-center gap-2">
              <h2 tedi-text modifiers="h5">Aitäh!</h2>
              <p tedi-text color="secondary">Sinu tagasiside aitab portaali paremaks muuta.</p>
            </div>
          } @else {
            <div class="flex flex-column gap-5">
              <div class="flex flex-column align-items-center gap-2">
                <h2 tedi-text modifiers="h5">Kuidas jäid rahule teenuse kasutamisega?</h2>
                <tedi-rating [(value)]="rating" [itemLabels]="labels" label="Kuidas jäid rahule teenuse kasutamisega?" />
              </div>
              @if (rating > 0) {
                <div class="flex flex-column align-items-center gap-2">
                  <h3 tedi-text modifiers="h5">Mis mõjutas Sinu vastust?</h3>
                  <p tedi-text color="secondary">Vali sobivad märksõnad</p>
                </div>
                <tedi-checkbox-card-group class="justify-content-center">
                  @for (reason of reasons; track reason.id) {
                    <label tedi-checkbox-card variant="secondary">
                      <input tedi-checkbox type="checkbox" [id]="reason.id" [checked]="!!reason.checked" />
                      {{ reason.label }}
                    </label>
                  }
                </tedi-checkbox-card-group>
                <tedi-form-field [characterLimit]="500">
                  <label tedi-label for="feedback-comment">Soovi korral lisa täpsustus</label>
                  <textarea tedi-textarea id="feedback-comment"></textarea>
                  <tedi-feedback-text text="Me ei vasta selle vormi kaudu saadetud tagasisidele. Palun ära lisa siia isiklikku teavet." />
                </tedi-form-field>
                <div class="flex justify-content-center">
                  <button tedi-button (click)="submitted = true">Saada tagasiside</button>
                </div>
              }
            </div>
          }
        </tedi-card-content>
      </tedi-card>
    `,
  }),
};
