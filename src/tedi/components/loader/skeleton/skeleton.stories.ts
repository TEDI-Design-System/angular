import { Component, OnDestroy, signal } from "@angular/core";
import {
  Meta,
  StoryObj,
  argsToTemplate,
  moduleMetadata,
} from "@storybook/angular";
import { ComponentInputs } from "../../../types/inputs.type";
import { SkeletonComponent } from "./skeleton.component";
import {
  SkeletonBlockComponent,
  SkeletonBlockTextHeight,
} from "./skeleton-block/skeleton-block.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { TextComponent } from "../../base/text/text.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";

/**
 * The wrapper's own inputs plus the projected block's, so the Default story can
 * drive a single block from the controls panel.
 */
type StoryArgs = ComponentInputs<SkeletonComponent> &
  Partial<Pick<ComponentInputs<SkeletonBlockComponent>, "width" | "height">>;

const TEXT_HEIGHTS: SkeletonBlockTextHeight[] = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
];

type AccessibilityLoader = {
  id: number;
  duration: number;
  color?: string;
  label?: string;
  completedLabel?: string;
};

@Component({
  standalone: true,
  selector: "tedi-skeleton-accessibility-demo",
  imports: [
    SkeletonComponent,
    SkeletonBlockComponent,
    ButtonComponent,
    RowComponent,
    ColComponent,
    TextComponent,
  ],
  template: `
    <tedi-row [cols]="1" [gapY]="3">
      <tedi-col>
        <tedi-row [cols]="3" [gapX]="2" [gapY]="2">
          <tedi-col>
            <button tedi-button (click)="add({ duration: 900 })">
              Add a short loading block
            </button>
          </tedi-col>
          <tedi-col>
            <button
              tedi-button
              (click)="add({ duration: 3000, color: 'var(--tedi-red-600)' })"
            >
              Add a long loading block
            </button>
          </tedi-col>
          <tedi-col>
            <button
              tedi-button
              (click)="
                add({
                  duration: 3000,
                  color: 'var(--tedi-green-600)',
                  label: 'Custom block is loading',
                  completedLabel: 'Custom block has finished loading',
                })
              "
            >
              Render loading block with custom labels
            </button>
          </tedi-col>
        </tedi-row>
      </tedi-col>
      <tedi-col>
        @if (loaders().length) {
          <tedi-row [cols]="12" [gapX]="2" [gapY]="2">
            @for (loader of loaders(); track loader.id) {
              <tedi-col [width]="12" [md]="{ width: 3 }">
                <tedi-skeleton
                  [label]="loader.label"
                  [completedLabel]="loader.completedLabel"
                  [style.--loader-skeleton-color]="loader.color"
                >
                  <tedi-skeleton-block [width]="100" height="p" />
                  <tedi-skeleton-block [width]="75" [height]="29" />
                  <tedi-skeleton-block [width]="40" [height]="50" />
                  <tedi-skeleton-block [width]="80" />
                </tedi-skeleton>
              </tedi-col>
            }
          </tedi-row>
        } @else {
          <p tedi-text color="tertiary">No loaders</p>
        }
      </tedi-col>
    </tedi-row>
  `,
})
class AccessibilityDemoComponent implements OnDestroy {
  loaders = signal<AccessibilityLoader[]>([]);

  private nextId = 0;
  private timers = new Set<ReturnType<typeof setTimeout>>();

  add(loader: Omit<AccessibilityLoader, "id">) {
    const id = this.nextId++;

    this.loaders.update((current) => [...current, { ...loader, id }]);

    const timer = setTimeout(() => {
      this.timers.delete(timer);
      this.loaders.update((current) => current.filter((l) => l.id !== id));
    }, loader.duration);

    this.timers.add(timer);
  }

  ngOnDestroy() {
    this.timers.forEach(clearTimeout);
    this.timers.clear();
  }
}

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.75.90?node-id=2188-34298&m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/429294-skeleton" target="_blank">Zeroheight ↗</a>
 *
 * `<tedi-skeleton>` stacks the blocks projected into it and announces the
 * loading state; `<tedi-skeleton-block>` draws one placeholder. Use one wrapper
 * per loading region, not one per block.
 *
 * The wrapper carries `aria-busy="true"` and a `role="status"` live region.
 * Since it is removed once content arrives, set `aria-busy="false"` yourself on
 * the region that swaps skeleton for content.
 *
 * A block's `width` and `height` can be set per breakpoint with the `xs`–`xxl`
 * inputs, mobile-first. See the **Responsive** story.
 */
