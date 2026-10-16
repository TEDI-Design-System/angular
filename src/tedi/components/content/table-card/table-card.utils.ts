import { InjectionToken, Signal } from "@angular/core";
import { CardPadding, CardPaddingNumber } from "../card/card.utils";

export type TableCardLayout = "horizontal" | "vertical";

export type TableCardAlign = "left" | "right";

export type TableCardRowAlign = "start" | "center";

export type TableCardLabelSize = "small" | "default";

export type TableCardColumnSizing = "equal" | "auto";

/**
 * Layout settings shared by card, group and summary rows.
 */
export type TableCardRowsLayoutInputs = {
  layout?: TableCardLayout;
  columns?: number;
  columnSizing?: TableCardColumnSizing;
  labelWidth?: string | number;
  labelAlign?: TableCardAlign;
  valueAlign?: TableCardAlign;
  rowAlign?: TableCardRowAlign;
  rowGap?: string | number;
};

const LAYOUT_DEFAULTS = {
  horizontal: {
    labelAlign: "right",
    valueAlign: "right",
    labelWidth: "var(--text-group-label-width-sm)",
    rowGap: "0",
  },
  vertical: {
    labelAlign: "left",
    valueAlign: "left",
    labelWidth: "auto",
    rowGap: "var(--layout-grid-gutters-16)",
  },
} as const satisfies Record<
  TableCardLayout,
  {
    labelAlign: TableCardAlign;
    valueAlign: TableCardAlign;
    labelWidth: string;
    rowGap: string;
  }
>;

function resolveLabelWidth(labelWidth: string | number): string {
  return typeof labelWidth === "number" ? `${labelWidth}px` : labelWidth;
}

function resolveRowGap(rowGap: string | number): string {
  return typeof rowGap === "number" ? `${rowGap}rem` : rowGap;
}

export function getTableCardRowsClasses(
  inputs: TableCardRowsLayoutInputs,
): string {
  const layout = inputs.layout ?? "horizontal";
  const defaults = LAYOUT_DEFAULTS[layout];
  const columns = inputs.columns ?? 1;
  const labelAlign = inputs.labelAlign ?? defaults.labelAlign;
  const valueAlign = inputs.valueAlign ?? defaults.valueAlign;
  const classList = ["tedi-table-card-rows", `tedi-table-card-rows--${layout}`];

  if (columns > 1) {
    classList.push("tedi-table-card-rows--columns");

    if ((inputs.columnSizing ?? "equal") === "auto") {
      classList.push("tedi-table-card-rows--columns-auto");
    }
  }

  if (labelAlign === "right") {
    classList.push("tedi-table-card-rows--label-align-right");
  }

  if (layout === "horizontal" && valueAlign === "right") {
    classList.push("tedi-table-card-rows--value-align-right");
  }

  if (layout === "horizontal" && (inputs.rowAlign ?? "start") === "center") {
    classList.push("tedi-table-card-rows--row-align-center");
  }

  return classList.join(" ");
}

export function getTableCardRowsStyles(
  inputs: TableCardRowsLayoutInputs,
): Record<string, string> {
  const layout = inputs.layout ?? "horizontal";
  const defaults = LAYOUT_DEFAULTS[layout];

  return {
    "--_tedi-table-card-columns": `${inputs.columns ?? 1}`,
    "--_tedi-table-card-label-width": resolveLabelWidth(
      inputs.labelWidth ?? defaults.labelWidth,
    ),
    "--_tedi-table-card-row-gap": resolveRowGap(
      inputs.rowGap ?? defaults.rowGap,
    ),
  };
}

/**
 * Provides rows with the label size and column count of their enclosing card or group.
 */
export interface TableCardRowsContext {
  resolvedLabelSize: Signal<TableCardLabelSize>;
  resolvedColumns: Signal<number>;
}

export const TEDI_TABLE_CARD_ROWS_CONTEXT =
  new InjectionToken<TableCardRowsContext>("TEDI_TABLE_CARD_ROWS_CONTEXT");

export type TableCardPaddingSides = Record<
  "top" | "right" | "bottom" | "left",
  CardPaddingNumber
>;

/**
 * Resolves padding into four sides, defaulting omitted sides to zero.
 */
export function getTableCardPaddingSides(
  padding: CardPadding,
): TableCardPaddingSides {
  if (typeof padding === "number") {
    return { top: padding, right: padding, bottom: padding, left: padding };
  }

  if ("vertical" in padding && "horizontal" in padding) {
    return {
      top: padding.vertical,
      right: padding.horizontal,
      bottom: padding.vertical,
      left: padding.horizontal,
    };
  }

  const { top = 0, right = 0, bottom = 0, left = 0 } = padding;

  return { top, right, bottom, left };
}
