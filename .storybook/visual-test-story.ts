import type { IStory } from "@storybook/angular";
import { TextComponent } from "../src/tedi/components/base/text/text.component";
import { ColComponent } from "../src/tedi/components/helpers/grid/col/col.component";
import { RowComponent } from "../src/tedi/components/helpers/grid/row/row.component";

/**
 * The parts of a docs story (`StoryObj`) that a `VisualTest` block needs. `never` parameters accept
 * any story's `render`, whatever its args type.
 */
export interface VisualTestStory {
  args?: object;
  render?: (args: never, context: never) => IStory;
}

export interface VisualTestBlock {
  /** Bold label above the block, so a Chromatic diff is easy to place. */
  label: string;
  /** Docs story to render. Pass a story-like `{ render }` for markup that isn't a docs story. */
  story: VisualTestStory;
  /** Args merged over the story's own, e.g. a unique `ariaLabel` for a repeated landmark. */
  args?: object;
}

export interface VisualTestOptions {
  /** Args every block starts from, usually the meta's `args`. */
  args?: object;
  /** Render for stories without their own, usually the meta's `render`. */
  render?: VisualTestStory["render"];
}

type Imports = NonNullable<NonNullable<IStory["moduleMetadata"]>["imports"]>;

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

/**
 * Builds a `VisualTest` story's render result from docs stories, so a later change to a docs story
 * reaches Chromatic. Each block renders the story's own template with its own props.
 *
 * A prop that every block binds to the same value (or only one block binds) goes on the composite
 * itself, so two-way bindings (`[(x)]`) keep working. Only when blocks bind one name to different
 * values is it re-declared with `@let` inside an `@if (true)` block, which scopes it to that block;
 * `@let` is read-only, so such a prop can't be two-way bound.
 *
 * Throws when neither the story nor `options` has a `render`, or the render returns no template, so the test-runner fails
 * instead of Chromatic snapshotting an empty block.
 */
export const visualTest = (
  blocks: VisualTestBlock[],
  options: VisualTestOptions = {},
): IStory => {
  const imports: Imports = [RowComponent, ColComponent, TextComponent];

  const rendered = blocks.map(({ label, story, args }) => {
    const render = story.render ?? options.render;
    if (!render) {
      throw new Error(`visualTest: "${label}" has no render.`);
    }

    const result = render(
      { ...options.args, ...story.args, ...args } as never,
      {} as never,
    );

    if (!result.template) {
      throw new Error(`visualTest: "${label}" renders no template.`);
    }

    imports.push(...(result.moduleMetadata?.imports ?? []));
    const props = (result.props ?? {}) as Record<string, unknown>;

    return { label, props, template: result.template };
  });

  // A prop is shared when no other block binds the same name to a different value.
  const shared: Record<string, unknown> = {};
  const clashing = new Set<string>();
  rendered.forEach(({ props }) =>
    Object.entries(props).forEach(([key, value]) => {
      if (key in shared && shared[key] !== value) {
        clashing.add(key);
      }
      shared[key] = value;
    }),
  );
  clashing.forEach((key) => delete shared[key]);

  const vt = rendered.map(({ props }) => props);

  const cols = rendered.map(({ label, props, template }, index) => {
    const lets = Object.keys(props)
      .filter((key) => clashing.has(key) && IDENTIFIER.test(key))
      .map((key) => `@let ${key} = vt[${index}].${key};`)
      .join("\n");

    return `
      <tedi-col>
        <p tedi-text modifiers="bold">${label}</p>
        @if (true) {
          ${lets}
          ${template}
        }
      </tedi-col>`;
  });

  return {
    moduleMetadata: { imports },
    props: { ...shared, vt },
    template: `<tedi-row [cols]="1" [gapY]="4">${cols.join("")}</tedi-row>`,
  };
};