export default {
  title: "TEDI-Ready/Components/Loader/Skeleton",
  component: SkeletonComponent,
  decorators: [
    moduleMetadata({
      imports: [
        SkeletonComponent,
        SkeletonBlockComponent,
        AccessibilityDemoComponent,
      ],
    }),
  ],
  parameters: {
    status: {
      type: ["breakpointSupport"],
    },
  },
  argTypes: {
    label: {
      description:
        "Announced once the skeleton has been on screen for `labelDelay`. Name what is loading.",
      control: "text",
      table: {
        category: "inputs",
        type: { summary: "string" },
        defaultValue: { summary: "skeleton.loading translation" },
      },
    },
    completedLabel: {
      description:
        "Announced when the skeleton is removed. Silent if `label` was never announced.",
      control: "text",
      table: {
        category: "inputs",
        type: { summary: "string" },
        defaultValue: { summary: "skeleton.loading-completed translation" },
      },
    },
    labelDelay: {
      description: "Delay in ms before `label` is announced.",
      control: "number",
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "200" },
      },
    },
    width: {
      description:
        "Width of the block. A number is a percentage of the container, a `px` string is absolute, `auto` fills it.",
      control: "text",
      table: {
        category: "SkeletonBlock inputs",
        type: {
          summary: "SkeletonBlockWidth",
          detail: "number \n'auto' \n`${number}px`",
        },
        defaultValue: { summary: "auto" },
      },
    },
    height: {
      description:
        "Height of the block. A text style takes that style's line height; a number is a height in px.",
      control: "select",
      options: TEXT_HEIGHTS,
      table: {
        category: "SkeletonBlock inputs",
        type: {
          summary: "SkeletonBlockHeight",
          detail: "'p' \n'h1' \n'h2' \n'h3' \n'h4' \n'h5' \n'h6' \nnumber",
        },
        defaultValue: { summary: "p" },
      },
    },
  },
} as Meta<StoryArgs>;

type Story = StoryObj<StoryArgs>;

export const Default: Story = {
  args: {
    label: "Loading something",
    width: 50,
    height: "h2",
  },
  render: ({ width, height, ...args }) => ({
    props: { ...args, width, height },
    template: `
      <tedi-skeleton ${argsToTemplate(args)}>
        <tedi-skeleton-block [width]="width" [height]="height" />
      </tedi-skeleton>
    `,
  }),
};

/**
 * A text style takes the line height of the text the block stands in for and
 * follows it across breakpoints. A number is a height in px, for blocks
 * standing in for something other than text.
 */
export const Height: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <tedi-skeleton label="Loading something">
        <tedi-skeleton-block height="p" />
        <tedi-skeleton-block height="h3" />
        <tedi-skeleton-block height="h2" />
        <tedi-skeleton-block height="h1" />
        <tedi-skeleton-block [height]="100" />
      </tedi-skeleton>
    `,
  }),
};

/**
 * A number is a percentage of the container, a `px` string is an absolute
 * width, and `auto` fills the container.
 */
export const Width: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <tedi-skeleton label="Loading something">
        <tedi-skeleton-block [width]="50" height="p" />
        <tedi-skeleton-block [width]="75" height="h3" />
        <tedi-skeleton-block width="36px" height="h2" />
        <tedi-skeleton-block width="auto" height="h1" />
      </tedi-skeleton>
    `,
  }),
};

/**
 * Below `md` the blocks are full width; from `md` up they narrow and grow
 * taller.
 */
export const Responsive: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <tedi-skeleton label="Loading something">
        <tedi-skeleton-block [width]="100" height="h3" [md]="{ width: 44, height: 'h1' }" />
        <tedi-skeleton-block [width]="100" height="p" [md]="{ width: 75 }" />
        <tedi-skeleton-block [width]="100" [height]="60" [md]="{ width: 32, height: 100 }" />
      </tedi-skeleton>
    `,
  }),
};

/**
 * Add several loading blocks with a screen reader on to hear how concurrent
 * loaders are announced. Each block removes itself after its own delay, and the
 * short one may pass too quickly to be announced at all.
 *
 * Pass both `label` and `completedLabel` so the announcement names what is
 * loading; the third button shows that.
 */
export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `<tedi-skeleton-accessibility-demo />`,
  }),
};
