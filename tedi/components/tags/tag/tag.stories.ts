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
      <tedi-tag [type]="type" [loading]="loading" [closable]="closable">
        {{content}}
      </tedi-tag>
    `,
  }),
  args: {
    type: "primary",
    loading: false,
    closable: false,
    content: "Tag Content",
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
  },
} as Meta<TagComponent & { content: string }>;

type Story = StoryObj<TagComponent & { content: string }>;

export const Default: Story = {};

export const WithCloseButton: Story = {
  render: () => ({
    template: `
      <tedi-tag [closable]="true">
        Tag
      </tedi-tag>
    `,
  }),
};

export const WithLoader: Story = {
  render: () => ({
    template: `
      <tedi-tag [loading]="true">
        taotlus_scan_lk_1.pdf
      </tedi-tag>
    `,
  }),
};

export const WithInvalidIcon: Story = {
  render: () => ({
    template: `
      <tedi-row [gap]="1">
        <tedi-col>
          <tedi-tag type="danger">
            taotlus_scan_lk_1.pdf
          </tedi-tag>
        </tedi-col>
        <tedi-col>
          <tedi-tag type="danger" [closable]="true">
            taotlus_scan_lk_1.pdf
          </tedi-tag>
        </tedi-col>
      </tedi-row>
    `,
  }),
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
