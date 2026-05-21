import { Component, signal, TemplateRef, viewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import type { CellContext, Row } from "@tanstack/angular-table";
import { TediTableComponent } from "./table.component";
import { TediTableColumnsMenuComponent } from "./table-columns-menu/table-columns-menu.component";
import { groupRowSpan } from "./row-span.utils";
import type {
  TableState,
  TablePersistOptions,
  TediColumnDef,
} from "./table.types";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { TediTranslationService } from "../../../services/translation/translation.service";

type Translator = (...args: unknown[]) => string;
const TRANSLATIONS: Record<string, Translator> = {
  "table.no-data": () => "No data",
  "table.row-details": () => "Row details",
  "table.filter-input": (col) => `Filter ${col ?? ""}`.trim(),
  "table.filter-placeholder": () => "Filter…",
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
      [manualPagination]="manualPagination()"
      [manualSorting]="manualSorting()"
      [manualFiltering]="manualFiltering()"
      [pageCount]="pageCount()"
      [rowCount]="rowCount()"
      [renderSubComponent]="subTemplate()"
      [interactive]="interactive()"
      [activeRowId]="activeRowId()"
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
  readonly pagination = signal<
    boolean | { pageSize?: number; pageSizeOptions?: number[] | false } | undefined
  >(undefined);
  readonly manualPagination = signal(false);
  readonly manualSorting = signal(false);
  readonly manualFiltering = signal(false);
  readonly pageCount = signal<number | undefined>(undefined);
  readonly rowCount = signal<number | undefined>(undefined);
  readonly subTemplate = signal<
    TemplateRef<{ $implicit: Row<Person> }> | undefined
  >(undefined);
  readonly interactive = signal(false);
  readonly activeRowId = signal<string | undefined>(undefined);
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
});
