import JestEnvironment from "jest-preset-angular/environments/jest-jsdom-env";
import type { JestEnvironmentConfig, EnvironmentContext } from "@jest/environment";

/**
 * Custom jest environment that suppresses jsdom "Could not parse CSS stylesheet"
 * errors. These occur because jsdom <22 does not support CSS @layer rules used
 * by Angular CDK overlay styles.
 */
export default class PatchedJsdomEnvironment extends JestEnvironment {
  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    const originalError = context.console.error.bind(context.console);
    context.console.error = (...args: Parameters<typeof console.error>) => {
      const first = args[0];
      if (
        first instanceof Error &&
        first.message === "Could not parse CSS stylesheet"
      ) {
        return;
      }
      originalError(...args);
    };

    super(config, context);
  }
}
