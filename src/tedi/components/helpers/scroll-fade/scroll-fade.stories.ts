import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { ScrollFadeComponent } from "./scroll-fade.component";
import { ColComponent } from "../grid/col/col.component";
import { RowComponent } from "../grid/row/row.component";
import { ButtonComponent } from "../../buttons/button/button.component";

const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
  magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris Lorem ipsum dolor sit amet,
  consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.39.64?node-id=10758-111141&m=dev" target="_blank">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/32b155-scroll-fade" target="_blank">Zeroheight ↗</a>
 */

export default {
  title: "TEDI-Ready/Components/Helpers/ScrollFade",
  component: ScrollFadeComponent,
  decorators: [
    moduleMetadata({
      imports: [
        ScrollFadeComponent,
        RowComponent,
        ColComponent,
        ButtonComponent,
      ],
    }),
  ],
  argTypes: {
    fadeSize: {
      description: "Size of the fade gradient in percentages.",
      control: { type: "radio" },
      options: [0, 10, 20],
      table: {
        category: "inputs",
        type: { summary: "ScrollFadeSize" },
        defaultValue: { summary: "20" },
      },
    },
    fadePosition: {
      description: "Which edges show the fade.",
      control: { type: "radio" },
      options: ["top", "bottom", "both"],
      table: {
        category: "inputs",
        type: { summary: "ScrollFadePosition" },
        defaultValue: { summary: "both" },
      },
    },
    scrollBar: {
      description: "Scrollbar style.",
      control: { type: "radio" },
      options: ["default", "custom"],
      table: {
        category: "inputs",
        type: { summary: "ScrollFadeScrollbar" },
        defaultValue: { summary: "custom" },
      },
    },
    ariaLabel: {
      control: "text",
      description:
        "Accessible label for the scrollable region. Falls back to a translated default.",
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
  },
  parameters: {
    status: {
      type: ["devComponent"],
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-(work-in-progress)?node-id=10758-111142&m=dev",
    },
  },
} as Meta<ScrollFadeComponent>;

type Story = StoryObj<ScrollFadeComponent>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, content: loremIpsum },
    template: `
      <div style="max-width: 200px; max-height: 200px;">
        <tedi-scroll-fade [scrollBar]="scrollBar" [fadeSize]="fadeSize" [fadePosition]="fadePosition">
          {{ content }}
        </tedi-scroll-fade>
      </div>
    `,
  }),
  args: {
    scrollBar: "custom",
    fadeSize: 20,
    fadePosition: "both",
  },
};

export const Scrollbar: Story = {
  render: (args) => ({
    props: { ...args, content: loremIpsum },
    template: `
      <tedi-row [gap]="5">
        <tedi-col [xs]="3">
          <strong>Default Scrollbar</strong>
          <div style="margin-top: 16px; max-width: 200px; max-height: 200px;">
            <tedi-scroll-fade scrollBar="default">{{ content }}</tedi-scroll-fade>
          </div>
        </tedi-col>
        <tedi-col [xs]="3">
          <strong>Custom Scrollbar</strong>
          <div style="margin-top: 16px; max-width: 200px; max-height: 200px;">
            <tedi-scroll-fade scrollBar="custom">{{ content }}</tedi-scroll-fade>
          </div>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const FadeSize: Story = {
  render: (args) => ({
    props: { ...args, content: loremIpsum },
    template: `
      <tedi-row [gap]="5">
        <tedi-col [xs]="3">
          <strong>No Fade (0%)</strong>
          <div style="margin-top: 16px; max-width: 200px; max-height: 200px;">
            <tedi-scroll-fade [fadeSize]="0">{{ content }}</tedi-scroll-fade>
          </div>
        </tedi-col>
        <tedi-col [xs]="3">
          <strong>Small Fade (10%)</strong>
          <div style="margin-top: 16px; max-width: 200px; max-height: 200px;">
            <tedi-scroll-fade [fadeSize]="10">{{ content }}</tedi-scroll-fade>
          </div>
        </tedi-col>
        <tedi-col [xs]="3">
          <strong>Large Fade (20%)</strong>
          <div style="margin-top: 16px; max-width: 200px; max-height: 200px;">
            <tedi-scroll-fade [fadeSize]="20">{{ content }}</tedi-scroll-fade>
          </div>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const FadePosition: Story = {
  render: (args) => ({
    props: { ...args, content: loremIpsum },
    template: `
      <tedi-row [gap]="5">
        <tedi-col [xs]="3">
          <strong>Top</strong>
          <div style="margin-top: 16px; max-width: 200px; max-height: 200px;">
            <tedi-scroll-fade fadePosition="top">{{ content }}</tedi-scroll-fade>
          </div>
        </tedi-col>
        <tedi-col [xs]="3">
          <strong>Bottom</strong>
          <div style="margin-top: 16px; max-width: 200px; max-height: 200px;">
            <tedi-scroll-fade fadePosition="bottom">{{ content }}</tedi-scroll-fade>
          </div>
        </tedi-col>
        <tedi-col [xs]="3">
          <strong>Both</strong>
          <div style="margin-top: 16px; max-width: 200px; max-height: 200px;">
            <tedi-scroll-fade fadePosition="both">{{ content }}</tedi-scroll-fade>
          </div>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const NoFadeWithoutScrollbar: Story = {
  render: (args) => ({
    props: { ...args, content: loremIpsum },
    template: `
      <tedi-row>
        <tedi-col [xs]="3">
          <div style="margin-top: 16px; max-width: 200px; max-height: 400px;">
            <tedi-scroll-fade>{{ content }}</tedi-scroll-fade>
          </div>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const DynamicContent: Story = {
  render: (args) => ({
    props: {
      ...args,
      items: [1, 2, 3, 4, 5, 6],
      add() {
        this["items"].push(this["items"].length + 1);
      },
      remove() {
        this["items"].pop();
      },
    },
    styles: [
      `
        .dynamic-content-scroller {
          max-width: 200px;
          max-height: 150px;
        }
      `,
    ],
    template: `
      <div class="flex flex-column gap-3">
        <div class="flex gap-3">
          <button tedi-button (click)="add()">Add item</button>
          <button tedi-button variant="secondary" (click)="remove()">Remove item</button>
        </div>
        <div class="dynamic-content-scroller">
          <tedi-scroll-fade
            [scrollBar]="scrollBar"
            [fadeSize]="fadeSize"
            [fadePosition]="fadePosition"
            [ariaLabel]="ariaLabel"
          >
            <div class="flex flex-column gap-3">
              @for (item of items; track item) {
                <p>Item {{ item }}</p>
              }
            </div>
          </tedi-scroll-fade>
        </div>
      </div>
    `,
  }),
  args: {
    scrollBar: "custom",
    fadeSize: 20,
    fadePosition: "both",
  },
};
