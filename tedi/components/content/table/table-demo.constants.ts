import { signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TediTableComponent } from "./table.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { IconComponent } from "../../base/icon/icon.component";
import { TextFieldComponent } from "../../form/text-field/text-field.component";
import { ClosingButtonComponent } from "../../buttons/closing-button/closing-button.component";
import { FormFieldComponent } from "../../form/form-field/form-field.component";
import { SelectComponent } from "../../form/select/select.component";
import { DateFieldComponent } from "../../form/date-field/date-field.component";
import { TimeFieldComponent } from "../../form/time-field/time-field.component";

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

// Inline-edit cell for a date range: the value is a `DateRange` object, edited
// with `tedi-date-field` in range mode. The read view formats via the host's
// `formatDateRange` reference.
function editableDateRangeCellTemplate(tplName = "dateRangeCell"): string {
  return `
<ng-template #${tplName} let-ctx>
  @if (editor.isEditing(ctx.row.original.id)) {
    <tedi-form-field size="small">
      <tedi-date-field
        [inputId]="'dateRange-' + ctx.row.original.id"
        size="small"
        mode="range"
        placeholder="pp.kk.aaaa – pp.kk.aaaa"
        [ngModel]="editor.draftValueRaw(ctx.row.original.id, 'dateRange')"
        (ngModelChange)="editor.setDraftValueRaw(ctx.row.original.id, 'dateRange', $event)"
      />
    </tedi-form-field>
  } @else {
    {{ formatDateRange(ctx.row.original.dateRange) }}
  }
</ng-template>`;
}

// Inline-edit cell for an `HH:mm` time string, edited with `tedi-time-field`.
function editableTimeCellTemplate(
  tplName: string,
  field: string,
): string {
  return `
<ng-template #${tplName} let-ctx>
  @if (editor.isEditing(ctx.row.original.id)) {
    <tedi-form-field size="small">
      <tedi-time-field
        [inputId]="'${field}-' + ctx.row.original.id"
        [ngModel]="editor.draftValueRaw(ctx.row.original.id, '${field}')"
        (ngModelChange)="editor.setDraftValueRaw(ctx.row.original.id, '${field}', $event)"
      />
    </tedi-form-field>
  } @else {
    {{ ctx.row.original.${field} }}
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
  editableDateRangeCellTemplate("dateRangeCell") +
  editableTimeCellTemplate("hourCell", "hour") +
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
  DateFieldComponent,
  TimeFieldComponent,
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
    // Typed accessors for non-string fields (e.g. a DateRange edited via
    // tedi-date-field) — the string variants above are only for text inputs.
    draftValueRaw: <K extends keyof T>(id: string, field: K): T[K] | null => {
      const d = draft();
      if (!d || d.id !== id) return null;
      return d[field];
    },
    setDraftValueRaw: <K extends keyof T>(
      id: string,
      field: K,
      value: T[K],
    ): void => {
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

// Sibling binding fragment so every story template can forward the base-class
// inputs to its <tedi-table> without repeating the property list.
const TABLE_APPEARANCE_BINDINGS = `
  [size]="size()"
  [striped]="striped()"
  [verticalBorders]="verticalBorders()"
  [borderless]="borderless()"
  [stickyFirstColumn]="stickyFirstColumn()"
  [stickyLastColumn]="stickyLastColumn()"
  [stickyHeader]="stickyHeader()"
  [fixedLayout]="fixedLayout()"
  [rowHover]="rowHover()"
  [interactive]="interactive()"
  [expandTrigger]="expandTrigger()"
  [enableRowSelection]="enableRowSelection()"
  [selectedRowHighlight]="selectedRowHighlight()"
  [selectionMode]="selectionMode()"
  [enableColumnFilters]="enableColumnFilters()"
  [rowGroupDividers]="rowGroupDividers()"
  [controlColumnOrder]="controlColumnOrder()"
  [filterModalBreakpoint]="filterModalBreakpoint()"
  [filterModalFullscreen]="filterModalFullscreen()"
  [maxHeight]="maxHeight()"
  [activeRowId]="activeRowId()"
  [placeholderRole]="placeholderRole()"
`.trim();

export {
  priceFormatter,
  initialsOf,
  LONG_DESCRIPTION,
  DEFAULT_PAGINATION,
  SHOWCASE_PAGINATION_3,
  SHOWCASE_PAGINATION_4,
  sortIconFor,
  ESTONIAN_COUNTIES,
  EDITABLE_ACTIONS_TEMPLATE,
  BOOKING_EDIT_TEMPLATES,
  EDIT_IMPORTS,
  createEditableRows,
  TABLE_APPEARANCE_BINDINGS,
};
