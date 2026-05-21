import {
  booleanAttribute,
  Component,
  computed,
  input,
  signal,
  TemplateRef,
  viewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  type CdkDragDrop,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { argsToTemplate, Meta, StoryObj } from "@storybook/angular";
import type { CellContext, Row } from "@tanstack/angular-table";
import { TediTableComponent } from "./table.component";
import { TediTableToolbarComponent } from "./table-toolbar/table-toolbar.component";
import { TediTableColumnsMenuComponent } from "./table-columns-menu/table-columns-menu.component";
import { TediTableHeaderButtonComponent } from "./table-header-button/table-header-button.component";
import { groupRowSpan } from "./row-span.utils";
import type { TableState, TediColumnDef } from "./table.types";
import { ButtonComponent } from "../../buttons/button/button.component";
import { IconComponent } from "../../base/icon/icon.component";
import { LinkComponent } from "../../navigation/link/link.component";
import { InfoButtonComponent } from "../../buttons/info-button/info-button.component";
import { ClosingButtonComponent } from "../../buttons/closing-button/closing-button.component";
import { FormFieldComponent } from "../../form/form-field/form-field.component";
import { SelectComponent } from "../../form/select/select.component";
import { TextFieldComponent } from "../../form/text-field/text-field.component";
import { CheckboxComponent } from "../../form/checkbox/checkbox.component";
import { StatusBadgeComponent } from "../../tags/status-badge/status-badge.component";
import { AlertComponent } from "../../notifications/alert/alert.component";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { TooltipComponent } from "../../overlay/tooltip/tooltip.component";
import { TooltipTriggerComponent } from "../../overlay/tooltip/tooltip-trigger/tooltip-trigger.component";
import { TooltipContentComponent } from "../../overlay/tooltip/tooltip-content/tooltip-content.component";
import { PopoverComponent } from "../../overlay/popover/popover.component";
import { PopoverContentComponent } from "../../overlay/popover/popover-content/popover-content.component";
import { PopoverTriggerDirective } from "../../overlay/popover/popover-trigger/popover-trigger.directive";
import { DropdownComponent } from "../../overlay/dropdown/dropdown.component";
import { DropdownContentComponent } from "../../overlay/dropdown/dropdown-content/dropdown-content.component";
import { DropdownItemComponent } from "../../overlay/dropdown/dropdown-item/dropdown-item.component";
import { DropdownTriggerDirective } from "../../overlay/dropdown/dropdown-trigger/dropdown-trigger.directive";
import { EmptyStateComponent } from "../../helpers/empty-state/empty-state.component";

// ---------------------------------------------------------------------------
// Shared data — mirrors `react/src/tedi/components/content/table/table.stories.tsx`.
// Keep these seeds + Estonian labels aligned so Chromatic comparisons line up.
// ---------------------------------------------------------------------------

interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
  location: string;
  salary: number;
  status: "active" | "inactive";
}

const personSeed: Omit<Person, "id">[] = [
  {
    name: "Anna Tamm",
    email: "anna.tamm@example.ee",
    role: "Engineer",
    location: "Tallinn",
    salary: 4200,
    status: "active",
  },
  {
    name: "Jüri Kask",
    email: "juri.kask@example.ee",
    role: "Designer",
    location: "Tartu",
    salary: 3800,
    status: "active",
  },
  {
    name: "Maria Saar",
    email: "maria.saar@example.ee",
    role: "Product",
    location: "Pärnu",
    salary: 4600,
    status: "active",
  },
  {
    name: "Mart Mets",
    email: "mart.mets@example.ee",
    role: "Engineer",
    location: "Tallinn",
    salary: 4100,
    status: "inactive",
  },
  {
    name: "Liis Lepp",
    email: "liis.lepp@example.ee",
    role: "Ops",
    location: "Narva",
    salary: 3600,
    status: "active",
  },
  {
    name: "Kadri Kask",
    email: "kadri.kask@example.ee",
    role: "Engineer",
    location: "Viljandi",
    salary: 4000,
    status: "active",
  },
  {
    name: "Rain Roos",
    email: "rain.roos@example.ee",
    role: "Designer",
    location: "Rakvere",
    salary: 3900,
    status: "inactive",
  },
];

const people: Person[] = Array.from({ length: 28 }, (_, index) => {
  const seed = personSeed[index % personSeed.length];
  const round = Math.floor(index / personSeed.length);
  return {
    ...seed,
    id: String(index + 1),
    name: round === 0 ? seed.name : `${seed.name} ${round + 1}`,
  };
});

const personColumns: TediColumnDef<Person>[] = [
  { id: "name", header: "Name", accessorKey: "name" },
  { id: "email", header: "Email", accessorKey: "email" },
  { id: "role", header: "Role", accessorKey: "role" },
  { id: "location", header: "Location", accessorKey: "location" },
];

interface Booking {
  id: string;
  dateRange: string;
  hour: string;
  duration: string;
  location: string;
}

const bookingDateRange = "22.03.2029 – 29.03.2029";

const bookings: Booking[] = Array.from({ length: 28 }, (_, index) => ({
  id: String(index + 1),
  dateRange: bookingDateRange,
  hour: "11:14",
  duration: "6 min",
  location: "Harjumaa",
}));

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  location: string;
}

const doctorSeed: Omit<Doctor, "id">[] = [
  {
    name: "Kalle Kask",
    specialty: "Dermatovenereoloog",
    experience: "4 a",
    location: "Tallinn",
  },
  {
    name: "Mari Maasikas",
    specialty: "Kopsuarst",
    experience: "4 a",
    location: "Tallinn",
  },
  {
    name: "Vello Vaarikas",
    specialty: "Kõrva-nina-kurguarst",
    experience: "4 a",
    location: "Tallinn",
  },
];

const doctors: Doctor[] = Array.from({ length: 28 }, (_, index) => ({
  ...doctorSeed[index % doctorSeed.length],
  id: String(index + 1),
}));

type CertStatus = "Kehtiv" | "Kehtetu" | "Aegumas" | "Aegunud";
const CERT_STATUSES: CertStatus[] = ["Kehtiv", "Kehtetu", "Aegumas", "Aegunud"];
const certStatusColor: Record<
  CertStatus,
  "success" | "warning" | "danger" | "neutral"
> = {
  Kehtiv: "success",
  Aegumas: "warning",
  Kehtetu: "danger",
  Aegunud: "neutral",
};

interface PersonRecord {
  id: string;
  name: string;
  jobStart: string;
  age: number;
  visits: number;
  status: CertStatus;
}

const filterablePeopleSeed: Omit<PersonRecord, "id">[] = [
  { name: "Mari Maasikas", jobStart: "21.08.2019", age: 25, visits: 6, status: "Kehtiv" },
  { name: "Kalle Kapsapea", jobStart: "14.03.2020", age: 35, visits: 13, status: "Kehtiv" },
  { name: "Mart Mägi", jobStart: "02.01.2018", age: 43, visits: 26, status: "Kehtiv" },
  { name: "Meelis Mets", jobStart: "10.07.2021", age: 64, visits: 26, status: "Kehtetu" },
  { name: "Kadri Kask", jobStart: "30.11.2022", age: 32, visits: 4, status: "Aegumas" },
  { name: "Liis Linn", jobStart: "21.08.2019", age: 21, visits: 13, status: "Aegunud" },
];

const filterablePeople: PersonRecord[] = Array.from({ length: 28 }, (_, index) => {
  const seed = filterablePeopleSeed[index % filterablePeopleSeed.length];
  const round = Math.floor(index / filterablePeopleSeed.length);
  return {
    ...seed,
    id: String(index + 1),
    name: round === 0 ? seed.name : `${seed.name} ${round + 1}`,
  };
});

interface CollapsibleRecord {
  id: string;
  name: string;
  age: number;
  visits: number;
  status: CertStatus;
  subRows?: CollapsibleRecord[];
}

const collapsibleSeed: Omit<CollapsibleRecord, "id" | "subRows">[] = [
  { name: "Mari Maasikas", age: 25, visits: 6, status: "Kehtiv" },
  { name: "Kalle Kapsapea", age: 35, visits: 13, status: "Kehtiv" },
  { name: "Mart Mägi", age: 43, visits: 26, status: "Kehtiv" },
  { name: "Meelis Mets", age: 64, visits: 26, status: "Kehtetu" },
  { name: "Kadri Kask", age: 32, visits: 4, status: "Aegumas" },
  { name: "Liis Linn", age: 21, visits: 13, status: "Aegunud" },
];

const collapsiblePeople: CollapsibleRecord[] = Array.from({ length: 28 }, (_, index) => {
  const seed = collapsibleSeed[index % collapsibleSeed.length];
  const round = Math.floor(index / collapsibleSeed.length);
  const name = round === 0 ? seed.name : `${seed.name} ${round + 1}`;
  const id = String(index + 1);
  const subRows: CollapsibleRecord[] | undefined =
    index % 2 === 0
      ? [
          { id: `${id}-1`, name, age: seed.age, visits: Math.floor(seed.visits / 2), status: "Kehtiv" },
          { id: `${id}-2`, name, age: seed.age, visits: seed.visits - Math.floor(seed.visits / 2), status: "Kehtetu" },
        ]
      : undefined;
  return { ...seed, id, name, ...(subRows ? { subRows } : {}) };
});

interface StickyDoctor extends Doctor {
  personalId: string;
  email: string;
  phone: string;
  room: string;
  nextAvailable: string;
  patientsToday: number;
  rating: string;
}

const stickyDoctorSeed: Omit<StickyDoctor, "id">[] = [
  {
    name: "Kalle Kask",
    personalId: "49504080456",
    specialty: "Dermatovenereoloog",
    experience: "4 a",
    location: "Tallinn",
    email: "kalle.kask@tedi.ee",
    phone: "+372 5123 4567",
    room: "Kabinet 304",
    nextAvailable: "29.03.2029 09:30",
    patientsToday: 12,
    rating: "4.7 / 5",
  },
  {
    name: "Mari Maasikas",
    personalId: "39404080456",
    specialty: "Kopsuarst",
    experience: "4 a",
    location: "Tallinn",
    email: "mari.maasikas@tedi.ee",
    phone: "+372 5234 5678",
    room: "Kabinet 211",
    nextAvailable: "30.03.2029 14:00",
    patientsToday: 9,
    rating: "4.9 / 5",
  },
  {
    name: "Vello Vaarikas",
    personalId: "39403080865",
    specialty: "Kõrva-nina-kurguarst",
    experience: "4 a",
    location: "Tallinn",
    email: "vello.vaarikas@tedi.ee",
    phone: "+372 5345 6789",
    room: "Kabinet 117",
    nextAvailable: "29.03.2029 11:15",
    patientsToday: 14,
    rating: "4.5 / 5",
  },
];

