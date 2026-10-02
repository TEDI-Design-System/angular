import {
  argsToTemplate,
  moduleMetadata,
  type Meta,
  type StoryObj,
} from "@storybook/angular";
import { FormsModule } from "@angular/forms";
import { createBreakpointArgTypes } from "../../../../dev-tools/createBreakpointArgTypes";
import { VerticalSpacingDirective } from "../../../directives/vertical-spacing/vertical-spacing.directive";
import { IconComponent } from "../../base/icon/icon.component";
import { ButtonComponent } from "../../buttons/button/button.component";
// `DropdownComponent` first: it and `DropdownTriggerDirective` import each other,
// so loading the trigger first trips the temporal dead zone.
import { DropdownComponent } from "../../overlay/dropdown/dropdown.component";
import { DropdownContentComponent } from "../../overlay/dropdown/dropdown-content/dropdown-content.component";
import { DropdownItemComponent } from "../../overlay/dropdown/dropdown-item/dropdown-item.component";
import { DropdownTriggerDirective } from "../../overlay/dropdown/dropdown-trigger/dropdown-trigger.directive";
import { DateFieldComponent } from "../../form/date-field/date-field.component";
import { FormFieldComponent } from "../../form/form-field/form-field.component";
import { InputGroupComponent } from "../../form/input-group/input-group.component";
import { InputGroupSuffixDirective } from "../../form/input-group/input-group-suffix.directive";
import { SelectComponent } from "../../form/select/select.component";
import { TextFieldComponent } from "../../form/text-field/text-field.component";
import { TimeFieldComponent } from "../../form/time-field/time-field.component";
import { StatusBadgeComponent } from "../../tags/status-badge/status-badge.component";
import { TableCardActionsComponent } from "./table-card-actions/table-card-actions.component";
import { TableCardEndSlotDirective } from "./table-card-end-slot.directive";
import { TableCardGroupComponent } from "./table-card-group/table-card-group.component";
import { TableCardRowComponent } from "./table-card-row/table-card-row.component";
import { TableCardSummaryComponent } from "./table-card-summary/table-card-summary.component";
import { TableCardComponent } from "./table-card.component";

/**
 * `TableCard` presents a table row as a card of label-value pairs, serving as the mobile counterpart to `Table`.
 * Use `<div tedi-table-card-row>` for each pair, with optional groups, a summary and actions.
 *
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.75.91?node-id=53155-150281&m=dev" target="_BLANK">Figma ↗</a>
 */
