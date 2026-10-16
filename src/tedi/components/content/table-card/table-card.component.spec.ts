import { BreakpointObserver } from "@angular/cdk/layout";
import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { of } from "rxjs";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { CardBackground, CardPadding } from "../card/card.utils";
import { TableCardActionsComponent } from "./table-card-actions/table-card-actions.component";
import { TableCardEndSlotDirective } from "./table-card-end-slot.directive";
import { TableCardGroupComponent } from "./table-card-group/table-card-group.component";
import { TableCardRowComponent } from "./table-card-row/table-card-row.component";
import { TableCardSummaryComponent } from "./table-card-summary/table-card-summary.component";
import { TableCardComponent } from "./table-card.component";
import {
  getTableCardPaddingSides,
  getTableCardRowsClasses,
  getTableCardRowsStyles,
  TableCardAlign,
  TableCardColumnSizing,
  TableCardLabelSize,
  TableCardLayout,
} from "./table-card.utils";

const breakpointObserverMock = {
  provide: BreakpointObserver,
  useValue: {
    observe: () =>
      of({ matches: true, breakpoints: { "(min-width: 0px)": true } }),
  },
};

@Component({
  standalone: true,
  imports: [
    TableCardComponent,
    TableCardRowComponent,
    TableCardEndSlotDirective,
  ],
  template: `
    <tedi-table-card
      [title]="title"
      [subtitle]="subtitle"
      [titleElement]="titleElement"
      [collapsible]="collapsible"
      [(open)]="open"
      [selectable]="selectable"
      [(selected)]="selected"
      [ariaLabel]="ariaLabel"
      [layout]="layout"
      [columns]="columns"
      [columnSizing]="columnSizing"
      [labelSize]="labelSize"
      [labelWidth]="labelWidth"
      [labelAlign]="labelAlign"
      [rowGap]="rowGap"
    >
      @if (showEndSlot) {
        <span tediTableCardEndSlot class="end-slot">Badge</span>
      }
      <div
        tedi-table-card-row
        label="Vanus"
        value="25"
        [labelFor]="labelFor"
        [labelId]="labelId"
      ></div>
      <div
        tedi-table-card-row
        label="Summa"
        value="0.00 €"
        bold
        [colSpan]="colSpan"
      >
        <span class="projected-value">extra</span>
      </div>
    </tedi-table-card>
  `,
})
class TestHostComponent {
  title?: string;
  subtitle?: string;
  titleElement: "h2" | "h3" | "h4" | "h5" | "h6" = "h3";
  collapsible = false;
  open = true;
  selectable = false;
  selected = false;
  ariaLabel?: string;
  layout: TableCardLayout = "horizontal";
  columns = 1;
  columnSizing: TableCardColumnSizing = "equal";
  labelSize: TableCardLabelSize = "default";
  labelWidth?: string | number;
  labelAlign?: TableCardAlign;
  rowGap?: string | number;
  colSpan?: number;
  showEndSlot = true;
  labelFor?: string;
  labelId?: string;
}

@Component({
  standalone: true,
  imports: [
    TableCardComponent,
    TableCardRowComponent,
    TableCardGroupComponent,
    TableCardSummaryComponent,
    TableCardActionsComponent,
  ],
  template: `
    <tedi-table-card
      title="Kadri Kaasik"
      layout="vertical"
      labelSize="small"
      [padding]="padding"
      [columns]="columns"
    >
      @if (showRows) {
        <div tedi-table-card-row label="Vanus" value="25"></div>
      }

      <tedi-table-card-group
        [layout]="groupLayout"
        [columns]="groupColumns"
        [background]="groupBackground"
      >
        <div
          tedi-table-card-row
          label="Tõend"
          value="COVID-19"
          [colSpan]="4"
        ></div>
        <tedi-table-card-actions>
          <button type="button" class="group-action">Vaata</button>
        </tedi-table-card-actions>
      </tedi-table-card-group>

      <tedi-table-card-summary label="Kokku">0.00 €</tedi-table-card-summary>

      <tedi-table-card-actions>
        <button type="button" class="card-action">Muuda</button>
      </tedi-table-card-actions>
    </tedi-table-card>
  `,
})
class TestSlotsHostComponent {
  columns = 1;
  groupLayout?: TableCardLayout;
  groupColumns?: number;
  groupBackground: CardBackground = "tertiary";
  padding: CardPadding = 1;
  showRows = true;
}

