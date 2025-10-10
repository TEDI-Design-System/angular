import { TextGroupValueComponent } from "./text-group-value.component";
import { TextGroupLabelComponent } from "./text-group-label.component";
import {
  argsToTemplate,
  moduleMetadata,
  type Meta,
  type StoryObj,
} from "@storybook/angular";

import { TextGroupComponent } from "./text-group.component";
import {
  IconComponent,
  RowComponent,
  VerticalSpacingDirective,
} from "@tedi-design-system/angular/tedi";
import { createBreakpointArgTypes } from "../../../../src/dev-tools/createBreakpointArgTypes";

/**
 * <a href="https://www.figma.com/file/jWiRIXhHRxwVdMSimKX2FF/TEDI-Design-System-(draft)?type=design&node-id=45-30752&mode=dev" target="_BLANK">Figma ↗</a><br/>
 * <a href="https://tedi.tehik.ee/1ee8444b7/p/433820-text-group" target="_BLANK">Zeroheight ↗</a>
 */

export default {
  title: "TEDI-Ready/Content/TextGroup",
  component: TextGroupComponent,
  args: {
    type: "horizontal",
  },
  parameters: {
    status: {
      type: ["breakpointSupport"],
    },
  },
  decorators: [
    moduleMetadata({
      imports: [
        VerticalSpacingDirective,
        TextGroupComponent,
        TextGroupLabelComponent,
        TextGroupValueComponent,
        IconComponent,
        RowComponent,
      ],
    }),
  ],
  argTypes: {
    type: {
      control: "radio",
      options: ["vertical", "horizontal"],
      description: "Type of text group layout",
      table: {
        category: "inputs",
        type: { summary: "TextGroupType", detail: "vertical \nhorizontal" },
        defaultValue: { summary: "horizontal" },
      },
    },
    labelWidth: {
      control: "text",
      description: 'Width for the label (e.g., "200px", "30%", etc.)',
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    ...createBreakpointArgTypes("TextGroup"),
  },
} as Meta<TextGroupComponent>;

type Story = StoryObj<TextGroupComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-text-group ${argsToTemplate(args)} >
        <tedi-text-group-label>Accessibility</tedi-text-group-label>
        <tedi-text-group-value>Visible to doctor and representative</tedi-text-group-value>
      </tedi-text-group>
    `,
  }),
};

export const Types: Story = {
  render: () => {
    const textGroups = [
      {
        type: "vertical",
        label: "Accessibility",
        value: "Visible to doctor and representative",
      },
      {
        type: "vertical",
        label: "Accessibility",
        value: "Visible to doctor and representative",
        icon: { size: 16, name: "lock_open", color: "tertiary" },
        valueModifiers: "inline-block",
      },
      {
        type: "vertical",
        label: "Accessibility",
        labelModifiers: "bold",
        value: "Visible to doctor and representative",
      },
      {
        type: "vertical",
        label: "Accessibility",
        value: "Visible to doctor and representative",
        valueModifiers: "bold",
      },
      {
        type: "horizontal",
        label: "Patient",
        value: "Mari Maasikas",
        icon: { size: 16, name: "person_filled", color: "tertiary" },
        valueModifiers: "inline-block",
      },
    ];
    return {
      props: {
        textGroups,
      },
      template: `
        <div [tediVerticalSpacing]="1.5">
          <tedi-text-group
            *ngFor="let group of textGroups"
            [type]="group.type"
          >
            <tedi-text-group-label>
              @if (group.labelModifiers === "bold") {
                <b>{{ group.label }}</b>
              } @else {
                {{ group.label }}
              }
            </tedi-text-group-label>
            <tedi-text-group-value>
              <tedi-icon
                *ngIf="group.icon"
                [size]="group.icon.size"
                [name]="group.icon.name"
                [color]="group.icon.color"
              />
              @if (group.valueModifiers === "bold") {
                <b>{{ group.value }}</b>
              } @else {
                {{ group.value }}
              }
            </tedi-text-group-value>
          </tedi-text-group>
        </div>
      `,
    };
  },
};

export const PositionType: Story = {
  render: () => ({
    template: `
    <div [tediVerticalSpacing]="1">
      <tedi-text-group type="vertical">
        <tedi-text-group-label>Accessibility</tedi-text-group-label>
        <tedi-text-group-value>Visible to doctor and representative</tedi-text-group-value>
      </tedi-text-group>
      <tedi-text-group type="horizontal">
        <tedi-text-group-label>Accessibility</tedi-text-group-label>
        <tedi-text-group-value>Visible to doctor and representative</tedi-text-group-value>
      </tedi-text-group>
    </div>
    `,
  }),
};

export const HorizontalLabelLength: Story = {
  render: () => {
    const textGroups = [
      {
        spacing: 0.25,
        groups: [
          {
            type: "horizontal",
            labelWidth: "132px",
            label: "Patient",
            value: "Mari Maasikas",
            icon: { size: 16, name: "person_filled", color: "tertiary" },
          },
          {
            type: "horizontal",
            labelWidth: "132px",
            label: "Address",
            value: "Tulbi tn 4, Tallinn, 23562, Estonia",
            icon: { size: 16, name: "location_on", color: "tertiary" },
          },
        ],
      },
      {
        spacing: 0.25,
        groups: [
          {
            type: "horizontal",
            labelWidth: "164px",
            label: "Vaccine",
            value: "Mari Maasikas",
          },
          {
            type: "horizontal",
            labelWidth: "164px",
            label: "Next vaccination",
            value: "Immunization finished",
          },
        ],
      },
      {
        spacing: 0.25,
        groups: [
          {
            type: "horizontal",
            labelWidth: "196px",
            label: "Healthcare provider",
            value: "SA Põhja-Eesti Regionaalhaigla",
          },
          {
            type: "horizontal",
            labelWidth: "196px",
            label: "Healthcare specialist",
            value: "Mart Mets",
          },
          {
            type: "horizontal",
            labelWidth: "196px",
            label: "Document creation time",
            value: "16.08.2023 14:51:48",
          },
        ],
      },
    ];
    return {
      props: { textGroups },
      template: `
        <tedi-row cols="1" gap="3">
          <ng-container *ngFor="let section of textGroups">
            <div [tediVerticalSpacing]="section.spacing">
              <tedi-text-group
                *ngFor="let group of section.groups"
                [type]="group.type"
                [labelWidth]="group.labelWidth"
              >
                <tedi-text-group-label>{{ group.label }}</tedi-text-group-label>
                <tedi-text-group-value>
                  <tedi-icon
                    *ngIf="group.icon"
                    [size]="group.icon.size"
                    [name]="group.icon.name"
                    [color]="group.icon.color"
                  />
                  {{ group.value }}
                </tedi-text-group-value>
              </tedi-text-group>
            </div>
          </ng-container>
        </tedi-row>
      `,
    };
  },
};

export const LongTextValues: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div [tediVerticalSpacing]="1">
        <tedi-text-group type="vertical" labelWidth="150px">
          <tedi-text-group-label>Accessibility</tedi-text-group-label>
          <tedi-text-group-value>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent pulvinar malesuada tellus, nec efficitur orci interdum vitae.
            Proin semper venenatis est, vel malesuada sapien ornare at. Vestibulum egestas in lectus non finibus.
            Donec rhoncus sapien vel justo elementum vestibulum. Vivamus euismod dui vel erat semper luctus.
            Nulla egestas purus elit, non fermentum sapien sagittis nec. Pellentesque ac sapien non justo vehicula porta.
          </tedi-text-group-value>
        </tedi-text-group>
        <tedi-text-group type="horizontal" labelWidth="150px">
          <tedi-text-group-label>Accessibility</tedi-text-group-label>
          <tedi-text-group-value>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent pulvinar malesuada tellus, nec efficitur orci interdum vitae.
            Proin semper venenatis est, vel malesuada sapien ornare at. Vestibulum egestas in lectus non finibus.
            Donec rhoncus sapien vel justo elementum vestibulum. Vivamus euismod dui vel erat semper luctus.
            Nulla egestas purus elit, non fermentum sapien sagittis nec. Pellentesque ac sapien non justo vehicula porta.
          </tedi-text-group-value>
        </tedi-text-group>
      </div>
    `,
  }),
};
