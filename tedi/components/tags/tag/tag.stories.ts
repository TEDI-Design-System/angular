import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { TagComponent } from "./tag.component";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { VerticalSpacingDirective } from "../../../directives/vertical-spacing/vertical-spacing.directive";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.30.44?node-id=5784-114505&m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/6524c4-tag" target="_blank">Zeroheight ↗</a>
 * The Tag component is used to label, categorize, or organize items using keywords.
 */
export default {
  title: "TEDI-Ready/Components/Tags/Tag",
  component: TagComponent,
  decorators: [
    moduleMetadata({
      imports: [TagComponent, SeparatorComponent, RowComponent, ColComponent, VerticalSpacingDirective],
    }),
  ],
  render: (props) => ({
    props,
    template: `
      <tedi-tag [type]="type" [loading]="loading" [closable]="closable" [ellipsis]="ellipsis">
        {{content}}
      </tedi-tag>
    `,
  }),
  args: {
    type: "primary",
    loading: false,
    closable: false,
    ellipsis: false,
    content: "Tag",
  },
  argTypes: {
    loading: {
      control: "boolean",
      description: "Whether the tag is in loading state.",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" },
        category: "inputs",
      },
    },
    closable: {
      control: "boolean",
      description: "Whether the tag can be closed.",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" },
        category: "inputs",
      },
    },
    content: {
      control: "text",
      description: "The content of the tag.",
      table: {
        category: "story-only",
      },
    },
    type: {
      control: "select",
      options: ["primary", "secondary", "danger"],
      description: "The type of the tag.",
      table: {
        defaultValue: { summary: "primary" },
        type: { summary: "string" },
        category: "inputs",
      },
    },
    ellipsis: {
      control: "radio",
      options: [false, "start", "end"],
      description:
        "Which end the label truncates from when it doesn't fit. `false` never truncates; `end` → `Long label…`; `start` → `…label`. Truncation only kicks in when the tag is width-constrained, and the full label shows in a tooltip on hover/focus.",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "TagEllipsis", detail: "false \nstart \nend" },
        category: "inputs",
      },
    },
  },
} as Meta<TagComponent & { content: string }>;

type Story = StoryObj<TagComponent & { content: string }>;

export const Default: Story = {};

export const Ellipsis: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.5rem; width: 7rem;">
        <tedi-tag [closable]="true">A fairly long tag label that wraps</tedi-tag>
        <tedi-tag [closable]="true" ellipsis="end">A fairly long tag label, end</tedi-tag>
        <tedi-tag [closable]="true" ellipsis="start">start, a fairly long tag label</tedi-tag>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "When width-constrained, `ellipsis` truncates the label (the close button stays fixed) and reveals the full text in a tooltip on hover/focus. `false` never truncates — the label wraps; `end` cuts the end; `start` cuts the start.",
      },
    },
  },
};

export const Primary: Story = {
  render: (props) => ({
    props,
    template: `
      <tedi-row [gap]="2" cols="auto">
        <tedi-col>
          <tedi-tag [type]="type">
            Tag
          </tedi-tag>
        </tedi-col>
        <tedi-col>
          <tedi-tag [type]="type" [closable]="true">
            Tag
          </tedi-tag>
        </tedi-col>
        <tedi-col>
          <tedi-tag [type]="type" [loading]="true">
            taotlus_scan_lk_1.pdf
          </tedi-tag>
        </tedi-col>
        <tedi-col style="max-width: 150px;">
          <tedi-tag [type]="type" [closable]="true">
            Tag with a very long text but little room
          </tedi-tag>
        </tedi-col>
        <tedi-col style="max-width: 150px;">
          <tedi-tag [type]="type" [loading]="true">
            Tag with a very long text but little room
          </tedi-tag>
        </tedi-col>
      </tedi-row>
    `,
  }),
  args: {
    type: "primary",
  },
};

export const Secondary: Story = {
  render: (props) => ({
    props,
    template: `
      <tedi-row [gap]="2" cols="auto">
        <tedi-col>
          <tedi-tag [type]="type">
            Tag
          </tedi-tag>
        </tedi-col>
        <tedi-col>
          <tedi-tag [type]="type" [closable]="true">
            Tag
          </tedi-tag>
        </tedi-col>
        <tedi-col>
          <tedi-tag [type]="type" [loading]="true">
            taotlus_scan_lk_1.pdf
          </tedi-tag>
        </tedi-col>
        <tedi-col style="max-width: 150px;">
          <tedi-tag [type]="type" [closable]="true">
            Tag with a very long text but little room
          </tedi-tag>
        </tedi-col>
        <tedi-col style="max-width: 150px;">
          <tedi-tag [type]="type" [loading]="true">
            Tag with a very long text but little room
          </tedi-tag>
        </tedi-col>
      </tedi-row>
    `,
  }),
  args: {
    type: "secondary",
  },
};

export const Danger: Story = {
  render: (props) => ({
    props,
    template: `
      <tedi-row [gap]="2" cols="auto">
        <tedi-col>
          <tedi-tag [type]="type">
            Tag
          </tedi-tag>
        </tedi-col>
        <tedi-col>
          <tedi-tag [type]="type" [closable]="true">
            Tag
          </tedi-tag>
        </tedi-col>
        <tedi-col>
          <tedi-tag [type]="type" [loading]="true">
            taotlus_scan_lk_1.pdf
          </tedi-tag>
        </tedi-col>
        <tedi-col style="max-width: 150px;">
          <tedi-tag [type]="type" [closable]="true">
            Tag with a very long text but little room
          </tedi-tag>
        </tedi-col>
        <tedi-col style="max-width: 150px;">
          <tedi-tag [type]="type" [loading]="true">
            Tag with a very long text but little room
          </tedi-tag>
        </tedi-col>
      </tedi-row>
    `,
  }),
  args: {
    type: "danger",
  },
};
