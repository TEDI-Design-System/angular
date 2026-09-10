export type HeaderAlignment =
  | "flex-start"
  | "center"
  | "flex-end"
  | "space-between"
  | "space-around"
  | "space-evenly";

/**
 * Maps a `HeaderAlignment` value to the global `justify-content-*` utility class,
 * so header components reuse the shared utilities instead of redefining the same
 * `justify-content` modifiers.
 */
export const headerAlignmentUtility: Record<HeaderAlignment, string> = {
  "flex-start": "justify-content-start",
  center: "justify-content-center",
  "flex-end": "justify-content-end",
  "space-between": "justify-content-between",
  "space-around": "justify-content-around",
  "space-evenly": "justify-content-evenly",
};
