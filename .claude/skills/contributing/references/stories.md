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
- **States story** — if Figma has a states showcase (showing default, hover, active, focus, disabled side by side), create a `States` story that renders all states together using `storybook-addon-pseudo-states` parameters:
  ```typescript
  export const States: StoryObj<ComponentName> = {
    render: () => ({
      template: `
        <div style="display: flex; gap: 1rem;">
          <tedi-component>Default</tedi-component>
          <tedi-component>Hover</tedi-component>
          <tedi-component>Active</tedi-component>
          <tedi-component>Focus</tedi-component>
          <tedi-component [disabled]="true">Disabled</tedi-component>
        </div>
      `,
    }),
    parameters: {
      pseudo: {
        hover: 'tedi-component:nth-of-type(2)',
        active: 'tedi-component:nth-of-type(3)',
        focusVisible: 'tedi-component:nth-of-type(4)',
      },
    },
  };
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
    status: { type: ['partiallyTediReady'] },
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
- [ ] `Default` story has all controls wired up via `args`
- [ ] States story covers all visual states shown in Figma (default, hover, active, focus, disabled)
- [ ] Reactive forms example included if the component implements ControlValueAccessor
- [ ] Figma link is in the meta `parameters.design` and in the JSDoc comment above `export default`

### 6. argTypes Convention

```typescript
argTypes: {
  inputName: {
    description: 'Brief description of what this input controls',
    control: { type: 'radio' },  // or 'select', 'boolean', 'text', 'number'
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
