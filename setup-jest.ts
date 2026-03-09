import { setupZoneTestEnv } from "jest-preset-angular/setup-env/zone";

setupZoneTestEnv();

// Mock scrollIntoView which is not implemented in jsdom
Element.prototype.scrollIntoView = jest.fn();

// Mock window.matchMedia which is not implemented in jsdom
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suppress CSS parsing errors from jsdom (it doesn't support all modern CSS features)
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const message = args[0]?.toString() ?? "";
  if (message.includes("Could not parse CSS stylesheet")) {
    return;
  }
  originalConsoleError.apply(console, args);
};
