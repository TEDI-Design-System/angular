import { usePagination } from "./pagination.utils";

describe("usePagination", () => {
  it("returns an empty list when pageCount is 0", () => {
    expect(usePagination({ page: 1, pageCount: 0 })).toEqual([]);
  });

  it("renders every page when pageCount is small enough", () => {
    const items = usePagination({ page: 2, pageCount: 4 });
    const pages = items
      .filter((item) => item.type === "page")
      .map((item) => item.page);
    expect(pages).toEqual([1, 2, 3, 4]);
    expect(items.some((item) => item.type === "ellipsis")).toBe(false);
  });

  it("inserts an ellipsis on each side when the active page is in the middle", () => {
    const items = usePagination({
      page: 20,
      pageCount: 40,
      boundaryCount: 1,
      siblingCount: 1,
    });
    const ellipses = items.filter((item) => item.type === "ellipsis");
    expect(ellipses).toHaveLength(2);
  });

  it("marks the current page as selected", () => {
    const items = usePagination({ page: 3, pageCount: 10 });
    const selected = items.find((item) => item.selected);
    expect(selected?.page).toBe(3);
  });

  it("clamps out-of-range page inputs", () => {
    const low = usePagination({ page: -5, pageCount: 10 });
    const high = usePagination({ page: 99, pageCount: 10 });
    expect(low.find((i) => i.selected)?.page).toBe(1);
    expect(high.find((i) => i.selected)?.page).toBe(10);
  });

  it("disables Previous on the first page and Next on the last", () => {
    const first = usePagination({ page: 1, pageCount: 10 });
    const last = usePagination({ page: 10, pageCount: 10 });
    expect(first[0]).toEqual(
      expect.objectContaining({ type: "previous", disabled: true }),
    );
    expect(last[last.length - 1]).toEqual(
      expect.objectContaining({ type: "next", disabled: true }),
    );
  });

  it("produces the same number of slots for every page when pageCount exceeds the window", () => {
    const pageCount = 30;
    const counts = new Set(
      Array.from(
        { length: pageCount },
        (_, index) => usePagination({ page: index + 1, pageCount }).length,
      ),
    );
    expect(counts.size).toBe(1);
  });

  it("keeps the slot count constant with custom boundary + sibling counts", () => {
    const counts = new Set(
      Array.from(
        { length: 25 },
        (_, index) =>
          usePagination({
            page: index + 1,
            pageCount: 25,
            boundaryCount: 2,
            siblingCount: 2,
          }).length,
      ),
    );
    expect(counts.size).toBe(1);
  });

  it("swaps the ellipsis for an extra page number when near the start boundary", () => {
    const nearStart = usePagination({ page: 2, pageCount: 20 });
    const middle = usePagination({ page: 10, pageCount: 20 });

    expect(nearStart.filter((item) => item.type === "ellipsis").length).toBe(1);
    expect(middle.filter((item) => item.type === "ellipsis").length).toBe(2);
    expect(nearStart.length).toBe(middle.length);
  });
});
