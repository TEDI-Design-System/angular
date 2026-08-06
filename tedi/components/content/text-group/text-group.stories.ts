import { TextGroupValueComponent } from "./text-group-value.component";
import { TextGroupLabelComponent } from "./text-group-label.component";
import {
  argsToTemplate,
  moduleMetadata,
  type Meta,
  type StoryObj,
} from "@storybook/angular";

import { TextGroupComponent } from "./text-group.component";
import { IconComponent } from "../../base/icon/icon.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { VerticalSpacingDirective } from "../../../directives/vertical-spacing/vertical-spacing.directive";
import { createBreakpointArgTypes } from "../../../../src/dev-tools/createBreakpointArgTypes";
import { StatusBadgeComponent } from "@tedi-design-system/angular/community";

/**
 * <a href="https://www.figma.com/file/jWiRIXhHRxwVdMSimKX2FF/TEDI-Design-System-(draft)?type=design&node-id=45-30752&mode=dev" target="_BLANK">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/433820-text-group" target="_BLANK">Zeroheight ↗</a>
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
        StatusBadgeComponent
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
        <tedi-text-group-label>Nähtavus</tedi-text-group-label>
        <tedi-text-group-value>Nähtav arstile ja esindajale</tedi-text-group-value>
      </tedi-text-group>
    `,
  }),
};

export const Types: Story = {
  // TODO(a11y): decorative tertiary-color icon font trips color-contrast (~3:1); pending token review.
  parameters: { a11y: { test: "todo" } },
  render: () => {
    const textGroups = [
      {
        type: "vertical",
        label: "Nähtavus",
        value: "Nähtav arstile ja esindajale",
      },
      {
        type: "vertical",
        label: "Nähtavus",
        value: "Nähtav arstile ja esindajale",
        statusBadge: 'Esitatud'
      },
      {
        type: "vertical",
        label: "Nähtavus",
        value: "Nähtav arstile ja esindajale",
        icon: { size: 16, name: "lock_open", color: "tertiary" },
        valueModifiers: "inline-block",
      },
      {
        type: "vertical",
        label: "Nähtavus",
        labelModifiers: "bold",
        value: "Nähtav arstile ja esindajale",
      },
      {
        type: "vertical",
        label: "Nähtavus",
        value: "Nähtav arstile ja esindajale",
        valueModifiers: "bold",
      },
      {
        type: "horizontal",
        label: "Patsient",
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
              <div class="flex flex-column align-items-start">
                @if (group.valueModifiers === "bold") {
                  <b>{{ group.value }}</b>
                } @else {
                  {{ group.value }}
                }
                @if (group.statusBadge) {
                  <span tedi-status-badge color="brand" status="none">{{ group.statusBadge }}</span>
                }
              </div>
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
        <tedi-text-group-label>Nähtavus</tedi-text-group-label>
        <tedi-text-group-value>Nähtav arstile ja esindajale</tedi-text-group-value>
      </tedi-text-group>
      <tedi-text-group type="horizontal">
        <tedi-text-group-label>Nähtavus</tedi-text-group-label>
        <tedi-text-group-value>Nähtav arstile ja esindajale</tedi-text-group-value>
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
            label: "Patsient",
            value: "Mari Maasikas",
            icon: { size: 16, name: "person_filled", color: "tertiary" },
          },
          {
            type: "horizontal",
            labelWidth: "132px",
            label: "Aadress",
            value: "Tulbi tn 4, Tallinn, 23562, Eesti",
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
            label: "Vaktsiin",
            value: "Mari Maasikas",
          },
          {
            type: "horizontal",
            labelWidth: "164px",
            label: "Järgmine vaktsineerimine",
            value: "Immuniseerimine lõpetatud",
          },
        ],
      },
      {
        spacing: 0.25,
        groups: [
          {
            type: "horizontal",
            labelWidth: "196px",
            label: "Tervishoiuteenuse osutaja",
            value: "SA Põhja-Eesti Regionaalhaigla",
          },
          {
            type: "horizontal",
            labelWidth: "196px",
            label: "Tervishoiutöötaja",
            value: "Mart Mets",
          },
          {
            type: "horizontal",
            labelWidth: "196px",
            label: "Dokumendi loomise aeg",
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

/**
 * Demonstrates overriding the label `type` and `labelWidth` per breakpoint. Resize the preview
 * to see the layout adapt.
 */
export const Responsive: Story = {
  render: () => {
    const rows = [
      { label: "Patsient", value: "Mari Maasikas" },
      { label: "Aadress", value: "Tulbi tn 4, Tallinn, 23562, Eesti" },
      { label: "Vaktsiin", value: "Mari Maasikas" },
      { label: "Järgmine vaktsineerimine", value: "Immuniseerimine lõpetatud" },
      { label: "Tervishoiuteenuse osutaja", value: "SA Põhja-Eesti Regionaalhaigla" },
      { label: "Tervishoiutöötaja", value: "Mart Mets" },
      { label: "Dokumendi loomise aeg", value: "16.08.2023 14:51:48" },
    ];
    return {
      props: { rows },
      template: `
        <div [tediVerticalSpacing]="0.25">
          <tedi-text-group
            *ngFor="let row of rows"
            type="vertical"
            [sm]="{ type: 'horizontal', labelWidth: '120px' }"
            [md]="{ labelWidth: '200px' }"
            [lg]="{ labelWidth: '25%' }"
          >
            <tedi-text-group-label>{{ row.label }}</tedi-text-group-label>
            <tedi-text-group-value>{{ row.value }}</tedi-text-group-value>
          </tedi-text-group>
        </div>
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
          <tedi-text-group-label>Nähtavus</tedi-text-group-label>
          <tedi-text-group-value>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent pulvinar malesuada tellus, nec efficitur orci interdum vitae.
            Proin semper venenatis est, vel malesuada sapien ornare at. Vestibulum egestas in lectus non finibus.
            Donec rhoncus sapien vel justo elementum vestibulum. Vivamus euismod dui vel erat semper luctus.
            Nulla egestas purus elit, non fermentum sapien sagittis nec. Pellentesque ac sapien non justo vehicula porta.
          </tedi-text-group-value>
        </tedi-text-group>
        <tedi-text-group type="horizontal" labelWidth="150px">
          <tedi-text-group-label>Nähtavus</tedi-text-group-label>
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
