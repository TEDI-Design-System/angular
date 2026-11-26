import { InjectionToken, Signal } from "@angular/core";

export type ProcessTimelineOrientation = "horizontal" | "vertical";
export type ProcessTimelineConnectorThickness = 1 | 2;

export interface ProcessTimelineContext {
  readonly vertical: Signal<boolean>;
  readonly connectorThickness: Signal<ProcessTimelineConnectorThickness>;
  readonly items: Signal<readonly unknown[]>;
}

export const PROCESS_TIMELINE = new InjectionToken<ProcessTimelineContext>(
  "PROCESS_TIMELINE",
);
