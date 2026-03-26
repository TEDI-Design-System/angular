# Test & Verify TEDI Component

Target: `$ARGUMENTS`

## Workflow

### 1. Run Tests

If a path was provided, run tests for that specific component:
```bash
npx jest $ARGUMENTS
```

If no path was provided, run the full test suite:
```bash
npm test
```

### 2. Analyze Failures

If tests fail:
- Read the failing test file and the component source.
- Identify the root cause — is it a test issue or a component bug?
- Fix the issue in the appropriate file.
- Re-run the failing test to confirm the fix.

### 3. Run Lint

```bash
npm run lint
```

### 4. Fix Lint Errors

If lint reports errors:
- Fix each reported issue in the source file.
- Re-run lint to confirm all errors are resolved.

### 5. Known Workarounds

#### jsdom CSS `@layer` parse errors

jsdom <22 does not support CSS `@layer` rules. Angular CDK overlay injects styles
that use `@layer cdk-overlay { ... }`, which causes jsdom to emit
`"Could not parse CSS stylesheet"` errors via its VirtualConsole.

**Root cause**: jsdom's VirtualConsole forwards parse errors to `context.console.error`,
which is jest's buffered console — not `globalThis.console`. Patching `console.error`
in `setup-jest.ts` or test files has no effect because jest captures these at the
environment level before any userland code runs.

**Solution**: A custom jest environment (`jest-jsdom-env.ts`) extends
`jest-preset-angular`'s environment and intercepts `context.console.error` in the
constructor, filtering out the CSS parse errors before they reach jest's reporter.

```ts
// jest-jsdom-env.ts
import JestEnvironment from "jest-preset-angular/environments/jest-jsdom-env";
import type { JestEnvironmentConfig, EnvironmentContext } from "@jest/environment";

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
```

Referenced in `jest.config.ts` as `testEnvironment: "<rootDir>/jest-jsdom-env.ts"`.

This will no longer be needed once jsdom is upgraded to 22+ (requires a newer
`jest-environment-jsdom` or switching to a package like `jest-environment-jsdom-global`).

### 6. Report

Summarize what was run and the outcome:
- Tests: pass/fail count
- Lint: clean or what was fixed
- Any issues that need manual attention