describe("TableCardComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  const query = (selector: string) =>
    fixture.nativeElement.querySelector(selector) as HTMLElement | null;
  const queryAll = (selector: string) =>
    Array.from(
      fixture.nativeElement.querySelectorAll(selector),
    ) as HTMLElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        breakpointObserverMock,
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "en" },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(
      fixture.debugElement.query(By.directive(TableCardComponent)),
    ).toBeTruthy();
  });

  describe("rows", () => {
    it("renders every row as a dt/dd pair of a single definition list", () => {
      const lists = queryAll("dl.tedi-table-card-rows");

      expect(lists).toHaveLength(1);
      expect(lists[0].querySelectorAll("dt")).toHaveLength(2);
      expect(lists[0].querySelectorAll("dd")).toHaveLength(2);
    });

    it("renders the label, the value input and any projected value content", () => {
      const row = queryAll(".tedi-table-card-row")[1];

      expect(row.querySelector("dt")?.textContent).toContain("Summa");
      expect(row.querySelector("dd")?.textContent).toContain("0.00 €");
      expect(row.querySelector(".projected-value")).toBeTruthy();
    });

    it("marks a bold row so its value can be emphasised", () => {
      const rows = queryAll(".tedi-table-card-row");

      expect(rows[0].classList).not.toContain("tedi-table-card-row--bold");
      expect(rows[1].classList).toContain("tedi-table-card-row--bold");
    });

    it("spans a row across columns only when colSpan is above one", () => {
      const row = () => queryAll(".tedi-table-card-row")[1];

      host.columns = 2;
      fixture.detectChanges();
      expect(row().style.gridColumn).toBe("");

      host.colSpan = 2;
      fixture.detectChanges();
      expect(row().style.gridColumn).toBe("span 2");

      host.colSpan = 1;
      fixture.detectChanges();
      expect(row().style.gridColumn).toBe("");
    });

    it("clamps the span to the columns the body lays out", () => {
      const row = () => queryAll(".tedi-table-card-row")[1];

      host.colSpan = 3;
      host.columns = 1;
      fixture.detectChanges();
      expect(row().style.gridColumn).toBe("");

      host.columns = 2;
      fixture.detectChanges();
      expect(row().style.gridColumn).toBe("span 2");

      host.columns = 3;
      fixture.detectChanges();
      expect(row().style.gridColumn).toBe("span 3");
    });

    it("renders a label targeting labelFor", () => {
      const label = () => queryAll(".tedi-table-card-row__label")[0];

      expect(label().querySelector("label")).toBeNull();
      expect(label().querySelector("span.tedi-label")?.textContent).toContain(
        "Vanus",
      );

      host.labelFor = "age-input";
      fixture.detectChanges();
      expect(label().querySelector("label")?.getAttribute("for")).toBe(
        "age-input",
      );
    });

    it("exposes the label's id for controls that name themselves by reference", () => {
      const labelText = () =>
        queryAll(".tedi-table-card-row__label")[0].querySelector(".tedi-label");

      expect(labelText()?.getAttribute("id")).toBeNull();

      host.labelId = "age-label";
      fixture.detectChanges();
      expect(labelText()?.getAttribute("id")).toBe("age-label");

      host.labelFor = "age-input";
      fixture.detectChanges();
      expect(labelText()?.tagName).toBe("LABEL");
      expect(labelText()?.getAttribute("id")).toBe("age-label");
    });

    it("takes the label size from the enclosing card", () => {
      expect(query(".tedi-label")?.classList).not.toContain(
        "tedi-label--small",
      );

      host.labelSize = "small";
      fixture.detectChanges();
      expect(query(".tedi-label")?.classList).toContain("tedi-label--small");
    });
  });

  describe("layout", () => {
    it("aligns both columns against the gutter in horizontal layout", () => {
      const list = query("dl.tedi-table-card-rows")!;

      expect(list.classList).toContain("tedi-table-card-rows--horizontal");
      expect(list.classList).toContain(
        "tedi-table-card-rows--label-align-right",
      );
      expect(list.classList).toContain(
        "tedi-table-card-rows--value-align-right",
      );
    });

    it("stacks labels above values and aligns them left in vertical layout", () => {
      host.layout = "vertical";
      fixture.detectChanges();
      const list = query("dl.tedi-table-card-rows")!;

      expect(list.classList).toContain("tedi-table-card-rows--vertical");
      expect(list.classList).not.toContain(
        "tedi-table-card-rows--label-align-right",
      );
    });

    it("switches to a grid only once there is more than one column", () => {
      const list = () => query("dl.tedi-table-card-rows")!;

      expect(list().classList).not.toContain("tedi-table-card-rows--columns");

      host.columns = 2;
      fixture.detectChanges();
      expect(list().classList).toContain("tedi-table-card-rows--columns");
      expect(list().style.getPropertyValue("--_tedi-table-card-columns")).toBe(
        "2",
      );
    });

    it("switches the grid to content-sized tracks on columnSizing auto", () => {
      const list = () => query("dl.tedi-table-card-rows")!;

      host.columns = 3;
      fixture.detectChanges();
      expect(list().classList).toContain("tedi-table-card-rows--columns");
      expect(list().classList).not.toContain(
        "tedi-table-card-rows--columns-auto",
      );

      host.columnSizing = "auto";
      fixture.detectChanges();
      expect(list().classList).toContain("tedi-table-card-rows--columns-auto");

      // Only meaningful once there is more than one column.
      host.columns = 1;
      fixture.detectChanges();
      expect(list().classList).not.toContain(
        "tedi-table-card-rows--columns-auto",
      );
    });

    it("reads a numeric labelWidth as pixels and a numeric rowGap as rems", () => {
      host.labelWidth = 200;
      host.rowGap = 1.5;
      fixture.detectChanges();
      const list = query("dl.tedi-table-card-rows")!;

      expect(
        list.style.getPropertyValue("--_tedi-table-card-label-width"),
      ).toBe("200px");
      expect(list.style.getPropertyValue("--_tedi-table-card-row-gap")).toBe(
        "1.5rem",
      );
    });

    it("lets labelAlign override the layout default", () => {
      host.labelAlign = "left";
      fixture.detectChanges();

      expect(query("dl.tedi-table-card-rows")!.classList).not.toContain(
        "tedi-table-card-rows--label-align-right",
      );
    });
  });

  describe("header", () => {
    it("renders no header at all when there is nothing to put in it", () => {
      host.showEndSlot = false;
      fixture.detectChanges();

      expect(query(".tedi-table-card__header")).toBeNull();
    });

    it("renders a header for an end slot that arrives on its own", () => {
      expect(host.title).toBeUndefined();
      expect(host.selectable).toBe(false);
      expect(host.collapsible).toBe(false);

      expect(query(".tedi-table-card__header")).toBeTruthy();
      expect(query(".tedi-table-card__end-slot .end-slot")).toBeTruthy();
    });

    it("renders the title in the requested heading tag", () => {
      host.title = "Kadri Kaasik";
      host.titleElement = "h4";
      fixture.detectChanges();

      const heading = query(".tedi-table-card__heading")!;
      expect(heading.tagName).toBe("H4");
      expect(heading.textContent).toContain("Kadri Kaasik");
    });

    it("mutes only a lone title in a collapsible header", () => {
      host.title = "Kadri Kaasik";
      fixture.detectChanges();
      const title = () =>
        query(
          `#${query(".tedi-table-card__heading")!.querySelector("[tedi-text]")!.id}`,
        )!;

      expect(title().className).toContain("tedi-text--primary");

      host.collapsible = true;
      fixture.detectChanges();
      expect(title().className).toContain("tedi-text--secondary");

      // Paired with a subtitle the title carries the emphasis again.
      host.subtitle = "14.04.2026 15:30";
      fixture.detectChanges();
      expect(title().className).toContain("tedi-text--primary");
    });

    it("renders the subtitle and the projected end slot beside the title", () => {
      host.title = "Kadri Kaasik";
      host.subtitle = "14.04.2026";
      fixture.detectChanges();

      expect(query(".tedi-table-card__header")!.textContent).toContain(
        "14.04.2026",
      );
      expect(query(".tedi-table-card__end-slot .end-slot")).toBeTruthy();
    });

    it("labels the card region only when an ariaLabel is given", () => {
      const card = () => query(".tedi-table-card__card")!;

      expect(card().getAttribute("role")).toBeNull();

      host.ariaLabel = "Töövõimetusleht";
      fixture.detectChanges();
      expect(card().getAttribute("role")).toBe("group");
      expect(card().getAttribute("aria-label")).toBe("Töövõimetusleht");
    });
  });

  describe("collapsible", () => {
    beforeEach(() => {
      host.title = "Kadri Kaasik";
      host.collapsible = true;
      fixture.detectChanges();
    });

    it("points the toggle at the body it controls", () => {
      const toggle = query(".tedi-table-card__toggle")!;
      const body = query(".tedi-table-card__body")!;

      expect(toggle.getAttribute("aria-controls")).toBe(body.id);
      expect(body.id).toBeTruthy();
    });

    it("toggles the body and writes the new state back to the binding", () => {
      const toggle = query(".tedi-table-card__toggle")!;
      const body = () => query(".tedi-table-card__body")!;

      expect(toggle.getAttribute("aria-expanded")).toBe("true");
      expect(body().hasAttribute("hidden")).toBe(false);

      toggle.click();
      fixture.detectChanges();

      expect(host.open).toBe(false);
      expect(toggle.getAttribute("aria-expanded")).toBe("false");
      expect(body().hasAttribute("hidden")).toBe(true);
    });

    it("turns the chevron over while the body is open", () => {
      const chevron = () => query(".tedi-table-card__chevron")!;

      expect(chevron().classList).toContain("tedi-table-card__chevron--open");

      query(".tedi-table-card__toggle")!.click();
      fixture.detectChanges();
      expect(chevron().classList).not.toContain(
        "tedi-table-card__chevron--open",
      );
    });

    it("names the toggle by its title, or falls back when there is none", () => {
      expect(
        query(".tedi-table-card__toggle")!.getAttribute("aria-label"),
      ).toBeNull();

      host.title = undefined;
      host.ariaLabel = "Töövõimetusleht";
      fixture.detectChanges();
      expect(
        query(".tedi-table-card__toggle")!.getAttribute("aria-label"),
      ).toBe("Töövõimetusleht");

      host.ariaLabel = undefined;
      fixture.detectChanges();
      expect(
        query(".tedi-table-card__toggle")!.getAttribute("aria-label"),
      ).toBeTruthy();
    });

    it("keeps the body hidden but the card intact while collapsed", () => {
      host.open = false;
      fixture.detectChanges();

      expect(query(".tedi-table-card__body")!.hasAttribute("hidden")).toBe(
        true,
      );
      expect(query(".tedi-table-card__header")).toBeTruthy();
    });
  });

  describe("separators", () => {
    it("divides a collapsible header from the rows it toggles", () => {
      host.title = "Kadri Kaasik";
      host.collapsible = true;
      fixture.detectChanges();

      expect(query(".tedi-table-card__body")!.classList).toContain(
        "tedi-table-card__body--separator",
      );
    });

    it("keeps a plain title or a checkbox in the same block as the rows", () => {
      host.title = "Kadri Kaasik";
      fixture.detectChanges();
      expect(query(".tedi-table-card__body")!.classList).not.toContain(
        "tedi-table-card__body--separator",
      );

      host.selectable = true;
      fixture.detectChanges();
      expect(query(".tedi-table-card__body")!.classList).not.toContain(
        "tedi-table-card__body--separator",
      );
    });

    it("drops the header's bottom padding when it is not divided off", () => {
      host.title = "Kadri Kaasik";
      fixture.detectChanges();
      const header = () => query(".tedi-table-card__header")!;

      expect(
        header().style.getPropertyValue("--card-content-padding-bottom"),
      ).toBe("0rem");

      host.collapsible = true;
      fixture.detectChanges();
      expect(
        header().style.getPropertyValue("--card-content-padding-bottom"),
      ).toBe("1rem");
    });
  });

  describe("selectable", () => {
    beforeEach(() => {
      host.selectable = true;
      fixture.detectChanges();
    });

    it("writes the checkbox state back to the binding", () => {
      const checkbox = query(
        ".tedi-table-card__select",
      ) as HTMLInputElement | null;

      expect(checkbox).toBeTruthy();
      expect(checkbox!.checked).toBe(false);

      checkbox!.checked = true;
      checkbox!.dispatchEvent(new Event("change"));
      fixture.detectChanges();

      expect(host.selected).toBe(true);
    });

    it("reflects a selection made through the binding", () => {
      host.selected = true;
      fixture.detectChanges();

      expect(
        (query(".tedi-table-card__select") as HTMLInputElement).checked,
      ).toBe(true);
    });

    it("names the checkbox by the card's title when it has one", () => {
      host.title = "Kadri Kaasik";
      fixture.detectChanges();

      const checkbox = query(".tedi-table-card__select")!;
      const title = query(".tedi-table-card__title")!;

      expect(title.tagName).toBe("LABEL");
      expect(title.getAttribute("for")).toBe(checkbox.id);
      expect(checkbox.id).toBeTruthy();
      expect(title.textContent).toContain("Kadri Kaasik");
      expect(checkbox.getAttribute("aria-label")).toBeNull();
    });

    it("selects the row when the title naming the checkbox is clicked", () => {
      host.title = "Kadri Kaasik";
      fixture.detectChanges();

      const checkbox = query(".tedi-table-card__select") as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      (query(".tedi-table-card__title") as HTMLLabelElement).click();
      fixture.detectChanges();

      expect(checkbox.checked).toBe(true);
      expect(host.selected).toBe(true);
    });

    it("falls back to the translated label when there is no title", () => {
      const checkbox = query(".tedi-table-card__select")!;

      expect(checkbox.getAttribute("aria-labelledby")).toBeNull();
      expect(checkbox.getAttribute("aria-label")).toBeTruthy();
    });

    it("does not lend the title to the checkbox when it already names a toggle", () => {
      host.title = "Kadri Kaasik";
      host.collapsible = true;
      fixture.detectChanges();

      const checkbox = query(".tedi-table-card__select")!;
      expect(query(".tedi-table-card__title")!.tagName).not.toBe("LABEL");
      expect(checkbox.getAttribute("aria-label")).toBeTruthy();
    });
  });
});

