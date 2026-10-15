import { isDevMode } from "@angular/core";

const warned = new Set<string>();

/**
 * Logs a deprecation warning once per component, in dev mode only.
 * @internal
 */
export function warnDeprecated(name: string, message: string): void {
  if (!isDevMode() || warned.has(name)) return;
  warned.add(name);
  console.warn(`[TEDI] ${name} is deprecated. ${message}`);
}
