export type CardBorderPlacement = "top" | "left";

export type CardBackground =
  | "primary"
  | "secondary"
  | "tertiary"
  | "accent"
  | "brand-primary"
  | "brand-secondary"
  | "brand-tertiary"
  | "brand-quaternary"
  | "danger-primary"
  | "danger-secondary"
  | "success-primary"
  | "success-secondary"
  | "info-primary"
  | "info-secondary"
  | "warning-primary"
  | "warning-secondary"
  | "neutral-primary"
  | "neutral-secondary";

export type CardBorderType =
  `${CardBorderPlacement}-${CardBackground}` | CardBackground;

export type CardPaddingNumber =
  0 | 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2 | 2.5 | 3;

export type CardPadding =
  | CardPaddingNumber
  | { vertical: CardPaddingNumber; horizontal: CardPaddingNumber }
  | {
      top?: CardPaddingNumber;
      right?: CardPaddingNumber;
      bottom?: CardPaddingNumber;
      left?: CardPaddingNumber;
    };

export type CardBorderRadius =
  | false
  | {
      top?: boolean;
      right?: boolean;
      bottom?: boolean;
      left?: boolean;
      topLeft?: boolean;
      topRight?: boolean;
      bottomRight?: boolean;
      bottomLeft?: boolean;
    };

export type CardResolvedCorners = {
  topLeft: boolean;
  topRight: boolean;
  bottomRight: boolean;
  bottomLeft: boolean;
};

export function getCardBorderPlacementColor(
  border?: CardBorderType,
): [CardBorderPlacement | undefined, CardBackground | undefined] {
  if (!border) {
    return [undefined, undefined];
  }

  if (border.startsWith("top-")) {
    return ["top", border.slice("top-".length) as CardBackground];
  }

  if (border.startsWith("left-")) {
    return ["left", border.slice("left-".length) as CardBackground];
  }

  return [undefined, border as CardBackground];
}

export function getPaddingCssVariables(
  padding: CardPadding,
): Record<string, string> {
  if (typeof padding === "number") {
    return {
      "--card-content-padding-top": `${padding}rem`,
      "--card-content-padding-right": `${padding}rem`,
      "--card-content-padding-bottom": `${padding}rem`,
      "--card-content-padding-left": `${padding}rem`,
    };
  }

  if ("vertical" in padding && "horizontal" in padding) {
    return {
      "--card-content-padding-top": `${padding.vertical}rem`,
      "--card-content-padding-right": `${padding.horizontal}rem`,
      "--card-content-padding-bottom": `${padding.vertical}rem`,
      "--card-content-padding-left": `${padding.horizontal}rem`,
    };
  }

  const { top = 0, right = 0, bottom = 0, left = 0 } = padding;
  return {
    "--card-content-padding-top": `${top}rem`,
    "--card-content-padding-right": `${right}rem`,
    "--card-content-padding-bottom": `${bottom}rem`,
    "--card-content-padding-left": `${left}rem`,
  };
}

export function resolveCardBorderRadius(
  config?: CardBorderRadius,
): CardResolvedCorners {
  if (config === false) {
    return {
      topLeft: false,
      topRight: false,
      bottomRight: false,
      bottomLeft: false,
    };
  }

  const {
    top,
    right,
    bottom,
    left,
    topLeft,
    topRight,
    bottomRight,
    bottomLeft,
  } = config ?? {};

  const sideTop = top !== false;
  const sideRight = right !== false;
  const sideBottom = bottom !== false;
  const sideLeft = left !== false;

  // corner overrides take precedence over side values
  return {
    topLeft: topLeft ?? (sideTop && sideLeft),
    topRight: topRight ?? (sideTop && sideRight),
    bottomRight: bottomRight ?? (sideBottom && sideRight),
    bottomLeft: bottomLeft ?? (sideBottom && sideLeft),
  };
}