describe("TableCard slots", () => {
  let fixture: ComponentFixture<TestSlotsHostComponent>;
  let host: TestSlotsHostComponent;

  const query = (selector: string) =>
    fixture.nativeElement.querySelector(selector) as HTMLElement | null;
  const queryAll = (selector: string) =>
    Array.from(
      fixture.nativeElement.querySelectorAll(selector),
    ) as HTMLElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestSlotsHostComponent],
      providers: [
        breakpointObserverMock,
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "en" },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestSlotsHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("gives the group its own list, separate from the card's rows", () => {
    const lists = queryAll("dl.tedi-table-card-rows");

    expect(lists.length).toBeGreaterThanOrEqual(2);
    expect(query("tedi-table-card-group dl.tedi-table-card-rows")).toBeTruthy();
  });

  it("inherits the card's layout in a group until the group overrides it", () => {
    const groupList = () =>
      query("tedi-table-card-group dl.tedi-table-card-rows")!;

    expect(groupList().classList).toContain("tedi-table-card-rows--vertical");

    host.groupLayout = "horizontal";
    fixture.detectChanges();
    expect(groupList().classList).toContain("tedi-table-card-rows--horizontal");
  });

  it("clamps a span inside a group to the group's own column count", () => {
    const groupRow = () =>
      query("tedi-table-card-group [tedi-table-card-row]")!;

    expect(groupRow().style.gridColumn).toBe("");

    host.groupColumns = 2;
    fixture.detectChanges();
    expect(groupRow().style.gridColumn).toBe("span 2");
  });

  it("inherits the card's label size inside a group", () => {
    const groupLabel = query("tedi-table-card-group .tedi-label")!;

    expect(groupLabel.classList).toContain("tedi-label--small");
  });

  it("sets the group on the muted background and divides it from the rows above", () => {
    const groupContent = query(".tedi-table-card-group__rows-content")!;

    expect(groupContent.classList).toContain(
      "tedi-card-content--background--tertiary",
    );
  });

  it("puts a group's actions on the group background and the card's on its own", () => {
    const [groupActions, cardActions] = queryAll(
      ".tedi-table-card-actions__content",
    );

    expect(groupActions.classList).toContain(
      "tedi-card-content--background--tertiary",
    );
    expect(cardActions.classList).toContain(
      "tedi-card-content--background--primary",
    );
  });

  it("divides only the card's own footer from what precedes it", () => {
    const [groupActions, cardActions] = queryAll("tedi-table-card-actions");

    expect(groupActions.classList).toContain(
      "tedi-table-card-actions--in-group",
    );
    expect(cardActions.classList).not.toContain(
      "tedi-table-card-actions--in-group",
    );
  });

  it("gives every block the card's horizontal padding so they line up", () => {
    const padLeft = (selector: string) =>
      query(selector)!.style.getPropertyValue("--card-content-padding-left");

    host.padding = 2;
    fixture.detectChanges();

    const blocks = [
      ".tedi-table-card__header",
      ".tedi-table-card__rows-content",
      ".tedi-table-card-group__rows-content",
      ".tedi-table-card-summary__content",
      ".tedi-table-card-actions__content",
    ];

    for (const block of blocks) {
      expect([block, padLeft(block)]).toEqual([block, "2rem"]);
    }
  });

  it("keeps the footer's own vertical padding while following the card sideways", () => {
    host.padding = 2;
    fixture.detectChanges();
    const footer = query(".tedi-table-card-actions__content")!;

    expect(footer.style.getPropertyValue("--card-content-padding-top")).toBe(
      "0.5rem",
    );
    expect(footer.style.getPropertyValue("--card-content-padding-right")).toBe(
      "2rem",
    );
  });

  it("drops the rows block when the card has no rows of its own", () => {
    expect(
      query(".tedi-table-card__rows-content")!.hasAttribute("hidden"),
    ).toBe(false);

    host.showRows = false;
    fixture.detectChanges();

    expect(
      query(".tedi-table-card__rows-content")!.hasAttribute("hidden"),
    ).toBe(true);
    // Marks the body so the first group drops the line it would draw above it.
    expect(query(".tedi-table-card__body")!.classList).toContain(
      "tedi-table-card__body--no-rows",
    );
    expect(query("tedi-table-card-group")).toBeTruthy();
  });

  it("lets a group sit on the card surface, footer and all", () => {
    const groupContent = () => query(".tedi-table-card-group__rows-content")!;
    const groupFooter = () => queryAll(".tedi-table-card-actions__content")[0];

    expect(groupContent().classList).toContain(
      "tedi-card-content--background--tertiary",
    );
    expect(groupFooter().classList).toContain(
      "tedi-card-content--background--tertiary",
    );

    host.groupBackground = "primary";
    fixture.detectChanges();

    expect(groupContent().classList).toContain(
      "tedi-card-content--background--primary",
    );
    expect(groupFooter().classList).toContain(
      "tedi-card-content--background--primary",
    );
  });

  it("keeps the summary in one column when the card uses multiple columns", () => {
    host.columns = 2;
    fixture.detectChanges();

    expect(query(".tedi-table-card__rows-content dl")!.classList).toContain(
      "tedi-table-card-rows--columns",
    );
    const summaryRows = query("tedi-table-card-summary dl")!;
    expect(summaryRows.classList).not.toContain(
      "tedi-table-card-rows--columns",
    );
    expect(
      summaryRows.style.getPropertyValue("--_tedi-table-card-columns"),
    ).toBe("1");
  });

  it("renders the summary label and its projected value", () => {
    const summary = query(".tedi-table-card-summary__content")!;

    expect(summary.textContent).toContain("Kokku");
    expect(summary.textContent).toContain("0.00 €");
    expect(summary.classList).toContain(
      "tedi-card-content--background--tertiary",
    );
  });

  it("keeps groups and the summary inside the collapsible body, but not the actions", () => {
    const body = query(".tedi-table-card__body")!;

    expect(body.querySelector("tedi-table-card-group")).toBeTruthy();
    expect(body.querySelector("tedi-table-card-summary")).toBeTruthy();
    expect(body.querySelector(".card-action")).toBeNull();
    expect(query(".card-action")).toBeTruthy();
  });
});

