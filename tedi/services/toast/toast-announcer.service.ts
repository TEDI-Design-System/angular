import { Injectable, inject, OnDestroy } from "@angular/core";
import { DOCUMENT } from "@angular/common";

export type ToastPoliteness = "polite" | "assertive";

const ANNOUNCE_DELAY = 100;
const DEFAULT_CLEAR_DELAY = 1000;

/**
 * Announcer for toast notifications. Deliberately not CDK's `LiveAnnouncer`:
 * that one needs `cdk-visually-hidden` from CDK's prebuilt stylesheet, which
 * this library does not ship, and it reuses a single element whose `aria-live`
 * is rewritten per announcement — TalkBack ignores regions mutated that way.
 *
 * Instead, one region per politeness level is created up front and kept for the
 * application's lifetime, and each message is appended as its own child so that
 * rapid successive toasts queue instead of overwriting each other.
 *
 * @internal
 */
@Injectable({ providedIn: "root" })
export class ToastAnnouncerService implements OnDestroy {
  private readonly document = inject(DOCUMENT);

  private readonly regions = new Map<ToastPoliteness, HTMLElement>();
  private readonly timeouts = new Set<ReturnType<typeof setTimeout>>();

  constructor() {
    this.getRegion("polite");
    this.getRegion("assertive");
  }

  /**
   * Announce a message to screen readers.
   * @param message The message to announce
   * @param politeness The politeness level: 'polite' (default) or 'assertive'
   * @param clearAfterMs Time in ms after which to remove the message (default: 1000ms)
   */
  announce(
    message: string,
    politeness: ToastPoliteness = "polite",
    clearAfterMs: number = DEFAULT_CLEAR_DELAY
  ): void {
    const region = this.getRegion(politeness);
    const entry = this.document.createElement("div");
    entry.textContent = message;

    this.schedule(() => {
      region.appendChild(entry);
      this.schedule(() => entry.remove(), clearAfterMs);
    }, ANNOUNCE_DELAY);
  }

  /**
   * Remove all pending and announced messages, keeping the live regions in place.
   */
  clear(): void {
    this.cancelPending();
    this.regions.forEach((region) => {
      region.textContent = "";
    });
  }

  destroy(): void {
    this.cancelPending();
    this.regions.forEach((region) => region.remove());
    this.regions.clear();
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  private schedule(callback: () => void, delay: number): void {
    const timeout = setTimeout(() => {
      this.timeouts.delete(timeout);
      callback();
    }, delay);
    this.timeouts.add(timeout);
  }

  private cancelPending(): void {
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts.clear();
  }

  private getRegion(politeness: ToastPoliteness): HTMLElement {
    const existing = this.regions.get(politeness);
    if (existing) {
      return existing;
    }

    const region = this.document.createElement("div");
    region.setAttribute("aria-live", politeness);
    // Messages are appended as children, so the region must not be atomic —
    // otherwise every append re-announces the messages already present.
    region.setAttribute("aria-atomic", "false");
    region.classList.add("sr-only");
    region.id = `tedi-toast-announcer-${politeness}`;
    this.document.body.appendChild(region);
    this.regions.set(politeness, region);

    return region;
  }
}
