import {
  Meta,
  StoryObj,
  argsToTemplate,
  moduleMetadata,
} from "@storybook/angular";
import { NgFor } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { RatingComponent, RatingItem } from "./rating.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { TextComponent } from "../../base/text/text.component";
import { AlertComponent } from "../../notifications/alert/alert.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.41.67?node-id=15548-139123&m=dev" target="_blank">Figma ↗</a>
 */

export default {
  title: "TEDI-Ready/Components/Form/Rating",
  component: RatingComponent,
  decorators: [
    moduleMetadata({
      imports: [
        RatingComponent,
        ReactiveFormsModule,
        NgFor,
        RowComponent,
        ColComponent,
        TextComponent,
        AlertComponent,
      ],
    }),
  ],
  argTypes: {
    variant: {
      description: "Visual variant of the rating.",
      control: "radio",
      options: ["star", "number", "icon"],
      table: {
        category: "inputs",
        type: { summary: '"star" | "number" | "icon"' },
        defaultValue: { summary: '"star"' },
      },
    },
    value: {
      description:
        "Selected rating value (1-based). Supports two-way binding.",
      control: "number",
      table: {
        category: "inputs",
        type: { summary: "number | null" },
        defaultValue: { summary: "null" },
      },
    },
    max: {
      description: "Maximum number of items for star/number variants.",
      control: "number",
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "5" },
      },
    },
    precision: {
      description:
        "Star-variant increment. Only 1 or 0.5 are supported; 0.5 (half stars) is discouraged — each half-star target falls below the WCAG 2.5.8 24×24px minimum. Ignored by other variants.",
      control: "inline-radio",
      options: [1, 0.5],
      table: {
        category: "inputs",
        type: { summary: "1 | 0.5" },
        defaultValue: { summary: "1" },
      },
    },
    icon: {
      description:
        "Material Symbols icon for the star variant. Needs both filled and outlined variants for partial fill to read correctly.",
      control: "text",
      table: {
        category: "inputs",
        type: { summary: "string" },
        defaultValue: { summary: '"kid_star"' },
      },
    },
    color: {
      description:
        "Fill color of selected stars (star variant). Empty stars stay neutral.",
      control: "select",
      options: [
        "brand",
        "brand-dark",
        "success",
        "warning",
        "warning-dark",
        "danger",
        "primary",
        "secondary",
        "tertiary",
      ],
      table: {
        category: "inputs",
        type: { summary: "IconColor" },
        defaultValue: { summary: '"brand"' },
      },
    },
    items: {
      description:
        "Array of rating items for icon variant. Each item has an icon name and optional label.",
      control: "object",
      table: {
        category: "inputs",
        type: { summary: "RatingItem[]" },
        defaultValue: { summary: "[]" },
      },
    },
    startLabel: {
      description: "Label displayed below the first item (number variant).",
      control: "text",
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    endLabel: {
      description: "Label displayed below the last item (number variant).",
      control: "text",
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    ariaLabel: {
      description: "Accessible label for the rating group.",
      control: "text",
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
  },
} as Meta<RatingComponent>;

type Story = StoryObj<RatingComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<tedi-rating ${argsToTemplate(args)} />`,
  }),
  args: {
    variant: "star",
    value: 3,
    ariaLabel: "Rate this item",
  },
};

export const StarVariant: Story = {
  render: () => ({
    template: `
      <div class="flex flex-column gap-4">
        <div class="flex flex-column gap-2">
          <p tedi-text>Empty</p>
          <tedi-rating ariaLabel="Empty rating" />
        </div>
        <div class="flex flex-column gap-2">
          <p tedi-text>Partially filled (3/5)</p>
          <tedi-rating [value]="3" ariaLabel="Partial rating" />
        </div>
        <div class="flex flex-column gap-2">
          <p tedi-text>Fully filled (5/5)</p>
          <tedi-rating [value]="5" ariaLabel="Full rating" />
        </div>
      </div>
    `,
  }),
};

export const HalfStar: Story = {
  render: () => ({
    template: `
      <div class="flex flex-column gap-4">
        <div class="flex flex-column gap-2">
          <p tedi-text>Empty</p>
          <tedi-rating [precision]="0.5" ariaLabel="Half-star rating" />
        </div>
        <div class="flex flex-column gap-2">
          <p tedi-text>2.5 / 5</p>
          <tedi-rating [precision]="0.5" [value]="2.5" ariaLabel="Half-star rating" />
        </div>
        <div class="flex flex-column gap-2">
          <p tedi-text>3.5 / 5</p>
          <tedi-rating [precision]="0.5" [value]="3.5" ariaLabel="Half-star rating" />
        </div>
      </div>
    `,
  }),
};

export const CustomIcon: Story = {
  render: () => ({
    template: `
      <div class="flex flex-column gap-4">
        <div class="flex flex-column gap-2">
          <p tedi-text>Hearts</p>
          <tedi-rating icon="favorite" color="danger" [value]="3" ariaLabel="Heart rating" />
        </div>
        <div class="flex flex-column gap-2">
          <p tedi-text>Thumbs up</p>
          <tedi-rating icon="thumb_up" color="success" [value]="4" ariaLabel="Thumb rating" />
        </div>
      </div>
    `,
  }),
};

export const NumberVariant: Story = {
  render: () => ({
    template: `
      <div class="flex flex-column gap-4">
        <div class="flex flex-column gap-2">
          <p tedi-text>With labels</p>
          <tedi-rating
            variant="number"
            [max]="10"
            [value]="7"
            startLabel="Väga halb"
            endLabel="Suurepärane"
            ariaLabel="Number rating"
          />
        </div>
        <div class="flex flex-column gap-2">
          <p tedi-text>Without labels</p>
          <tedi-rating variant="number" [max]="10" [value]="4" ariaLabel="Number rating" />
        </div>
      </div>
    `,
  }),
};

const iconItems: RatingItem[] = [
  { icon: "sentiment_very_dissatisfied", label: "Väga halb" },
  { icon: "sentiment_dissatisfied", label: "Halb" },
  { icon: "sentiment_neutral", label: "Keskmine" },
  { icon: "sentiment_satisfied", label: "Hea" },
  { icon: "sentiment_very_satisfied", label: "Väga hea" },
];

export const IconVariant: Story = {
  render: () => ({
    props: {
      items: iconItems,
    },
    template: `
      <tedi-rating
        variant="icon"
        [items]="items"
        [value]="3"
        ariaLabel="Rate your experience"
      />
    `,
  }),
};

export const WithFormControl: Story = {
  render: () => ({
    props: {
      control: new FormControl<number | null>(2.5),
    },
    template: `
      <div class="flex flex-column gap-3">
        <tedi-rating [formControl]="control" [precision]="0.5" ariaLabel="Form control rating" />
        <tedi-alert type="info" [showClose]="false">
          <pre tedi-text modifiers="small">{{ {
  value: control.value,
  touched: control.touched,
  dirty: control.dirty
} | json }}</pre>
        </tedi-alert>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    props: {
      disabledControl: new FormControl<number | null>({ value: 3, disabled: true }),
      disabledNumberControl: new FormControl<number | null>({ value: 5, disabled: true }),
      disabledIconControl: new FormControl<number | null>({ value: 2, disabled: true }),
      items: iconItems,
    },
    template: `
      <div class="flex flex-column gap-4">
        <div class="flex flex-column gap-2">
          <p tedi-text>Star (disabled)</p>
          <tedi-rating [formControl]="disabledControl" ariaLabel="Disabled star rating" />
        </div>
        <div class="flex flex-column gap-2">
          <p tedi-text>Number (disabled)</p>
          <tedi-rating variant="number" [max]="10" startLabel="Väga halb" endLabel="Suurepärane" [formControl]="disabledNumberControl" ariaLabel="Disabled number rating" />
        </div>
        <div class="flex flex-column gap-2">
          <p tedi-text>Icon (disabled)</p>
          <tedi-rating variant="icon" [items]="items" [formControl]="disabledIconControl" ariaLabel="Disabled icon rating" />
        </div>
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: {
    pseudo: {
      hover: ".pseudo-hover [role='radio']",
      active: ".pseudo-active [role='radio']",
      focusVisible: ".pseudo-focus [role='radio']",
    },
  },
  render: () => ({
    props: {
      STATES: ["Default", "Hover", "Active", "Focus", "Selected"],
      items: iconItems,
    },
    template: `
      <tedi-row [cols]="4" [gapY]="3" alignItems="center">
        <tedi-col><p tedi-text modifiers="bold">State</p></tedi-col>
        <tedi-col><p tedi-text modifiers="bold">Star</p></tedi-col>
        <tedi-col><p tedi-text modifiers="bold">Number</p></tedi-col>
        <tedi-col><p tedi-text modifiers="bold">Icon</p></tedi-col>

        <ng-container *ngFor="let state of STATES;">
          <tedi-col><p tedi-text>{{ state }}</p></tedi-col>
          <tedi-col [class]="'pseudo-' + state.toLowerCase()">
            <tedi-rating [max]="1" [value]="state === 'Selected' ? 1 : null" ariaLabel="Star rating" />
          </tedi-col>
          <tedi-col [class]="'pseudo-' + state.toLowerCase()">
            <tedi-rating variant="number" [max]="1" [value]="state === 'Selected' ? 1 : null" ariaLabel="Number rating" />
          </tedi-col>
          <tedi-col [class]="'pseudo-' + state.toLowerCase()">
            <tedi-rating variant="icon" [items]="[items[0]]" [value]="state === 'Selected' ? 1 : null" ariaLabel="Icon rating" />
          </tedi-col>
        </ng-container>
      </tedi-row>
    `,
  }),
};
