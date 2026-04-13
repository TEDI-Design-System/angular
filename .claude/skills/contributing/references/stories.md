# Create TEDI Angular Storybook Stories

Target component: `$ARGUMENTS`

## Workflow

### 1. Understand the Component

1. Read the component's `.component.ts` to understand all inputs, outputs, types, and variants.
2. Read the component's `.component.html` for content projection slots.
3. **Figma is the source of truth for stories.** If the component or its stories file contains a Figma link, use `figma-desktop` MCP to fetch the design. If no link exists, ask the user for one.
4. Check if TEDI React (`../react/src/tedi/components/`) has stories for the equivalent component — use as reference for story coverage.

### 2. Map Figma Sections to Stories

**Stories must match Figma 1:1 in order and naming.** Each distinct section/example in the Figma component page becomes a named story export:

| Figma section | Story export name |
|---|---|
| "Default" | `Default` |
| "With icon" | `WithIcon` |
| "With dropdown" | `WithDropdown` |
| "With status" | `WithStatus` |
| States showcase (default, hover, active, focus, disabled) | `States` |

Rules:
- **Same order** — export stories in the same top-to-bottom order as they appear in Figma.
- **Same examples** — reproduce the exact content/data shown in Figma (labels, placeholder text, number of items). Do not invent different example data.
- **Same variants** — if Figma shows 3 tabs with specific labels, use those exact labels.
- **States story** — every component that can be activated or has visual states (hover, active, focus, disabled, selected, error, etc.) **must** have a `States` story. Use a table-like layout with `tedi-row`/`tedi-col` grid components, one row per state. Each row has a bold label in the first column and the component in the second column. Use `storybook-addon-pseudo-states` parameters for hover/active/focus. If the component has multiple variants, show them **side by side in columns** (not stacked vertically) — one column per variant with a bold header row, like a comparison table.

  Required imports: `RowComponent`, `ColComponent`, `TextComponent` from `@tedi-design-system/angular/tedi`.

  Define states as a constant and iterate with `*ngFor`:
  ```typescript
  const PSEUDO_STATE = ['Default', 'Hover', 'Active', 'Focus', 'Disabled'];

  export const States: StoryObj<ComponentName> = {
    parameters: {
      pseudo: {
        hover: '#Hover',
        active: '#Active',
        focusVisible: '#Focus',
      },
    },
    render: () => ({
      props: { PSEUDO_STATE },
      template: `
        <tedi-row [cols]="1" [gapY]="3">
          <tedi-row cols="1" [sm]="{ cols: 6 }" *ngFor="let state of PSEUDO_STATE;" alignItems="center">
            <tedi-col width="1">
              <p tedi-text modifiers="bold">{{ state }}</p>
            </tedi-col>
            <tedi-col width="5">
              <tedi-component
                [id]="state"
                [disabled]="state === 'Disabled'"
              />
            </tedi-col>
          </tedi-row>
        </tedi-row>
      `,
    }),
  };
  ```

  Key rules:
  - Each state's component must have `[id]="state"` so pseudo-state selectors (`#Hover`, `#Active`, `#Focus`) can target it.
  - Include all relevant states for the component (e.g., `Selected`, `Error`, `Success` where applicable).
  - Reference `text-field.stories.ts` as the canonical example.

- **Variant comparison layout** — when a component has multiple variants (e.g., primary/secondary), always show them **side by side** in a `tedi-row` grid, not stacked vertically. Use a header row with bold labels for each variant column:
  ```html
  <tedi-row [cols]="2" [gapY]="3">
    <tedi-col><p tedi-text modifiers="bold">Primary</p></tedi-col>
    <tedi-col><p tedi-text modifiers="bold">Secondary</p></tedi-col>
    <tedi-col><!-- primary content --></tedi-col>
    <tedi-col><!-- secondary content --></tedi-col>
  </tedi-row>
  ```
  For states with variants, use a 3-column layout (State | Primary | Secondary):
  ```html
  <tedi-row [cols]="3" [gapY]="3" alignItems="center">
    <tedi-col><p tedi-text modifiers="bold">State</p></tedi-col>
    <tedi-col><p tedi-text modifiers="bold">Primary</p></tedi-col>
    <tedi-col><p tedi-text modifiers="bold">Secondary</p></tedi-col>
    <!-- one row per state -->
  </tedi-row>
  ```

### 3. Determine the Story Category

Find where the component lives under `tedi/components/` and map to the Storybook title:

| Component path | Story title prefix |
|---|---|
| `tedi/components/form/` | `TEDI-Ready/Components/Form/` |
| `tedi/components/buttons/` | `TEDI-Ready/Components/Buttons/` |
| `tedi/components/overlay/` | `TEDI-Ready/Components/Overlay/` |
| `tedi/components/navigation/` | `TEDI-Ready/Components/Navigation/` |
| Other category | `TEDI-Ready/Components/<Category>/` |

### 4. Create the Stories File

Follow this structure:

```typescript
import { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ComponentName } from './index';

/**
 * <a href="https://www.figma.com/design/..." target="_BLANK">Figma ↗</a>
 */

export default {
  title: 'TEDI-Ready/Components/Category/ComponentName',
  component: ComponentName,
  decorators: [
    moduleMetadata({
      imports: [ComponentName, /* required dependencies */],
    }),
  ],
  parameters: {
    design: { type: 'figma', url: 'https://www.figma.com/...' },
  },
  argTypes: {
    // One entry per public input
  },
} as Meta<ComponentName>;
```

### 5. Story Checklist

- [ ] Every Figma section has a corresponding story export, in the same order
- [ ] Example content (labels, data, item count) matches Figma exactly
- [ ] Every public input/model has a corresponding `argTypes` entry with description, control, type summary, and default value
- [ ] `Default` story has all controls wired up via `args`
- [ ] States story covers all visual states shown in Figma (default, hover, active, focus, disabled)
- [ ] Reactive forms example included if the component implements ControlValueAccessor
- [ ] Figma link is in the meta `parameters.design` and in the JSDoc comment above `export default`

### 6. argTypes Convention

**Every public input/model must have an argTypes entry.** Do not skip any — all props must appear in the Storybook controls panel with correct typing and descriptions.

Each entry must include:
- `description` — brief explanation of what the input controls
- `control` — appropriate control type (`'radio'`, `'select'`, `'boolean'`, `'text'`, `'number'`, `'object'`)
- `options` — for enum/union type inputs, list all possible values
- `table.category` — always `'inputs'`
- `table.type.summary` — the TypeScript type name (e.g., `'boolean'`, `'string'`, `'FilterVariant'`, `'FilterOption[]'`)
- `table.defaultValue.summary` — the default value

```typescript
argTypes: {
  inputName: {
    description: 'Brief description of what this input controls',
    control: { type: 'radio' },  // or 'select', 'boolean', 'text', 'number', 'object'
    options: ['value1', 'value2'],
    table: {
      category: 'inputs',
      type: { summary: 'TypeName' },
      defaultValue: { summary: 'defaultValue' },
    },
  },
}
```

### 7. Verify

Run Storybook to visually confirm stories render correctly:
```bash
npm start
```

Check that:
- All stories appear in the correct category
- Story order matches Figma section order
- Example content matches Figma
- Controls work interactively
- No console errors