const stickyDoctors: StickyDoctor[] = Array.from({ length: 28 }, (_, index) => ({
  ...stickyDoctorSeed[index % stickyDoctorSeed.length],
  id: String(index + 1),
}));

interface Service {
  id: string;
  service: string;
  doctor: string;
  price: number;
  location: string;
}

const serviceSeed: Omit<Service, "id">[] = [
  { service: "Vaimse tervise nõustamisteenus", doctor: "Pille Paunküla", price: 45.5, location: "Tallinn" },
  { service: "Hematoloogia", doctor: "Kalle Kuusik", price: 89.99, location: "Tallinn" },
  { service: "Ortopeedia", doctor: "Märt Männimets", price: 110, location: "Tallinn" },
  { service: "Dermatoloogia", doctor: "Anna Tamm", price: 75, location: "Tartu" },
  { service: "Kardioloogia", doctor: "Mati Saar", price: 120.5, location: "Pärnu" },
  { service: "Neuroloogia", doctor: "Liis Põld", price: 95.25, location: "Tallinn" },
  { service: "Pediaatria", doctor: "Jaan Lepp", price: 60, location: "Tartu" },
];
const services: Service[] = Array.from({ length: 28 }, (_, index) => ({
  id: String(index + 1),
  ...serviceSeed[index % serviceSeed.length],
}));

type CustomNoteColor = "warning" | "danger" | undefined;
interface CustomDoctor extends Doctor {
  note?: string;
  noteColor?: CustomNoteColor;
}

const customDoctorSeed: Omit<CustomDoctor, "id">[] = [
  {
    name: "Kalle Kask",
    specialty: "Dermatovenereoloog",
    experience: "4 a",
    location: "Tallinn",
    note: "Esineb maksehäireid",
    noteColor: "warning",
  },
  { name: "Mari Maasikas", specialty: "Kopsuarst", experience: "4 a", location: "Tallinn" },
  {
    name: "Vello Vaarikas",
    specialty: "Kõrva-nina-kurguarst",
    experience: "4 a",
    location: "Tallinn",
    note: "Arve tasumata",
    noteColor: "danger",
  },
];

const customDoctors: CustomDoctor[] = Array.from({ length: 28 }, (_, index) => ({
  ...customDoctorSeed[index % customDoctorSeed.length],
  id: String(index + 1),
}));

const priceFormatter = new Intl.NumberFormat("et-EE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");

const LONG_DESCRIPTION =
  "Pellentesque mattis augue at mi tristique dignissim. Aliquam lobortis hendrerit " +
  "augue, sit amet pellentesque nibh ultricies eu. Nullam ut nibh non lectus pulvinar " +
  "volutpat.";

const DEFAULT_PAGINATION = { pageSize: 10, pageSizeOptions: [10, 25, 50] };
const SHOWCASE_PAGINATION_3 = { pageSize: 3, pageSizeOptions: [3, 10, 25, 50] };
const SHOWCASE_PAGINATION_4 = { pageSize: 4, pageSizeOptions: [4, 10, 25, 50] };

const sortIconFor = (sorted: false | "asc" | "desc"): string =>
  sorted === "asc"
    ? "arrow_upward"
    : sorted === "desc"
      ? "arrow_downward"
      : "unfold_more";

// Estonian counties used as options for the editable "Asukoht" (location)
// select cells across editable stories.
const ESTONIAN_COUNTIES: { label: string; value: string }[] = [
  { label: "Harjumaa", value: "Harjumaa" },
  { label: "Hiiumaa", value: "Hiiumaa" },
  { label: "Ida-Virumaa", value: "Ida-Virumaa" },
  { label: "Jõgevamaa", value: "Jõgevamaa" },
  { label: "Järvamaa", value: "Järvamaa" },
  { label: "Läänemaa", value: "Läänemaa" },
  { label: "Lääne-Virumaa", value: "Lääne-Virumaa" },
  { label: "Põlvamaa", value: "Põlvamaa" },
  { label: "Pärnumaa", value: "Pärnumaa" },
  { label: "Raplamaa", value: "Raplamaa" },
  { label: "Saaremaa", value: "Saaremaa" },
  { label: "Tartumaa", value: "Tartumaa" },
  { label: "Valgamaa", value: "Valgamaa" },
  { label: "Viljandimaa", value: "Viljandimaa" },
  { label: "Võrumaa", value: "Võrumaa" },
];

// Shared template fragments for booking + doctor inline-edit cells. Each host
// component includes these in its template string and declares the matching
// `viewChild` template refs to wire them into the columns. The `editor`
// accessor is assumed to be on the host (`createEditableRows<T>(...)`).
function editableTextCellTemplate(
  tplName: string,
  field: string,
  ariaLabel: string,
  icon?: string,
): string {
  const fieldAttr = icon ? ` icon="${icon}"` : "";
  return `
<ng-template #${tplName} let-ctx>
  @if (editor.isEditing(ctx.row.original.id)) {
    <tedi-form-field size="small"${fieldAttr}>
      <input
        tedi-text-field
        type="text"
        [ngModel]="editor.draftValue(ctx.row.original.id, '${field}')"
        (ngModelChange)="editor.setDraftValue(ctx.row.original.id, '${field}', $event)"
        aria-label="${ariaLabel}"
      />
    </tedi-form-field>
  } @else {
    {{ ctx.row.original.${field} }}
  }
</ng-template>`;
}

function editableLocationCellTemplate(tplName = "locationCell"): string {
  return `
<ng-template #${tplName} let-ctx>
  @if (editor.isEditing(ctx.row.original.id)) {
    <tedi-select
      [inputId]="'location-' + ctx.row.original.id"
      size="small"
      [options]="counties"
      bindLabel="label"
      bindValue="value"
      [ngModel]="editor.draftValue(ctx.row.original.id, 'location')"
      (ngModelChange)="editor.setDraftValue(ctx.row.original.id, 'location', $event)"
    />
  } @else {
    {{ ctx.row.original.location }}
  }
</ng-template>`;
}

const EDITABLE_ACTIONS_TEMPLATE = `
<ng-template #editActions let-ctx>
  <span style="display:inline-flex; gap:8px; justify-content:flex-end; align-items:center; width:100%;">
    @if (editor.isEditing(ctx.row.original.id)) {
      <button tedi-closing-button type="button" aria-label="Tühista"
        (click)="editor.cancelEdit()"></button>
      <button tedi-button variant="primary" size="small" type="button"
        (click)="editor.commitEdit()">
        <tedi-icon name="check" [size]="16" color="inherit" />
        Kinnita
      </button>
    } @else {
      <button tedi-button variant="neutral" size="small" type="button"
        (click)="editor.beginEdit(ctx.row.original)">
        <tedi-icon name="edit" [size]="16" color="inherit" />
        Muuda
      </button>
    }
  </span>
</ng-template>`;

const BOOKING_EDIT_TEMPLATES =
  editableTextCellTemplate("dateRangeCell", "dateRange", "Kuupäev") +
  editableTextCellTemplate("hourCell", "hour", "Kellaaeg", "schedule") +
  editableTextCellTemplate("durationCell", "duration", "Kestus") +
  editableLocationCellTemplate("locationCell") +
  EDITABLE_ACTIONS_TEMPLATE;

const EDIT_IMPORTS = [
  TediTableComponent,
  ButtonComponent,
  IconComponent,
  TextFieldComponent,
  ClosingButtonComponent,
  FormFieldComponent,
  SelectComponent,
  FormsModule,
];

// Shared editable-rows controller — mirrors the React `useEditableRows` hook.
// Each host that wants per-row inline editing calls this once with its initial
// rows; the returned object exposes signals + handlers that templates wire up
// via `editor.isEditing(...)`, `editor.beginEdit(...)`, etc.
function createEditableRows<T extends { id: string }>(initial: T[]) {
  const rows = signal<T[]>(initial);
  const editingId = signal<string | null>(null);
  const draft = signal<T | null>(null);

  return {
    rows,
    editingId,
    draft,
    isEditing: (id: string) => editingId() === id,
    draftValue: (id: string, field: keyof T): string => {
      const d = draft();
      if (!d || d.id !== id) return "";
      return String(d[field] ?? "");
    },
    setDraftValue: (id: string, field: keyof T, value: string): void => {
      draft.update((prev) =>
        prev && prev.id === id ? { ...prev, [field]: value } : prev,
      );
    },
    beginEdit: (row: T): void => {
      editingId.set(row.id);
      draft.set({ ...row });
    },
    cancelEdit: (): void => {
      editingId.set(null);
      draft.set(null);
    },
    commitEdit: (): void => {
      const current = draft();
      if (!current) return;
      rows.update((existing) =>
        existing.map((row) => (row.id === current.id ? current : row)),
      );
      editingId.set(null);
      draft.set(null);
    },
  };
}

type TediTableStoryArgs = {
  size: "medium" | "small";
  striped: boolean;
  verticalBorders: boolean;
  borderless: boolean;
  stickyFirstColumn: boolean;
  stickyHeader: boolean;
  rowHover: boolean;
  interactive: boolean;
  enableRowSelection: boolean;
  enableColumnFilters: boolean;
  maxHeight: number | undefined;
  activeRowId: string | undefined;
  placeholderRole: "alert" | "status" | undefined;
};

/**
 * <a href="https://tanstack.com/table/latest/docs/framework/angular/angular-table" target="_BLANK">@tanstack/angular-table ↗</a><br/>
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.45.70?node-id=11335-186161&m=dev" target="_BLANK">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/557b9f-table" target="_BLANK">Zeroheight ↗</a>
 *
 * Headless data table built on `@tanstack/angular-table`. Supports sorting,
 * filtering, expansion, selection, pagination, sticky chrome and body row
 * spanning. Cells render via per-column `cell` accessor (string or
 * `TemplateRef`).
 */
