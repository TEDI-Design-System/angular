import { Component, signal, TemplateRef, viewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import type { CellContext, Row } from "@tanstack/angular-table";
import { TediTableComponent } from "./table.component";
import { TediTableColumnsMenuComponent } from "./table-columns-menu/table-columns-menu.component";
import { groupRowSpan } from "./row-span.utils";
import type {
  TableFilterOptions,
  TablePaginationOptions,
  TableState,
  TablePersistOptions,
  TediColumnDef,
  TediTableFilterContext,
} from "./table.types";
import { TextFieldComponent } from "../../form/text-field/text-field.component";
import { FormFieldComponent } from "../../form/form-field/form-field.component";
import { TediPaginationResultsDirective } from "../../navigation/pagination/pagination-results.directive";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { TediTranslationService } from "../../../services/translation/translation.service";

type Translator = (...args: unknown[]) => string;
const TRANSLATIONS: Record<string, Translator> = {
  "table.no-data": () => "No data",
  "table.row-details": () => "Row details",
  "table.filter-input": (col) => `Filter ${col ?? ""}`.trim(),
  "table.filter-placeholder": () => "Filter…",
  "table.filter-apply": () => "Apply",
  "table.filter-clear": () => "Clear",
  "table.filter-button-aria": (col) => `Filter ${col ?? ""}`.trim(),
  "table.columns": () => "Columns",
  "table.expand-row": () => "Expand row",
  "table.collapse-row": () => "Collapse row",
  "table.select-all": (selected) => (selected ? "Deselect all" : "Select all"),
  "table.select-row": (selected) => (selected ? "Deselect row" : "Select row"),
  "pagination.title": () => "Pagination",
  "pagination.prev-page": () => "Previous page",
  "pagination.next-page": () => "Next page",
  "pagination.page": (page, isCurrent) =>
    isCurrent ? `Current page, page ${page}` : `Go to page ${page}`,
  "pagination.results": (count) =>
    `${count} ${count === 1 ? "result" : "results"}`,
  "pagination.page-size": () => "Show per page",
  "pagination.page-status": (page, total) => `Page ${page} of ${total}`,
};

class TranslationMock {
  translate(key: string, ...args: unknown[]): string {
    const fn = TRANSLATIONS[key];
    return fn ? fn(...args) : key;
  }
  track(key: string) {
    return () => this.translate(key);
  }
}

interface Person {
  id: string;
  name: string;
  role: string;
  subRows?: Person[];
}

const data: Person[] = [
  { id: "1", name: "Anna", role: "Engineer" },
  { id: "2", name: "Jüri", role: "Designer" },
];

const columns: TediColumnDef<Person>[] = [
  { id: "name", header: "Name", accessorKey: "name" },
  { id: "role", header: "Role", accessorKey: "role" },
];

@Component({
  standalone: true,
  imports: [TediTableComponent],
  template: `
    <tedi-table
      [data]="data()"
      [columns]="columns()"
      [size]="size()"
      [striped]="striped()"
      [enableRowSelection]="enableRowSelection()"
      [enableColumnFilters]="enableColumnFilters()"
      [pagination]="pagination()"
      [paginationTop]="paginationTop()"
      [manualPagination]="manualPagination()"
      [manualSorting]="manualSorting()"
      [manualFiltering]="manualFiltering()"
      [pageCount]="pageCount()"
      [rowCount]="rowCount()"
      [renderSubComponent]="subTemplate()"
      [getSubRows]="getSubRows()"
      [interactive]="interactive()"
      [activeRowId]="activeRowId()"
      [selectedRowHighlight]="selectedRowHighlight()"
      [persist]="persist()"
      [state]="state()"
      [defaultState]="defaultState()"
      [placeholder]="placeholder()"
      [placeholderRole]="placeholderRole()"
      (stateChange)="onStateChange($event)"
      (rowClick)="onRowClick($event)"
    />
    <ng-template #sub let-row>
      <div class="sub-content">Sub for {{ row.id }}</div>
    </ng-template>
  `,
})
class HostComponent {
  readonly subTemplateRef = viewChild<TemplateRef<{ $implicit: Row<Person> }>>(
    "sub",
  );

  readonly data = signal<Person[]>(data);
  readonly columns =
    signal<TediColumnDef<Person>[]>(columns);
  readonly size = signal<"medium" | "small">("medium");
  readonly striped = signal(false);
  readonly enableRowSelection = signal<
    boolean | ((row: Row<Person>) => boolean) | undefined
  >(undefined);
  readonly enableColumnFilters = signal(false);
  readonly pagination = signal<boolean | TablePaginationOptions | undefined>(
    undefined,
  );
  readonly paginationTop = signal<boolean | TablePaginationOptions | undefined>(
    undefined,
  );
  readonly manualPagination = signal(false);
  readonly manualSorting = signal(false);
  readonly manualFiltering = signal(false);
  readonly pageCount = signal<number | undefined>(undefined);
  readonly rowCount = signal<number | undefined>(undefined);
  readonly subTemplate = signal<
    TemplateRef<{ $implicit: Row<Person> }> | undefined
  >(undefined);
  readonly getSubRows = signal<
    ((row: Person) => Person[] | undefined) | undefined
  >(undefined);
  readonly interactive = signal(false);
  readonly activeRowId = signal<string | undefined>(undefined);
  readonly selectedRowHighlight = signal(true);
  readonly persist = signal<TablePersistOptions | undefined>(undefined);
  readonly state = signal<Partial<TableState> | undefined>(undefined);
  readonly defaultState = signal<Partial<TableState> | undefined>(undefined);
  readonly placeholder = signal<string | undefined>(undefined);
  readonly placeholderRole = signal<"alert" | "status" | undefined>(undefined);

  readonly onStateChange = jest.fn();
  readonly onRowClick = jest.fn();
}

function setupHost(): ComponentFixture<HostComponent> {
  TestBed.configureTestingModule({
    imports: [HostComponent],
    providers: [
      { provide: TediTranslationService, useClass: TranslationMock },
      { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      provideNoopAnimations(),
    ],
  });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return fixture;
}

describe("TediTableComponent", () => {
  describe("rendering", () => {
    it("renders column headers and row data", () => {
      const fixture = setupHost();
      const html: string = fixture.nativeElement.textContent;
      expect(html).toContain("Name");
      expect(html).toContain("Role");
      expect(html).toContain("Anna");
      expect(html).toContain("Designer");
    });

    it("renders the default placeholder when data is empty", () => {
      const fixture = setupHost();
      fixture.componentInstance.data.set([]);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain("No data");
    });

    it("respects a custom placeholder string", () => {
      const fixture = setupHost();
      fixture.componentInstance.data.set([]);
      fixture.componentInstance.placeholder.set("Nothing here");
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain("Nothing here");
    });

    it("wraps the placeholder in a live region when placeholderRole is set", () => {
      const fixture = setupHost();
      fixture.componentInstance.data.set([]);
      fixture.componentInstance.placeholderRole.set("status");
      fixture.detectChanges();
      const region = fixture.nativeElement.querySelector('[role="status"]');
      expect(region).not.toBeNull();
    });
  });

  describe("sizes", () => {
    it("applies medium size class by default", () => {
      const fixture = setupHost();
      const host = fixture.debugElement.query(By.css("tedi-table"));
      expect(host.nativeElement.className).toContain("tedi-table--medium");
    });

    it("applies small size class when size=small", () => {
      const fixture = setupHost();
      fixture.componentInstance.size.set("small");
      fixture.detectChanges();
      const host = fixture.debugElement.query(By.css("tedi-table"));
      expect(host.nativeElement.className).toContain("tedi-table--small");
    });

    it("applies striped modifier when striped=true", () => {
      const fixture = setupHost();
      fixture.componentInstance.striped.set(true);
      fixture.detectChanges();
      const host = fixture.debugElement.query(By.css("tedi-table"));
      expect(host.nativeElement.className).toContain("tedi-table--striped");
    });
  });

  describe("selection", () => {
    it("renders a select-all checkbox when enableRowSelection is true", () => {
      const fixture = setupHost();
      fixture.componentInstance.enableRowSelection.set(true);
      fixture.detectChanges();
      const selectAll = fixture.nativeElement.querySelector(
        'input[aria-label="Select all"]',
      );
      expect(selectAll).not.toBeNull();
    });

    it("toggles all rows when select-all is checked", () => {
      const fixture = setupHost();
      fixture.componentInstance.enableRowSelection.set(true);
      fixture.detectChanges();
      const selectAll = fixture.nativeElement.querySelector(
        'input[aria-label="Select all"]',
      ) as HTMLInputElement;
      selectAll.click();
      fixture.detectChanges();
      const lastEmit = fixture.componentInstance.onStateChange.mock.calls.at(-1);
      expect(lastEmit?.[0].rowSelection).toEqual({ "0": true, "1": true });
    });

    it("adds .tedi-table__row--selected to selected rows by default", () => {
      const fixture = setupHost();
      fixture.componentInstance.enableRowSelection.set(true);
      fixture.detectChanges();
      const selectAll = fixture.nativeElement.querySelector(
        'input[aria-label="Select all"]',
      ) as HTMLInputElement;
      selectAll.click();
      fixture.detectChanges();
      const rows = Array.from(
        fixture.nativeElement.querySelectorAll(".tedi-table__row") as NodeListOf<
          HTMLTableRowElement
        >,
      );
      expect(rows.some((r) => r.classList.contains("tedi-table__row--selected"))).toBe(
        true,
      );
    });

    it("omits .tedi-table__row--selected when selectedRowHighlight is false", () => {
      const fixture = setupHost();
      fixture.componentInstance.enableRowSelection.set(true);
      fixture.componentInstance.selectedRowHighlight.set(false);
      fixture.detectChanges();
      const selectAll = fixture.nativeElement.querySelector(
        'input[aria-label="Select all"]',
      ) as HTMLInputElement;
      selectAll.click();
      fixture.detectChanges();
      const rows = Array.from(
        fixture.nativeElement.querySelectorAll(".tedi-table__row") as NodeListOf<
          HTMLTableRowElement
        >,
      );
      expect(
        rows.some((r) => r.classList.contains("tedi-table__row--selected")),
      ).toBe(false);
    });
  });

  describe("expansion", () => {
    it("renders an expand toggle column when renderSubComponent is set", () => {
      const fixture = setupHost();
      fixture.componentInstance.subTemplate.set(
        fixture.componentInstance.subTemplateRef()!,
      );
      fixture.detectChanges();
      const expandButton = fixture.nativeElement.querySelector(
        'button[aria-label="Expand row"]',
      );
      expect(expandButton).not.toBeNull();
    });

    it("renders the sub component when the expand toggle is clicked", () => {
      const fixture = setupHost();
      fixture.componentInstance.subTemplate.set(
        fixture.componentInstance.subTemplateRef()!,
      );
      fixture.detectChanges();
      const expandButton = fixture.nativeElement.querySelector(
        'button[aria-label="Expand row"]',
      ) as HTMLButtonElement;
      expandButton.click();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain("Sub for 0");
    });

    const nestedData: Person[] = Array.from({ length: 4 }, (_, i) => ({
      id: `r${i}`,
      name: `Root ${i}`,
      role: "Role",
      subRows: [
        { id: `r${i}-a`, name: `Child ${i}a`, role: "Role" },
        { id: `r${i}-b`, name: `Child ${i}b`, role: "Role" },
      ],
    }));

    function setupNested(): ComponentFixture<HostComponent> {
      const fixture = setupHost();
      fixture.componentInstance.data.set(nestedData);
      fixture.componentInstance.getSubRows.set((row) => row.subRows);
      fixture.componentInstance.pagination.set({ pageSize: 3 });
      fixture.detectChanges();
      return fixture;
    }

    it("keeps all root rows on the page when a row is expanded (getSubRows)", () => {
      const fixture = setupNested();
      const expandButton = fixture.nativeElement.querySelector(
        '.tedi-table__body button[aria-label="Expand row"]',
      ) as HTMLButtonElement;
      expandButton.click();
      fixture.detectChanges();

      const rootRows = fixture.nativeElement.querySelectorAll(
        ".tedi-table__body .tedi-table__row:not(.tedi-table__row--sub-row)",
      );
      // pageSize is 3 root rows; expanding row 0 must not push roots off page.
      expect(rootRows.length).toBe(3);
      const subRows = fixture.nativeElement.querySelectorAll(
        ".tedi-table__body .tedi-table__row--sub-row",
      );
      expect(subRows.length).toBe(2);
    });

    it("indexes root rows sequentially and leaves sub-rows without aria-rowindex", () => {
      const fixture = setupNested();
      const expandButton = fixture.nativeElement.querySelector(
        '.tedi-table__body button[aria-label="Expand row"]',
      ) as HTMLButtonElement;
      expandButton.click();
      fixture.detectChanges();

      const rootRows = Array.from(
        fixture.nativeElement.querySelectorAll(
          ".tedi-table__body .tedi-table__row:not(.tedi-table__row--sub-row)",
        ),
      ) as HTMLElement[];
      const indices = rootRows.map((r) => r.getAttribute("aria-rowindex"));
      // headerRowCount is 1, so root rows are 2, 3, 4 — expanded sub-rows do
      // not inflate the indices of the roots below them.
      expect(indices).toEqual(["2", "3", "4"]);

      const subRows = Array.from(
        fixture.nativeElement.querySelectorAll(
          ".tedi-table__body .tedi-table__row--sub-row",
        ),
      ) as HTMLElement[];
      expect(subRows.every((r) => r.getAttribute("aria-rowindex") === null)).toBe(
        true,
      );
    });
  });

  describe("filters", () => {
    it("renders a filter row when enableColumnFilters is true", () => {
      const fixture = setupHost();
      fixture.componentInstance.enableColumnFilters.set(true);
      fixture.detectChanges();
      const filters = fixture.nativeElement.querySelectorAll(
        "tr.tedi-table__row--filter input",
      );
      expect(filters.length).toBeGreaterThanOrEqual(2);
    });

    it("filters rows when input value changes", () => {
      const fixture = setupHost();
      fixture.componentInstance.enableColumnFilters.set(true);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector(
        'tr.tedi-table__row--filter input[aria-label="Filter Name"]',
      ) as HTMLInputElement;
      input.value = "Anna";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();
      const rows = fixture.nativeElement.querySelectorAll(
        ".tedi-table__body .tedi-table__row",
      );
      expect(rows.length).toBe(1);
      expect(rows[0].textContent).toContain("Anna");
    });
  });

  describe("pagination", () => {
    it("renders pagination chrome when pagination is enabled", () => {
      const fixture = setupHost();
      fixture.componentInstance.data.set(
        Array.from({ length: 15 }, (_, i) => ({
          id: String(i),
          name: `Person ${i}`,
          role: "Role",
        })),
      );
      fixture.componentInstance.pagination.set({ pageSize: 5 });
      fixture.detectChanges();
      const paginationEl =
        fixture.nativeElement.querySelector("tedi-pagination");
      expect(paginationEl).not.toBeNull();
    });

    it("renders only pageSize rows on the first page", () => {
      const fixture = setupHost();
      fixture.componentInstance.data.set(
        Array.from({ length: 15 }, (_, i) => ({
          id: String(i),
          name: `Person ${i}`,
          role: "Role",
        })),
      );
      fixture.componentInstance.pagination.set({ pageSize: 5 });
      fixture.detectChanges();
      const rows = fixture.nativeElement.querySelectorAll(
        ".tedi-table__body .tedi-table__row",
      );
      expect(rows.length).toBe(5);
    });

    it("uses rowCount for the aria-rowcount when manual pagination is set", () => {
      const fixture = setupHost();
      fixture.componentInstance.data.set(data);
      fixture.componentInstance.pagination.set(true);
      fixture.componentInstance.manualPagination.set(true);
      fixture.componentInstance.pageCount.set(10);
      fixture.componentInstance.rowCount.set(100);
      fixture.detectChanges();
      const table = fixture.nativeElement.querySelector("table");
      expect(table?.getAttribute("aria-rowcount")).toBe("101");
    });

    it("renders only the bottom paginator by default", () => {
      const fixture = setupHost();
      fixture.componentInstance.data.set(
        Array.from({ length: 15 }, (_, i) => ({
          id: String(i),
          name: `Person ${i}`,
          role: "Role",
        })),
      );
      fixture.componentInstance.pagination.set({ pageSize: 5 });
      fixture.detectChanges();
      const paginators =
        fixture.nativeElement.querySelectorAll("tedi-pagination");
      expect(paginators.length).toBe(1);
      const host = fixture.nativeElement.querySelector("tedi-table");
      expect(host?.classList.contains("tedi-table--has-pagination-bottom")).toBe(
        true,
      );
      expect(host?.classList.contains("tedi-table--has-pagination-top")).toBe(
        false,
      );
    });

    it("renders two paginators when paginationTop is set", () => {
      const fixture = setupHost();
      fixture.componentInstance.data.set(
        Array.from({ length: 15 }, (_, i) => ({
          id: String(i),
          name: `Person ${i}`,
          role: "Role",
        })),
      );
      fixture.componentInstance.pagination.set({ pageSize: 5 });
      fixture.componentInstance.paginationTop.set(true);
      fixture.detectChanges();
      const paginators =
        fixture.nativeElement.querySelectorAll("tedi-pagination");
      expect(paginators.length).toBe(2);
      const host = fixture.nativeElement.querySelector("tedi-table");
      expect(host?.classList.contains("tedi-table--has-pagination-top")).toBe(
        true,
      );
      expect(host?.classList.contains("tedi-table--has-pagination-bottom")).toBe(
        true,
      );
    });

    it("does not render the top paginator when base pagination is off", () => {
      const fixture = setupHost();
      fixture.componentInstance.paginationTop.set(true);
      fixture.detectChanges();
      const paginators =
        fixture.nativeElement.querySelectorAll("tedi-pagination");
      expect(paginators.length).toBe(0);
    });

    it("forwards visual options to the bottom paginator", () => {
      const fixture = setupHost();
      fixture.componentInstance.data.set(
        Array.from({ length: 15 }, (_, i) => ({
          id: String(i),
          name: `Person ${i}`,
          role: "Role",
        })),
      );
      fixture.componentInstance.pagination.set({
        pageSize: 5,
        background: "transparent",
        dividerPosition: "none",
      });
      fixture.detectChanges();
      const paginator = fixture.nativeElement.querySelector("tedi-pagination");
      expect(paginator?.classList.contains("tedi-pagination--bg-transparent")).toBe(
        true,
      );
      expect(paginator?.classList.contains("tedi-pagination--divider-none")).toBe(
        true,
      );
    });

    it("defaults the top slot divider position to 'bottom'", () => {
      const fixture = setupHost();
      fixture.componentInstance.data.set(
        Array.from({ length: 15 }, (_, i) => ({
          id: String(i),
          name: `Person ${i}`,
          role: "Role",
        })),
      );
      fixture.componentInstance.pagination.set({ pageSize: 5 });
      fixture.componentInstance.paginationTop.set(true);
      fixture.detectChanges();
      const wrappers = fixture.nativeElement.querySelectorAll(
        ".tedi-table__pagination",
      );
      const topPaginator = wrappers[0].querySelector("tedi-pagination");
      expect(
        topPaginator?.classList.contains("tedi-pagination--divider-bottom"),
      ).toBe(true);
    });

    it("syncs state between top and bottom paginators", () => {
      const fixture = setupHost();
      fixture.componentInstance.data.set(
        Array.from({ length: 15 }, (_, i) => ({
          id: String(i),
          name: `Person ${i}`,
          role: "Role",
        })),
      );
      fixture.componentInstance.pagination.set({ pageSize: 5 });
      fixture.componentInstance.paginationTop.set(true);
      fixture.detectChanges();
      const paginators = fixture.debugElement.queryAll(By.css("tedi-pagination"));
      const initialPages = paginators.map((el) => el.componentInstance.page());
      expect(initialPages).toEqual([1, 1]);

      paginators[0].componentInstance.pageChange.emit(2);
      fixture.detectChanges();

      const updatedPages = paginators.map((el) => el.componentInstance.page());
      expect(updatedPages).toEqual([2, 2]);
    });
  });

  describe("pagination results slot", () => {
    @Component({
      standalone: true,
      imports: [TediTableComponent, TediPaginationResultsDirective],
      template: `
        <tedi-table
          [data]="data"
          [columns]="columns"
          [pagination]="pagination"
          [paginationTop]="paginationTop"
        >
          <ng-template tediPaginationResults>
            <span data-testid="custom-results">Custom label</span>
          </ng-template>
        </tedi-table>
      `,
    })
    class ResultsSlotHostComponent {
      data = Array.from({ length: 15 }, (_, i) => ({
        id: String(i),
        name: `Person ${i}`,
        role: "Role",
      }));
      columns: TediColumnDef<Person>[] = columns;
      pagination: TablePaginationOptions = { pageSize: 5 };
      paginationTop: boolean | TablePaginationOptions | undefined = undefined;
    }

    function setupResultsHost(): ComponentFixture<ResultsSlotHostComponent> {
      TestBed.configureTestingModule({
        imports: [ResultsSlotHostComponent],
        providers: [
          { provide: TediTranslationService, useClass: TranslationMock },
          { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
          provideNoopAnimations(),
        ],
      });
      const fixture = TestBed.createComponent(ResultsSlotHostComponent);
      fixture.detectChanges();
      return fixture;
    }

    it("projects the results slot into the bottom paginator by default", () => {
      const fixture = setupResultsHost();
      const wrappers = fixture.nativeElement.querySelectorAll(
        ".tedi-table__pagination",
      );
      expect(wrappers.length).toBe(1);
      const projected = wrappers[0].querySelector(
        '[data-testid="custom-results"]',
      );
      expect(projected).not.toBeNull();
    });

    it("projects the results slot into the top paginator when bottom hides results", () => {
      const fixture = setupResultsHost();
      fixture.componentInstance.pagination = {
        pageSize: 5,
        hideResults: true,
        hidePageSize: true,
      };
      fixture.componentInstance.paginationTop = { hidePager: true };
      fixture.detectChanges();
      const wrappers = fixture.nativeElement.querySelectorAll(
        ".tedi-table__pagination",
      );
      expect(wrappers.length).toBe(2);
      const topProjected = wrappers[0].querySelector(
        '[data-testid="custom-results"]',
      );
      const bottomProjected = wrappers[1].querySelector(
        '[data-testid="custom-results"]',
      );
      expect(topProjected).not.toBeNull();
      expect(bottomProjected).toBeNull();
    });
  });

  describe("clickable rows", () => {
    it("adds role=button and tabindex when interactive is true", () => {
      const fixture = setupHost();
      fixture.componentInstance.interactive.set(true);
      fixture.detectChanges();
      const firstRow = fixture.nativeElement.querySelector(
        ".tedi-table__body .tedi-table__row",
      );
      expect(firstRow?.getAttribute("role")).toBe("button");
      expect(firstRow?.getAttribute("tabindex")).toBe("0");
    });

    it("emits rowClick when a clickable row is clicked", () => {
      const fixture = setupHost();
      fixture.componentInstance.interactive.set(true);
      fixture.detectChanges();
      const firstRow = fixture.nativeElement.querySelector(
        ".tedi-table__body .tedi-table__row",
      ) as HTMLElement;
      firstRow.click();
      expect(fixture.componentInstance.onRowClick).toHaveBeenCalledTimes(1);
    });

    it("emits rowClick on Enter when row is keyboard-focused", () => {
      const fixture = setupHost();
      fixture.componentInstance.interactive.set(true);
      fixture.detectChanges();
      const firstRow = fixture.nativeElement.querySelector(
        ".tedi-table__body .tedi-table__row",
      ) as HTMLElement;
      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
      });
      Object.defineProperty(event, "target", { value: firstRow });
      Object.defineProperty(event, "currentTarget", { value: firstRow });
      firstRow.dispatchEvent(event);
      expect(fixture.componentInstance.onRowClick).toHaveBeenCalled();
    });
  });

  describe("active row", () => {
    it("renders aria-current on the active row", () => {
      const fixture = setupHost();
      fixture.componentInstance.activeRowId.set("0");
      fixture.detectChanges();
      const active = fixture.nativeElement.querySelector(
        '.tedi-table__body .tedi-table__row[aria-current="true"]',
      );
      expect(active).not.toBeNull();
    });
  });

  describe("state / persistence", () => {
    it("emits stateChange when state slice updates", () => {
      const fixture = setupHost();
      fixture.componentInstance.enableRowSelection.set(true);
      fixture.detectChanges();
      const selectAll = fixture.nativeElement.querySelector(
        'input[aria-label="Select all"]',
      ) as HTMLInputElement;
      selectAll.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.onStateChange).toHaveBeenCalled();
    });

    it("round-trips columnVisibility through localStorage", () => {
      const memory = new Map<string, string>();
      const storage: Storage = {
        getItem: (k) => memory.get(k) ?? null,
        setItem: (k, v) => memory.set(k, v),
        removeItem: (k) => memory.delete(k),
        clear: () => memory.clear(),
        key: () => null,
        length: 0,
      } as Storage;

      const fixture = setupHost();
      fixture.componentInstance.persist.set({
        key: "test-table",
        storage,
      });
      fixture.componentInstance.defaultState.set({
        columnVisibility: { role: false },
      });
      fixture.detectChanges();
      // Simulate a write
      const table = fixture.debugElement.query(By.directive(TediTableComponent))
        .componentInstance as TediTableComponent<Person>;
      table["persistence"].patch({ columnVisibility: { role: false } });
      expect(memory.get("test-table")).toContain('"role":false');
    });
  });

  describe("a11y", () => {
    it("uses aria-rowcount when paginating", () => {
      const fixture = setupHost();
      fixture.componentInstance.pagination.set(true);
      fixture.detectChanges();
      const table = fixture.nativeElement.querySelector("table");
      expect(table?.hasAttribute("aria-rowcount")).toBe(true);
    });

    it("uses aria-colcount equal to visible leaf columns", () => {
      const fixture = setupHost();
      const table = fixture.nativeElement.querySelector("table");
      expect(table?.getAttribute("aria-colcount")).toBe("2");
    });
  });

  describe("row spanning", () => {
    it("emits rowspan=N on the spanning cell and skips covered cells", () => {
      const rows: Person[] = [
        { id: "a", name: "Anna", role: "Engineer" },
        { id: "b", name: "Anna", role: "Engineer" },
        { id: "c", name: "Bob", role: "Designer" },
      ];
      const groupSpan = (info: CellContext<Person, unknown>) => {
        if (info.row.original.name === "Anna" && info.row.id === "0") return 2;
        if (info.row.original.name === "Anna" && info.row.id === "1") return 0;
        return 1;
      };
      const cols: TediColumnDef<Person>[] = [
        {
          id: "name",
          header: "Name",
          accessorKey: "name",
          rowSpan: groupSpan,
        },
        { id: "role", header: "Role", accessorKey: "role" },
      ];
      const fixture = setupHost();
      fixture.componentInstance.data.set(rows);
      fixture.componentInstance.columns.set(cols);
      fixture.detectChanges();
      const bodyRows = fixture.nativeElement.querySelectorAll(
        ".tedi-table__body tr.tedi-table__row",
      );
      // first row's name cell should have rowspan=2
      const firstNameCell = bodyRows[0].querySelector("td");
      expect(firstNameCell?.getAttribute("rowspan")).toBe("2");
      // second row has only role cell (name is covered)
      const secondRowCells = bodyRows[1].querySelectorAll("td");
      expect(secondRowCells.length).toBe(1);
    });

    it("groupRowSpan helper produces 2 / 0 / 1 spans for consecutive equal keys", () => {
      const tableRows = [
        { id: "0", original: { key: "a" } },
        { id: "1", original: { key: "a" } },
        { id: "2", original: { key: "b" } },
      ] as unknown as Row<{ key: string }>[];
      const fn = groupRowSpan(tableRows, (r) => r.original.key);
      expect(
        fn({ row: tableRows[0] } as CellContext<{ key: string }, unknown>),
      ).toBe(2);
      expect(
        fn({ row: tableRows[1] } as CellContext<{ key: string }, unknown>),
      ).toBe(0);
      expect(
        fn({ row: tableRows[2] } as CellContext<{ key: string }, unknown>),
      ).toBe(1);
    });
  });

  describe("columns menu", () => {
    @Component({
      standalone: true,
      imports: [TediTableComponent, TediTableColumnsMenuComponent],
      template: `
        <tedi-table [data]="data" [columns]="columns">
          <tedi-table-columns-menu />
        </tedi-table>
      `,
    })
    class ColumnsMenuHostComponent {
      data = data;
      columns = columns;
    }

    it("renders a trigger labeled 'Columns'", () => {
      TestBed.configureTestingModule({
        imports: [ColumnsMenuHostComponent],
        providers: [
          { provide: TediTranslationService, useClass: TranslationMock },
          { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
          provideNoopAnimations(),
        ],
      });
      const fixture = TestBed.createComponent(ColumnsMenuHostComponent);
      fixture.detectChanges();
      const trigger = fixture.nativeElement.querySelector(
        "tedi-table-columns-menu button",
      );
      expect(trigger?.textContent).toContain("Columns");
    });
  });

  describe("sortable shorthand", () => {
    it("auto-renders the sort button when sortable: true and header is a string", () => {
      const fixture = setupHost();
      fixture.componentInstance.columns.set([
        {
          id: "name",
          header: "Name",
          accessorKey: "name",
          sortable: true,
        } as TediColumnDef<Person>,
        { id: "role", header: "Role", accessorKey: "role" },
      ]);
      fixture.detectChanges();
      const headers = fixture.nativeElement.querySelectorAll(
        ".tedi-table__head .tedi-table__header-cell",
      );
      const nameHeaderBtn = headers[0].querySelector(
        "button.tedi-table-header-button",
      );
      const roleHeaderBtn = headers[1].querySelector(
        "button.tedi-table-header-button",
      );
      expect(nameHeaderBtn).not.toBeNull();
      expect(roleHeaderBtn).toBeNull();
      expect(nameHeaderBtn?.textContent).toContain("Name");
    });

    it("toggles sort state when the auto-rendered button is clicked", () => {
      const fixture = setupHost();
      fixture.componentInstance.columns.set([
        {
          id: "name",
          header: "Name",
          accessorKey: "name",
          sortable: true,
        } as TediColumnDef<Person>,
      ]);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector(
        "button.tedi-table-header-button",
      ) as HTMLButtonElement;
      const th = fixture.nativeElement.querySelector(
        ".tedi-table__head .tedi-table__header-cell",
      );
      expect(th?.getAttribute("aria-sort")).toBe("none");
      button.click();
      fixture.detectChanges();
      expect(th?.getAttribute("aria-sort")).toBe("ascending");
      button.click();
      fixture.detectChanges();
      expect(th?.getAttribute("aria-sort")).toBe("descending");
    });

    it("does not render the sort button when sortable is not set", () => {
      const fixture = setupHost();
      fixture.componentInstance.columns.set([
        { id: "name", header: "Name", accessorKey: "name" },
      ]);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector(
        "button.tedi-table-header-button",
      );
      expect(button).toBeNull();
    });
  });

  describe("filterable shorthand", () => {
    @Component({
      standalone: true,
      imports: [TediTableComponent, TextFieldComponent, FormFieldComponent],
      template: `
        <tedi-table [data]="data()" [columns]="columns()" />
        <ng-template #textFilter let-ctx>
          <tedi-form-field size="small">
            <input
              tedi-text-field
              type="text"
              [value]="ctx.value ?? ''"
              (input)="ctx.setValue($any($event.target).value)"
              aria-label="Name filter input"
            />
          </tedi-form-field>
        </ng-template>
      `,
    })
    class FilterableHostComponent {
      readonly data = signal<Person[]>(data);
      readonly textFilterTpl = viewChild<
        TemplateRef<TediTableFilterContext<string, Person>>
      >("textFilter");
      readonly filterableOption = signal<boolean | TableFilterOptions>(true);

      readonly columns = signal<TediColumnDef<Person>[]>([]);

      // Allow tests to (re)build the columns array after the template's
      // viewChild resolves. We expose a helper so each test can request a
      // specific configuration (filterable on/off, clearOnClose, etc.).
      build(
        filterable: boolean | TableFilterOptions = true,
        attachTemplate = true,
      ): void {
        this.columns.set([
          {
            id: "name",
            header: "Name",
            accessorKey: "name",
            filterable,
            filterFn: "includesString",
            filterTemplate: attachTemplate
              ? (this.textFilterTpl() ?? undefined)
              : undefined,
          } as TediColumnDef<Person>,
          { id: "role", header: "Role", accessorKey: "role" },
        ]);
      }
    }

    function setupFilterableHost(
      configure?: (host: FilterableHostComponent) => void,
    ): ComponentFixture<FilterableHostComponent> {
      TestBed.configureTestingModule({
        imports: [FilterableHostComponent],
        providers: [
          { provide: TediTranslationService, useClass: TranslationMock },
          { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
          provideNoopAnimations(),
        ],
      });
      const fixture = TestBed.createComponent(FilterableHostComponent);
      // Run an initial CD pass so viewChild resolves, then let each test
      // call `build()` with its preferred filterable config.
      fixture.detectChanges();
      configure?.(fixture.componentInstance);
      fixture.componentInstance.build();
      fixture.detectChanges();
      return fixture;
    }

    function getTableComponent(
      fixture: ComponentFixture<FilterableHostComponent>,
    ): TediTableComponent<Person> {
      return fixture.debugElement.query(By.directive(TediTableComponent))
        .componentInstance as TediTableComponent<Person>;
    }

    function findTriggerButton(
      fixture: ComponentFixture<FilterableHostComponent>,
    ): HTMLButtonElement | null {
      return fixture.nativeElement.querySelector(
        'button.tedi-table-header-button[aria-label="Filter Name"]',
      ) as HTMLButtonElement | null;
    }

    function getPopoverContent(): HTMLElement | null {
      return document.body.querySelector(
        ".float-ui-container-popover",
      ) as HTMLElement | null;
    }

    afterEach(() => {
      // Popovers append to body — clean up any leftover overlay containers
      // between tests so DOM queries scoped to body stay deterministic.
      document.body
        .querySelectorAll(".float-ui-container-popover")
        .forEach((node) => node.remove());
    });

    it("renders the filter trigger when filterable: true", () => {
      const fixture = setupFilterableHost();
      const trigger = findTriggerButton(fixture);
      expect(trigger).not.toBeNull();
      expect(trigger?.getAttribute("aria-label")).toBe("Filter Name");
      // Trigger uses the filter_alt icon (the icon renders its name as text).
      const icon = trigger?.querySelector("tedi-icon");
      expect(icon?.textContent?.trim()).toBe("filter_alt");
    });

    it("does not render the trigger when filterable is not set", () => {
      const fixture = setupFilterableHost();
      // Rebuild without filterable.
      fixture.componentInstance.columns.set([
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "role", header: "Role", accessorKey: "role" },
      ]);
      fixture.detectChanges();
      const trigger = fixture.nativeElement.querySelector(
        'button.tedi-table-header-button[aria-label="Filter Name"]',
      );
      expect(trigger).toBeNull();
    });

    it("opens the popover when the trigger is clicked", () => {
      const fixture = setupFilterableHost();
      const trigger = findTriggerButton(fixture);
      trigger?.click();
      fixture.detectChanges();
      const popover = getPopoverContent();
      expect(popover).not.toBeNull();
      // Filter template's input is rendered inside.
      const input = popover?.querySelector(
        'input[aria-label="Name filter input"]',
      );
      expect(input).not.toBeNull();
      // Apply / Clear footer buttons are present.
      const buttons = popover?.querySelectorAll("button");
      const labels = Array.from(buttons ?? []).map((b) =>
        b.textContent?.trim(),
      );
      expect(labels).toEqual(expect.arrayContaining(["Apply", "Clear"]));
    });

    it("commits the draft to column.setFilterValue on Apply and closes the popover", () => {
      const fixture = setupFilterableHost();
      const trigger = findTriggerButton(fixture);
      trigger?.click();
      fixture.detectChanges();
      const popover = getPopoverContent()!;
      const input = popover.querySelector(
        'input[aria-label="Name filter input"]',
      ) as HTMLInputElement;
      input.value = "Anna";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();
      // Click Apply.
      const applyBtn = Array.from(popover.querySelectorAll("button")).find(
        (b) => b.textContent?.trim() === "Apply",
      ) as HTMLButtonElement | undefined;
      applyBtn?.click();
      fixture.detectChanges();
      // Filter was applied: only matching row remains.
      const rows = fixture.nativeElement.querySelectorAll(
        ".tedi-table__body .tedi-table__row",
      );
      expect(rows.length).toBe(1);
      expect(rows[0].textContent).toContain("Anna");
      // Trigger reports active state.
      const triggerAfter = findTriggerButton(fixture);
      expect(triggerAfter?.classList.contains("tedi-table-header-button--selected")).toBe(true);
    });

    it("resets the filter on Clear and closes the popover", () => {
      const fixture = setupFilterableHost();
      // First apply a filter so Clear has something to undo.
      const table = getTableComponent(fixture);
      const column = table["table"].getColumn("name")!;
      column.setFilterValue("Anna");
      fixture.detectChanges();
      const trigger = findTriggerButton(fixture);
      trigger?.click();
      fixture.detectChanges();
      const popover = getPopoverContent()!;
      const clearBtn = Array.from(popover.querySelectorAll("button")).find(
        (b) => b.textContent?.trim() === "Clear",
      ) as HTMLButtonElement | undefined;
      clearBtn?.click();
      fixture.detectChanges();
      expect(column.getFilterValue()).toBeUndefined();
      const rows = fixture.nativeElement.querySelectorAll(
        ".tedi-table__body .tedi-table__row",
      );
      expect(rows.length).toBe(2);
    });

    it("reflects active state with selected + filled classes on the trigger", () => {
      const fixture = setupFilterableHost();
      const table = getTableComponent(fixture);
      const column = table["table"].getColumn("name")!;
      // Initially neither.
      let trigger = findTriggerButton(fixture)!;
      expect(trigger.classList.contains("tedi-table-header-button--selected")).toBe(false);
      // Apply.
      column.setFilterValue("Anna");
      fixture.detectChanges();
      trigger = findTriggerButton(fixture)!;
      expect(trigger.classList.contains("tedi-table-header-button--selected")).toBe(true);
      // Filled variant means the icon's filled style is requested; verify
      // we forwarded the input by inspecting the icon's host class
      // (`tedi-icon--filled` is added when variant === 'filled').
      const icon = trigger.querySelector("tedi-icon");
      expect(icon?.classList.contains("tedi-icon--filled")).toBe(true);
    });

    it("setValue + apply through the template context commits the draft", () => {
      const fixture = setupFilterableHost();
      const table = getTableComponent(fixture);
      const column = table["table"].getColumn("name")!;
      const trigger = findTriggerButton(fixture)!;
      trigger.click();
      fixture.detectChanges();
      const popover = getPopoverContent()!;
      const input = popover.querySelector(
        'input[aria-label="Name filter input"]',
      ) as HTMLInputElement;
      // Drive via the input's `input` event — exercises the consumer's
      // setValue plumbing in the filterTemplate.
      input.value = "Jüri";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();
      // Draft is staged; column not yet filtered.
      expect(column.getFilterValue()).toBeUndefined();
      const applyBtn = Array.from(popover.querySelectorAll("button")).find(
        (b) => b.textContent?.trim() === "Apply",
      ) as HTMLButtonElement;
      applyBtn.click();
      fixture.detectChanges();
      expect(column.getFilterValue()).toBe("Jüri");
    });

    it("clearOnClose resets the draft to the applied value on next open", () => {
      const fixture = setupFilterableHost();
      // Switch to clearOnClose mode.
      fixture.componentInstance.build({ clearOnClose: true });
      fixture.detectChanges();
      const table = getTableComponent(fixture);
      const column = table["table"].getColumn("name")!;

      // Open, type a draft, close WITHOUT applying.
      let trigger = findTriggerButton(fixture)!;
      trigger.click();
      fixture.detectChanges();
      let popover = getPopoverContent()!;
      let input = popover.querySelector(
        'input[aria-label="Name filter input"]',
      ) as HTMLInputElement;
      input.value = "Stale draft";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();

      // Reopen via trigger click — clearOnClose resets the draft to applied
      // value (undefined here → input renders empty).
      trigger = findTriggerButton(fixture)!;
      trigger.click();
      fixture.detectChanges();
      popover = getPopoverContent()!;
      input = popover.querySelector(
        'input[aria-label="Name filter input"]',
      ) as HTMLInputElement;
      expect(input.value).toBe("");
      expect(column.getFilterValue()).toBeUndefined();
    });

    it("renders both the sort button and the filter trigger when both shorthands are set", () => {
      const fixture = setupFilterableHost();
      fixture.componentInstance.columns.set([
        {
          id: "name",
          header: "Name",
          accessorKey: "name",
          sortable: true,
          filterable: true,
          filterFn: "includesString",
          filterTemplate:
            fixture.componentInstance.textFilterTpl() ?? undefined,
        } as TediColumnDef<Person>,
        { id: "role", header: "Role", accessorKey: "role" },
      ]);
      fixture.detectChanges();
      const headers = fixture.nativeElement.querySelectorAll(
        ".tedi-table__head .tedi-table__header-cell",
      );
      // Sort button — whole title is clickable, no aria-label.
      const sortBtn = headers[0].querySelector(
        'button.tedi-table-header-button:not([aria-label])',
      );
      // Filter trigger — aria-label set.
      const filterBtn = headers[0].querySelector(
        'button.tedi-table-header-button[aria-label="Filter Name"]',
      );
      expect(sortBtn).not.toBeNull();
      expect(filterBtn).not.toBeNull();
      expect(sortBtn?.textContent).toContain("Name");
    });
  });
});
