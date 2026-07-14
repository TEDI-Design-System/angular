import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { ScrollFadeComponent } from "./scroll-fade.component";
import { ColComponent } from "../grid/col/col.component";
import { RowComponent } from "../grid/row/row.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.39.64?node-id=10758-111141&m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/32b155-scroll-fade" target="_blank">Zeroheight ↗</a>
 */

const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
  magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris Lorem ipsum dolor sit amet,
  consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;

export default {
  title: "TEDI-Ready/Components/Helpers/ScrollFade",
  component: ScrollFadeComponent,
  decorators: [
    moduleMetadata({
      imports: [ScrollFadeComponent, RowComponent, ColComponent],
    }),
  ],
  argTypes: {
    ariaLabel: {
      control: "text",
      description:
        "Accessible label for the scrollable region. Falls back to a translated default.",
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