describe("table card rows layout helpers", () => {
  it("defaults a horizontal list to a fixed, gutter-aligned label column", () => {
    expect(getTableCardRowsClasses({ layout: "horizontal" })).toContain(
      "tedi-table-card-rows--label-align-right",
    );
    expect(
      getTableCardRowsStyles({ layout: "horizontal" })[
        "--_tedi-table-card-label-width"
      ],
    ).toBe("var(--text-group-label-width-sm)");
    expect(
      getTableCardRowsStyles({ layout: "horizontal" })[
        "--_tedi-table-card-row-gap"
      ],
    ).toBe("0");
  });

  it("defaults a vertical list to auto labels separated by the layout gutter", () => {
    const classes = getTableCardRowsClasses({ layout: "vertical" });

    expect(classes).not.toContain("tedi-table-card-rows--label-align-right");
    expect(classes).not.toContain("tedi-table-card-rows--value-align-right");
    expect(
      getTableCardRowsStyles({ layout: "vertical" })[
        "--_tedi-table-card-row-gap"
      ],
    ).toBe("var(--layout-grid-gutters-16)");
  });

  it("only centres rows against their labels in horizontal layout", () => {
    expect(
      getTableCardRowsClasses({ layout: "horizontal", rowAlign: "center" }),
    ).toContain("tedi-table-card-rows--row-align-center");
    expect(
      getTableCardRowsClasses({ layout: "vertical", rowAlign: "center" }),
    ).not.toContain("tedi-table-card-rows--row-align-center");
  });

  it("ignores a right value alignment in vertical layout", () => {
    expect(
      getTableCardRowsClasses({ layout: "vertical", valueAlign: "right" }),
    ).not.toContain("tedi-table-card-rows--value-align-right");
  });
});

describe("table card padding helper", () => {
  it("spreads a single number to all four sides", () => {
    expect(getTableCardPaddingSides(2)).toEqual({
      top: 2,
      right: 2,
      bottom: 2,
      left: 2,
    });
  });

  it("maps a vertical / horizontal pair onto the sides it covers", () => {
    expect(getTableCardPaddingSides({ vertical: 2, horizontal: 0.5 })).toEqual({
      top: 2,
      right: 0.5,
      bottom: 2,
      left: 0.5,
    });
  });

  it("passes per-side values through and defaults the omitted ones to zero", () => {
    expect(getTableCardPaddingSides({ top: 1.5, left: 3 })).toEqual({
      top: 1.5,
      right: 0,
      bottom: 0,
      left: 3,
    });
  });
});
