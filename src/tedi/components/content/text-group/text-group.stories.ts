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
import { ColComponent } from "../../helpers/grid/col/col.component";
import { TextComponent } from "../../base/text/text.component";
import { VerticalSpacingDirective } from "../../../directives/vertical-spacing/vertical-spacing.directive";
import { createBreakpointArgTypes } from "../../../../dev-tools/createBreakpointArgTypes";
import { StatusBadgeComponent } from "@tedi-design-system/angular/community";
import { StatusBadgeComponent as TediStatusBadgeComponent } from "../../tags/status-badge/status-badge.component";
import { InfoTooltipComponent } from "../../overlay/info-tooltip/info-tooltip.component";

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
    chromatic: { disableSnapshot: true },
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
        ColComponent,
        TextComponent,
        StatusBadgeComponent,
        TediStatusBadgeComponent,
        InfoTooltipComponent,
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

const TYPES_GROUPS = [
  {
    type: "vertical",
    label: "Nähtavus",
    value: "Nähtav arstile ja esindajale",
  },
  {
    type: "vertical",
    label: "Nähtavus",
    value: "Nähtav arstile ja esindajale",
    statusBadge: "Esitatud",
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

const TYPES_TEMPLATE = `
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
      `;

export const Types: Story = {
  // TODO(a11y): decorative tertiary-color icon font trips color-contrast (~3:1); pending token review.
  parameters: { a11y: { test: "todo" } },
  render: () => {
    return {
      props: {
        textGroups: TYPES_GROUPS,
      },
      template: TYPES_TEMPLATE,
    };
  },
};

const POSITION_TYPE_TEMPLATE = `
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
    `;

export const PositionType: Story = {
  render: () => ({
    template: POSITION_TYPE_TEMPLATE,
  }),
};

const HAS_SLOT_TEMPLATE = `
    <div [tediVerticalSpacing]="1">
      <tedi-text-group type="vertical">
        <tedi-text-group-label>Ligipääs</tedi-text-group-label>
        <tedi-text-group-value>
          Arstile ja esindajale nähtav
          <tedi-info-tooltip ariaLabel="Lisainfo ligipääsu kohta">
            Dokumenti näevad sinu raviarst ja esindajaks määratud isik.
          </tedi-info-tooltip>
        </tedi-text-group-value>
      </tedi-text-group>
      <tedi-text-group type="vertical">
        <tedi-text-group-label>Nimi</tedi-text-group-label>
        <tedi-text-group-value>
          Mari Maasikas
          <tedi-status-badge color="success" text="Ligipääs lubatud" />
        </tedi-text-group-value>
      </tedi-text-group>
    </div>
    `;

/**
 * `tedi-text-group-value` is a flex row that takes any content, so a trailing info tooltip,
 * status badge or tag sits inline beside the text with the design system's inner spacing
 * already applied.
 */
export const HasSlot: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: HAS_SLOT_TEMPLATE,
  }),
};

const LABEL_LENGTH_SECTIONS = [
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

const LABEL_LENGTH_TEMPLATE = `
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
      `;

export const HorizontalLabelLength: Story = {
  render: () => {
    return {
      props: { textGroups: LABEL_LENGTH_SECTIONS },
      template: LABEL_LENGTH_TEMPLATE,
    };
  },
};

/**
 * Demonstrates overriding the label `type` and `labelWidth` per breakpoint. Resize the preview
 * to see the layout adapt.
 */
export const Responsive: Story = {
  parameters: { chromatic: { disableSnapshot: false } },
  render: () => {
    const rows = [
      { label: "Patsient", value: "Mari Maasikas" },
      { label: "Aadress", value: "Tulbi tn 4, Tallinn, 23562, Eesti" },
      { label: "Vaktsiin", value: "Mari Maasikas" },
      { label: "Järgmine vaktsineerimine", value: "Immuniseerimine lõpetatud" },
      {
        label: "Tervishoiuteenuse osutaja",
        value: "SA Põhja-Eesti Regionaalhaigla",
      },
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

const LONG_TEXT_TEMPLATE = `
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
    `;

export const LongTextValues: Story = {
  render: (args) => ({
    props: args,
    template: LONG_TEXT_TEMPLATE,
  }),
};

/** Chromatic snapshot for TextGroup: add every new visual variant here too. */
export const VisualTest: Story = {
  tags: ["!dev", "!autodocs"],
  parameters: {
    chromatic: { disableSnapshot: false },
    a11y: { test: "todo" },
  },
  render: () => ({
    props: {
      typesGroups: TYPES_GROUPS,
      labelLengthSections: LABEL_LENGTH_SECTIONS,
    },
    template: `
      <tedi-row [cols]="1" [gapY]="5">
        <tedi-col>
          <p tedi-text modifiers="bold">Types</p>
          <ng-container *ngTemplateOutlet="types; context: { textGroups: typesGroups }" />
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">Position type</p>
          ${POSITION_TYPE_TEMPLATE}
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">Has slot</p>
          ${HAS_SLOT_TEMPLATE}
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">Horizontal label length</p>
          <ng-container *ngTemplateOutlet="labelLength; context: { textGroups: labelLengthSections }" />
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">Long text values</p>
          ${LONG_TEXT_TEMPLATE}
        </tedi-col>
      </tedi-row>
      <ng-template #types let-textGroups="textGroups">${TYPES_TEMPLATE}</ng-template>
      <ng-template #labelLength let-textGroups="textGroups">${LABEL_LENGTH_TEMPLATE}</ng-template>
    `,
  }),
};
