/**
 * Validates the behaviors documented in state-management.mdx: defaultState
 * seeding per slice, per-slice controlled mode, persist round-trips, and the
 * controlled > storage > defaultState precedence order. Keep in sync with
 * that page — a failure here means the docs lie.
 */
import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { TediTableComponent } from "./table.component";
import { PaginationComponent } from "../../navigation/pagination/pagination.component";
import type {
  TableState,
  TablePersistOptions,
  TediColumnDef,
} from "./table.types";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { TediTranslationService } from "../../../services/translation/translation.service";

class TranslationMock {
  translate(key: string) {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

interface Person {
  id: string;
  name: string;
  subRows?: Person[];
}

const PEOPLE: Person[] = [
  { id: "b", name: "Bob" },
  { id: "a", name: "Anna" },
  { id: "c", name: "Carl" },
  { id: "e", name: "Erik" },
  { id: "d", name: "Dora" },
];

const NESTED: Person[] = [
  { id: "p0", name: "Parent 0", subRows: [{ id: "c0", name: "Child 0" }] },
  { id: "p1", name: "Parent 1", subRows: [{ id: "c1", name: "Child 1" }] },
  { id: "p2", name: "Parent 2", subRows: [{ id: "c2", name: "Child 2" }] },
];

@Component({
  standalone: true,
  imports: [TediTableComponent],
  template: `
    <tedi-table
      [data]="data()"
      [columns]="columns()"
      [getSubRows]="getSubRows()"
      [enableRowSelection]="enableRowSelection()"
      [pagination]="pagination()"
      [paginationTop]="paginationTop()"
      [state]="state()"
      [defaultState]="defaultState()"
      [persist]="persist()"
      (stateChange)="onStateChange($event)"
    />
  `,
})
class HostComponent {
  readonly data = signal<Person[]>(PEOPLE);
  readonly columns = signal<TediColumnDef<Person>[]>([
    { id: "name", header: "Name", accessorKey: "name", sortable: true },
  ]);
  readonly getSubRows = signal<
    ((row: Person) => Person[] | undefined) | undefined
  >(undefined);
  readonly enableRowSelection = signal(false);
  readonly pagination = signal<boolean | undefined>(undefined);
  readonly paginationTop = signal<boolean | undefined>(undefined);
  readonly state = signal<Partial<TableState> | undefined>(undefined);
  readonly defaultState = signal<Partial<TableState> | undefined>(undefined);
  readonly persist = signal<TablePersistOptions | undefined>(undefined);
  readonly onStateChange = jest.fn();
}

function setup(
  configure: (host: HostComponent) => void,
): ComponentFixture<HostComponent> {
  TestBed.configureTestingModule({
    imports: [HostComponent],
    providers: [
      { provide: TediTranslationService, useClass: TranslationMock },
      { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
    ],
  });
  const fixture = TestBed.createComponent(HostComponent);
  configure(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

function bodyRowTexts(fixture: ComponentFixture<HostComponent>): string[] {
  return Array.from(
    fixture.nativeElement.querySelectorAll(
      ".tedi-table__body .tedi-table__row",
    ),
  ).map((row) => (row as HTMLElement).textContent?.trim() ?? "");
}

function sortButton(
  fixture: ComponentFixture<HostComponent>,
): HTMLButtonElement {
  return fixture.nativeElement.querySelector(
    "button.tedi-table-header-button",
  ) as HTMLButtonElement;
}

function headerCellAriaSort(
  fixture: ComponentFixture<HostComponent>,
): string | null {
  return (
    fixture.nativeElement.querySelector(
      ".tedi-table__head .tedi-table__header-cell",
    ) as HTMLElement
  ).getAttribute("aria-sort");
}

function makeStorage(initial?: Record<string, string>): Storage & {
  dump(): Map<string, string>;
} {
  const memory = new Map<string, string>(Object.entries(initial ?? {}));
  return {
    getItem: (k: string) => memory.get(k) ?? null,
    setItem: (k: string, v: string) => void memory.set(k, v),
    removeItem: (k: string) => void memory.delete(k),
    clear: () => memory.clear(),
    key: () => null,
    length: 0,
    dump: () => memory,
  } as Storage & { dump(): Map<string, string> };
}

describe("state-management.mdx claims", () => {
  describe("uncontrolled (default)", () => {
    it("owns state internally and emits the merged TableState on every change", () => {
      const fixture = setup(() => undefined);
      sortButton(fixture).click();
      fixture.detectChanges();
      expect(headerCellAriaSort(fixture)).toBe("ascending");
      expect(fixture.componentInstance.onStateChange).toHaveBeenCalledWith(
        expect.objectContaining({ sorting: [{ id: "name", desc: false }] }),
      );
    });
  });

  describe("defaultState seeding", () => {
    it("seeds sorting", () => {
      const fixture = setup((host) =>
        host.defaultState.set({ sorting: [{ id: "name", desc: true }] }),
      );
      expect(bodyRowTexts(fixture)[0]).toBe("Erik");
      expect(headerCellAriaSort(fixture)).toBe("descending");
    });

    it("seeds pagination (pageIndex + pageSize)", () => {
      const fixture = setup((host) => {
        host.pagination.set(true);
        host.defaultState.set({
          pagination: { pageIndex: 1, pageSize: 2 },
        });
      });
      // source order, no sorting: page 2 of size 2 -> rows 3 and 4
      expect(bodyRowTexts(fixture)).toEqual(["Carl", "Erik"]);
    });

    it("feeds seeded pagination state into BOTH paginator components", () => {
      const fixture = setup((host) => {
        host.pagination.set(true);
        host.paginationTop.set(true);
        host.defaultState.set({ pagination: { pageIndex: 1, pageSize: 2 } });
      });
      const paginators = fixture.debugElement
        .queryAll(By.directive(PaginationComponent))
        .map((de) => de.componentInstance as PaginationComponent);
      expect(paginators).toHaveLength(2);
      for (const paginator of paginators) {
        expect(paginator.pageSize()).toBe(2);
        expect(paginator.page()).toBe(2); // pageIndex 1 -> page 2
      }
    });

    it("seeds rowSelection", () => {
      const fixture = setup((host) => {
        host.enableRowSelection.set(true);
        host.defaultState.set({ rowSelection: { "1": true } });
      });
      const tableCmp = fixture.debugElement.children[0].children[0]
        .componentInstance as TediTableComponent<Person>;
      const selected = tableCmp["table"].getSelectedRowModel().rows;
      expect(selected.map((r) => r.id)).toEqual(["1"]);
      const checked = fixture.nativeElement.querySelectorAll(
        ".tedi-table__body input:checked",
      );
      expect(checked.length).toBe(1);
    });

    it("seeds expanded with a per-row map (rows 0 and 2 open, 1 closed)", () => {
      const fixture = setup((host) => {
        host.data.set(NESTED);
        host.getSubRows.set((row) => row.subRows);
        host.defaultState.set({ expanded: { "0": true, "2": true } });
      });
      const texts = bodyRowTexts(fixture).map((t) => t.replace(/\s+/g, " "));
      const names = texts.map((t) =>
        t.replace(/table\.\S+|expand_more|expand_less/g, "").trim(),
      );
      expect(names).toEqual([
        "Parent 0",
        "Child 0",
        "Parent 1",
        "Parent 2",
        "Child 2",
      ]);
    });

    it("is inert after the user interacts (read-once)", () => {
      const fixture = setup((host) =>
        host.defaultState.set({ sorting: [{ id: "name", desc: false }] }),
      );
      expect(headerCellAriaSort(fixture)).toBe("ascending");
      sortButton(fixture).click(); // user toggles to descending
      fixture.detectChanges();
      expect(headerCellAriaSort(fixture)).toBe("descending");

      fixture.componentInstance.defaultState.set({ sorting: [] });
      fixture.detectChanges();
      expect(headerCellAriaSort(fixture)).toBe("descending");
    });
  });

  describe("controlled state", () => {
    it("renders a controlled slice verbatim and never changes it itself", () => {
      const fixture = setup((host) => host.state.set({ sorting: [] }));
      sortButton(fixture).click();
      fixture.detectChanges();
      // UI stays frozen on the controlled value...
      expect(headerCellAriaSort(fixture)).toBe("none");
      // ...but the change is still emitted for the consumer to apply.
      expect(fixture.componentInstance.onStateChange).toHaveBeenCalledWith(
        expect.objectContaining({ sorting: [{ id: "name", desc: false }] }),
      );
    });

    it("updates when the consumer writes the emitted value back", () => {
      const fixture = setup((host) => host.state.set({ sorting: [] }));
      sortButton(fixture).click();
      fixture.detectChanges();
      const emitted = fixture.componentInstance.onStateChange.mock
        .calls[0][0] as TableState;
      fixture.componentInstance.state.set({ sorting: emitted.sorting });
      fixture.detectChanges();
      expect(headerCellAriaSort(fixture)).toBe("ascending");
    });

    it("leaves unlisted slices uncontrolled (per-slice control)", () => {
      const fixture = setup((host) => {
        host.data.set(NESTED);
        host.getSubRows.set((row) => row.subRows);
        host.state.set({ sorting: [] }); // sorting controlled, expanded not
      });
      const expandButton = fixture.nativeElement.querySelector(
        '.tedi-table__body button[aria-label="table.expand-row"]',
      ) as HTMLButtonElement;
      expandButton.click();
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector(".tedi-table__row--sub-row"),
      ).not.toBeNull();
    });
  });

  describe("persist", () => {
    it("restores included slices from storage on init", () => {
      const storage = makeStorage({
        "t.validate": JSON.stringify({ sorting: [{ id: "name", desc: true }] }),
      });
      const fixture = setup((host) =>
        host.persist.set({ key: "t.validate", storage, include: ["sorting"] }),
      );
      expect(headerCellAriaSort(fixture)).toBe("descending");
      expect(bodyRowTexts(fixture)[0]).toBe("Erik");
    });

    it("writes included slices to storage on change", () => {
      const storage = makeStorage();
      const fixture = setup((host) =>
        host.persist.set({ key: "t.validate", storage, include: ["sorting"] }),
      );
      sortButton(fixture).click();
      fixture.detectChanges();
      expect(storage.dump().get("t.validate")).toContain('"sorting"');
    });

    it("does not persist task-scoped slices with the default include list", () => {
      const storage = makeStorage();
      const fixture = setup((host) =>
        host.persist.set({ key: "t.validate", storage }),
      );
      sortButton(fixture).click();
      fixture.detectChanges();
      const written = storage.dump().get("t.validate");
      expect(written).toBeDefined();
      expect(written).not.toContain('"sorting"');
    });
  });

  describe("precedence", () => {
    it("persisted storage beats defaultState for included slices", () => {
      const storage = makeStorage({
        "t.validate": JSON.stringify({ sorting: [{ id: "name", desc: true }] }),
      });
      const fixture = setup((host) => {
        host.persist.set({ key: "t.validate", storage, include: ["sorting"] });
        host.defaultState.set({ sorting: [{ id: "name", desc: false }] });
      });
      expect(headerCellAriaSort(fixture)).toBe("descending");
    });

    it("falls back to defaultState when nothing is persisted for the slice", () => {
      const storage = makeStorage();
      const fixture = setup((host) => {
        host.persist.set({ key: "t.validate", storage, include: ["sorting"] });
        host.defaultState.set({ sorting: [{ id: "name", desc: false }] });
      });
      expect(headerCellAriaSort(fixture)).toBe("ascending");
    });

    it("controlled state beats the persisted storage value", () => {
      const storage = makeStorage({
        "t.validate": JSON.stringify({ sorting: [{ id: "name", desc: true }] }),
      });
      const fixture = setup((host) => {
        host.persist.set({ key: "t.validate", storage, include: ["sorting"] });
        host.state.set({ sorting: [] });
      });
      expect(headerCellAriaSort(fixture)).toBe("none");
    });
  });
});