export default {
  title: "TEDI-Ready/Content/TableCard",
  component: TableCardComponent,
  parameters: {
    status: {
      type: ["breakpointSupport"],
    },
  },
  decorators: [
    moduleMetadata({
      imports: [
        TableCardComponent,
        TableCardRowComponent,
        TableCardGroupComponent,
        TableCardSummaryComponent,
        TableCardActionsComponent,
        TableCardEndSlotDirective,
        StatusBadgeComponent,
        ButtonComponent,
        DropdownComponent,
        DropdownTriggerDirective,
        DropdownContentComponent,
        DropdownItemComponent,
        IconComponent,
        VerticalSpacingDirective,
        FormsModule,
        FormFieldComponent,
        TextFieldComponent,
        InputGroupComponent,
        InputGroupSuffixDirective,
        SelectComponent,
        DateFieldComponent,
        TimeFieldComponent,
      ],
    }),
  ],
  argTypes: {
    title: {
      control: "text",
      description:
        "Title shown in the header. It also names the toggle of a `collapsible` card, which falls back to `ariaLabel` without it.",
      table: { category: "inputs", type: { summary: "string" } },
    },
    subtitle: {
      control: "text",
      description: "Secondary line under the title.",
      table: { category: "inputs", type: { summary: "string" } },
    },
    titleElement: {
      control: "radio",
      options: ["h2", "h3", "h4", "h5", "h6"],
      description:
        "HTML heading level of the title. Does not affect its visual size.",
      table: {
        category: "inputs",
        type: { summary: "TableCardTitleElement" },
        defaultValue: { summary: "h3" },
      },
    },
    titleModifiers: {
      control: "text",
      description:
        "Visual size and weight of the title, independent of `titleElement`.",
      table: {
        category: "inputs",
        type: { summary: "TextModifiers | TextModifiers[]" },
      },
    },
    collapsible: {
      control: "boolean",
      description:
        "Turn the header into a toggle that shows and hides the body.",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    open: {
      control: "boolean",
      description:
        "Whether the body is expanded when `collapsible` is enabled.",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    selectable: {
      control: "boolean",
      description: "Show a leading checkbox that selects the row.",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    selected: {
      control: "boolean",
      description: "Whether the row is selected.",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    selectionLabel: {
      control: "text",
      description:
        "Accessible name of the checkbox when the card is collapsible or has no title.",
      table: {
        category: "inputs",
        type: { summary: "string" },
        defaultValue: { summary: "table-card.select-row" },
      },
    },
    ariaLabel: {
      control: "text",
      description:
        "Accessible name of the card. Also names the collapse toggle when no title is provided.",
      table: { category: "inputs", type: { summary: "string" } },
    },
    layout: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description:
        "Row layout — `horizontal` puts the label beside its value, `vertical` above it.",
      table: {
        category: "inputs",
        type: { summary: "TableCardLayout", detail: "horizontal \nvertical" },
        defaultValue: { summary: "horizontal" },
      },
    },
    columns: {
      control: { type: "number", min: 1, max: 4 },
      description: "Number of columns used to arrange the rows.",
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "1" },
      },
    },
    columnSizing: {
      control: "radio",
      options: ["equal", "auto"],
      description:
        "Column sizing in multi-column layouts. `equal` uses equal widths; `auto` sizes columns according to their content and distributes remaining space.",
      table: {
        category: "inputs",
        type: { summary: "TableCardColumnSizing", detail: "equal \nauto" },
        defaultValue: { summary: "equal" },
      },
    },
    labelWidth: {
      control: "text",
      description:
        "Width of the label column in horizontal layout. A `number` is pixels.",
      table: {
        category: "inputs",
        type: { summary: "string | number" },
        defaultValue: {
          summary: "var(--text-group-label-width-sm) horizontal, auto vertical",
        },
      },
    },
    labelAlign: {
      control: "radio",
      options: ["left", "right"],
      description:
        "Alignment of the label text. Defaults to `right` in horizontal layout, `left` otherwise.",
      table: { category: "inputs", type: { summary: "TableCardAlign" } },
    },
    valueAlign: {
      control: "radio",
      options: ["left", "right"],
      description: "Value alignment in horizontal layout. Defaults to `right`.",
      table: { category: "inputs", type: { summary: "TableCardAlign" } },
    },
    rowAlign: {
      control: "radio",
      options: ["start", "center"],
      description:
        "Vertical alignment of labels and values in horizontal layout.",
      table: {
        category: "inputs",
        type: { summary: "TableCardRowAlign", detail: "start \ncenter" },
        defaultValue: { summary: "start" },
      },
    },
    labelSize: {
      control: "radio",
      options: ["default", "small"],
      description: "Size of the row labels.",
      table: {
        category: "inputs",
        type: { summary: "TableCardLabelSize", detail: "default \nsmall" },
        defaultValue: { summary: "default" },
      },
    },
    padding: {
      control: "number",
      description:
        "Padding of the card. Accepts the same values as `tedi-card-content`.",
      table: {
        category: "inputs",
        type: { summary: "CardPadding" },
        defaultValue: { summary: "1" },
      },
    },
    rowGap: {
      control: "text",
      description:
        "Gap between rows. A `number` is rems, matching `padding`; pass a string for any other CSS length.",
      table: {
        category: "inputs",
        type: { summary: "string | number" },
        defaultValue: {
          summary: "var(--layout-grid-gutters-16) vertical, 0 horizontal",
        },
      },
    },
    // Add object controls to the breakpoint documentation provided by the helper.
    ...Object.fromEntries(
      Object.entries(createBreakpointArgTypes("TableCardInputs")).map(
        ([breakpoint, argType]) => [
          breakpoint,
          { ...argType, control: "object" },
        ],
      ),
    ),
  },
} as Meta<TableCardComponent>;

type Story = StoryObj<TableCardComponent>;

export const Default: Story = {
  args: {
    labelSize: "small",
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 360px">
      <tedi-table-card ${argsToTemplate(args)}>
        <div tedi-table-card-row label="Hüvitise arvutamine" value="Tervisekassa ei hüvita"></div>
        <div tedi-table-card-row label="Kogus" value="2 päeva"></div>
        <div tedi-table-card-row label="Ühe päeva hüvitis (€)" value="-"></div>
        <div tedi-table-card-row label="Summa (€)" value="0.00 €" bold></div>
        <tedi-table-card-summary label="Ülekande summa">0.00 €</tedi-table-card-summary>
      </tedi-table-card>
      </div>
    `,
  }),
};

export const SimpleCard: Story = {
  render: () => ({
    props: {
      benefits: [0, 1, 2, 3],
    },
    template: `
      <div style="max-width: 360px"><div [tediVerticalSpacing]="1">
        <tedi-table-card labelSize="small">
          @for (benefit of benefits; track benefit) {
            <tedi-table-card-group background="primary">
              <div tedi-table-card-row label="Hüvitise arvutamine" value="Tervisekassa ei hüvita"></div>
              <div tedi-table-card-row label="Kogus" value="2 päeva"></div>
              <div tedi-table-card-row label="Ühe päeva hüvitis (€)" value="-"></div>
              <div tedi-table-card-row label="Summa (€)" value="0.00 €" bold></div>
            </tedi-table-card-group>
          }
          <tedi-table-card-summary label="Ülekande summa">0.00 €</tedi-table-card-summary>
        </tedi-table-card>

        <tedi-table-card
          title="ID kaart"
          titleElement="h4"
          titleModifiers="h4"
          layout="vertical"
          labelSize="small"
          [columns]="2"
        >
          <tedi-status-badge tediTableCardEndSlot color="success" text="Kehtib 13.08.2027" />
          <div tedi-table-card-row label="Eesnimi" value="Mari"></div>
          <div tedi-table-card-row label="Sünniaeg" value="15.08.1987"></div>
          <div tedi-table-card-row label="Perenimi" value="Maasikas"></div>
          <div tedi-table-card-row label="Isikukood" value="41234567891"></div>
          <div tedi-table-card-row label="Dokumendi number" value="AS0000226"></div>
          <div tedi-table-card-row label="Sugu" value="Naine"></div>
        </tedi-table-card>

        <tedi-table-card title="4. juuli 2026" layout="vertical" labelSize="small">
          <div tedi-table-card-row label="Päringu teostaja" value="EE4800234675"></div>
          <div tedi-table-card-row label="Päringu nimetus" value="Inimeste arv kohalikus omavalitsuses"></div>
          <div tedi-table-card-row label="Infosüsteem" value="Rahvastikuregister"></div>
        </tedi-table-card>

        <tedi-table-card layout="vertical">
          <div tedi-table-card-row label="Periood" value="01.02 - 14.01.2024"></div>
          <div tedi-table-card-row label="Liik" value="Haigusleht"></div>
          <div tedi-table-card-row label="Pikkus" value="14 päeva"></div>
          <div tedi-table-card-row label="Hüvitis" value="120.34 €" bold></div>
          <div tedi-table-card-row label="Tõendi olek">
            <tedi-status-badge color="success" text="Kehtiv" />
          </div>
        </tedi-table-card>

        <tedi-table-card layout="vertical" [columns]="2">
          <div tedi-table-card-row label="Periood" value="01.02 - 14.01.2024" [colSpan]="2"></div>
          <div tedi-table-card-row label="Liik" value="Haigusleht"></div>
          <div tedi-table-card-row label="Pikkus" value="14 päeva"></div>
          <div tedi-table-card-row label="Hüvitis" value="120.34 €" bold></div>
          <div tedi-table-card-row label="Tõendi olek">
            <tedi-status-badge color="success" text="Kehtiv" />
          </div>
        </tedi-table-card>
      </div></div>
    `,
  }),
};

/**
 * Use `tedi-table-card-actions` for footer buttons and `selectable` for a checkbox
 * in the header. Row values can also contain interactive content, such as the
 * location dropdown shown here.
 */
type BookingDraft = {
  dateRange: { from: Date; to?: Date };
  time: string;
  duration: string;
  location: string;
};

type BookingHost = {
  booking: BookingDraft;
  draft: BookingDraft | null;
  editing: boolean;
};

export const WithActions: Story = {
  render: () => ({
    props: {
      selected: [false, false, false],
      editing: false,
      booking: {
        dateRange: { from: new Date(2029, 2, 22), to: new Date(2029, 2, 29) },
        time: "11:14",
        duration: "6",
        location: "Tallinn",
      },
      draft: null as BookingDraft | null,
      formatRange: (range: { from?: Date; to?: Date } | null): string => {
        const format = (date: Date) =>
          [date.getDate(), date.getMonth() + 1, date.getFullYear()]
            .map((part, index) =>
              index === 2 ? part : String(part).padStart(2, "0"),
            )
            .join(".");
        if (!range?.from) return "";
        return range.to
          ? `${format(range.from)} \u2013 ${format(range.to)}`
          : format(range.from);
      },
      beginEdit(this: BookingHost) {
        this.draft = { ...this.booking };
        this.editing = true;
      },
      cancelEdit(this: BookingHost) {
        this.draft = null;
        this.editing = false;
      },
      saveEdit(this: BookingHost) {
        if (this.draft) this.booking = this.draft;
        this.draft = null;
        this.editing = false;
      },
      locations: [
        { label: "Tallinn", value: "Tallinn" },
        { label: "Tartu", value: "Tartu" },
        { label: "Pärnu", value: "Pärnu" },
      ],
    },
    template: `
      <div style="max-width: 360px"><div [tediVerticalSpacing]="1">
        <tedi-table-card layout="vertical">
          <div tedi-table-card-row label="Kuupäev" [labelFor]="editing ? 'booking-date' : undefined">
            @if (editing) {
              <tedi-date-field
                inputId="booking-date"
                mode="range"
                placeholder="pp.kk.aaaa – pp.kk.aaaa"
                [(ngModel)]="draft.dateRange"
              />
            } @else {
              {{ formatRange(booking.dateRange) }}
            }
          </div>
          <div tedi-table-card-row label="Kellaaeg" [labelFor]="editing ? 'booking-time' : undefined">
            @if (editing) {
              <tedi-time-field inputId="booking-time" [(ngModel)]="draft.time" />
            } @else {
              {{ booking.time }}
            }
          </div>
          <div tedi-table-card-row label="Kestus" [labelFor]="editing ? 'booking-duration' : undefined">
            @if (editing) {
              <tedi-input-group>
                <tedi-form-field>
                  <input tedi-text-field id="booking-duration" [(ngModel)]="draft.duration" />
                </tedi-form-field>
                <span tediInputGroupSuffix>min</span>
              </tedi-input-group>
            } @else {
              {{ booking.duration }} min
            }
          </div>
          <div tedi-table-card-row label="Asukoht" [labelId]="editing ? 'booking-location-label' : undefined">
            @if (editing) {
              <tedi-select
                inputId="booking-location"
                ariaLabelledby="booking-location-label"
                [options]="locations"
                bindLabel="label"
                bindValue="value"
                [(ngModel)]="draft.location"
              />
            } @else {
              {{ booking.location }}
            }
          </div>
          <tedi-table-card-actions>
            @if (editing) {
              <button tedi-button variant="neutral" (click)="cancelEdit()">Katkesta</button>
              <button tedi-button variant="primary" (click)="saveEdit()">Salvesta</button>
            } @else {
              <button tedi-button variant="neutral" (click)="beginEdit()">
                <tedi-icon name="edit" [size]="18" />
                Muuda
              </button>
            }
          </tedi-table-card-actions>
        </tedi-table-card>

        <tedi-table-card layout="vertical">
          <div tedi-table-card-row label="Teenus" value="Ortopeedia"></div>
          <div tedi-table-card-row label="Arst" value="Pille Paunküla"></div>
          <div tedi-table-card-row label="Maksumus" value="45.50 €/h"></div>
          <tedi-table-card-group
            background="primary"
            layout="horizontal"
            labelAlign="left"
            valueAlign="left"
            labelWidth="auto"
            rowAlign="center"
          >
            <div tedi-table-card-row label="Asukoht">
              <tedi-dropdown>
                <button
                  tedi-button
                  tedi-dropdown-trigger
                  variant="neutral"
                  size="small"
                >
                  Tallinn
                  <tedi-icon name="expand_more" [size]="18" />
                </button>
                <tedi-dropdown-content>
                  <li tedi-dropdown-item>Tallinn</li>
                  <li tedi-dropdown-item>Tartu</li>
                  <li tedi-dropdown-item>Pärnu</li>
                </tedi-dropdown-content>
              </tedi-dropdown>
            </div>
          </tedi-table-card-group>
        </tedi-table-card>

        <tedi-table-card layout="vertical">
          <div tedi-table-card-row label="Periood" value="01.02 - 14.01.2024"></div>
          <div tedi-table-card-row label="Liik" value="Haigusleht"></div>
          <div tedi-table-card-row label="Pikkus" value="14 päeva"></div>
          <div tedi-table-card-row label="Hüvitis" value="120.34 €" bold></div>
          <tedi-table-card-actions>
            <button tedi-button variant="neutral" aria-label="Muuda">
              <tedi-icon name="edit" [size]="18" />
            </button>
            <button tedi-button variant="neutral" aria-label="Jaga">
              <tedi-icon name="share" [size]="18" />
            </button>
            <button tedi-button variant="neutral" aria-label="Lukusta">
              <tedi-icon name="lock" [size]="18" />
            </button>
            <button tedi-button variant="neutral" aria-label="Rohkem">
              <tedi-icon name="more_vert" [size]="18" />
            </button>
          </tedi-table-card-actions>
        </tedi-table-card>

        <tedi-table-card
          title="Meelis Mägi"
          titleModifiers="h6"
          selectable
          [(selected)]="selected[0]"
          labelAlign="left"
          valueAlign="left"
        >
          <div tedi-table-card-row label="Vanus" value="23"></div>
          <div tedi-table-card-row label="Külastuste arv" value="7"></div>
          <div tedi-table-card-row label="Tõendi staatus">
            <tedi-status-badge color="warning" text="Aegumas" />
          </div>
        </tedi-table-card>

        <tedi-table-card
          title="Madis Tamm"
          titleModifiers="h6"
          selectable
          [(selected)]="selected[1]"
          labelAlign="left"
          valueAlign="left"
        >
          <div tedi-table-card-row label="Vanus" value="12"></div>
          <div tedi-table-card-row label="Külastuste arv" value="14"></div>
          <div tedi-table-card-row label="Tõendi staatus">
            <tedi-status-badge color="success" text="Kehtiv" />
          </div>
        </tedi-table-card>

        <tedi-table-card
          title="Kadi Kuusk"
          titleModifiers="h6"
          selectable
          [(selected)]="selected[2]"
          labelAlign="left"
          valueAlign="left"
        >
          <div tedi-table-card-row label="Vanus" value="43"></div>
          <div tedi-table-card-row label="Külastuste arv" value="24"></div>
          <div tedi-table-card-row label="Tõendi staatus">
            <tedi-status-badge color="success" text="Kehtiv" />
          </div>
        </tedi-table-card>

        <tedi-table-card layout="vertical">
          <div tedi-table-card-row label="Periood" value="01.02 - 14.01.2024"></div>
          <div tedi-table-card-row label="Liik" value="Haigusleht"></div>
          <div tedi-table-card-row label="Pikkus" value="14 päeva"></div>
          <div tedi-table-card-row label="Staatus">
            <tedi-status-badge color="brand" text="Ülekanne tehtud" />
          </div>
          <div tedi-table-card-row label="Hüvitis" value="120.34 €" bold></div>
          <tedi-table-card-actions>
            <button tedi-button variant="neutral">Vaata</button>
            <button tedi-button variant="neutral">Muuda</button>
            <button tedi-button variant="neutral">Rohkem</button>
          </tedi-table-card-actions>
        </tedi-table-card>

        <tedi-table-card
          title="Pass"
          titleElement="h4"
          titleModifiers="h4"
          layout="vertical"
          [columns]="2"
        >
          <tedi-status-badge tediTableCardEndSlot color="success" text="Kehtib 13.08.2027" />
          <div tedi-table-card-row label="Eesnimi" value="Mari"></div>
          <div tedi-table-card-row label="Sünniaeg" value="15.08.1987"></div>
          <div tedi-table-card-row label="Perenimi" value="Maasikas"></div>
          <div tedi-table-card-row label="Isikukood" value="41234567891"></div>
          <div tedi-table-card-row label="Dokumendi number" value="AS0000226"></div>
          <div tedi-table-card-row label="Sugu" value="Naine"></div>
          <tedi-table-card-actions>
            <button tedi-button variant="secondary">Kuva pilt</button>
            <button tedi-button variant="secondary">Tegevused</button>
          </tedi-table-card-actions>
        </tedi-table-card>

        <tedi-table-card
          title="Eesti Maksu- ja Tolliamet"
          [titleModifiers]="['small', 'bold']"
          layout="vertical"
        >
          <tedi-status-badge tediTableCardEndSlot color="danger" text="Täitmata" />
          <div tedi-table-card-row value="Käibedeklaratsiooni esitamise tähtaeg on 5 päeva pärast 10.10.2025"></div>
          <tedi-table-card-actions>
            <button tedi-button variant="neutral">
              <tedi-icon name="share" [size]="18" />
              Jaga
            </button>
            <button tedi-button variant="neutral">
              <tedi-icon name="calendar_today" [size]="18" />
              Lisa kalendrisse
            </button>
          </tedi-table-card-actions>
        </tedi-table-card>
      </div></div>
    `,
  }),
};

/**
 * Enable `collapsible` to expand and collapse the body from the header.
 * The card's footer remains visible when collapsed.
 */
export const IsAccordion: Story = {
  render: () => ({
    template: `
      <div style="max-width: 360px"><div [tediVerticalSpacing]="1">
        <tedi-table-card
          title="Hambaarst"
          subtitle="14.04.2026 15:30"
          collapsible
          [open]="false"
          labelAlign="left"
          valueAlign="left"
          rowAlign="center"
        >
          <div tedi-table-card-row label="Vanus" value="25"></div>
          <div tedi-table-card-row label="Külastuste arv" value="6"></div>
          <div tedi-table-card-row label="Taotluse olek">
            <tedi-status-badge color="brand" text="Menetluses" />
          </div>
        </tedi-table-card>

        <tedi-table-card
          title="Hambaarst"
          subtitle="14.04.2026 15:30"
          collapsible
          [open]="false"
          labelAlign="left"
          valueAlign="left"
          rowAlign="center"
        >
          <div tedi-table-card-row label="Vanus" value="25"></div>
          <div tedi-table-card-row label="Külastuste arv" value="6"></div>
          <div tedi-table-card-row label="Taotluse olek">
            <tedi-status-badge color="brand" text="Menetluses" />
          </div>
          <tedi-table-card-actions>
            <button tedi-button variant="neutral">
              <tedi-icon name="edit" [size]="18" />
              Muuda
            </button>
            <button tedi-button variant="neutral">
              <tedi-icon name="close" [size]="18" />
              Tühista
            </button>
            <button tedi-button variant="neutral">
              <tedi-icon name="more_vert" [size]="18" />
              Rohkem
            </button>
          </tedi-table-card-actions>
        </tedi-table-card>

        <tedi-table-card
          title="Mari Maasikas"
          titleModifiers="bold"
          subtitle="Vanus: 25"
          collapsible
          [open]="false"
          labelAlign="left"
          valueAlign="left"
        >
          <tedi-status-badge tediTableCardEndSlot color="success" text="Verifitseeritud" />
          <div tedi-table-card-row label="Vanus" value="25"></div>
          <div tedi-table-card-row label="Külastuste arv" value="6"></div>
          <div tedi-table-card-row label="Taotluse olek">
            <tedi-status-badge color="brand" text="Menetluses" />
          </div>
        </tedi-table-card>

        <tedi-table-card
          title="Kadri Kaasik"
          collapsible
          labelAlign="left"
          valueAlign="left"
        >
          <div tedi-table-card-row label="Vanus" value="25"></div>
          <div tedi-table-card-row label="Külastuste arv" value="6"></div>
          <div tedi-table-card-row label="Taotluse olek">
            <tedi-status-badge color="brand" text="Menetluses" />
          </div>
          <tedi-table-card-actions>
            <button tedi-button variant="neutral">
              <tedi-icon name="edit" [size]="18" />
              Muuda
            </button>
          </tedi-table-card-actions>
        </tedi-table-card>

        <tedi-table-card
          title="Kadri Kaasik"
          collapsible
          layout="vertical"
          [columns]="3"
          columnSizing="auto"
        >
          <div tedi-table-card-row label="Vanus" value="25"></div>
          <div tedi-table-card-row label="Külastuste arv" value="6"></div>
          <div tedi-table-card-row label="Olek">
            <tedi-status-badge color="brand" text="Menetluses" />
          </div>
        </tedi-table-card>
      </div></div>
    `,
  }),
};

/**
 * Use `tedi-table-card-group` to group related rows. Groups inherit the card's
 * layout unless overridden, can contain their own actions, and collapse with the body.
 */
export const HasChildrenRows: Story = {
  render: () => ({
    template: `
      <div style="max-width: 360px"><div [tediVerticalSpacing]="1">
        <tedi-table-card title="Kadri Kaasik" collapsible labelAlign="left" valueAlign="left">
          <div tedi-table-card-row label="Vanus" value="25"></div>
          <div tedi-table-card-row label="Külastuste arv" value="6"></div>

          <tedi-table-card-group>
            <div tedi-table-card-row label="Tõend" value="Puukentsefaliidi vaktsiin"></div>
            <div tedi-table-card-row label="Tõendi staatus">
              <tedi-status-badge color="success" variant="filled-bordered" text="Kehtiv" />
            </div>
            <tedi-table-card-actions>
              <button tedi-button variant="neutral">Vaata</button>
            </tedi-table-card-actions>
          </tedi-table-card-group>

          <tedi-table-card-group>
            <div tedi-table-card-row label="Tõend" value="COVID-19"></div>
            <div tedi-table-card-row label="Tõendi staatus">
              <tedi-status-badge color="success" variant="filled-bordered" text="Kehtiv" />
            </div>
            <tedi-table-card-actions>
              <button tedi-button variant="neutral">Vaata</button>
            </tedi-table-card-actions>
          </tedi-table-card-group>

          <tedi-table-card-actions>
            <button tedi-button variant="neutral">
              <tedi-icon name="edit" [size]="18" />
              Muuda
            </button>
          </tedi-table-card-actions>
        </tedi-table-card>

        <tedi-table-card title="Kadri Kaasik" collapsible labelAlign="left" valueAlign="left">
          <div tedi-table-card-row label="Vanus" value="25"></div>
          <div tedi-table-card-row label="Külastuste arv" value="6"></div>

          <tedi-table-card-group>
            <div tedi-table-card-row label="Tõend" value="Puukentsefaliidi vaktsiin"></div>
            <div tedi-table-card-row label="Olek">
              <tedi-status-badge color="success" variant="filled-bordered" text="Kehtiv" />
            </div>
          </tedi-table-card-group>

          <tedi-table-card-group>
            <div tedi-table-card-row label="Tõend" value="COVID-19"></div>
            <div tedi-table-card-row label="Olek">
              <tedi-status-badge color="success" variant="filled-bordered" text="Kehtiv" />
            </div>
          </tedi-table-card-group>

          <tedi-table-card-actions>
            <button tedi-button variant="neutral">
              <tedi-icon name="edit" [size]="18" />
              Muuda
            </button>
          </tedi-table-card-actions>
        </tedi-table-card>

        <tedi-table-card title="Kadri Kaasik" collapsible layout="vertical" [columns]="2">
          <div tedi-table-card-row label="Vanus" value="25"></div>
          <div tedi-table-card-row label="Külastuste arv" value="6"></div>

          <tedi-table-card-group>
            <div tedi-table-card-row label="Tõend" value="Puukentsefaliidi vaktsiin"></div>
            <div tedi-table-card-row label="Olek">
              <tedi-status-badge color="success" variant="filled-bordered" text="Kehtiv" />
            </div>
          </tedi-table-card-group>

          <tedi-table-card-group>
            <div tedi-table-card-row label="Tõend" value="COVID-19"></div>
            <div tedi-table-card-row label="Olek">
              <tedi-status-badge color="success" variant="filled-bordered" text="Kehtiv" />
            </div>
          </tedi-table-card-group>

          <tedi-table-card-actions>
            <button tedi-button variant="neutral">
              <tedi-icon name="edit" [size]="18" />
              Muuda
            </button>
          </tedi-table-card-actions>
        </tedi-table-card>
      </div></div>
    `,
  }),
};

/**
 * This example uses `[md]="{ columns: 2 }"` to switch from one column to two at
 * the `md` viewport breakpoint. Labels stay above their values. Resize the preview
 * to see the configured layout change.
 */
export const WithResponsiveLayout: Story = {
  render: () => ({
    template: `
      <tedi-table-card
        style="max-width: 360px"
        title="ID kaart"
        titleElement="h4"
        titleModifiers="h4"
        layout="vertical"
        labelSize="small"
        [md]="{ columns: 2 }"
      >
        <tedi-status-badge tediTableCardEndSlot color="success" text="Kehtib 13.08.2027" />
        <div tedi-table-card-row label="Eesnimi" value="Mari"></div>
        <div tedi-table-card-row label="Sünniaeg" value="15.08.1987"></div>
        <div tedi-table-card-row label="Perenimi" value="Maasikas"></div>
        <div tedi-table-card-row label="Isikukood" value="41234567891"></div>
        <div tedi-table-card-row label="Dokumendi number" value="AS0000226"></div>
        <div tedi-table-card-row label="Sugu" value="Naine"></div>
      </tedi-table-card>
    `,
  }),
};