const meta: Meta<TediTableStoryArgs> = {
  title: "TEDI-Ready/Content/Table",
  component: TediTableComponent,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.45.70?node-id=11335-186161&m=dev",
    },
  },
  args: {
    size: "medium",
    striped: false,
    verticalBorders: false,
    borderless: false,
    stickyFirstColumn: false,
    stickyHeader: false,
    rowHover: false,
    interactive: false,
    enableRowSelection: false,
    enableColumnFilters: false,
    maxHeight: undefined,
    activeRowId: undefined,
    placeholderRole: undefined,
  },
  argTypes: {
    // Visual / layout
    size: {
      description: "Visual size. `medium` = 49px rows, `small` = 41px rows.",
      control: { type: "inline-radio" },
      options: ["medium", "small"],
      table: {
        category: "appearance",
        type: { summary: "TableSize" },
        defaultValue: { summary: "medium" },
      },
    },
    striped: {
      description: "Alternating row backgrounds.",
      control: "boolean",
      table: {
        category: "appearance",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    verticalBorders: {
      description: "Vertical separators between columns.",
      control: "boolean",
      table: {
        category: "appearance",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    borderless: {
      description: "Remove the outer border + radius.",
      control: "boolean",
      table: {
        category: "appearance",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    stickyFirstColumn: {
      description: "Freeze the first column during horizontal scroll.",
      control: "boolean",
      table: {
        category: "appearance",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    stickyHeader: {
      description: "Pin `<thead>` during vertical scroll. Requires `maxHeight`.",
      control: "boolean",
      table: {
        category: "appearance",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    rowHover: {
      description:
        "Paint a hover background on data rows. Auto-on when `interactive` is set.",
      control: "boolean",
      table: {
        category: "appearance",
        type: { summary: "boolean | undefined" },
        defaultValue: { summary: "false" },
      },
    },
    maxHeight: {
      description:
        "Constrains the height of the scroll container. Pair with `stickyHeader`.",
      control: "number",
      table: {
        category: "appearance",
        type: { summary: "number | string" },
      },
    },
    // Behavior
    interactive: {
      description:
        "Adds `role=button`, tabindex, and Enter/Space activation to rows. Subscribe to `rowClick`.",
      control: "boolean",
      table: {
        category: "behavior",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    enableRowSelection: {
      description:
        "Adds a checkbox column. Pass `true` or a predicate `(row) => boolean`.",
      control: "boolean",
      table: {
        category: "behavior",
        type: { summary: "boolean | ((row) => boolean)" },
        defaultValue: { summary: "false" },
      },
    },
    enableColumnFilters: {
      description: "Render the per-column filter row below the header.",
      control: "boolean",
      table: {
        category: "behavior",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    activeRowId: {
      description: "Highlight the row whose id matches as the active row.",
      control: "text",
      table: { category: "behavior", type: { summary: "string" } },
    },
    placeholderRole: {
      description:
        "ARIA live region role around the empty-state placeholder ('status' for polite, 'alert' for assertive).",
      control: { type: "inline-radio" },
      options: [undefined, "status", "alert"],
      table: {
        category: "behavior",
        type: { summary: "'alert' | 'status'" },
      },
    },
    // Inputs not driven by Storybook controls (data, columns, etc.) — documented for completeness.
  },
};

export default meta;

type Story = StoryObj<TediTableStoryArgs>;

// Each story registers a dedicated host component (Angular generics in
// templates require a typed host). Stories return a template that references
// the host via `moduleMetadata` + selector.

// ---------- Default ----------
@Component({
  standalone: true,
  selector: "tedi-default-story",
  imports: [TediTableComponent, ButtonComponent, IconComponent],
  template: `
    <tedi-table
      id="tedi-table-default"
      [data]="data"
      [columns]="columns()"
      [pagination]="pagination"
      [size]="size()"
      [striped]="striped()"
      [verticalBorders]="verticalBorders()"
      [borderless]="borderless()"
      [stickyFirstColumn]="stickyFirstColumn()"
      [stickyHeader]="stickyHeader()"
      [rowHover]="rowHover()"
      [interactive]="interactive()"
      [enableRowSelection]="enableRowSelection()"
      [enableColumnFilters]="enableColumnFilters()"
      [maxHeight]="maxHeight()"
      [activeRowId]="activeRowId()"
      [placeholderRole]="placeholderRole()"
    />
    <ng-template #actions>
      <span style="display:inline-flex; gap:8px; justify-content:flex-end; width:100%;">
        <button tedi-button variant="neutral" size="small" type="button">
          <tedi-icon name="edit" [size]="16" color="inherit" />
          Muuda
        </button>
      </span>
    </ng-template>
  `,
})
class DefaultStoryHostComponent {
  data = bookings;
  pagination = SHOWCASE_PAGINATION_3;
  actionsTpl = viewChild<TemplateRef<CellContext<Booking, unknown>>>("actions");

  columns = computed<TediColumnDef<Booking>[]>(() => [
    { id: "dateRange", header: "Kuupäev", accessorKey: "dateRange" },
    { id: "hour", header: "Kellaaeg", accessorKey: "hour" },
    { id: "duration", header: "Kestus", accessorKey: "duration" },
    { id: "location", header: "Asukoht", accessorKey: "location" },
    {
      id: "actions",
      header: "",
      size: 1,
      cell: this.actionsTpl() ?? "",
    } as TediColumnDef<Booking>,
  ]);

  readonly size = input<"medium" | "small">("medium");
  readonly striped = input(false, { transform: booleanAttribute });
  readonly verticalBorders = input(false, { transform: booleanAttribute });
  readonly borderless = input(false, { transform: booleanAttribute });
  readonly stickyFirstColumn = input(false, { transform: booleanAttribute });
  readonly stickyHeader = input(false, { transform: booleanAttribute });
  readonly rowHover = input(false, { transform: booleanAttribute });
  readonly interactive = input(false, { transform: booleanAttribute });
  readonly enableRowSelection = input(false, { transform: booleanAttribute });
  readonly enableColumnFilters = input(false, { transform: booleanAttribute });
  readonly maxHeight = input<number | undefined>(undefined);
  readonly activeRowId = input<string | undefined>(undefined);
  readonly placeholderRole = input<"alert" | "status" | undefined>(undefined);
}

export const Default: Story = {
  render: (args) => ({
    moduleMetadata: { imports: [DefaultStoryHostComponent] },
    props: args,
    template: `<tedi-default-story ${argsToTemplate(args)} />`,
  }),
};

// ---------- Sizes ----------
@Component({
  standalone: true,
  selector: "tedi-sizes-story",
  imports: [TediTableComponent],
  template: `
    <div style="display:flex; flex-direction:column; gap:24px;">
      <h3 style="margin:0;">Default</h3>
      <tedi-table
        id="tedi-table-sizes-default"
        [data]="data"
        [columns]="columns"
        [pagination]="pagination"
      />
      <h3 style="margin:0;">Small</h3>
      <tedi-table
        id="tedi-table-sizes-small"
        size="small"
        [data]="data"
        [columns]="columns"
        [pagination]="pagination"
      />
    </div>
  `,
})
class SizesStoryHostComponent {
  data = bookings;
  pagination = SHOWCASE_PAGINATION_3;
  columns: TediColumnDef<Booking>[] = [
    { id: "dateRange", header: "Kuupäev", accessorKey: "dateRange" },
    { id: "hour", header: "Kellaaeg", accessorKey: "hour" },
    { id: "duration", header: "Kestus", accessorKey: "duration" },
    { id: "location", header: "Asukoht", accessorKey: "location" },
  ];
}

export const Sizes: Story = {
  render: () => ({
    moduleMetadata: { imports: [SizesStoryHostComponent] },
    template: `<tedi-sizes-story />`,
  }),
};

// ---------- Simple ----------
@Component({
  standalone: true,
  selector: "tedi-simple-story",
  imports: [TediTableComponent, StatusBadgeComponent, LinkComponent],
  template: `
    <div style="display:flex; flex-direction:column; gap:24px;">
      <tedi-table
        id="tedi-table-simple-bookings"
        [data]="bookings"
        [columns]="bookingColumns"
        [pagination]="paginationBooking"
      />
      <tedi-table
        id="tedi-table-simple-people"
        [data]="people"
        [columns]="peopleColumns()"
        [pagination]="paginationPeople"
      />
      <tedi-table
        id="tedi-table-simple-doctors"
        [data]="doctors"
        [columns]="doctorColumns()"
        [pagination]="paginationBooking"
      />
    </div>

    <ng-template #personName let-ctx>
      <a tedi-link href="#" (click)="$event.preventDefault()">{{ ctx.row.original.name }}</a>
    </ng-template>
    <ng-template #personStatus let-ctx>
      <tedi-status-badge
        [color]="statusColor[ctx.row.original.status]"
        [text]="ctx.row.original.status"
      />
    </ng-template>
    <ng-template #doctorName let-ctx>
      <div>
        <div>{{ ctx.row.original.name }}</div>
        <div style="color: var(--general-text-secondary);">
          {{ ctx.row.original.specialty }}
        </div>
      </div>
    </ng-template>
  `,
})
class SimpleStoryHostComponent {
  bookings = bookings;
  people = filterablePeople;
  doctors = doctors;
  paginationBooking = SHOWCASE_PAGINATION_3;
  paginationPeople = SHOWCASE_PAGINATION_4;
  statusColor = certStatusColor;

  personNameTpl =
    viewChild<TemplateRef<CellContext<PersonRecord, unknown>>>("personName");
  personStatusTpl =
    viewChild<TemplateRef<CellContext<PersonRecord, unknown>>>("personStatus");
  doctorNameTpl =
    viewChild<TemplateRef<CellContext<Doctor, unknown>>>("doctorName");

  bookingColumns: TediColumnDef<Booking>[] = [
    { id: "dateRange", header: "Kuupäev", accessorKey: "dateRange" },
    { id: "hour", header: "Kellaaeg", accessorKey: "hour" },
    { id: "duration", header: "Kestus", accessorKey: "duration" },
    { id: "location", header: "Asukoht", accessorKey: "location" },
  ];

  peopleColumns = computed<TediColumnDef<PersonRecord>[]>(() => [
    {
      id: "name",
      header: "Isik",
      accessorKey: "name",
      cell: this.personNameTpl() ?? "",
    } as TediColumnDef<PersonRecord>,
    { id: "age", header: "Vanus", accessorKey: "age" },
    { id: "visits", header: "Külastuste arv", accessorKey: "visits" },
    {
      id: "status",
      header: "Tõendi staatus",
      accessorKey: "status",
      cell: this.personStatusTpl() ?? "",
    } as TediColumnDef<PersonRecord>,
  ]);

  doctorColumns = computed<TediColumnDef<Doctor>[]>(() => [
    {
      id: "name",
      header: "Arst",
      cell: this.doctorNameTpl() ?? "",
    } as TediColumnDef<Doctor>,
    { id: "experience", header: "Tööstaaž", accessorKey: "experience" },
    { id: "location", header: "Asukoht", accessorKey: "location" },
  ]);
}

export const Simple: Story = {
  render: () => ({
    moduleMetadata: { imports: [SimpleStoryHostComponent] },
    template: `<tedi-simple-story />`,
  }),
};

// ---------- MergedCells (grouped headers + sort) ----------
@Component({
  standalone: true,
  selector: "tedi-merged-cells-story",
  imports: [TediTableComponent, TediTableHeaderButtonComponent],
  template: `
    <tedi-table
      id="tedi-table-merged"
      verticalBorders
      [data]="data"
      [columns]="columns()"
      [pagination]="pagination"
    />
    <ng-template #dateHeader let-ctx>
      <span style="display:inline-flex; align-items:center; gap:4px;">
        Kuupäev
        <button
          tedi-table-header-button
          [icon]="iconFor(ctx.column.getIsSorted())"
          [selected]="!!ctx.column.getIsSorted()"
          (click)="ctx.column.toggleSorting()"
          [aria-label]="'Sort by Kuupäev'"
        ></button>
      </span>
    </ng-template>
  `,
})
class MergedCellsStoryHostComponent {
  data = bookings;
  pagination = DEFAULT_PAGINATION;
  iconFor = sortIconFor;

  dateHeaderTpl = viewChild<TemplateRef<unknown>>("dateHeader");

  columns = computed<TediColumnDef<Booking>[]>(() => [
    {
      id: "dateRange",
      accessorKey: "dateRange",
      size: 240,
      header: this.dateHeaderTpl() ?? "Kuupäev",
    } as TediColumnDef<Booking>,
    {
      id: "aeg",
      header: "Aeg",
      columns: [
        { id: "hour", header: "Kellaaeg", accessorKey: "hour" },
        { id: "duration", header: "Kestus", accessorKey: "duration" },
      ],
    } as TediColumnDef<Booking>,
    { id: "location", header: "Asukoht", accessorKey: "location" },
  ]);
}

export const MergedCells: Story = {
  render: () => ({
    moduleMetadata: { imports: [MergedCellsStoryHostComponent] },
    template: `<tedi-merged-cells-story />`,
  }),
};

// ---------- GroupedRows (body row spanning — Angular-only feature) ----------
interface PatientRow {
  id: string;
  date: string;
  doctor: string;
  procedure: string;
}
const patientRows: PatientRow[] = [
  { id: "1", date: "2026-05-20", doctor: "Dr Tamm", procedure: "Consultation" },
  { id: "2", date: "2026-05-20", doctor: "Dr Tamm", procedure: "Follow-up" },
  { id: "3", date: "2026-05-21", doctor: "Dr Kask", procedure: "X-ray" },
  { id: "4", date: "2026-05-21", doctor: "Dr Kask", procedure: "Consultation" },
];

@Component({
  standalone: true,
  selector: "tedi-grouped-rows-story",
  imports: [TediTableComponent],
  template: `<tedi-table [data]="data" [columns]="columns" verticalBorders />`,
})
class GroupedRowsStoryHostComponent {
  data = patientRows;
  columns: TediColumnDef<PatientRow>[] = [
    {
      id: "date",
      header: "Date",
      accessorKey: "date",
      rowSpan: groupRowSpan(
        patientRows.map(
          (_, i) =>
            ({ id: String(i), original: patientRows[i] }) as unknown as Row<PatientRow>,
        ),
        (row) => row.original.date,
      ),
    },
    { id: "doctor", header: "Doctor", accessorKey: "doctor" },
    { id: "procedure", header: "Procedure", accessorKey: "procedure" },
  ];
}

export const GroupedRows: Story = {
  render: () => ({
    moduleMetadata: { imports: [GroupedRowsStoryHostComponent] },
    template: `<tedi-grouped-rows-story />`,
  }),
};

// ---------- VerticalBorders (services with sort + info tooltips) ----------
@Component({
  standalone: true,
  selector: "tedi-vertical-borders-story",
  imports: [
    TediTableComponent,
    TediTableHeaderButtonComponent,
    InfoButtonComponent,
    TooltipComponent,
    TooltipTriggerComponent,
    TooltipContentComponent,
  ],
  template: `
    <tedi-table
      id="tedi-table-vb"
      verticalBorders
      [data]="data"
      [columns]="columns()"
      [pagination]="pagination"
    />
    <ng-template #serviceHeader let-ctx>
      <span style="display:inline-flex; align-items:center; gap:4px;">
        Teenus
        <button
          tedi-table-header-button
          [icon]="iconFor(ctx.column.getIsSorted())"
          [selected]="!!ctx.column.getIsSorted()"
          (click)="ctx.column.toggleSorting()"
          [aria-label]="'Sorteeri Teenus järgi'"
        ></button>
      </span>
    </ng-template>
    <ng-template #doctorHeader>
      <span style="display:inline-flex; align-items:center; gap:4px;">
        Arst
        <tedi-tooltip>
          <tedi-tooltip-trigger>
            <button tedi-info-button aria-label="Arst info"></button>
          </tedi-tooltip-trigger>
          <tedi-tooltip-content>
            Vastutav raviarst, kes teostab teenuse.
          </tedi-tooltip-content>
        </tedi-tooltip>
      </span>
    </ng-template>
    <ng-template #priceCell let-ctx>
      {{ format(ctx.row.original.price) }} €/h
    </ng-template>
    <ng-template #locationHeader>
      <span style="display:inline-flex; align-items:center; gap:4px;">
        Asukoht
        <tedi-tooltip>
          <tedi-tooltip-trigger>
            <button tedi-info-button aria-label="Asukoht info"></button>
          </tedi-tooltip-trigger>
          <tedi-tooltip-content>Vastuvõtu toimumiskoht.</tedi-tooltip-content>
        </tedi-tooltip>
      </span>
    </ng-template>
  `,
})
class VerticalBordersStoryHostComponent {
  data = services;
  pagination = DEFAULT_PAGINATION;
  iconFor = sortIconFor;
  format = (price: number) => priceFormatter.format(price);

  serviceHeaderTpl = viewChild<TemplateRef<unknown>>("serviceHeader");
  doctorHeaderTpl = viewChild<TemplateRef<unknown>>("doctorHeader");
  priceCellTpl =
    viewChild<TemplateRef<CellContext<Service, unknown>>>("priceCell");
  locationHeaderTpl = viewChild<TemplateRef<unknown>>("locationHeader");

  columns = computed<TediColumnDef<Service>[]>(() => [
    {
      id: "service",
      accessorKey: "service",
      header: this.serviceHeaderTpl() ?? "Teenus",
    } as TediColumnDef<Service>,
    {
      id: "doctor",
      accessorKey: "doctor",
      header: this.doctorHeaderTpl() ?? "Arst",
    } as TediColumnDef<Service>,
    {
      id: "price",
      accessorKey: "price",
      header: "Maksumus",
      meta: { align: "right" },
      cell: this.priceCellTpl() ?? "",
    } as TediColumnDef<Service>,
    {
      id: "location",
      accessorKey: "location",
      header: this.locationHeaderTpl() ?? "Asukoht",
    } as TediColumnDef<Service>,
  ]);
}

export const VerticalBorders: Story = {
  render: () => ({
    moduleMetadata: { imports: [VerticalBordersStoryHostComponent] },
    template: `<tedi-vertical-borders-story />`,
  }),
};

// ---------- NoOutsideBorder ----------
@Component({
  standalone: true,
  selector: "tedi-no-outside-border-story",
  imports: [TediTableComponent],
  template: `
    <tedi-table
      id="tedi-table-borderless"
      [data]="data"
      [columns]="columns"
      borderless
      [pagination]="pagination"
    />
  `,
})
class NoOutsideBorderStoryHostComponent {
  data = people;
  columns = personColumns;
  pagination = DEFAULT_PAGINATION;
}

export const NoOutsideBorder: Story = {
  render: () => ({
    moduleMetadata: { imports: [NoOutsideBorderStoryHostComponent] },
    template: `<tedi-no-outside-border-story />`,
  }),
};

// ---------- EditableValues ----------
@Component({
  standalone: true,
  selector: "tedi-editable-values-story",
  imports: EDIT_IMPORTS,
  template: `
    <tedi-table
      id="tedi-table-editable"
      [data]="editor.rows()"
      [columns]="columns()"
      [pagination]="pagination"
    />
    ${BOOKING_EDIT_TEMPLATES}
  `,
})
class EditableValuesStoryHostComponent {
  protected readonly counties = ESTONIAN_COUNTIES;
  protected readonly editor = createEditableRows<Booking>(bookings);
  pagination = DEFAULT_PAGINATION;

  dateRangeCellTpl =
    viewChild<TemplateRef<CellContext<Booking, unknown>>>("dateRangeCell");
  hourCellTpl =
    viewChild<TemplateRef<CellContext<Booking, unknown>>>("hourCell");
  durationCellTpl =
    viewChild<TemplateRef<CellContext<Booking, unknown>>>("durationCell");
  locationCellTpl =
    viewChild<TemplateRef<CellContext<Booking, unknown>>>("locationCell");
  editActionsTpl =
    viewChild<TemplateRef<CellContext<Booking, unknown>>>("editActions");

  columns = computed<TediColumnDef<Booking>[]>(() => [
    {
      id: "dateRange",
      header: "Kuupäev",
      accessorKey: "dateRange",
      cell: this.dateRangeCellTpl() ?? "",
    } as TediColumnDef<Booking>,
    {
      id: "hour",
      header: "Kellaaeg",
      accessorKey: "hour",
      cell: this.hourCellTpl() ?? "",
    } as TediColumnDef<Booking>,
    {
      id: "duration",
      header: "Kestus",
      accessorKey: "duration",
      cell: this.durationCellTpl() ?? "",
    } as TediColumnDef<Booking>,
    {
      id: "location",
      header: "Asukoht",
      accessorKey: "location",
      cell: this.locationCellTpl() ?? "",
    } as TediColumnDef<Booking>,
    {
      id: "actions",
      header: "",
      size: 1,
      cell: this.editActionsTpl() ?? "",
    } as TediColumnDef<Booking>,
  ]);
}

export const EditableValues: Story = {
  render: () => ({
    moduleMetadata: { imports: [EditableValuesStoryHostComponent] },
    template: `<tedi-editable-values-story />`,
  }),
};

// ---------- Sortable ----------
@Component({
  standalone: true,
  selector: "tedi-sortable-story",
  imports: [TediTableComponent, TediTableHeaderButtonComponent],
  template: `
    <div style="
      color: var(--general-text-secondary);
      margin-bottom: 16px;
      font-size: var(--body-small-regular-size);
    ">
      <p style="margin: 0 0 8px;">
        Each column opts into sorting via the header template binding
        <code>ctx.column.toggleSorting()</code>. Use <code>column.getIsSorted()</code>
        to drive the icon and <code>aria-sort</code> state.
      </p>
      <p style="margin: 0 0 8px;">
        Customise comparison per column with <code>sortingFn</code> on
        <code>TediColumnDef</code>:
      </p>
      <ul style="margin: 0 0 8px; padding-left: 20px;">
        <li>
          built-in: <code>'alphanumeric'</code>,
          <code>'alphanumericCaseSensitive'</code>, <code>'text'</code>,
          <code>'textCaseSensitive'</code>, <code>'datetime'</code>,
          <code>'basic'</code>, <code>'auto'</code> (default)
        </li>
        <li>
          custom: <code>(rowA, rowB, columnId) =&gt; number</code> — return
          &lt;0, 0, or &gt;0 just like <code>Array.sort</code>. The table
          flips the sign on descending sort, so always write the comparator
          for ascending order.
        </li>
      </ul>
      <p style="margin: 0;">
        Examples below:
        <strong>Name</strong> uses locale-aware compare,
        <strong>Salary</strong> sorts numerically (built-in
        <code>'alphanumeric'</code>),
        the rest use the inferred default.
      </p>
    </div>

    <tedi-table
      id="tedi-table-sortable"
      [data]="data"
      [columns]="columns()"
      [pagination]="pagination"
    />
    <ng-template #sortHeader let-ctx>
      <span style="display:inline-flex; align-items:center; gap:4px;">
        {{ ctx.column.columnDef.meta?.label }}
        <button
          tedi-table-header-button
          [icon]="iconFor(ctx.column.getIsSorted())"
          [selected]="!!ctx.column.getIsSorted()"
          (click)="ctx.column.toggleSorting()"
          [aria-label]="'Sort by ' + ctx.column.columnDef.meta?.label"
        ></button>
      </span>
    </ng-template>
  `,
})
class SortableStoryHostComponent {
  data = people;
  pagination = DEFAULT_PAGINATION;
  iconFor = sortIconFor;
  sortHeaderTpl = viewChild<TemplateRef<unknown>>("sortHeader");

  // Custom sortingFn: locale-aware string comparison for Estonian characters
  // (ä, ö, õ, ü etc.). Default `auto` would still work for ASCII names but
  // gets the order wrong for accented characters in some locales.
  private readonly nameLocaleCompare = (
    rowA: Row<Person>,
    rowB: Row<Person>,
    columnId: string,
  ) => {
    const a = rowA.getValue<string>(columnId);
    const b = rowB.getValue<string>(columnId);
    return a.localeCompare(b, "et", { sensitivity: "base" });
  };

  columns = computed<TediColumnDef<Person>[]>(() => {
    const header = this.sortHeaderTpl() ?? "";
    return [
      {
        id: "name",
        header,
        accessorKey: "name",
        meta: { label: "Name" },
        sortingFn: this.nameLocaleCompare,
      } as TediColumnDef<Person>,
      {
        id: "role",
        header,
        accessorKey: "role",
        meta: { label: "Role" },
      } as TediColumnDef<Person>,
      {
        id: "location",
        header,
        accessorKey: "location",
        meta: { label: "Location" },
      } as TediColumnDef<Person>,
      {
        id: "salary",
        header,
        accessorKey: "salary",
        meta: { label: "Salary" },
        sortingFn: "alphanumeric",
      } as TediColumnDef<Person>,
    ];
  });
}

export const Sortable: Story = {
  render: () => ({
    moduleMetadata: { imports: [SortableStoryHostComponent] },
    template: `<tedi-sortable-story />`,
  }),
};

// ---------- Filters (popover-driven per-column filters) ----------
@Component({
  standalone: true,
  selector: "tedi-filters-story",
  imports: [
    TediTableComponent,
    TediTableHeaderButtonComponent,
    StatusBadgeComponent,
    TextFieldComponent,
    FormFieldComponent,
    CheckboxComponent,
    ButtonComponent,
    PopoverComponent,
    PopoverContentComponent,
    PopoverTriggerDirective,
  ],
  template: `
    <tedi-table
      id="tedi-table-filters"
      [data]="data"
      [columns]="columns()"
      [pagination]="pagination"
      [maxHeight]="480"
    />

    <ng-template #nameHeader let-ctx>
      <span style="display:inline-flex; align-items:center; gap:4px;">
        Nimi
        <button
          tedi-table-header-button
          [icon]="iconFor(ctx.column.getIsSorted())"
          [selected]="!!ctx.column.getIsSorted()"
          (click)="ctx.column.toggleSorting()"
          [aria-label]="'Sorteeri Nimi'"
        ></button>
        <tedi-popover
          position="bottom-end"
          [preventOverflow]="true"
          style="display:inline-flex;"
        >
          <button
            tedi-popover-trigger
            tedi-table-header-button
            icon="filter_alt"
            [selected]="!!ctx.column.getFilterValue()"
            [filled]="!!ctx.column.getFilterValue()"
            [aria-label]="'Filtreeri Nimi'"
          ></button>
          <tedi-popover-content>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <tedi-form-field size="small">
                <input
                  tedi-text-field
                  type="text"
                  [value]="textDraft()"
                  (input)="textDraft.set($any($event.target).value)"
                  aria-label="Nimi"
                />
              </tedi-form-field>
              <div style="display:flex; gap:8px; justify-content:flex-end;">
                <button
                  tedi-button
                  variant="secondary"
                  size="small"
                  type="button"
                  (click)="textDraft.set(''); ctx.column.setFilterValue(undefined)"
                >Tühista</button>
                <button
                  tedi-button
                  variant="primary"
                  size="small"
                  type="button"
                  (click)="ctx.column.setFilterValue(textDraft() || undefined)"
                >Filtreeri</button>
              </div>
            </div>
          </tedi-popover-content>
        </tedi-popover>
      </span>
    </ng-template>

    <ng-template #plainSort let-ctx>
      <span style="display:inline-flex; align-items:center; gap:4px;">
        {{ ctx.column.columnDef.meta?.label }}
        <button
          tedi-table-header-button
          [icon]="iconFor(ctx.column.getIsSorted())"
          [selected]="!!ctx.column.getIsSorted()"
          (click)="ctx.column.toggleSorting()"
          [aria-label]="'Sorteeri ' + ctx.column.columnDef.meta?.label"
        ></button>
      </span>
    </ng-template>

    <ng-template #statusHeader let-ctx>
      <span style="display:inline-flex; align-items:center; gap:4px;">
        Tõendi staatus
        <button
          tedi-table-header-button
          [icon]="iconFor(ctx.column.getIsSorted())"
          [selected]="!!ctx.column.getIsSorted()"
          (click)="ctx.column.toggleSorting()"
          [aria-label]="'Sorteeri Tõendi staatus'"
        ></button>
        <tedi-popover
          position="bottom-end"
          [preventOverflow]="true"
          style="display:inline-flex;"
        >
          <button
            tedi-popover-trigger
            tedi-table-header-button
            icon="filter_alt"
            [selected]="(ctx.column.getFilterValue()?.length ?? 0) > 0"
            [filled]="(ctx.column.getFilterValue()?.length ?? 0) > 0"
            [aria-label]="'Filtreeri Tõendi staatus'"
          ></button>
          <tedi-popover-content>
            <div style="display:flex; flex-direction:column; gap:8px;">
              @for (option of certStatuses; track option) {
                <label style="display:inline-flex; gap:8px; align-items:center;">
                  <input
                    tedi-checkbox
                    type="checkbox"
                    [value]="option"
                    [checked]="statusDraft().includes(option)"
                    (change)="toggleStatus(option, $any($event.target).checked)"
                  />
                  {{ option }}
                </label>
              }
              <div style="display:flex; gap:8px; justify-content:flex-end;">
                <button
                  tedi-button
                  variant="secondary"
                  size="small"
                  type="button"
                  (click)="statusDraft.set([]); ctx.column.setFilterValue(undefined)"
                >Tühista</button>
                <button
                  tedi-button
                  variant="primary"
                  size="small"
                  type="button"
                  (click)="ctx.column.setFilterValue(statusDraft().length ? statusDraft() : undefined)"
                >Filtreeri</button>
              </div>
            </div>
          </tedi-popover-content>
        </tedi-popover>
      </span>
    </ng-template>

    <ng-template #statusCell let-ctx>
      <tedi-status-badge
        [color]="statusColor[ctx.row.original.status]"
        [text]="ctx.row.original.status"
      />
    </ng-template>
  `,
})
class FiltersStoryHostComponent {
  data = filterablePeople;
  pagination = DEFAULT_PAGINATION;
  iconFor = sortIconFor;
  certStatuses = CERT_STATUSES;
  statusColor = certStatusColor;

  textDraft = signal("");
  statusDraft = signal<CertStatus[]>([]);

  nameHeaderTpl = viewChild<TemplateRef<unknown>>("nameHeader");
  plainSortTpl = viewChild<TemplateRef<unknown>>("plainSort");
  statusHeaderTpl = viewChild<TemplateRef<unknown>>("statusHeader");
  statusCellTpl =
    viewChild<TemplateRef<CellContext<PersonRecord, unknown>>>("statusCell");

  toggleStatus(status: CertStatus, checked: boolean) {
    this.statusDraft.update((prev) =>
      checked ? [...prev, status] : prev.filter((v) => v !== status),
    );
  }

  columns = computed<TediColumnDef<PersonRecord>[]>(() => [
    {
      id: "name",
      accessorKey: "name",
      filterFn: "includesString",
      header: this.nameHeaderTpl() ?? "Nimi",
    } as TediColumnDef<PersonRecord>,
    {
      id: "jobStart",
      accessorKey: "jobStart",
      header: this.plainSortTpl() ?? "Töö algus",
      meta: { label: "Töö algus" },
    } as TediColumnDef<PersonRecord>,
    {
      id: "age",
      accessorKey: "age",
      header: this.plainSortTpl() ?? "Vanus",
      meta: { label: "Vanus" },
    } as TediColumnDef<PersonRecord>,
    {
      id: "visits",
      accessorKey: "visits",
      header: this.plainSortTpl() ?? "Külastuste arv",
      meta: { label: "Külastuste arv" },
    } as TediColumnDef<PersonRecord>,
    {
      id: "status",
      accessorKey: "status",
      header: this.statusHeaderTpl() ?? "Tõendi staatus",
      cell: this.statusCellTpl() ?? "",
      filterFn: ((row: Row<PersonRecord>, id: string, value: CertStatus[]) =>
        !value?.length ||
        value.includes(row.getValue(id) as CertStatus)) as unknown as string,
    } as TediColumnDef<PersonRecord>,
  ]);
}

export const Filters: Story = {
  render: () => ({
    moduleMetadata: { imports: [FiltersStoryHostComponent] },
    template: `<tedi-filters-story />`,
  }),
};

// ---------- CollapsibleRows (nested sub-rows) ----------
@Component({
  standalone: true,
  selector: "tedi-collapsible-rows-story",
  imports: [TediTableComponent, StatusBadgeComponent],
  template: `
    <tedi-table
      id="tedi-table-collapse"
      [data]="data"
      [columns]="columns()"
      [getSubRows]="getSubRows"
      [pagination]="pagination"
    />
    <ng-template #statusCell let-ctx>
      <tedi-status-badge
        [color]="statusColor[ctx.row.original.status]"
        [text]="ctx.row.original.status"
      />
    </ng-template>
  `,
})
class CollapsibleRowsStoryHostComponent {
  data = collapsiblePeople;
  pagination = DEFAULT_PAGINATION;
  statusColor = certStatusColor;
  getSubRows = (row: CollapsibleRecord) => row.subRows;
  statusCellTpl =
    viewChild<TemplateRef<CellContext<CollapsibleRecord, unknown>>>("statusCell");

  columns = computed<TediColumnDef<CollapsibleRecord>[]>(() => [
    { id: "name", header: "Isik", accessorKey: "name" },
    { id: "age", header: "Vanus", accessorKey: "age" },
    { id: "visits", header: "Külastuste arv", accessorKey: "visits" },
    {
      id: "status",
      header: "Tõendi staatus",
      accessorKey: "status",
      cell: this.statusCellTpl() ?? "",
    } as TediColumnDef<CollapsibleRecord>,
  ]);
}

export const CollapsibleRows: Story = {
  render: () => ({
    moduleMetadata: { imports: [CollapsibleRowsStoryHostComponent] },
    template: `<tedi-collapsible-rows-story />`,
  }),
};

// ---------- SelectableRows ----------
@Component({
  standalone: true,
  selector: "tedi-selectable-rows-story",
  imports: [TediTableComponent, StatusBadgeComponent, LinkComponent],
  template: `
    <tedi-table
      id="tedi-table-selectable"
      [data]="data"
      [columns]="columns()"
      [enableRowSelection]="true"
      [pagination]="pagination"
    />
    <ng-template #personName let-ctx>
      <a tedi-link href="#" (click)="$event.preventDefault()">{{ ctx.row.original.name }}</a>
    </ng-template>
    <ng-template #personStatus let-ctx>
      <tedi-status-badge
        [color]="statusColor[ctx.row.original.status]"
        [text]="ctx.row.original.status"
      />
    </ng-template>
  `,
})
class SelectableRowsStoryHostComponent {
  data = filterablePeople;
  pagination = DEFAULT_PAGINATION;
  statusColor = certStatusColor;

  personNameTpl =
    viewChild<TemplateRef<CellContext<PersonRecord, unknown>>>("personName");
  personStatusTpl =
    viewChild<TemplateRef<CellContext<PersonRecord, unknown>>>("personStatus");

  columns = computed<TediColumnDef<PersonRecord>[]>(() => [
    {
      id: "name",
      header: "Isik",
      accessorKey: "name",
      cell: this.personNameTpl() ?? "",
    } as TediColumnDef<PersonRecord>,
    { id: "age", header: "Vanus", accessorKey: "age" },
    { id: "visits", header: "Külastuste arv", accessorKey: "visits" },
    {
      id: "status",
      header: "Tõendi staatus",
      accessorKey: "status",
      cell: this.personStatusTpl() ?? "",
    } as TediColumnDef<PersonRecord>,
  ]);
}

export const SelectableRows: Story = {
  render: () => ({
    moduleMetadata: { imports: [SelectableRowsStoryHostComponent] },
    template: `<tedi-selectable-rows-story />`,
  }),
};

// ---------- ClickableRows ----------
@Component({
  standalone: true,
  selector: "tedi-clickable-rows-story",
  imports: [TediTableComponent, StatusBadgeComponent],
  template: `
    <p style="margin-bottom: 10px;">
      {{
        active()
          ? "You clicked " + active()!.name
          : "Click a row to select it."
      }}
    </p>
    <tedi-table
      id="tedi-table-clickable"
      [data]="data"
      [columns]="columns()"
      [interactive]="true"
      [activeRowId]="active()?.id"
      (rowClick)="onClick($event)"
      [pagination]="pagination"
    />
    <ng-template #personStatus let-ctx>
      <tedi-status-badge
        [color]="statusColor[ctx.row.original.status]"
        [text]="ctx.row.original.status"
        [variant]="active()?.id === ctx.row.id ? 'filled-bordered' : 'filled'"
      />
    </ng-template>
  `,
})
class ClickableRowsStoryHostComponent {
  data = filterablePeople;
  pagination = DEFAULT_PAGINATION;
  statusColor = certStatusColor;
  active = signal<{ id: string; name: string } | null>(null);

  personStatusTpl =
    viewChild<TemplateRef<CellContext<PersonRecord, unknown>>>("personStatus");

  columns = computed<TediColumnDef<PersonRecord>[]>(() => [
    { id: "name", header: "Isik", accessorKey: "name" },
    { id: "age", header: "Vanus", accessorKey: "age" },
    { id: "visits", header: "Külastuste arv", accessorKey: "visits" },
    {
      id: "status",
      header: "Tõendi staatus",
      accessorKey: "status",
      cell: this.personStatusTpl() ?? "",
    } as TediColumnDef<PersonRecord>,
  ]);

  onClick(row: Row<PersonRecord>) {
    this.active.set({ id: row.id, name: row.original.name });
  }
}

export const ClickableRows: Story = {
  render: () => ({
    moduleMetadata: { imports: [ClickableRowsStoryHostComponent] },
    template: `<tedi-clickable-rows-story />`,
  }),
};

// ---------- Striped ----------
@Component({
  standalone: true,
  selector: "tedi-striped-story",
  imports: [TediTableComponent],
  template: `
    <tedi-table
      id="tedi-table-striped"
      [data]="data"
      [columns]="columns"
      striped
      [pagination]="pagination"
    />
  `,
})
class StripedStoryHostComponent {
  data = people;
  columns = personColumns;
  pagination = DEFAULT_PAGINATION;
}

export const Striped: Story = {
  render: () => ({
    moduleMetadata: { imports: [StripedStoryHostComponent] },
    template: `<tedi-striped-story />`,
  }),
};

// ---------- StickyFirstColumn ----------
@Component({
  standalone: true,
  selector: "tedi-sticky-first-story",
  imports: [TediTableComponent],
  template: `
    <div style="width: 100%;">
      <tedi-table
        id="tedi-table-sticky"
        [data]="data"
        [columns]="columns()"
        stickyFirstColumn
        [pagination]="pagination"
      />
    </div>
    <ng-template #nameCell let-ctx>
      <span style="display:inline-flex; align-items:center; gap:16px;">
        {{ ctx.row.original.name }}
        <span style="color: var(--general-text-tertiary);">
          {{ ctx.row.original.personalId }}
        </span>
      </span>
    </ng-template>
  `,
})
class StickyFirstColumnStoryHostComponent {
  data = stickyDoctors;
  pagination = DEFAULT_PAGINATION;
  nameCellTpl =
    viewChild<TemplateRef<CellContext<StickyDoctor, unknown>>>("nameCell");

  columns = computed<TediColumnDef<StickyDoctor>[]>(() => [
    {
      id: "name",
      header: "Arst",
      accessorKey: "name",
      size: 280,
      cell: this.nameCellTpl() ?? "",
    } as TediColumnDef<StickyDoctor>,
    { id: "specialty", header: "Eriala", accessorKey: "specialty", size: 240 },
    { id: "experience", header: "Tööstaaž", accessorKey: "experience", size: 160 },
    { id: "location", header: "Asukoht", accessorKey: "location", size: 160 },
    { id: "email", header: "E-post", accessorKey: "email", size: 240 },
    { id: "phone", header: "Telefon", accessorKey: "phone", size: 180 },
    { id: "room", header: "Kabinet", accessorKey: "room", size: 160 },
    {
      id: "nextAvailable",
      header: "Järgmine vaba aeg",
      accessorKey: "nextAvailable",
      size: 200,
    },
    {
      id: "patientsToday",
      header: "Patsiente täna",
      accessorKey: "patientsToday",
      size: 160,
      meta: { align: "right" },
    },
    {
      id: "rating",
      header: "Hinnang",
      accessorKey: "rating",
      size: 140,
      meta: { align: "right" },
    },
  ]);
}

export const StickyFirstColumn: Story = {
  render: () => ({
    moduleMetadata: { imports: [StickyFirstColumnStoryHostComponent] },
    template: `<tedi-sticky-first-story />`,
  }),
};

// ---------- StickyHeader ----------
@Component({
  standalone: true,
  selector: "tedi-sticky-header-story",
  imports: [TediTableComponent],
  template: `
    <tedi-table
      id="tedi-table-sticky-header"
      [data]="data"
      [columns]="columns"
      stickyHeader
      [maxHeight]="240"
    />
  `,
})
class StickyHeaderStoryHostComponent {
  data = people;
  columns = personColumns;
}

export const StickyHeader: Story = {
  render: () => ({
    moduleMetadata: { imports: [StickyHeaderStoryHostComponent] },
    template: `<tedi-sticky-header-story />`,
  }),
};

// ---------- StickyHeaderAndFirstColumn ----------
@Component({
  standalone: true,
  selector: "tedi-sticky-both-story",
  imports: [TediTableComponent],
  template: `
    <div style="width: 100%;">
      <tedi-table
        id="tedi-table-sticky-both"
        [data]="data"
        [columns]="columns()"
        stickyHeader
        stickyFirstColumn
        [maxHeight]="280"
      />
    </div>
    <ng-template #nameCell let-ctx>
      <span style="display:inline-flex; align-items:center; gap:16px;">
        {{ ctx.row.original.name }}
        <span style="color: var(--general-text-tertiary);">
          {{ ctx.row.original.personalId }}
        </span>
      </span>
    </ng-template>
  `,
})
class StickyHeaderAndFirstColumnStoryHostComponent {
  data = stickyDoctors;
  nameCellTpl =
    viewChild<TemplateRef<CellContext<StickyDoctor, unknown>>>("nameCell");

  columns = computed<TediColumnDef<StickyDoctor>[]>(() => [
    {
      id: "name",
      header: "Arst",
      accessorKey: "name",
      size: 280,
      cell: this.nameCellTpl() ?? "",
    } as TediColumnDef<StickyDoctor>,
    { id: "specialty", header: "Eriala", accessorKey: "specialty", size: 240 },
    { id: "experience", header: "Tööstaaž", accessorKey: "experience", size: 160 },
    { id: "location", header: "Asukoht", accessorKey: "location", size: 160 },
    { id: "email", header: "E-post", accessorKey: "email", size: 240 },
    { id: "phone", header: "Telefon", accessorKey: "phone", size: 180 },
    { id: "room", header: "Kabinet", accessorKey: "room", size: 160 },
    {
      id: "nextAvailable",
      header: "Järgmine vaba aeg",
      accessorKey: "nextAvailable",
      size: 200,
    },
    {
      id: "patientsToday",
      header: "Patsiente täna",
      accessorKey: "patientsToday",
      size: 160,
      meta: { align: "right" },
    },
    {
      id: "rating",
      header: "Hinnang",
      accessorKey: "rating",
      size: 140,
      meta: { align: "right" },
    },
  ]);
}

export const StickyHeaderAndFirstColumn: Story = {
  render: () => ({
    moduleMetadata: { imports: [StickyHeaderAndFirstColumnStoryHostComponent] },
    template: `<tedi-sticky-both-story />`,
  }),
};

// ---------- WithEmptyState ----------
@Component({
  standalone: true,
  selector: "tedi-empty-story",
  imports: [TediTableComponent, EmptyStateComponent],
  template: `
    <tedi-table
      id="tedi-table-empty-state"
      [data]="empty"
      [columns]="columns"
      [placeholder]="emptyTpl"
      placeholderRole="status"
    />
    <ng-template #emptyTpl>
      <tedi-empty-state type="inside" icon="spa" iconColor="tertiary">
        No results found
      </tedi-empty-state>
    </ng-template>
  `,
})
class WithEmptyStateStoryHostComponent {
  empty: Person[] = [];
  columns = personColumns;
}

export const WithEmptyState: Story = {
  render: () => ({
    moduleMetadata: { imports: [WithEmptyStateStoryHostComponent] },
    template: `<tedi-empty-story />`,
  }),
};

// ---------- LongTexts ----------
@Component({
  standalone: true,
  selector: "tedi-long-texts-story",
  imports: [TediTableComponent, LinkComponent],
  template: `
    <tedi-table
      id="tedi-table-long-texts"
      [data]="data"
      [columns]="columns()"
      [pagination]="pagination"
    />
    <ng-template #nameCell let-ctx>
      <div>
        <div>{{ ctx.row.original.name }}</div>
        <div style="color: var(--general-text-secondary);">
          {{ ctx.row.original.specialty }}
        </div>
      </div>
    </ng-template>
    <ng-template #descCell let-ctx>
      @let expanded = expandedDescriptions().has(ctx.row.original.id);
      <span style="display: inline-block; max-width: 480px;">
        @if (expanded) {
          {{ description }}
          <a
            tedi-link
            href="#"
            (click)="
              toggleDescription(ctx.row.original.id);
              $event.preventDefault()
            "
          >
            Näita vähem
          </a>
        } @else {
          {{ truncate(description) }}
          <a
            tedi-link
            href="#"
            (click)="
              toggleDescription(ctx.row.original.id);
              $event.preventDefault()
            "
          >
            Näita rohkem
          </a>
        }
      </span>
    </ng-template>
  `,
})
class LongTextsStoryHostComponent {
  private static readonly TRUNCATE_LENGTH = 70;
  data = doctors;
  pagination = SHOWCASE_PAGINATION_3;
  description = LONG_DESCRIPTION;

  protected readonly expandedDescriptions = signal<Set<string>>(new Set());

  nameCellTpl =
    viewChild<TemplateRef<CellContext<Doctor, unknown>>>("nameCell");
  descCellTpl =
    viewChild<TemplateRef<CellContext<Doctor, unknown>>>("descCell");

  columns = computed<TediColumnDef<Doctor>[]>(() => [
    {
      id: "name",
      header: "Arst",
      cell: this.nameCellTpl() ?? "",
    } as TediColumnDef<Doctor>,
    {
      id: "description",
      header: "Kirjeldus",
      size: 480,
      cell: this.descCellTpl() ?? "",
    } as TediColumnDef<Doctor>,
    { id: "location", header: "Asukoht", accessorKey: "location" },
  ]);

  protected truncate(text: string): string {
    if (text.length <= LongTextsStoryHostComponent.TRUNCATE_LENGTH) return text;
    return (
      text.slice(0, LongTextsStoryHostComponent.TRUNCATE_LENGTH).trimEnd() +
      "…"
    );
  }

  protected toggleDescription(rowId: string): void {
    this.expandedDescriptions.update((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  }
}

export const LongTexts: Story = {
  render: () => ({
    moduleMetadata: { imports: [LongTextsStoryHostComponent] },
    template: `<tedi-long-texts-story />`,
  }),
};

// ---------- Actions ----------
@Component({
  standalone: true,
  selector: "tedi-actions-story",
  imports: [
    TediTableComponent,
    ButtonComponent,
    IconComponent,
    DropdownComponent,
    DropdownContentComponent,
    DropdownItemComponent,
    DropdownTriggerDirective,
  ],
  template: `
    <tedi-table
      id="tedi-table-actions"
      [data]="data"
      [columns]="columns()"
      [pagination]="pagination"
    />
    <ng-template #nameCell let-ctx>
      <div>
        <div>{{ ctx.row.original.name }}</div>
        <div style="color: var(--general-text-secondary);">{{ ctx.row.original.specialty }}</div>
      </div>
    </ng-template>
    <ng-template #actions let-ctx>
      <span style="display:inline-flex; gap:8px; justify-content:flex-end; width:100%;">
        <tedi-dropdown position="bottom-end">
          <button
            tedi-button
            tedi-dropdown-trigger
            variant="secondary"
            size="small"
            type="button"
            [attr.aria-label]="'Avalda ' + ctx.row.original.name + ' valikud'"
          >
            <tedi-icon name="more_vert" [size]="16" color="inherit" />
          </button>
          <tedi-dropdown-content>
            <li tedi-dropdown-item>Muuda</li>
            <li tedi-dropdown-item>Dubleeri</li>
            <li tedi-dropdown-item>Saada e-mail</li>
            <li tedi-dropdown-item>Kustuta</li>
          </tedi-dropdown-content>
        </tedi-dropdown>
      </span>
    </ng-template>
  `,
})
class ActionsStoryHostComponent {
  data = doctors;
  pagination = SHOWCASE_PAGINATION_3;
  nameCellTpl =
    viewChild<TemplateRef<CellContext<Doctor, unknown>>>("nameCell");
  actionsTpl = viewChild<TemplateRef<CellContext<Doctor, unknown>>>("actions");

  columns = computed<TediColumnDef<Doctor>[]>(() => [
    {
      id: "name",
      header: "Arst",
      cell: this.nameCellTpl() ?? "",
    } as TediColumnDef<Doctor>,
    { id: "experience", header: "Tööstaaž", accessorKey: "experience" },
    { id: "location", header: "Asukoht", accessorKey: "location" },
    {
      id: "actions",
      header: "",
      size: 1,
      cell: this.actionsTpl() ?? "",
    } as TediColumnDef<Doctor>,
  ]);
}

export const Actions: Story = {
  render: () => ({
    moduleMetadata: { imports: [ActionsStoryHostComponent] },
    template: `<tedi-actions-story />`,
  }),
};

// ---------- Custom ----------
@Component({
  standalone: true,
  selector: "tedi-custom-story",
  imports: [
    TediTableComponent,
    AlertComponent,
    InfoButtonComponent,
    ButtonComponent,
    IconComponent,
    SeparatorComponent,
    PopoverComponent,
    PopoverContentComponent,
    PopoverTriggerDirective,
  ],
  template: `
    <tedi-table
      id="tedi-table-custom"
      [data]="data"
      [columns]="columns()"
      [pagination]="pagination"
    />
    <ng-template #nameCell let-ctx>
      <div style="display:flex; align-items:center; gap:12px;">
        <span
          aria-hidden="true"
          style="
            width:40px; height:40px; border-radius:50%;
            background: var(--general-surface-secondary);
            color: var(--general-text-secondary);
            display:inline-flex; align-items:center; justify-content:center;
            font-weight: var(--heading-weight);
            font-size: var(--body-small-regular-size);
            flex-shrink: 0;
          "
        >{{ initials(ctx.row.original.name) }}</span>
        <div>
          <div>{{ ctx.row.original.name }}</div>
          <div style="color: var(--general-text-secondary);">{{ ctx.row.original.specialty }}</div>
        </div>
      </div>
    </ng-template>
    <ng-template #noteCell let-ctx>
      @if (ctx.row.original.note && ctx.row.original.noteColor) {
        <tedi-alert
          [type]="ctx.row.original.noteColor === 'danger' ? 'error' : 'warning'"
          variant="default"
          role="status"
        >
          {{ ctx.row.original.note }}
        </tedi-alert>
      }
    </ng-template>
    <ng-template #actions let-ctx>
      <span style="display:inline-flex; gap:8px; justify-content:flex-end; width:100%;">
        <tedi-popover>
          <button
            tedi-popover-trigger
            tedi-info-button
            [attr.aria-label]="ctx.row.original.name + ' eelvaade'"
          ></button>
          <tedi-popover-content>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div style="font-weight: var(--heading-weight);">{{ ctx.row.original.name }}</div>
              <div style="color: var(--general-text-secondary);">
                {{ ctx.row.original.specialty }} · {{ ctx.row.original.location }}
              </div>
              <tedi-separator color="primary" axis="horizontal" />
              <div style="display:flex; gap:8px; justify-content:flex-end;">
                <button tedi-button variant="secondary" size="small" type="button">
                  <tedi-icon name="edit" [size]="16" color="inherit" />
                  Muuda
                </button>
                <button tedi-button variant="primary" size="small" type="button">
                  <tedi-icon name="open_in_new" [size]="16" color="inherit" />
                  Ava profiil
                </button>
              </div>
            </div>
          </tedi-popover-content>
        </tedi-popover>
      </span>
    </ng-template>
  `,
})
class CustomStoryHostComponent {
  data = customDoctors;
  pagination = SHOWCASE_PAGINATION_3;
  initials = initialsOf;

  nameCellTpl =
    viewChild<TemplateRef<CellContext<CustomDoctor, unknown>>>("nameCell");
  noteCellTpl =
    viewChild<TemplateRef<CellContext<CustomDoctor, unknown>>>("noteCell");
  actionsTpl =
    viewChild<TemplateRef<CellContext<CustomDoctor, unknown>>>("actions");

  columns = computed<TediColumnDef<CustomDoctor>[]>(() => [
    {
      id: "name",
      header: "Arst",
      cell: this.nameCellTpl() ?? "",
    } as TediColumnDef<CustomDoctor>,
    {
      id: "note",
      header: "",
      cell: this.noteCellTpl() ?? "",
    } as TediColumnDef<CustomDoctor>,
    { id: "location", header: "Asukoht", accessorKey: "location" },
    {
      id: "actions",
      header: "",
      size: 1,
      cell: this.actionsTpl() ?? "",
    } as TediColumnDef<CustomDoctor>,
  ]);
}

export const Custom: Story = {
  render: () => ({
    moduleMetadata: { imports: [CustomStoryHostComponent] },
    template: `<tedi-custom-story />`,
  }),
};

// ---------- WithFooter ----------
@Component({
  standalone: true,
  selector: "tedi-footer-story",
  imports: [TediTableComponent],
  template: `
    <tedi-table
      id="tedi-table-footer"
      [data]="data"
      [columns]="columns()"
      [pagination]="pagination"
    />
    <ng-template #salaryCell let-ctx>
      {{ format(ctx.row.original.salary) }}
    </ng-template>
    <ng-template #salaryFooter>Total €{{ totalLabel() }}</ng-template>
  `,
})
class WithFooterStoryHostComponent {
  data = people;
  pagination = DEFAULT_PAGINATION;
  format = (v: number) => v.toLocaleString("et-EE");
  totalLabel = () =>
    people.reduce((sum, p) => sum + p.salary, 0).toLocaleString("et-EE");

  salaryCellTpl =
    viewChild<TemplateRef<CellContext<Person, unknown>>>("salaryCell");
  salaryFooterTpl = viewChild<TemplateRef<unknown>>("salaryFooter");

  columns = computed<TediColumnDef<Person>[]>(() => [
    { id: "name", header: "Name", accessorKey: "name", footer: `${people.length} people` },
    { id: "role", header: "Role", accessorKey: "role" },
    { id: "location", header: "Location", accessorKey: "location" },
    {
      id: "salary",
      accessorKey: "salary",
      header: "Salary (€)",
      meta: { align: "right" },
      cell: this.salaryCellTpl() ?? "",
      footer: this.salaryFooterTpl() ?? "",
    } as TediColumnDef<Person>,
  ]);
}

export const WithFooter: Story = {
  render: () => ({
    moduleMetadata: { imports: [WithFooterStoryHostComponent] },
    template: `<tedi-footer-story />`,
  }),
};

// ---------- WithColumnsMenu ----------
@Component({
  standalone: true,
  selector: "tedi-columns-menu-story",
  imports: [
    TediTableComponent,
    TediTableToolbarComponent,
    TediTableColumnsMenuComponent,
  ],
  template: `
    <tedi-table
      id="tedi-table-visibility"
      [data]="data"
      [columns]="columns"
      [pagination]="pagination"
    >
      <tedi-table-toolbar>
        <tedi-table-columns-menu />
      </tedi-table-toolbar>
    </tedi-table>
  `,
})
class WithColumnsMenuStoryHostComponent {
  data = people;
  columns = personColumns;
  pagination = DEFAULT_PAGINATION;
}

export const WithColumnsMenu: Story = {
  render: () => ({
    moduleMetadata: { imports: [WithColumnsMenuStoryHostComponent] },
    template: `<tedi-columns-menu-story />`,
  }),
};

// ---------- DraggableRows ----------
@Component({
  standalone: true,
  selector: "tedi-draggable-rows-story",
  imports: [TediTableComponent],
  template: `
    <div style="
      color: var(--general-text-secondary);
      margin-bottom: 16px;
      font-size: var(--body-small-regular-size);
    ">
      Drag any row to reorder it. The table emits
      <code>(rowDrop)</code>; this story uses CDK's
      <code>moveItemInArray</code> to reorder the data array and pipes the
      new array back via <code>[data]</code>.
    </div>
    <tedi-table
      id="tedi-table-draggable-rows"
      [data]="rows()"
      [columns]="columns"
      [draggableRows]="true"
      [pagination]="pagination"
      (rowDrop)="onRowDrop($event)"
    />
  `,
})
class DraggableRowsStoryHostComponent {
  protected readonly rows = signal<Person[]>(people.slice(0, 8));
  pagination = SHOWCASE_PAGINATION_4;
  columns: TediColumnDef<Person>[] = [
    { id: "name", header: "Name", accessorKey: "name", size: 200 },
    { id: "email", header: "Email", accessorKey: "email", size: 260 },
    { id: "role", header: "Role", accessorKey: "role", size: 160 },
    { id: "location", header: "Location", accessorKey: "location", size: 160 },
  ];

  onRowDrop(event: CdkDragDrop<Person[]>) {
    this.rows.update((current) => {
      const next = [...current];
      moveItemInArray(next, event.previousIndex, event.currentIndex);
      return next;
    });
  }
}

export const DraggableRows: Story = {
  render: () => ({
    moduleMetadata: { imports: [DraggableRowsStoryHostComponent] },
    template: `<tedi-draggable-rows-story />`,
  }),
};

// ---------- DraggableColumns ----------
@Component({
  standalone: true,
  selector: "tedi-draggable-columns-story",
  imports: [TediTableComponent],
  template: `
    <div style="
      color: var(--general-text-secondary);
      margin-bottom: 16px;
      font-size: var(--body-small-regular-size);
    ">
      Drag any header cell to reorder columns. The table updates its own
      <code>columnOrder</code> state internally — no consumer wiring is
      required beyond setting <code>[draggableColumns]="true"</code>. Persist
      the order across reloads by adding <code>'columnOrder'</code> to the
      <code>persist.include</code> list.
    </div>
    <tedi-table
      id="tedi-table-draggable-cols"
      [data]="data"
      [columns]="columns"
      [draggableColumns]="true"
      [pagination]="pagination"
    />
  `,
})
class DraggableColumnsStoryHostComponent {
  data = people;
  pagination = DEFAULT_PAGINATION;
  columns: TediColumnDef<Person>[] = [
    { id: "name", header: "Name", accessorKey: "name", size: 200 },
    { id: "email", header: "Email", accessorKey: "email", size: 260 },
    { id: "role", header: "Role", accessorKey: "role", size: 160 },
    { id: "location", header: "Location", accessorKey: "location", size: 160 },
  ];
}

export const DraggableColumns: Story = {
  render: () => ({
    moduleMetadata: { imports: [DraggableColumnsStoryHostComponent] },
    template: `<tedi-draggable-columns-story />`,
  }),
};

// ---------- ServerSide ----------
@Component({
  standalone: true,
  selector: "tedi-server-side-story",
  imports: [TediTableComponent, TediTableHeaderButtonComponent],
  template: `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div style="color: var(--general-text-secondary);">
        <p style="margin: 0 0 8px;">
          This story simulates a server-paginated, server-sorted table. The
          parent owns the current page slice and the sort state; the Table is
          told <code>manualPagination</code> + <code>manualSorting</code> so it
          does not re-slice or re-sort its <code>data</code> locally.
        </p>
        <p style="margin: 0 0 8px;">
          Pair <code>manualFiltering</code> in the same way for column filters.
        </p>
        <details>
          <summary style="cursor: pointer;">Wiring it up in your app</summary>
          <pre style="
            margin: 8px 0 0;
            padding: var(--tedi-dimensions-12);
            background: var(--general-surface-secondary);
            font-size: var(--body-small-regular-size);
            white-space: pre-wrap;
          ">{{ snippet }}</pre>
        </details>
      </div>
      <tedi-table
        id="tedi-table-server-side"
        [data]="page()"
        [columns]="columns()"
        [manualPagination]="true"
        [manualSorting]="true"
        [pageCount]="totalPages()"
        [rowCount]="total"
        [state]="tableState()"
        [pagination]="paginationOpts"
        (stateChange)="onState($event)"
      />
    </div>
    <ng-template #sortHeader let-ctx>
      <span style="display:inline-flex; align-items:center; gap:4px;">
        {{ ctx.column.columnDef.meta?.label }}
        <button
          tedi-table-header-button
          [icon]="iconFor(ctx.column.getIsSorted())"
          [selected]="!!ctx.column.getIsSorted()"
          (click)="ctx.column.toggleSorting()"
          [aria-label]="'Sort by ' + ctx.column.columnDef.meta?.label"
        ></button>
      </span>
    </ng-template>
  `,
})
class ServerSideStoryHostComponent {
  source = people;
  total = people.length;
  paginationOpts = { pageSize: 5, pageSizeOptions: [5, 10, 25] };
  iconFor = sortIconFor;

  tableState = signal<Partial<TableState>>({
    pagination: { pageIndex: 0, pageSize: 5 },
    sorting: [],
  });
  page = signal<Person[]>(this.source.slice(0, 5));
  totalPages = signal<number>(Math.ceil(this.source.length / 5));

  sortHeaderTpl = viewChild<TemplateRef<unknown>>("sortHeader");

  snippet = `const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
const [sorting, setSorting] = useState([]);

// Refetch from the server whenever pagination / sort changes.
const { data: page, total } = useServerQuery({ pagination, sorting });

<tedi-table
  [data]="page.rows"               <!-- current page only -->
  [columns]="columns"
  manualPagination                 <!-- disables in-memory pagination -->
  manualSorting                    <!-- disables in-memory sort -->
  [pageCount]="Math.ceil(total / pagination.pageSize)"
  [rowCount]="total"               <!-- shown in 'X results' footer -->
  [state]="{ pagination, sorting }"
  (stateChange)="onState($event)"
  [pagination]="{ pageSize: 10 }"
/>`;

  columns = computed<TediColumnDef<Person>[]>(() => {
    const header = this.sortHeaderTpl() ?? "";
    return personColumns.map(
      (col) =>
        ({
          ...col,
          header,
          meta: { label: typeof col.header === "string" ? col.header : col.id },
        }) as TediColumnDef<Person>,
    );
  });

  onState(next: TableState) {
    const pagination = next.pagination ?? { pageIndex: 0, pageSize: 5 };
    const sorting = next.sorting ?? [];
    const sortedSource = this.applySort(this.source, sorting);
    const start = pagination.pageIndex * pagination.pageSize;
    this.page.set(sortedSource.slice(start, start + pagination.pageSize));
    this.totalPages.set(Math.ceil(this.source.length / pagination.pageSize));
    this.tableState.set({ pagination, sorting });
  }

  private applySort(rows: Person[], sorting: TableState["sorting"]) {
    if (!sorting?.length) return rows;
    const { id, desc } = sorting[0];
    const direction = desc ? -1 : 1;
    return [...rows].sort((a, b) => {
      const av = a[id as keyof Person];
      const bv = b[id as keyof Person];
      if (av === bv) return 0;
      return av > bv ? direction : -direction;
    });
  }
}

export const ServerSide: Story = {
  render: () => ({
    moduleMetadata: { imports: [ServerSideStoryHostComponent] },
    template: `<tedi-server-side-story />`,
  }),
};
