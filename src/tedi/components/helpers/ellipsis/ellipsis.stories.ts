import { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { visualTest } from "../../../../../.storybook/visual-test-story";

import { EllipsisComponent } from "./index";
import { RowComponent } from "../grid/row/row.component";
import { ColComponent } from "../grid/col/col.component";
import { TextComponent } from "../../base/text/text.component";

/**
 * <a href="https://www.tedi.ee/1ee8444b7/p/87ef9b-ellipsis" target="_BLANK">Zeroheight ↗</a>
 */
const meta = {
  title: "TEDI-Ready/Components/Helpers/Ellipsis",
  component: EllipsisComponent,
  decorators: [
    moduleMetadata({
      imports: [EllipsisComponent, RowComponent, ColComponent, TextComponent],
    }),
  ],
  parameters: {
    status: {
      type: ["devComponent"],
    },
    chromatic: { disableSnapshot: true },
  },
  argTypes: {
    lineClamp: {
      description:
        "Maximum number of lines before truncating. End (multi-line) only.",
      control: { type: "number" },
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "2" },
      },
    },
    tooltip: {
      description:
        "Whether truncated content shows a hover/focus tooltip with full text.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    position: {
      description:
        "Ellipsis position. 'start' = leading, single-line. 'end' = trailing, multi-line.",
      control: { type: "radio" },
      options: ["start", "end"],
      table: {
        category: "inputs",
        type: { summary: "'start' | 'end'" },
        defaultValue: { summary: "'end'" },
      },
    },
  },
  args: {
    lineClamp: 2,
    tooltip: true,
    position: "end",
  },
} as Meta<EllipsisComponent>;

export default meta;

const CONTENT =
  "Any inline <b>content (even bold)</b>, that is too long for the wrapper and dont fit in x number of rows";

export const Default: StoryObj<EllipsisComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width:200px">
        <tedi-ellipsis [lineClamp]="lineClamp" [tooltip]="tooltip" [position]="position">
          ${CONTENT}
        </tedi-ellipsis>
      </div>
    `,
  }),
};

/**
 * Resize the window to see that the ellipsis and tooltip appear only when content doesn't fit.
 */
export const ResponsiveEnd: StoryObj<EllipsisComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-ellipsis [lineClamp]="lineClamp" [tooltip]="tooltip" [position]="position">
        ${CONTENT}
      </tedi-ellipsis>
    `,
  }),
  args: {
    lineClamp: 1,
  },
};

export const LeadingStart: StoryObj<EllipsisComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width:200px">
        <tedi-ellipsis [lineClamp]="lineClamp" [tooltip]="tooltip" [position]="position">
          ${CONTENT}
        </tedi-ellipsis>
      </div>
    `,
  }),
  args: {
    position: "start",
  },
};

export const NoTooltip: StoryObj<EllipsisComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width:200px">
        <tedi-ellipsis [lineClamp]="lineClamp" [tooltip]="tooltip" [position]="position">
          ${CONTENT}
        </tedi-ellipsis>
      </div>
    `,
  }),
  args: {
    tooltip: false,
  },
};

/** Chromatic snapshot for Ellipsis: add every new visual variant here too. */
export const VisualTest: StoryObj<EllipsisComponent> = {
  tags: ["!dev", "!autodocs"],
  parameters: { chromatic: { disableSnapshot: false } },
  render: () =>
    visualTest(
      [
        { label: "End", story: Default },
        { label: "Leading start", story: LeadingStart },
        { label: "No tooltip", story: NoTooltip },
        { label: "Fits, no ellipsis", story: ResponsiveEnd },
      ],
      { args: meta.args },
    ),
};
