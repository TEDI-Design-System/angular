import { Injectable, inject, OnDestroy } from "@angular/core";
import { DOCUMENT } from "@angular/common";

/**
 * Custom announcer service for toast notifications that uses the `sr-only` class
 * instead of CDK's LiveAnnouncer which requires CDK styles.
 *
 * Creates a visually hidden element that screen readers can access to announce
 * toast messages with appropriate politeness levels.
 *
 * @internal
 */
@Injectable({ providedIn: "root" })
export class ToastAnnouncerService implements OnDestroy {
  private readonly document = inject(DOCUMENT);

  private politeElement: HTMLElement | null = null;
  private assertiveElement: HTMLElement | null = null;

  /**
   * Announce a message to screen readers.
   * @param message The message to announce
   * @param politeness The politeness level: 'polite' (default) or 'assertive'
   * @param clearAfterMs Time in ms after which to clear the message (default: 1000ms)
   */
  announce(
    message: string,
    politeness: "polite" | "assertive" = "polite",
    clearAfterMs: number = 1000,
  ): void {
    const element = this.getOrCreateElement(politeness);
    element.textContent = "";

    // Use a small timeout to ensure screen readers detect the change
    setTimeout(() => {
      element.textContent = message;
      setTimeout(() => {
        element.textContent = "";
      }, clearAfterMs);
    }, 100);
  }

  /**
   * Clear all announcements text content.
   */
  clear(): void {
    if (this.politeElement) {
      this.politeElement.textContent = "";
    }
    if (this.assertiveElement) {
      this.assertiveElement.textContent = "";
    }
  }

  destroy(): void {
    this.politeElement?.remove();
    this.assertiveElement?.remove();
    this.politeElement = null;
    this.assertiveElement = null;
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  private getOrCreateElement(politeness: "polite" | "assertive"): HTMLElement {
    if (politeness === "assertive") {
      if (!this.assertiveElement) {
        this.assertiveElement = this.createAnnouncerElement("assertive");
      }
      return this.assertiveElement;
    } else {
      if (!this.politeElement) {
        this.politeElement = this.createAnnouncerElement("polite");
      }
      return this.politeElement;
    }
  }

  private createAnnouncerElement(
    politeness: "polite" | "assertive",
  ): HTMLElement {
    const element = this.document.createElement("span");
    element.setAttribute("aria-live", politeness);
    element.setAttribute("aria-atomic", "true");
    element.setAttribute(
      "role",
      politeness === "assertive" ? "alert" : "status",
    );
    element.classList.add("sr-only");
    element.id = `tedi-toast-announcer-${politeness}`;
    this.document.body.appendChild(element);
    return element;
  }
}
