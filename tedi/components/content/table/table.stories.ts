import {
  booleanAttribute,
  Component,
  computed,
  Directive,
  effect,
  inject,
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
import { TediPaginationResultsDirective } from "../../navigation/pagination/pagination-results.directive";
import { groupRowSpan } from "./row-span.utils";
import type {
  TableExpandTrigger,
  TableSelectionMode,
  TableSize,
  TableState,
  TediColumnDef,
  TediTableFilterContext,
} from "./table.types";
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
import { BreakpointService } from "../../../services/breakpoint/breakpoint.service";
import { TextGroupComponent } from "../text-group/text-group.component";
import { TextGroupLabelComponent } from "../text-group/text-group-label.component";
import { TextGroupValueComponent } from "../text-group/text-group-value.component";

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

// Shared appearance inputs every story host inherits — keeps the Storybook
// controls panel functional for every story, not just Default. `@Directive()`
// (no selector) is required so Angular walks the inheritance chain and picks
// up these signal inputs as inputs of every subclass component.
@Directive({ standalone: true })
abstract class TableStoryHostBase {
  readonly size = input<TableSize>("medium");
  readonly striped = input(false, { transform: booleanAttribute });
  readonly verticalBorders = input(false, { transform: booleanAttribute });
  readonly borderless = input(false, { transform: booleanAttribute });
  readonly stickyFirstColumn = input(false, { transform: booleanAttribute });
  readonly stickyHeader = input(false, { transform: booleanAttribute });
  readonly fixedLayout = input(false, { transform: booleanAttribute });
  readonly rowHover = input(false, { transform: booleanAttribute });
  readonly interactive = input(false, { transform: booleanAttribute });
  readonly expandTrigger = input<TableExpandTrigger>("button");
  readonly enableRowSelection = input(false, { transform: booleanAttribute });
  readonly selectedRowHighlight = input(true, { transform: booleanAttribute });
  readonly selectionMode = input<TableSelectionMode>("multiple");
  readonly enableColumnFilters = input(false, { transform: booleanAttribute });
  readonly maxHeight = input<number | undefined>(undefined);
  readonly activeRowId = input<string | undefined>(undefined);
  readonly placeholderRole = input<"alert" | "status" | undefined>(undefined);
}

// Sibling binding fragment so every story template can forward the base-class
// inputs to its <tedi-table> without repeating the property list.
const TABLE_APPEARANCE_BINDINGS = `
  [size]="size()"
  [striped]="striped()"
  [verticalBorders]="verticalBorders()"
  [borderless]="borderless()"
  [stickyFirstColumn]="stickyFirstColumn()"
  [stickyHeader]="stickyHeader()"
  [fixedLayout]="fixedLayout()"
  [rowHover]="rowHover()"
  [interactive]="interactive()"
  [expandTrigger]="expandTrigger()"
  [enableRowSelection]="enableRowSelection()"
  [selectedRowHighlight]="selectedRowHighlight()"
  [selectionMode]="selectionMode()"
  [enableColumnFilters]="enableColumnFilters()"
  [maxHeight]="maxHeight()"
  [activeRowId]="activeRowId()"
  [placeholderRole]="placeholderRole()"
`.trim();

type TediTableStoryArgs = {
  size: "medium" | "small";
  striped: boolean;
  verticalBorders: boolean;
  borderless: boolean;
  stickyFirstColumn: boolean;
  stickyHeader: boolean;
  fixedLayout: boolean;
  rowHover: boolean;
  interactive: boolean;
  expandTrigger: TableExpandTrigger;
  enableRowSelection: boolean;
  selectedRowHighlight: boolean;
  selectionMode: TableSelectionMode;
  enableColumnFilters: boolean;
  maxHeight: number | undefined;
  activeRowId: string | undefined;
  placeholderRole: "alert" | "status" | undefined;
  // Documented-only (set per story, not interactive controls)
  data?: unknown[];
  columns?: unknown[];
  id?: string;
  caption?: unknown;
  renderSubComponent?: unknown;
  getRowCanExpand?: unknown;
  getSubRows?: unknown;
  expandButtonVariant?: "default" | "secondary";
  expandButtonLabel?: string | { open: string; close: string };
  pagination?: unknown;
  paginationTop?: unknown;
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  pageCount?: number;
  rowCount?: number;
  state?: unknown;
  defaultState?: unknown;
  persist?: unknown;
  placeholder?: unknown;
  reorderableRows?: boolean;
  reorderableColumns?: boolean;
  stateChange?: unknown;
  rowClick?: unknown;
  rowDrop?: unknown;
};

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.45.70?node-id=11335-186161&m=dev" target="_BLANK">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/557b9f-table" target="_BLANK">Zeroheight ↗</a>
 * <a href="https://tanstack.com/table/latest/docs/framework/angular/angular-table" target="_BLANK">@tanstack/angular-table ↗</a><br/>
 *
 * Headless data table built on `@tanstack/angular-table`. Supports sorting,
 * filtering, expansion, selection, pagination, sticky chrome and body row
 * spanning. Cells render via per-column `cell` accessor (string or
 * `TemplateRef`).
 *
 * In-depth examples for column definitions, cell / header / footer
 * templates, row spanning, expansion sub-rows and editable cells live on the
 * <a href="?path=/docs/tedi-ready-content-table--cells-and-templates">Cells and Templates</a> page.
 */
const meta: Meta<TediTableStoryArgs> = {
  title: "TEDI-Ready/Content/Table",
  component: TediTableComponent,
  parameters: {
    status: {
      type: ["partiallyTediReady"],
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.45.70?node-id=11335-186161&m=dev",
    },
    docs: {
      source: {
        type: "code",
      },
    },
  },
  args: {
    size: "medium",
    striped: false,
    verticalBorders: false,
    borderless: false,
    stickyFirstColumn: false,
    stickyHeader: false,
    fixedLayout: false,
    rowHover: false,
    interactive: false,
    expandTrigger: "button",
    enableRowSelection: false,
    selectionMode: "multiple",
    enableColumnFilters: false,
    maxHeight: undefined,
    activeRowId: undefined,
    placeholderRole: undefined,
  },
  argTypes: {
    // Visual / layout
    size: {
      description: "Visual size.",
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
    fixedLayout: {
      description:
        "`table-layout: fixed` — makes column `size` / `minSize` / `maxSize` authoritative (content wraps instead of stretching the column). Required for max-width caps to hold.",
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
    expandTrigger: {
      description:
        "How an expandable row is toggled. `button` (default) — only the chevron button toggles, rendered in the bordered secondary style. `row` — clicking anywhere on the row toggles, chevron rendered in the neutral default style.",
      control: { type: "inline-radio" },
      options: ["button", "row"],
      table: {
        category: "behavior",
        type: { summary: "TableExpandTrigger" },
        defaultValue: { summary: "button" },
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
    selectedRowHighlight: {
      description:
        "Whether selected rows get a background highlight. Default `true`.",
      control: "boolean",
      table: {
        category: "behavior",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    selectionMode: {
      description:
        "`multiple` (default) renders checkboxes + select-all. `single` renders radios sharing one HTML group and omits select-all.",
      control: { type: "inline-radio" },
      options: ["multiple", "single"],
      table: {
        category: "behavior",
        type: { summary: "TableSelectionMode" },
        defaultValue: { summary: "multiple" },
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
    // Inputs / outputs set per story (not interactive controls) — documented
    // here so the args table lists the full API.
    data: {
      description: "Row data. Required.",
      control: false,
      table: { category: "data", type: { summary: "TData[]" } },
    },
    columns: {
      description: "Column definitions. Required.",
      control: false,
      table: { category: "data", type: { summary: "TediColumnDef<TData>[]" } },
    },
    id: {
      description:
        "Stable id used to prefix synthetic ids; auto-generated when omitted.",
      control: false,
      table: { category: "data", type: { summary: "string" } },
    },
    caption: {
      description: "Caption rendered above the table.",
      control: false,
      table: { category: "data", type: { summary: "string | TemplateRef" } },
    },
    renderSubComponent: {
      description:
        "Template rendered as an expandable detail row (receives the Row as `$implicit`). Auto-adds the expand column.",
      control: false,
      table: {
        category: "expansion",
        type: { summary: "TemplateRef<{ $implicit: Row<TData> }>" },
      },
    },
    getRowCanExpand: {
      description: "Predicate deciding whether a row can expand.",
      control: false,
      table: { category: "expansion", type: { summary: "(row) => boolean" } },
    },
    getSubRows: {
      description:
        "Accessor returning a row's child rows for hierarchical / tree data.",
      control: false,
      table: {
        category: "expansion",
        type: { summary: "(row) => TData[] | undefined" },
      },
    },
    expandButtonVariant: {
      description:
        "Expand toggle arrow style. Defaults to bordered `secondary`; `default` is the neutral chevron. Only affects icon-only mode.",
      control: false,
      table: {
        category: "expansion",
        type: { summary: '"default" | "secondary"' },
      },
    },
    expandButtonLabel: {
      description:
        "Visible label next to the chevron (single string, or `{ open, close }` per state). Switches the toggle out of icon-only mode.",
      control: false,
      table: {
        category: "expansion",
        type: { summary: "string | { open; close }" },
      },
    },
    pagination: {
      description:
        "Enables + configures the bottom paginator. `true` for defaults or a `TablePaginationOptions` object (source of truth for pageSize / pageSizeOptions).",
      control: false,
      table: {
        category: "pagination",
        type: { summary: "boolean | TablePaginationOptions" },
      },
    },
    paginationTop: {
      description:
        "Opt-in top paginator slot; shares page state with the bottom but has independent visual config. Requires `pagination`.",
      control: false,
      table: {
        category: "pagination",
        type: { summary: "boolean | TablePaginationOptions" },
      },
    },
    manualPagination: {
      description:
        "Server-side pagination — render `data` as the current page as-is. Supply `pageCount` / `rowCount`.",
      control: false,
      table: {
        category: "pagination",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    pageCount: {
      description: "Total page count for server-side pagination.",
      control: false,
      table: { category: "pagination", type: { summary: "number" } },
    },
    rowCount: {
      description: "Total row count for server-side pagination.",
      control: false,
      table: { category: "pagination", type: { summary: "number" } },
    },
    manualSorting: {
      description:
        "Server-side sorting — emit sort state via `(stateChange)` without reordering `data`.",
      control: false,
      table: {
        category: "behavior",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    manualFiltering: {
      description:
        "Server-side filtering — emit filter state via `(stateChange)` without filtering `data`.",
      control: false,
      table: {
        category: "behavior",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    placeholder: {
      description:
        "Empty-state content (string or TemplateRef). Defaults to the translated `table.no-data`.",
      control: false,
      table: { category: "behavior", type: { summary: "string | TemplateRef" } },
    },
    state: {
      description:
        "Controlled state — render the given slices and emit every change via `(stateChange)`.",
      control: false,
      table: { category: "state", type: { summary: "Partial<TableState>" } },
    },
    defaultState: {
      description:
        "Initial state for uncontrolled mode (seeds sorting / filters / pagination / selection).",
      control: false,
      table: { category: "state", type: { summary: "Partial<TableState>" } },
    },
    persist: {
      description:
        "Persist selected state slices to storage (`{ key, storage?, include? }`).",
      control: false,
      table: { category: "state", type: { summary: "TablePersistOptions" } },
    },
    reorderableRows: {
      description:
        "Reorder rows by mouse drag **and** keyboard (one input). Emits " +
        "`(rowDrop)` with source-array indices.",
      control: false,
      table: {
        category: "drag & drop",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    reorderableColumns: {
      description:
        "Reorder columns by mouse drag **and** keyboard (one input). Updates " +
        "internal `columnOrder` state.",
      control: false,
      table: {
        category: "drag & drop",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    stateChange: {
      description:
        "Emits the full merged `TableState` whenever any slice changes.",
      control: false,
      table: { category: "outputs", type: { summary: "TableState" } },
    },
    rowClick: {
      description: "Emits the activated row. Only fires when `interactive` is true.",
      control: false,
      table: { category: "outputs", type: { summary: "Row<TData>" } },
    },
    rowDrop: {
      description:
        "Emits when a row is dropped; indices normalised to source-`data` positions.",
      control: false,
      table: { category: "outputs", type: { summary: "CdkDragDrop<TData[]>" } },
    },
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
      ${TABLE_APPEARANCE_BINDINGS}
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
class DefaultStoryHostComponent extends TableStoryHostBase {
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
}

export const Default: Story = {
  render: (args) => ({
    moduleMetadata: { imports: [DefaultStoryHostComponent] },
    props: args,
    template: `<tedi-default-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<tedi-table
  [data]="data"
  [columns]="columns"
  [pagination]="{ pageSize: 3, pageSizeOptions: [3, 10, 25, 50] }"
/>`,
      },
    },
  },
};

// ---------- Sizes ----------
@Component({
  standalone: true,
  selector: "tedi-sizes-story",
  imports: [TediTableComponent],
  // The "Small" table below intentionally hardcodes size="small" to keep the
  // side-by-side comparison meaningful. The "Default" table reads its size
  // from the Storybook control (via the appearance bindings).
  template: `
    <div style="display:flex; flex-direction:column; gap:24px;">
      <h3 style="margin:0;">Default</h3>
      <tedi-table
        id="tedi-table-sizes-default"
        [data]="data"
        [columns]="columns"
        [pagination]="pagination"
        ${TABLE_APPEARANCE_BINDINGS}
      />
      <h3 style="margin:0;">Small</h3>
      <tedi-table
        id="tedi-table-sizes-small"
        size="small"
        [data]="data"
        [columns]="columns"
        [pagination]="pagination"
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
    </div>
  `,
})
class SizesStoryHostComponent extends TableStoryHostBase {
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
  render: (args) => ({
    moduleMetadata: { imports: [SizesStoryHostComponent] },
    props: args,
    template: `<tedi-sizes-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- Default size -->
<tedi-table [data]="data" [columns]="columns" [pagination]="pagination" />

<!-- Small size -->
<tedi-table size="small" [data]="data" [columns]="columns" [pagination]="pagination" />`,
      },
    },
  },
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
        ${TABLE_APPEARANCE_BINDINGS}
      />
      <tedi-table
        id="tedi-table-simple-people"
        [data]="people"
        [columns]="peopleColumns()"
        [pagination]="paginationPeople"
        ${TABLE_APPEARANCE_BINDINGS}
      />
      <tedi-table
        id="tedi-table-simple-doctors"
        [data]="doctors"
        [columns]="doctorColumns()"
        [pagination]="paginationBooking"
        ${TABLE_APPEARANCE_BINDINGS}
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
class SimpleStoryHostComponent extends TableStoryHostBase {
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
  render: (args) => ({
    moduleMetadata: { imports: [SimpleStoryHostComponent] },
    props: args,
    template: `<tedi-simple-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- Plain text columns -->
<tedi-table [data]="bookings" [columns]="bookingColumns" [pagination]="pagination" />

<!-- Columns with templated cells (link, status badge):
  peopleColumns = [
    id: 'name', header: 'Isik', accessorKey: 'name', cell: personNameTpl,
    id: 'age', header: 'Vanus', accessorKey: 'age',
    id: 'visits', header: 'Külastuste arv', accessorKey: 'visits',
    id: 'status', header: 'Tõendi staatus', accessorKey: 'status', cell: personStatusTpl,
  ]
-->
<tedi-table [data]="people" [columns]="peopleColumns" [pagination]="pagination" />

<ng-template #personName let-ctx>
  <a tedi-link href="#">{{ ctx.row.original.name }}</a>
</ng-template>
<ng-template #personStatus let-ctx>
  <tedi-status-badge
    [color]="statusColor[ctx.row.original.status]"
    [text]="ctx.row.original.status"
  />
</ng-template>`,
      },
    },
  },
};

// ---------- MergedCells (grouped headers + sort) ----------
@Component({
  standalone: true,
  selector: "tedi-merged-cells-story",
  imports: [TediTableComponent],
  template: `
    <tedi-table
      id="tedi-table-merged"
      [data]="data"
      [columns]="columns"
      [pagination]="pagination"
      ${TABLE_APPEARANCE_BINDINGS}
    />
  `,
})
class MergedCellsStoryHostComponent extends TableStoryHostBase {
  data = bookings;
  pagination = DEFAULT_PAGINATION;

  columns: TediColumnDef<Booking>[] = [
    {
      id: "dateRange",
      header: "Kuupäev",
      accessorKey: "dateRange",
      size: 240,
      sortable: true,
    },
    {
      id: "aeg",
      header: "Aeg",
      columns: [
        { id: "hour", header: "Kellaaeg", accessorKey: "hour" },
        { id: "duration", header: "Kestus", accessorKey: "duration" },
      ],
    } as TediColumnDef<Booking>,
    { id: "location", header: "Asukoht", accessorKey: "location" },
  ];
}

export const MergedCells: Story = {
  args: { verticalBorders: true },
  render: (args) => ({
    moduleMetadata: { imports: [MergedCellsStoryHostComponent] },
    props: args,
    template: `<tedi-merged-cells-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- Nested header groups via 'columns' on a parent column. The
  dateRange column opts into the built-in sort affordance with
  sortable: true.

  columns = [
    id: 'dateRange', header: 'Kuupäev', accessorKey: 'dateRange',
      size: 240, sortable: true,
    id: 'aeg', header: 'Aeg', columns: [hour, duration],
    id: 'location', header: 'Asukoht', accessorKey: 'location',
  ]
-->
<tedi-table
  verticalBorders
  [data]="data"
  [columns]="columns"
  [pagination]="pagination"
/>`,
      },
    },
  },
};

// ---------- GroupedRows (body row spanning — Angular-only feature) ----------
interface PatientRow {
  id: string;
  date: string;
  doctor: string;
  procedure: string;
}
const patientRows: PatientRow[] = [
  { id: "1", date: "20.05.2026", doctor: "Dr Tamm", procedure: "Consultation" },
  { id: "2", date: "20.05.2026", doctor: "Dr Tamm", procedure: "Follow-up" },
  { id: "3", date: "21.05.2026", doctor: "Dr Kask", procedure: "X-ray" },
  { id: "4", date: "21.05.2026", doctor: "Dr Kask", procedure: "Consultation" },
];

@Component({
  standalone: true,
  selector: "tedi-grouped-rows-story",
  imports: [TediTableComponent],
  template: `<tedi-table [data]="data" [columns]="columns" ${TABLE_APPEARANCE_BINDINGS} />`,
})
class GroupedRowsStoryHostComponent extends TableStoryHostBase {
  data = patientRows;
  columns: TediColumnDef<PatientRow>[] = [
    {
      id: "date",
      header: "Date",
      accessorKey: "date",
      meta: { vAlign: "top" },
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
  args: { verticalBorders: true },
  render: (args) => ({
    moduleMetadata: { imports: [GroupedRowsStoryHostComponent] },
    props: args,
    template: `<tedi-grouped-rows-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- The first column collapses adjacent rows with the same value
  via rowSpan. Use the groupRowSpan helper. meta.vAlign: 'top' keeps the
  spanned cell's content aligned to the top instead of vertically centered:
  columns = [
    id: 'date', header: 'Date', accessorKey: 'date',
      meta: { vAlign: 'top' },
      rowSpan: groupRowSpan(rows, row => row.original.date),
    id: 'doctor', header: 'Doctor', accessorKey: 'doctor',
    id: 'procedure', header: 'Procedure', accessorKey: 'procedure',
  ]
-->
<tedi-table [data]="data" [columns]="columns" verticalBorders />`,
      },
    },
  },
};

// ---------- ColumnSizing (size / minSize / maxSize) ----------
interface SizedRow {
  code: string;
  count: number;
  name: string;
  description: string;
}
const sizedRows: SizedRow[] = [
  {
    code: "A1",
    count: 3,
    name: "Maasikas",
    description:
      "Magus punane suvemari, mida kasutatakse moosides, kookides ja värskelt söögiks.",
  },
  {
    code: "B2",
    count: 17,
    name: "Mustikas",
    description:
      "Tumesinine metsamari, tuntud antioksüdantide rohkuse ja magushapu maitse poolest.",
  },
  {
    code: "C3",
    count: 5,
    name: "Vaarikas",
    description:
      "Õrn punane mari pehme tekstuuriga, sobib teedesse, magustoitudesse ja siirupitesse.",
  },
];

@Component({
  standalone: true,
  selector: "tedi-column-sizing-story",
  imports: [TediTableComponent],
  template: `
    <tedi-table
      id="tedi-table-column-sizing"
      [data]="data"
      [columns]="columns"
      ${TABLE_APPEARANCE_BINDINGS}
    />
  `,
})
class ColumnSizingStoryHostComponent extends TableStoryHostBase {
  data = sizedRows;
  columns: TediColumnDef<SizedRow>[] = [
    { id: "code", header: "Kood", accessorKey: "code", maxSize: 72 },
    { id: "count", header: "Arv", accessorKey: "count", size: 64, minSize: 120 },
    { id: "name", header: "Nimi", accessorKey: "name", maxSize: 140 },
    // No size set → flexes to absorb leftover space, so the long description
    // extends to fill the table while the other columns hold their widths.
    { id: "description", header: "Kirjeldus", accessorKey: "description" },
  ];
}

export const ColumnSizing: Story = {
  args: { verticalBorders: true, fixedLayout: true },
  render: (args) => ({
    moduleMetadata: { imports: [ColumnSizingStoryHostComponent] },
    props: args,
    template: `<tedi-column-sizing-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Columns accept TanStack's `size`, `minSize` and `maxSize`, rendered as " +
          "`width` / `min-width` / `max-width`. **`fixedLayout` is required** — in " +
          "the default auto layout the browser sizes columns to content and the " +
          "widths are only hints. Under fixed layout, leave at least one column " +
          "**unsized** so it absorbs the leftover space; otherwise every column " +
          "scales up to fill the table. Here `Kood` is capped at 72px, `Arv` is " +
          "held to ≥120px (its `size: 64` is lifted by `minSize: 120`), `Nimi` is " +
          "capped at 140px, and `Kirjeldus` is left unsized so it extends to fill " +
          "the remaining width.",
      },
      source: {
        language: "html",
        code: `<!-- size → width, minSize → min-width, maxSize → max-width (px),
  applied only when set. fixedLayout (table-layout: fixed) is required;
  leave one column unsized so it absorbs the slack and extends
  (otherwise all columns scale up to fill the table width).
  columns = [
    { id: 'code', header: 'Kood', accessorKey: 'code', maxSize: 72 },
    { id: 'count', header: 'Arv', accessorKey: 'count', size: 64, minSize: 120 },
    { id: 'name', header: 'Nimi', accessorKey: 'name', maxSize: 140 },
    { id: 'description', header: 'Kirjeldus', accessorKey: 'description' }, // flex
  ]
-->
<tedi-table [data]="data" [columns]="columns" fixedLayout verticalBorders />`,
      },
    },
  },
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
      [data]="data"
      [columns]="columns()"
      [pagination]="pagination"
      ${TABLE_APPEARANCE_BINDINGS}
    />
    <ng-template #serviceHeader let-ctx>
      <button
        tedi-table-header-button
        [icon]="iconFor(ctx.column.getIsSorted())"
        [selected]="!!ctx.column.getIsSorted()"
        (click)="ctx.column.toggleSorting()"
      >
        Teenus
      </button>
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
class VerticalBordersStoryHostComponent extends TableStoryHostBase {
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
  args: { verticalBorders: true },
  render: (args) => ({
    moduleMetadata: { imports: [VerticalBordersStoryHostComponent] },
    props: args,
    template: `<tedi-vertical-borders-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- columns:
    id: 'service', accessorKey: 'service', header: serviceHeaderTpl,
    id: 'doctor', accessorKey: 'doctor', header: doctorHeaderTpl,
    id: 'price', accessorKey: 'price', header: 'Maksumus',
      meta: align right, cell: priceCellTpl,
    id: 'location', accessorKey: 'location', header: locationHeaderTpl,
-->
<tedi-table
  verticalBorders
  [data]="data"
  [columns]="columns"
  [pagination]="pagination"
/>

<ng-template #serviceHeader let-ctx>
  <button
    tedi-table-header-button
    [icon]="iconFor(ctx.column.getIsSorted())"
    [selected]="!!ctx.column.getIsSorted()"
    (click)="ctx.column.toggleSorting()"
  >
    Teenus
  </button>
</ng-template>
<ng-template #doctorHeader>
  <span>
    Arst
    <tedi-tooltip>
      <tedi-tooltip-trigger>
        <button tedi-info-button aria-label="Arst info"></button>
      </tedi-tooltip-trigger>
      <tedi-tooltip-content>Vastutav raviarst.</tedi-tooltip-content>
    </tedi-tooltip>
  </span>
</ng-template>
<ng-template #priceCell let-ctx>
  {{ format(ctx.row.original.price) }} €/h
</ng-template>`,
      },
    },
  },
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
      [pagination]="pagination"
      ${TABLE_APPEARANCE_BINDINGS}
    />
  `,
})
class NoOutsideBorderStoryHostComponent extends TableStoryHostBase {
  data = people;
  columns = personColumns;
  pagination = DEFAULT_PAGINATION;
}

export const NoOutsideBorder: Story = {
  args: { borderless: true },
  render: (args) => ({
    moduleMetadata: { imports: [NoOutsideBorderStoryHostComponent] },
    props: args,
    template: `<tedi-no-outside-border-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<tedi-table
  [data]="data"
  [columns]="columns"
  borderless
  [pagination]="pagination"
/>`,
      },
    },
  },
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
      ${TABLE_APPEARANCE_BINDINGS}
    />
    ${BOOKING_EDIT_TEMPLATES}
  `,
})
class EditableValuesStoryHostComponent extends TableStoryHostBase {
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
  render: (args) => ({
    moduleMetadata: { imports: [EditableValuesStoryHostComponent] },
    props: args,
    template: `<tedi-editable-values-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- Each editable column points its 'cell' at a template that
  toggles between a read-only value and a form control based on
  editor.isEditing(rowId). The last column renders save / cancel
  via the editActions template.
-->
<tedi-table
  [data]="editor.rows()"
  [columns]="columns"
  [pagination]="pagination"
/>

<ng-template #dateRangeCell let-ctx>
  @if (editor.isEditing(ctx.row.original.id)) {
    <tedi-form-field size="small">
      <input
        tedi-text-field
        type="text"
        [ngModel]="editor.draftValue(ctx.row.original.id, 'dateRange')"
        (ngModelChange)="editor.setDraftValue(ctx.row.original.id, 'dateRange', $event)"
        aria-label="Kuupäev"
      />
    </tedi-form-field>
  } @else {
    {{ ctx.row.original.dateRange }}
  }
</ng-template>

<ng-template #editActions let-ctx>
  @if (editor.isEditing(ctx.row.original.id)) {
    <button tedi-closing-button aria-label="Tühista"
      (click)="editor.cancelEdit()"></button>
    <button tedi-button variant="primary" size="small"
      (click)="editor.commitEdit()">Kinnita</button>
  } @else {
    <button tedi-button variant="neutral" size="small"
      (click)="editor.beginEdit(ctx.row.original)">Muuda</button>
  }
</ng-template>`,
      },
    },
  },
};

// ---------- Sortable ----------
@Component({
  standalone: true,
  selector: "tedi-sortable-story",
  imports: [TediTableComponent],
  template: `
    <div style="
      color: var(--general-text-secondary);
      margin-bottom: 16px;
      font-size: var(--body-small-regular-size);
    ">
      <p style="margin: 0 0 8px;">
        Opt a column into the built-in sort affordance with
        <code>sortable: true</code> on its <code>TediColumnDef</code>. The
        entire header title becomes clickable, an icon reflects the sort
        state, and <code>aria-sort</code> is wired automatically.
      </p>
      <p style="margin: 0 0 8px;">
        Customise comparison per column with <code>sortingFn</code>:
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
        Below:
        <strong>Name</strong> uses locale-aware compare,
        <strong>Salary</strong> sorts numerically (built-in
        <code>'alphanumeric'</code>),
        the rest use the inferred default.
      </p>
    </div>

    <tedi-table
      id="tedi-table-sortable"
      [data]="data"
      [columns]="columns"
      [pagination]="pagination"
      ${TABLE_APPEARANCE_BINDINGS}
    />
  `,
})
class SortableStoryHostComponent extends TableStoryHostBase {
  data = people;
  pagination = DEFAULT_PAGINATION;

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

  columns: TediColumnDef<Person>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      sortable: true,
      sortingFn: this.nameLocaleCompare,
    },
    {
      id: "role",
      header: "Role",
      accessorKey: "role",
      sortable: true,
    },
    {
      id: "location",
      header: "Location",
      accessorKey: "location",
      sortable: true,
    },
    {
      id: "salary",
      header: "Salary",
      accessorKey: "salary",
      sortable: true,
      sortingFn: "alphanumeric",
    },
  ];
}

export const Sortable: Story = {
  render: (args) => ({
    moduleMetadata: { imports: [SortableStoryHostComponent] },
    props: args,
    template: `<tedi-sortable-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- Sort affordance is baked in. Set sortable: true on a column and
  the table auto-renders the sort button around its (string) header,
  wires the icon to the sort state, and sets aria-sort. Pair with
  sortingFn for a custom comparator.

  Built-in sortingFns: 'alphanumeric', 'alphanumericCaseSensitive',
    'text', 'textCaseSensitive', 'datetime', 'basic', 'auto'.

  columns:
    - id 'name'     header 'Name'     sortable: true   sortingFn: localeCompare
    - id 'role'     header 'Role'     sortable: true
    - id 'location' header 'Location' sortable: true
    - id 'salary'   header 'Salary'   sortable: true   sortingFn: 'alphanumeric'
-->
<tedi-table [data]="data" [columns]="columns" [pagination]="pagination" />`,
      },
    },
  },
};

// ---------- Filters (built-in filter popover via `filterable: true`) ----------
@Component({
  standalone: true,
  selector: "tedi-filters-story",
  styles: [
    `
      .tedi-filters-story__option-list {
        display: flex;
        flex-direction: column;
        gap: var(--tedi-dimensions-04);
      }

      .tedi-filters-story__option {
        display: inline-flex;
        gap: var(--tedi-dimensions-04);
        align-items: center;
      }
    `,
  ],
  imports: [
    TediTableComponent,
    StatusBadgeComponent,
    TextFieldComponent,
    FormFieldComponent,
    CheckboxComponent,
  ],
  template: `
    <tedi-table
      id="tedi-table-filters"
      [data]="data"
      [columns]="columns()"
      [pagination]="pagination"
      ${TABLE_APPEARANCE_BINDINGS}
    />

    <ng-template #textFilter let-ctx>
      <tedi-form-field size="small">
        <input
          tedi-text-field
          type="text"
          [value]="ctx.value ?? ''"
          (input)="ctx.setValue($any($event.target).value)"
          [attr.aria-label]="ctx.column.columnDef.header"
        />
      </tedi-form-field>
    </ng-template>

    <ng-template #statusFilter let-ctx>
      <div class="tedi-filters-story__option-list">
        @for (option of certStatuses; track option) {
          <label class="tedi-filters-story__option">
            <input
              tedi-checkbox
              type="checkbox"
              [checked]="(ctx.value ?? []).includes(option)"
              (change)="
                ctx.setValue(
                  toggleStatus(
                    ctx.value,
                    option,
                    $any($event.target).checked
                  )
                )
              "
            />
            <span>{{ option }}</span>
          </label>
        }
      </div>
    </ng-template>

    <ng-template #statusCell let-ctx>
      <tedi-status-badge
        [color]="statusColor[ctx.row.original.status]"
        [text]="ctx.row.original.status"
      />
    </ng-template>
  `,
})
class FiltersStoryHostComponent extends TableStoryHostBase {
  data = filterablePeople;
  pagination = {
    pageSize: 10,
    pageSizeOptions: [
      10,
      25,
      { value: filterablePeople.length, label: "Näita kõiki" },
    ],
  };
  certStatuses = CERT_STATUSES;
  statusColor = certStatusColor;

  textFilterTpl =
    viewChild<TemplateRef<TediTableFilterContext<string, PersonRecord>>>(
      "textFilter",
    );
  statusFilterTpl =
    viewChild<
      TemplateRef<TediTableFilterContext<CertStatus[], PersonRecord>>
    >("statusFilter");
  statusCellTpl =
    viewChild<TemplateRef<CellContext<PersonRecord, unknown>>>("statusCell");

  toggleStatus(
    current: CertStatus[] | undefined,
    option: CertStatus,
    on: boolean,
  ): CertStatus[] | undefined {
    const next = on
      ? [...(current ?? []), option]
      : (current ?? []).filter((s) => s !== option);
    return next.length ? next : undefined;
  }

  columns = computed<TediColumnDef<PersonRecord>[]>(() => [
    {
      id: "name",
      header: "Nimi",
      accessorKey: "name",
      sortable: true,
      filterable: true,
      filterFn: "includesString",
      filterTemplate: this.textFilterTpl() ?? undefined,
    } as TediColumnDef<PersonRecord>,
    {
      id: "jobStart",
      header: "Töökoht",
      accessorKey: "jobStart",
      sortable: true,
      filterable: true,
      filterFn: "includesString",
      filterTemplate: this.textFilterTpl() ?? undefined,
    } as TediColumnDef<PersonRecord>,
    {
      id: "age",
      header: "Vanus",
      accessorKey: "age",
      sortable: true,
      sortingFn: "alphanumeric",
    },
    {
      id: "visits",
      header: "Külastused",
      accessorKey: "visits",
      sortable: true,
      sortingFn: "alphanumeric",
    },
    {
      id: "status",
      header: "Tõendi staatus",
      accessorKey: "status",
      sortable: true,
      filterable: true,
      filterFn: "arrIncludesSome",
      filterTemplate: this.statusFilterTpl() ?? undefined,
      cell: this.statusCellTpl() ?? "",
    } as TediColumnDef<PersonRecord>,
  ]);
}

export const Filters: Story = {
  args: { maxHeight: 480 },
  render: (args) => ({
    moduleMetadata: { imports: [FiltersStoryHostComponent] },
    props: args,
    template: `<tedi-filters-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'The page-size dropdown includes a **"Show all"** option, built with the ' +
          "`{ value, label }` form of `pageSizeOptions`. Its `value` is the page " +
          "size used when the option is picked, so make it large enough to hold " +
          "every row: when you know the row total, pass it (here `data.length`); " +
          "when you don't, pass `Number.MAX_SAFE_INTEGER`. Either way the table " +
          "renders all rows on one page and the pager collapses — filtering only " +
          "shrinks the row count, so a large page size always fits the result.",
      },
      source: {
        language: "html",
        code: `<!-- Opt a column into the built-in filter popover with
  filterable: true (or filterable: clearOnClose true). Pass the input
  UI through filterTemplate. The table renders the trigger button,
  positions the popover, owns the draft state, and renders translated
  Apply / Clear buttons in the footer.

  columns:
    id 'name'   header 'Nimi'   sortable filterable filterFn 'includesString'
    id 'status' header 'Tõendi staatus' sortable filterable filterFn 'arrIncludesSome'

  pagination — a "Show all" page size is just a { value, label } option whose
  value is large enough to hold every row. Use the row total when you know it
  (data.length), or Number.MAX_SAFE_INTEGER when you don't:
    pagination = {
      pageSize: 10,
      pageSizeOptions: [10, 25, { value: data.length, label: 'Näita kõiki' }],
    };
-->
<tedi-table
  [data]="data"
  [columns]="columns"
  [pagination]="pagination"
  [maxHeight]="480"
/>

<ng-template #textFilter let-ctx>
  <tedi-form-field size="small">
    <input
      tedi-text-field
      type="text"
      [value]="ctx.value ?? ''"
      (input)="ctx.setValue($any($event.target).value)"
      [attr.aria-label]="ctx.column.columnDef.header"
    />
  </tedi-form-field>
</ng-template>

<ng-template #statusFilter let-ctx>
  @for (option of certStatuses; track option) {
    <label>
      <input
        tedi-checkbox
        type="checkbox"
        [checked]="(ctx.value ?? []).includes(option)"
        (change)="ctx.setValue(toggleStatus(ctx.value, option, $any($event.target).checked))"
      />
      <span>{{ option }}</span>
    </label>
  }
</ng-template>`,
      },
    },
  },
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
      ${TABLE_APPEARANCE_BINDINGS}
    />
    <ng-template #statusCell let-ctx>
      <tedi-status-badge
        [color]="statusColor[ctx.row.original.status]"
        [text]="ctx.row.original.status"
      />
    </ng-template>
  `,
})
class CollapsibleRowsStoryHostComponent extends TableStoryHostBase {
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
  render: (args) => ({
    moduleMetadata: { imports: [CollapsibleRowsStoryHostComponent] },
    props: args,
    template: `<tedi-collapsible-rows-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- Provide [getSubRows] so the table can build the expansion tree.
  An expand toggle is rendered automatically in the first column for
  rows that have sub-rows.
  getSubRows = (row) => row.subRows
-->
<tedi-table
  [data]="data"
  [columns]="columns"
  [getSubRows]="getSubRows"
  [pagination]="pagination"
/>

<ng-template #statusCell let-ctx>
  <tedi-status-badge
    [color]="statusColor[ctx.row.original.status]"
    [text]="ctx.row.original.status"
  />
</ng-template>`,
      },
    },
  },
};

// ---------- CollapsibleRowsRowTrigger ----------
@Component({
  standalone: true,
  selector: "tedi-collapsible-rows-row-trigger-story",
  imports: [TediTableComponent, StatusBadgeComponent],
  template: `
    <tedi-table
      id="tedi-table-collapse-row-trigger"
      [data]="data"
      [columns]="columns()"
      [getSubRows]="getSubRows"
      [expandButtonVariant]="'default'"
      [pagination]="pagination"
      ${TABLE_APPEARANCE_BINDINGS}
    />
    <ng-template #statusCell let-ctx>
      <tedi-status-badge
        [color]="statusColor[ctx.row.original.status]"
        [text]="ctx.row.original.status"
      />
    </ng-template>
  `,
})
class CollapsibleRowsRowTriggerStoryHostComponent extends TableStoryHostBase {
  data = collapsiblePeople;
  pagination = DEFAULT_PAGINATION;
  statusColor = certStatusColor;
  getSubRows = (row: CollapsibleRecord) => row.subRows;
  statusCellTpl =
    viewChild<TemplateRef<CellContext<CollapsibleRecord, unknown>>>(
      "statusCell",
    );

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

export const CollapsibleRowsRowTrigger: Story = {
  args: { expandTrigger: "row", rowHover: true },
  render: (args) => ({
    moduleMetadata: { imports: [CollapsibleRowsRowTriggerStoryHostComponent] },
    props: args,
    template: `<tedi-collapsible-rows-row-trigger-story ${argsToTemplate(
      args,
    )} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- expandTrigger="row" lets a click anywhere on the row toggle
  expansion. Here the chevron uses the neutral (borderless) "default"
  arrow style via [expandButtonVariant]="'default'" — it acts as a
  visual indicator while the whole row is the clickable target. Drop
  the input to keep the bordered "secondary" chevron (the default).
  Hover styling is automatic with expandTrigger="row"; bind [rowHover]
  only to override it ([rowHover]="false" suppresses it).
-->
<tedi-table
  expandTrigger="row"
  [data]="data"
  [columns]="columns"
  [getSubRows]="getSubRows"
  [expandButtonVariant]="'default'"
  [pagination]="pagination"
/>`,
      },
    },
  },
};

// ---------- CollapsibleRowsLabeledToggle ----------
@Component({
  standalone: true,
  selector: "tedi-collapsible-rows-labeled-toggle-story",
  imports: [TediTableComponent, StatusBadgeComponent],
  template: `
    <tedi-table
      id="tedi-table-collapse-labeled"
      [data]="data"
      [columns]="columns()"
      [getSubRows]="getSubRows"
      [expandButtonLabel]="{ open: 'Näita', close: 'Peida' }"
      [pagination]="pagination"
      ${TABLE_APPEARANCE_BINDINGS}
    />
    <ng-template #statusCell let-ctx>
      <tedi-status-badge
        [color]="statusColor[ctx.row.original.status]"
        [text]="ctx.row.original.status"
      />
    </ng-template>
  `,
})
class CollapsibleRowsLabeledToggleStoryHostComponent extends TableStoryHostBase {
  data = collapsiblePeople;
  pagination = DEFAULT_PAGINATION;
  statusColor = certStatusColor;
  getSubRows = (row: CollapsibleRecord) => row.subRows;
  statusCellTpl =
    viewChild<TemplateRef<CellContext<CollapsibleRecord, unknown>>>(
      "statusCell",
    );

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

export const CollapsibleRowsLabeledToggle: Story = {
  render: (args) => ({
    moduleMetadata: {
      imports: [CollapsibleRowsLabeledToggleStoryHostComponent],
    },
    props: args,
    template: `<tedi-collapsible-rows-labeled-toggle-story ${argsToTemplate(
      args,
    )} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- expandButtonLabel switches the expand toggle from an icon-only
  button to a visible text + chevron button. Pass a single string to
  use one label for both states, or { open, close } for distinct
  collapsed / expanded labels (open = shown while collapsed). The
  expand column widens automatically to fit the label.
  expandButtonVariant can still override the chevron style when no
  label is set (icon-only mode).
-->
<tedi-table
  [data]="data"
  [columns]="columns"
  [getSubRows]="getSubRows"
  [expandButtonLabel]="{ open: 'Näita', close: 'Peida' }"
/>`,
      },
    },
  },
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
      [pagination]="pagination"
      ${TABLE_APPEARANCE_BINDINGS}
    />
    <ng-template #personName let-ctx>
      <a tedi-link href="#" (click)="$event.preventDefault()">{{ ctx.row.original.name }}</a>
    </ng-template>
    <ng-template #personStatus let-ctx>
      <tedi-status-badge
        [color]="statusColor[ctx.row.original.status]"
        [text]="ctx.row.original.status"
        [variant]="ctx.row.getIsSelected() ? 'filled-bordered' : 'filled'"
      />
    </ng-template>
  `,
})
class SelectableRowsStoryHostComponent extends TableStoryHostBase {
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
  args: { enableRowSelection: true, selectedRowHighlight: false },
  render: (args) => ({
    moduleMetadata: { imports: [SelectableRowsStoryHostComponent] },
    props: args,
    template: `<tedi-selectable-rows-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- Default selectionMode is 'multiple' — checkbox per row plus
  a select-all checkbox in the header. Pass a predicate
  (row) => boolean to enableRowSelection to allow only some rows.
  The status cell reacts to per-row selection via ctx.row.getIsSelected()
  — bordering the badge while the row is selected.
-->
<tedi-table
  [data]="data"
  [columns]="columns"
  [enableRowSelection]="true"
  [selectedRowHighlight]="false"
  [pagination]="pagination"
/>

<ng-template #personStatus let-ctx>
  <tedi-status-badge
    [color]="statusColor[ctx.row.original.status]"
    [text]="ctx.row.original.status"
    [variant]="ctx.row.getIsSelected() ? 'filled-bordered' : 'filled'"
  />
</ng-template>`,
      },
    },
  },
};

export const SingleSelectableRows: Story = {
  args: { enableRowSelection: true, selectionMode: "single" },
  render: (args) => ({
    moduleMetadata: { imports: [SelectableRowsStoryHostComponent] },
    props: args,
    template: `<tedi-selectable-rows-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Pass `selectionMode: 'single'` to swap the checkbox column for " +
          "radios. Picking a row auto-deselects the previously selected one " +
          "(via TanStack's `enableMultiRowSelection: false` + native HTML " +
          "radio-group behaviour) and the header's select-all control is " +
          "omitted entirely.",
      },
      source: {
        language: "html",
        code: `<!-- selectionMode 'single' renders radios per row, shares one
  HTML name so picking a row auto-deselects siblings, and drops
  the header select-all control. The status cell borders its badge
  while the row is selected via ctx.row.getIsSelected().
-->
<tedi-table
  [data]="data"
  [columns]="columns"
  [enableRowSelection]="true"
  selectionMode="single"
  [pagination]="pagination"
/>

<ng-template #personStatus let-ctx>
  <tedi-status-badge
    [color]="statusColor[ctx.row.original.status]"
    [text]="ctx.row.original.status"
    [variant]="ctx.row.getIsSelected() ? 'filled-bordered' : 'filled'"
  />
</ng-template>`,
      },
    },
  },
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
      #table
      id="tedi-table-clickable"
      [data]="data"
      [columns]="columns()"
      [activeRowId]="active()?.id ?? activeRowId()"
      (rowClick)="onClick($event)"
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
      [placeholderRole]="placeholderRole()"
    />
    <ng-template #personStatus let-ctx>
      <tedi-status-badge
        [color]="statusColor[ctx.row.original.status]"
        [text]="ctx.row.original.status"
        [variant]="
          active()?.id === ctx.row.id || table.hoveredRowId() === ctx.row.id
            ? 'filled-bordered'
            : 'filled'
        "
      />
    </ng-template>
  `,
})
class ClickableRowsStoryHostComponent extends TableStoryHostBase {
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
  args: { interactive: true, rowHover: true },
  render: (args) => ({
    moduleMetadata: { imports: [ClickableRowsStoryHostComponent] },
    props: args,
    template: `<tedi-clickable-rows-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- [interactive]="true" gives rows role=button, tabindex, and
  keyboard activation. Subscribe to (rowClick) to react to clicks.
  [activeRowId] highlights the row whose id matches. The status cell
  borders its badge for the active OR hovered row — read the table's
  exposed hoveredRowId() signal via a #table template ref. Hover
  styling is automatic with [interactive]; bind [rowHover] only to
  override it ([rowHover]="false" suppresses it).
-->
<tedi-table
  #table
  [data]="data"
  [columns]="columns"
  [interactive]="true"
  [activeRowId]="active()?.id"
  (rowClick)="onClick($event)"
  [pagination]="pagination"
/>

<ng-template #personStatus let-ctx>
  <tedi-status-badge
    [color]="statusColor[ctx.row.original.status]"
    [text]="ctx.row.original.status"
    [variant]="
      active()?.id === ctx.row.id || table.hoveredRowId() === ctx.row.id
        ? 'filled-bordered'
        : 'filled'
    "
  />
</ng-template>`,
      },
    },
  },
};

// ---------- CollapsibleClickableRows ----------
@Component({
  standalone: true,
  selector: "tedi-collapsible-clickable-rows-story",
  imports: [TediTableComponent, StatusBadgeComponent],
  template: `
    <p style="margin-bottom: 10px;">
      {{
        active()
          ? "You clicked " + active()!.name
          : "Click a row to select it. Click the chevron or the row itself to expand."
      }}
    </p>
    <tedi-table
      #table
      id="tedi-table-collapsible-clickable"
      [data]="data"
      [columns]="columns()"
      [getSubRows]="getSubRows"
      [interactive]="true"
      [activeRowId]="active()?.id"
      (rowClick)="onClick($event)"
      [pagination]="pagination"
      ${TABLE_APPEARANCE_BINDINGS}
    />
    <ng-template #statusCell let-ctx>
      <tedi-status-badge
        [color]="statusColor[ctx.row.original.status]"
        [text]="ctx.row.original.status"
        [variant]="
          active()?.id === ctx.row.id || table.hoveredRowId() === ctx.row.id
            ? 'filled-bordered'
            : 'filled'
        "
      />
    </ng-template>
  `,
})
class CollapsibleClickableRowsStoryHostComponent extends TableStoryHostBase {
  data = collapsiblePeople;
  pagination = DEFAULT_PAGINATION;
  statusColor = certStatusColor;
  active = signal<CollapsibleRecord | null>(null);

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

  onClick(row: Row<CollapsibleRecord>) {
    // Only update active row if the click is not on the expand toggle
    this.active.set({ ...row.original, id: row.id });
  }
}

export const CollapsibleClickableRows: Story = {
  args: { interactive: true, rowHover: true },
  render: (args) => ({
    moduleMetadata: { imports: [CollapsibleClickableRowsStoryHostComponent] },
    props: args,
    template: `<tedi-collapsible-clickable-rows-story ${argsToTemplate(
      args,
    )} />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Combines [getSubRows] (collapsible / tree data) with " +
          "interactive = true for clickable rows. Rows that have sub-rows show " +
          "an expand chevron and respond to clicks in two ways: clicking the chevron " +
          "toggles expansion, while clicking anywhere else on the row activates it " +
          "(shown via [activeRowId]). The status cell borders its badge for both the " +
          "active and hovered rows — read the table's exposed hoveredRowId() signal via a " +
          "#table template ref.",
      },
      source: {
        language: "html",
        code: `<!-- [getSubRows] builds an expansion tree so rows with sub-rows
  show an expand chevron. [interactive]="true" makes every row act like a
  button (role=button, tabindex, Enter/Space). [activeRowId] pins the
  clicked row visually — it stays highlighted while a side pane shows
  its content. The status cell borders its badge for the active OR
  hovered row — read the table's exposed hoveredRowId() signal via a
  #table template ref.
-->
<tedi-table
  #table
  [data]="data"
  [columns]="columns"
  [getSubRows]="getSubRows"
  [interactive]="true"
  [activeRowId]="active()?.id"
  (rowClick)="onClick($event)"
  [pagination]="pagination"
/>

<ng-template #statusCell let-ctx>
  <tedi-status-badge
    [color]="statusColor[ctx.row.original.status]"
    [text]="ctx.row.original.status"
    [variant]="
      active()?.id === ctx.row.id || table.hoveredRowId() === ctx.row.id
        ? 'filled-bordered'
        : 'filled'
    "
  />
</ng-template>`,
      },
    },
  },
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
      [pagination]="pagination"
      ${TABLE_APPEARANCE_BINDINGS}
    />
  `,
})
class StripedStoryHostComponent extends TableStoryHostBase {
  data = people;
  columns = personColumns;
  pagination = DEFAULT_PAGINATION;
}

export const Striped: Story = {
  args: { striped: true },
  render: (args) => ({
    moduleMetadata: { imports: [StripedStoryHostComponent] },
    props: args,
    template: `<tedi-striped-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<tedi-table
  [data]="data"
  [columns]="columns"
  striped
  [pagination]="pagination"
/>`,
      },
    },
  },
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
        [pagination]="pagination"
        ${TABLE_APPEARANCE_BINDINGS}
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
class StickyFirstColumnStoryHostComponent extends TableStoryHostBase {
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
  args: { stickyFirstColumn: true },
  render: (args) => ({
    moduleMetadata: { imports: [StickyFirstColumnStoryHostComponent] },
    props: args,
    template: `<tedi-sticky-first-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- Add 'stickyFirstColumn' to freeze the leftmost column during
  horizontal scroll. Column widths come from each column's 'size'.
-->
<tedi-table
  [data]="data"
  [columns]="columns"
  stickyFirstColumn
  [pagination]="pagination"
/>`,
      },
    },
  },
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
      ${TABLE_APPEARANCE_BINDINGS}
    />
  `,
})
class StickyHeaderStoryHostComponent extends TableStoryHostBase {
  data = people;
  columns = personColumns;
}

export const StickyHeader: Story = {
  args: { stickyHeader: true, maxHeight: 480 },
  render: (args) => ({
    moduleMetadata: { imports: [StickyHeaderStoryHostComponent] },
    props: args,
    template: `<tedi-sticky-header-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- 'stickyHeader' pins thead during vertical scroll.
  Requires [maxHeight] so the body can scroll independently.
-->
<tedi-table
  [data]="data"
  [columns]="columns"
  stickyHeader
  [maxHeight]="240"
/>`,
      },
    },
  },
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
        ${TABLE_APPEARANCE_BINDINGS}
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
class StickyHeaderAndFirstColumnStoryHostComponent extends TableStoryHostBase {
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
  args: { stickyFirstColumn: true, stickyHeader: true, maxHeight: 480 },
  render: (args) => ({
    moduleMetadata: { imports: [StickyHeaderAndFirstColumnStoryHostComponent] },
    props: args,
    template: `<tedi-sticky-both-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- Combine 'stickyHeader' and 'stickyFirstColumn'. The corner
  cell stays pinned in both axes during scroll.
-->
<tedi-table
  [data]="data"
  [columns]="columns"
  stickyHeader
  stickyFirstColumn
  [maxHeight]="280"
/>`,
      },
    },
  },
};

// ---------- ClickableStickyFirstColumn ----------
@Component({
  standalone: true,
  selector: "tedi-clickable-sticky-story",
  imports: [TediTableComponent],
  template: `
    <p style="margin-bottom: 10px;">
      {{ active() ? "You clicked " + active()!.name : "Click or focus a row." }}
    </p>
    <div style="width: 100%;">
      <tedi-table
        id="tedi-table-clickable-sticky"
        [data]="data"
        [columns]="columns()"
        [rowAriaLabel]="rowAriaLabel"
        (rowClick)="onClick($event)"
        ${TABLE_APPEARANCE_BINDINGS}
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
class ClickableStickyFirstColumnStoryHostComponent extends TableStoryHostBase {
  data = stickyDoctors;
  active = signal<StickyDoctor | null>(null);
  nameCellTpl =
    viewChild<TemplateRef<CellContext<StickyDoctor, unknown>>>("nameCell");

  rowAriaLabel = (row: Row<StickyDoctor>) => `Ava arst ${row.original.name}`;

  onClick(row: Row<StickyDoctor>) {
    this.active.set(row.original);
  }

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
  ]);
}

export const ClickableStickyFirstColumn: Story = {
  args: {
    interactive: true,
    rowHover: true,
    stickyFirstColumn: true,
    stickyHeader: true,
    maxHeight: 400,
  },
  render: (args) => ({
    moduleMetadata: { imports: [ClickableStickyFirstColumnStoryHostComponent] },
    props: args,
    template: `<tedi-clickable-sticky-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- Interactive rows + stickyFirstColumn. The keyboard focus ring is
  redrawn on the pinned first column (its opaque background would
  otherwise cover the row's outline). Supply [rowAriaLabel] so each
  role=button row gets a concise accessible name instead of its full
  cell text.
-->
<tedi-table
  [data]="data"
  [columns]="columns"
  interactive
  stickyFirstColumn
  stickyHeader
  [maxHeight]="400"
  [rowAriaLabel]="rowAriaLabel"
  (rowClick)="onClick($event)"
/>`,
      },
    },
  },
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
      ${TABLE_APPEARANCE_BINDINGS}
    />
    <ng-template #emptyTpl>
      <tedi-empty-state type="inside" icon="spa" iconColor="tertiary">
        No results found
      </tedi-empty-state>
    </ng-template>
  `,
})
class WithEmptyStateStoryHostComponent extends TableStoryHostBase {
  empty: Person[] = [];
  columns = personColumns;
}

export const WithEmptyState: Story = {
  args: { placeholderRole: "status" },
  render: (args) => ({
    moduleMetadata: { imports: [WithEmptyStateStoryHostComponent] },
    props: args,
    template: `<tedi-empty-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- Provide a [placeholder] template that the table renders when
  data is empty. placeholderRole sets the ARIA live region role
  ('status' = polite, 'alert' = assertive).
-->
<tedi-table
  [data]="empty"
  [columns]="columns"
  [placeholder]="emptyTpl"
  placeholderRole="status"
/>

<ng-template #emptyTpl>
  <tedi-empty-state type="inside" icon="spa" iconColor="tertiary">
    No results found
  </tedi-empty-state>
</ng-template>`,
      },
    },
  },
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
      ${TABLE_APPEARANCE_BINDINGS}
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
class LongTextsStoryHostComponent extends TableStoryHostBase {
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
      text.slice(0, LongTextsStoryHostComponent.TRUNCATE_LENGTH).trim() +
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
  render: (args) => ({
    moduleMetadata: { imports: [LongTextsStoryHostComponent] },
    props: args,
    template: `<tedi-long-texts-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- Constrain a column with 'size' and let the cell template
  decide whether to truncate or render the full text via a
  per-row 'expanded' set.
-->
<tedi-table
  [data]="data"
  [columns]="columns"
  [pagination]="pagination"
/>

<ng-template #descCell let-ctx>
  @let expanded = expandedDescriptions().has(ctx.row.original.id);
  <span style="display:inline-block; max-width: 480px;">
    @if (expanded) {
      {{ description }}
      <a tedi-link href="#" (click)="toggleDescription(ctx.row.original.id); $event.preventDefault()">
        Näita vähem
      </a>
    } @else {
      {{ truncate(description) }}
      <a tedi-link href="#" (click)="toggleDescription(ctx.row.original.id); $event.preventDefault()">
        Näita rohkem
      </a>
    }
  </span>
</ng-template>`,
      },
    },
  },
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
      ${TABLE_APPEARANCE_BINDINGS}
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
class ActionsStoryHostComponent extends TableStoryHostBase {
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
  render: (args) => ({
    moduleMetadata: { imports: [ActionsStoryHostComponent] },
    props: args,
    template: `<tedi-actions-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- The 'actions' column has size:1 so it shrinks to the action
  button's intrinsic width. The cell template renders a dropdown
  with row-scoped action items.
-->
<tedi-table
  [data]="data"
  [columns]="columns"
  [pagination]="pagination"
/>

<ng-template #actions let-ctx>
  <tedi-dropdown position="bottom-end">
    <button
      tedi-button
      tedi-dropdown-trigger
      variant="secondary"
      size="small"
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
</ng-template>`,
      },
    },
  },
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
      ${TABLE_APPEARANCE_BINDINGS}
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
class CustomStoryHostComponent extends TableStoryHostBase {
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
  render: (args) => ({
    moduleMetadata: { imports: [CustomStoryHostComponent] },
    props: args,
    template: `<tedi-custom-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- Cell templates can render arbitrary content: avatar circles,
  inline alerts, popovers triggered from per-row buttons, etc.
-->
<tedi-table
  [data]="data"
  [columns]="columns"
  [pagination]="pagination"
/>

<ng-template #nameCell let-ctx>
  <div style="display:flex; align-items:center; gap:12px;">
    <span aria-hidden="true" class="avatar">
      {{ initials(ctx.row.original.name) }}
    </span>
    <div>
      <div>{{ ctx.row.original.name }}</div>
      <div>{{ ctx.row.original.specialty }}</div>
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
  <tedi-popover>
    <button
      tedi-popover-trigger
      tedi-info-button
      [attr.aria-label]="ctx.row.original.name + ' eelvaade'"
    ></button>
    <tedi-popover-content>
      <div>{{ ctx.row.original.name }}</div>
      <div>{{ ctx.row.original.specialty }} · {{ ctx.row.original.location }}</div>
    </tedi-popover-content>
  </tedi-popover>
</ng-template>`,
      },
    },
  },
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
      ${TABLE_APPEARANCE_BINDINGS}
    />
    <ng-template #salaryCell let-ctx>
      {{ format(ctx.row.original.salary) }}
    </ng-template>
    <ng-template #salaryFooter>Total €{{ totalLabel() }}</ng-template>
  `,
})
class WithFooterStoryHostComponent extends TableStoryHostBase {
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
  render: (args) => ({
    moduleMetadata: { imports: [WithFooterStoryHostComponent] },
    props: args,
    template: `<tedi-footer-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- Each column may declare a 'footer' as a string or a TemplateRef.
  columns = [
    id: 'name', header: 'Name', accessorKey: 'name', footer: '28 people',
    id: 'role', header: 'Role', accessorKey: 'role',
    id: 'location', header: 'Location', accessorKey: 'location',
    id: 'salary', header: 'Salary (€)', accessorKey: 'salary',
      meta: align right, cell: salaryCellTpl, footer: salaryFooterTpl,
  ]
-->
<tedi-table
  [data]="data"
  [columns]="columns"
  [pagination]="pagination"
/>

<ng-template #salaryFooter>Total €{{ totalLabel() }}</ng-template>`,
      },
    },
  },
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
      ${TABLE_APPEARANCE_BINDINGS}
    >
      <tedi-table-toolbar>
        <tedi-table-columns-menu />
      </tedi-table-toolbar>
    </tedi-table>
  `,
})
class WithColumnsMenuStoryHostComponent extends TableStoryHostBase {
  data = people;
  columns = personColumns;
  pagination = DEFAULT_PAGINATION;
}

export const WithColumnsMenu: Story = {
  render: (args) => ({
    moduleMetadata: { imports: [WithColumnsMenuStoryHostComponent] },
    props: args,
    template: `<tedi-columns-menu-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- Project a <tedi-table-toolbar> with the built-in
  <tedi-table-columns-menu> to let users toggle column visibility.
-->
<tedi-table
  [data]="data"
  [columns]="columns"
  [pagination]="pagination"
>
  <tedi-table-toolbar>
    <tedi-table-columns-menu />
  </tedi-table-toolbar>
</tedi-table>`,
      },
    },
  },
};

// ---------- ReorderableRows ----------
@Component({
  standalone: true,
  selector: "tedi-reorderable-rows-story",
  imports: [TediTableComponent],
  template: `
    <div style="
      color: var(--general-text-secondary);
      margin-bottom: 16px;
      font-size: var(--body-small-regular-size);
    ">
      <p style="margin: 0 0 8px;">
        Reorder rows two ways — both emit <code>(rowDrop)</code>; this story
        applies it with CDK's <code>moveItemInArray</code> and pipes the new
        array back via <code>[data]</code>:
      </p>
      <ul style="margin: 0; padding-left: 20px;">
        <li><strong>Mouse:</strong> drag any row by its handle.</li>
        <li>
          <strong>Keyboard:</strong> <code>Tab</code> to a row's handle,
          <code>Space</code>/<code>Enter</code> to pick it up,
          <code>↑</code>/<code>↓</code> to move (within the page),
          <code>Space</code>/<code>Enter</code> to drop,
          <code>Escape</code> to cancel.
        </li>
      </ul>
    </div>
    <tedi-table
      id="tedi-table-reorderable-rows"
      [data]="rows()"
      [columns]="columns"
      [reorderableRows]="true"
      [pagination]="pagination"
      (rowDrop)="onRowDrop($event)"
      ${TABLE_APPEARANCE_BINDINGS}
    />
  `,
})
class ReorderableRowsStoryHostComponent extends TableStoryHostBase {
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

export const ReorderableRows: Story = {
  render: (args) => ({
    moduleMetadata: { imports: [ReorderableRowsStoryHostComponent] },
    props: args,
    template: `<tedi-reorderable-rows-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "`reorderableRows` enables row reordering by **mouse drag and " +
          "keyboard** together — drag a row by its handle, or `Tab` to the " +
          "handle, `Space`/`Enter` to pick up, Up/Down to move (clamped to the " +
          "current page), `Space`/`Enter` to drop, `Escape` to cancel. Every " +
          "move emits `(rowDrop)` with source `data` indices — apply it with " +
          "`moveItemInArray` and feed the array back via `[data]`. The picked-up " +
          "row is highlighted and the handle exposes `aria-pressed`; a live " +
          "region announces pickup, move, drop and cancel.",
      },
      source: {
        language: "html",
        code: `<!-- reorderableRows = mouse drag + keyboard, in one input.
  Emits (rowDrop); the consumer reorders its data array (e.g. via
  CDK's moveItemInArray) and feeds it back through [data].
-->
<tedi-table
  [data]="rows()"
  [columns]="columns"
  [reorderableRows]="true"
  [pagination]="pagination"
  (rowDrop)="onRowDrop($event)"
/>`,
      },
    },
  },
};

// ---------- ReorderableColumns ----------
@Component({
  standalone: true,
  selector: "tedi-reorderable-columns-story",
  imports: [TediTableComponent],
  template: `
    <div style="
      color: var(--general-text-secondary);
      margin-bottom: 16px;
      font-size: var(--body-small-regular-size);
    ">
      <p style="margin: 0 0 8px;">
        Reorder columns two ways — both update the table's own
        <code>columnOrder</code> state internally:
      </p>
      <ul style="margin: 0 0 8px; padding-left: 20px;">
        <li><strong>Mouse:</strong> drag any header cell by its handle.</li>
        <li>
          <strong>Keyboard:</strong> <code>Tab</code> to a header,
          <code>Space</code>/<code>Enter</code> to pick it up,
          <code>←</code>/<code>→</code> to move,
          <code>Space</code>/<code>Enter</code> to drop,
          <code>Escape</code> to cancel.
        </li>
      </ul>
      Persist the order across reloads by adding <code>'columnOrder'</code> to
      the <code>persist.include</code> list.
    </div>
    <tedi-table
      id="tedi-table-reorderable-cols"
      [data]="data"
      [columns]="columns"
      [reorderableColumns]="true"
      [pagination]="pagination"
      ${TABLE_APPEARANCE_BINDINGS}
    />
  `,
})
class ReorderableColumnsStoryHostComponent extends TableStoryHostBase {
  data = people;
  pagination = DEFAULT_PAGINATION;
  columns: TediColumnDef<Person>[] = [
    { id: "name", header: "Name", accessorKey: "name", size: 200 },
    { id: "email", header: "Email", accessorKey: "email", size: 260 },
    { id: "role", header: "Role", accessorKey: "role", size: 160 },
    { id: "location", header: "Location", accessorKey: "location", size: 160 },
  ];
}

export const ReorderableColumns: Story = {
  args: { stickyHeader: true, maxHeight: 480 },
  render: (args) => ({
    moduleMetadata: { imports: [ReorderableColumnsStoryHostComponent] },
    props: args,
    template: `<tedi-reorderable-columns-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "`reorderableColumns` enables column reordering by **mouse drag and " +
          "keyboard** together — drag a header cell by its handle, or `Tab` to " +
          "a header, `Space`/`Enter` to pick up, Left/Right to move, " +
          "`Space`/`Enter` to drop, `Escape` to cancel. Both update the table's " +
          "own `columnOrder` state internally. The picked-up cell gets " +
          "`aria-pressed=\"true\"` and a primary highlight, and a live region " +
          "announces pickup, drop, and cancel for screen readers.",
      },
      source: {
        language: "html",
        code: `<!-- reorderableColumns = mouse drag + keyboard, in one input.
  Updates the table's columnOrder internally. 'stickyHeader' pins
  thead during vertical scroll; requires [maxHeight]. Persist across
  reloads by adding 'columnOrder' to persist.include.
-->
<tedi-table
  [data]="data"
  [columns]="columns"
  reorderableColumns
  [stickyHeader]="true"
  [maxHeight]="480"
  [pagination]="pagination"
/>`,
      },
    },
  },
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
        [columns]="columns"
        [manualPagination]="true"
        [manualSorting]="true"
        [pageCount]="totalPages()"
        [rowCount]="total"
        [state]="tableState()"
        [pagination]="paginationOpts"
        (stateChange)="onState($event)"
        ${TABLE_APPEARANCE_BINDINGS}
      />
    </div>
  `,
})
class ServerSideStoryHostComponent extends TableStoryHostBase {
  source = people;
  total = people.length;
  paginationOpts = { pageSize: 5, pageSizeOptions: [5, 10, 25] };

  tableState = signal<Partial<TableState>>({
    pagination: { pageIndex: 0, pageSize: 5 },
    sorting: [],
  });
  page = signal<Person[]>(this.source.slice(0, 5));
  totalPages = signal<number>(Math.ceil(this.source.length / 5));

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

  columns: TediColumnDef<Person>[] = personColumns.map(
    (col) =>
      ({
        ...col,
        sortable: true,
      }) as TediColumnDef<Person>,
  );

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
  render: (args) => ({
    moduleMetadata: { imports: [ServerSideStoryHostComponent] },
    props: args,
    template: `<tedi-server-side-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      source: {
        language: "html",
        code: `<!-- Server-side pagination + sorting. The parent owns the current
  page slice and the sort state; the table is told manualPagination
  + manualSorting so it does not re-slice or re-sort the data array.
  Add manualFiltering the same way for column filters.

  Each column has sortable: true on its TediColumnDef so the built-in
  sort button shows up in every header — clicks fire (stateChange)
  with the new sort, the parent refetches.

  [data]         = current page only (not the full set)
  [pageCount]    = Math.ceil(total / pageSize)
  [rowCount]     = total row count (shown in 'X results')
  [state]        = parent-owned pagination + sorting state
  (stateChange)  = refetch + re-slice when paging or sort changes
-->
<tedi-table
  [data]="page()"
  [columns]="columns"
  [manualPagination]="true"
  [manualSorting]="true"
  [pageCount]="totalPages()"
  [rowCount]="total"
  [state]="tableState()"
  [pagination]="paginationOpts"
  (stateChange)="onState($event)"
/>`,
      },
    },
  },
};

// ---------- Pagination: top and bottom ----------
@Component({
  standalone: true,
  selector: "tedi-pagination-top-and-bottom-story",
  imports: [TediTableComponent],
  template: `
    <tedi-table
      id="tedi-table-pagination-top-and-bottom"
      [data]="data"
      [columns]="columns"
      [pagination]="pagination"
      [paginationTop]="paginationTop"
      ${TABLE_APPEARANCE_BINDINGS}
    />
  `,
})
class PaginationTopAndBottomStoryHostComponent extends TableStoryHostBase {
  data = bookings;
  columns: TediColumnDef<Booking>[] = [
    { id: "dateRange", header: "Kuupäev", accessorKey: "dateRange" },
    { id: "hour", header: "Kellaaeg", accessorKey: "hour" },
    { id: "duration", header: "Kestus", accessorKey: "duration" },
    { id: "location", header: "Asukoht", accessorKey: "location" },
  ];

  pagination = {
    pageSize: 5,
    pageSizeOptions: [5, 10, 25],
    hideResults: true,
    hidePageSize: true,
  };

  paginationTop = {
    hidePager: true,
  };
}

export const PaginationTopAndBottom: Story = {
  render: (args) => ({
    moduleMetadata: { imports: [PaginationTopAndBottomStoryHostComponent] },
    props: args,
    template: `<tedi-pagination-top-and-bottom-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Render a paginator above and below the table. Both slots share " +
          "page / page-size state but each has its own visual config. Here " +
          "the top slot shows the results count and page-size selector, " +
          "while the bottom slot shows only the pager.",
      },
      source: {
        language: "html",
        code: `<tedi-table
  [data]="data"
  [columns]="columns"
  [pagination]="{ pageSize: 5, pageSizeOptions: [5, 10, 25], hideResults: true, hidePageSize: true }"
  [paginationTop]="{ hidePager: true }"
/>`,
      },
    },
  },
};

// ---------- Pagination: custom results slot ----------
@Component({
  standalone: true,
  selector: "tedi-pagination-custom-results-story",
  imports: [TediTableComponent, TediPaginationResultsDirective],
  template: `
    <tedi-table
      id="tedi-table-pagination-custom-results"
      [data]="data"
      [columns]="columns"
      [pagination]="pagination"
      ${TABLE_APPEARANCE_BINDINGS}
    >
      <ng-template tediPaginationResults>1000+ kirjet</ng-template>
    </tedi-table>
  `,
})
class PaginationCustomResultsStoryHostComponent extends TableStoryHostBase {
  data = bookings;
  pagination = SHOWCASE_PAGINATION_3;
  columns: TediColumnDef<Booking>[] = [
    { id: "dateRange", header: "Kuupäev", accessorKey: "dateRange" },
    { id: "hour", header: "Kellaaeg", accessorKey: "hour" },
    { id: "duration", header: "Kestus", accessorKey: "duration" },
    { id: "location", header: "Asukoht", accessorKey: "location" },
  ];
}

export const PaginationCustomResults: Story = {
  render: (args) => ({
    moduleMetadata: { imports: [PaginationCustomResultsStoryHostComponent] },
    props: args,
    template: `<tedi-pagination-custom-results-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Replace the default `\"X results\"` label with arbitrary content " +
          "by projecting an `<ng-template tediPaginationResults>` inside " +
          "`<tedi-table>`. The table captures the template and routes it to " +
          "whichever paginator slot is currently displaying results.",
      },
      source: {
        language: "html",
        code: `<tedi-table
  [data]="data"
  [columns]="columns"
  [pagination]="{ pageSize: 3, pageSizeOptions: [3, 10, 25, 50] }"
>
  <ng-template tediPaginationResults>1000+ kirjet</ng-template>
</tedi-table>`,
      },
    },
  },
};

// ---------- Pagination: fully configured ----------
@Component({
  standalone: true,
  selector: "tedi-pagination-fully-configured-story",
  imports: [TediTableComponent],
  template: `
    <tedi-table
      id="tedi-table-pagination-fully-configured"
      [data]="data"
      [columns]="columns"
      [pagination]="pagination"
      ${TABLE_APPEARANCE_BINDINGS}
    />
  `,
})
class PaginationFullyConfiguredStoryHostComponent extends TableStoryHostBase {
  data = Array.from({ length: 80 }, (_, index) => ({
    ...bookings[index % bookings.length],
    id: String(index + 1),
  }));
  columns: TediColumnDef<Booking>[] = [
    { id: "dateRange", header: "Kuupäev", accessorKey: "dateRange" },
    { id: "hour", header: "Kellaaeg", accessorKey: "hour" },
    { id: "duration", header: "Kestus", accessorKey: "duration" },
    { id: "location", header: "Asukoht", accessorKey: "location" },
  ];

  pagination = {
    pageSize: 5,
    pageSizeOptions: [5, 10, 25, 50],
    boundaryCount: 2,
    siblingCount: 2,
    disableArrowsAtBoundary: true,
    hideArrows: "md" as const,
    labels: {
      results: (count: number) => `Kokku ${count} kirjet`,
      pageSize: "Ridu lehel",
    },
  };
}

export const PaginationFullyConfigured: Story = {
  render: (args) => ({
    moduleMetadata: { imports: [PaginationFullyConfiguredStoryHostComponent] },
    props: args,
    template: `<tedi-pagination-fully-configured-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "All `tedi-pagination` inputs are forwarded through " +
          "`TablePaginationOptions`. This example sets `boundaryCount: 2`, " +
          "`siblingCount: 2`, `disableArrowsAtBoundary`, " +
          "`hideArrows: 'md'` (arrows collapse below the `md` breakpoint), " +
          "and overrides the results / page-size labels.",
      },
      source: {
        language: "html",
        code: `<tedi-table
  [data]="data"
  [columns]="columns"
  [pagination]="{
    pageSize: 5,
    pageSizeOptions: [5, 10, 25, 50],
    boundaryCount: 2,
    siblingCount: 2,
    disableArrowsAtBoundary: true,
    hideArrows: 'md',
    labels: {
      results: (count) => \`Kokku \${count} kirjet\`,
      pageSize: 'Ridu lehel',
    },
  }"
/>`,
      },
    },
  },
};

// ---------- Responsive (hide columns below breakpoint, show as sub-row) ----------
@Component({
  standalone: true,
  selector: "tedi-responsive-story",
  imports: [
    TediTableComponent,
    TextGroupComponent,
    TextGroupLabelComponent,
    TextGroupValueComponent,
  ],
  styles: [
    `
      .tedi-responsive-story__hint {
        margin-bottom: var(--tedi-dimensions-10);
        color: var(--general-text-secondary);
        font-size: var(--body-small-regular-size);
      }

      .tedi-responsive-story__details {
        display: flex;
        flex-direction: column;
        gap: var(--layout-grid-gutters-08);
        padding: var(--tedi-dimensions-05) 0;
      }
    `,
  ],
  template: `
    <p class="tedi-responsive-story__hint">
      Resize the viewport across the <code>md</code> breakpoint to
      see the email / role / location columns collapse into an expandable
      sub-row. The expand column itself only appears below the breakpoint.
    </p>
    <tedi-table
      id="tedi-table-responsive"
      ${TABLE_APPEARANCE_BINDINGS}
      [data]="data"
      [columns]="columns"
      [state]="tableState()"
      (stateChange)="onState($event)"
      [renderSubComponent]="responsiveSubRow()"
      [getRowCanExpand]="getRowCanExpand"
      [pagination]="pagination"
    />
    <ng-template #details let-row>
      <div class="tedi-responsive-story__details">
        @for (col of hiddenColumns; track col.id) {
          <tedi-text-group type="horizontal" labelWidth="5rem">
            <tedi-text-group-label>{{ col.header }}</tedi-text-group-label>
            <tedi-text-group-value>{{
              row.original[col.key]
            }}</tedi-text-group-value>
          </tedi-text-group>
        }
      </div>
    </ng-template>
  `,
})
class ResponsiveStoryHostComponent extends TableStoryHostBase {
  private readonly breakpoint = inject(BreakpointService);
  protected readonly isBelowMd = this.breakpoint.isBelowBreakpoint("md");

  data = people;
  pagination = SHOWCASE_PAGINATION_3;

  /** Columns hidden when the viewport is below `md`. Visible everywhere else. */
  protected readonly hiddenColumns = [
    { id: "email", key: "email", header: "Email" },
    { id: "role", key: "role", header: "Role" },
    { id: "location", key: "location", header: "Location" },
  ] as const;

  columns: TediColumnDef<Person>[] = [
    { id: "name", header: "Name", accessorKey: "name", sortable: true },
    { id: "email", header: "Email", accessorKey: "email" },
    { id: "role", header: "Role", accessorKey: "role" },
    { id: "location", header: "Location", accessorKey: "location" },
    {
      id: "salary",
      header: "Salary",
      accessorKey: "salary",
      sortable: true,
      sortingFn: "alphanumeric",
    },
  ];

  protected readonly tableState = signal<Partial<TableState>>({});

  protected readonly detailsTpl =
    viewChild<TemplateRef<{ $implicit: Row<Person> }>>("details");

  /** Only project the sub-row template below `md`, so the expand column
   *  itself disappears at larger viewports. */
  protected readonly responsiveSubRow = computed(() =>
    this.isBelowMd() ? this.detailsTpl() : undefined,
  );

  /** Restrict expansion to viewports where there's actually hidden info. */
  protected readonly getRowCanExpand = () => this.isBelowMd();

  constructor() {
    super();
    // Keep the columnVisibility slice in sync with the breakpoint signal —
    // other state slices (sort / filter / pagination) are still managed via
    // the regular [state] / (stateChange) round-trip below.
    effect(() => {
      const below = this.isBelowMd();
      this.tableState.update((prev) => ({
        ...prev,
        columnVisibility: this.hiddenColumns.reduce<Record<string, boolean>>(
          (acc, c) => {
            acc[c.id] = !below;
            return acc;
          },
          {},
        ),
      }));
    });
  }

  protected onState(next: TableState): void {
    this.tableState.set(next);
  }
}

export const Responsive: Story = {
  render: (args) => ({
    moduleMetadata: { imports: [ResponsiveStoryHostComponent] },
    props: args,
    template: `<tedi-responsive-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Pattern for shrinking a wide table on small viewports: hide the " +
          "less-essential columns via `state.columnVisibility` and surface " +
          "their values inside a row-detail template projected through " +
          "`[renderSubComponent]`. Driven by `BreakpointService` — flipping " +
          "the `[renderSubComponent]` binding to `undefined` above the " +
          "breakpoint also removes the expand column entirely. Resize the " +
          "viewport across the `md` breakpoint to see it switch.",
      },
      source: {
        language: "html",
        code: `<!-- TS sketch:
  hiddenColumns = [{ id: 'email', key: 'email', header: 'Email' }, ...];
  isBelowMd = inject(BreakpointService).isBelowBreakpoint('md');
  responsiveSubRow = computed(() =>
    this.isBelowMd() ? this.detailsTpl() : undefined,
  );
  tableState = signal({});
  // effect: syncs columnVisibility with isBelowMd via state.columnVisibility
-->
<tedi-table
  [data]="data"
  [columns]="columns"
  [state]="tableState()"
  (stateChange)="onState($event)"
  [renderSubComponent]="responsiveSubRow()"
  [getRowCanExpand]="getRowCanExpand"
  [pagination]="pagination"
/>

<ng-template #details let-row>
  <div class="my-details">
    @for (col of hiddenColumns; track col.id) {
      <tedi-text-group type="horizontal" labelWidth="5rem">
        <tedi-text-group-label>{{ col.header }}</tedi-text-group-label>
        <tedi-text-group-value>{{ row.original[col.key] }}</tedi-text-group-value>
      </tedi-text-group>
    }
  </div>
</ng-template>`,
      },
    },
  },
};
