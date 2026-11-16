import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { ListComponent } from "./list.component";
import { TextComponent } from "../../base/text/text.component";
import { VerticalSpacingDirective } from "../../../directives/vertical-spacing/vertical-spacing.directive";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { RowComponent } from "../../helpers/grid/row/row.component";

/**
 * <a href="https://www.figma.com/file/jWiRIXhHRxwVdMSimKX2FF/TEDI-Design-System-(draft)?type=design&node-id=2137-19322&m=dev" target="_BLANK">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/37b651-list" target="_BLANK">Zeroheight ↗</a>
 */

export default {
  title: "TEDI-Ready/Content/List",
  component: ListComponent,
  decorators: [
    moduleMetadata({
      imports: [
        RowComponent,
        ColComponent,
        VerticalSpacingDirective,
        TextComponent,
        ListComponent,
      ],
    }),
  ],
  parameters: { chromatic: { disableSnapshot: true } },
  args: {
    styled: true,
    color: "brand",
  },
  argTypes: {
    styled: {
      description: "Used for showing or hiding the list bullets.",
      control: {
        type: "boolean",
      },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    color: {
      description: "Color of the list bullet.",
      control: "select",
      options: [
        "primary",
        "secondary",
        "tertiary",
        "brand",
        "brand-dark",
        "success",
        "warning",
        "warning-dark",
        "danger",
        "white",
      ],
      table: {
        category: "inputs",
        type: { summary: "BulletColor" },
        defaultValue: { summary: "brand" },
      },
    },
  },
} as Meta<ListComponent>;

export const Default: StoryObj<ListComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <ul tedi-list ${argsToTemplate(args)}>
        <li>Caesar salad</li>
        <li>
          Caesar salad
          <ul tedi-list ${argsToTemplate(args)}>
            <li>Dressing</li>
          </ul>
        </li>
        <li>
          Caesar salad
          <ul tedi-list ${argsToTemplate(args)}>
            <li>
              Dressing
              <ul tedi-list ${argsToTemplate(args)}>
                <li>Lemon juice</li>
                <li>Anchovies</li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    `,
  }),
};

export const UnorderedList: StoryObj<ListComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <ul tedi-list ${argsToTemplate(args)}>
        <li>Potato</li>
        <li>Caesar salad</li>
        <li>
          Caesar salad
          <ul tedi-list ${argsToTemplate(args)}>
            <li>
              Dressing
              <ul tedi-list ${argsToTemplate(args)}>
                <li>Lemon juice</li>
                <li>Anchovies</li>
                <li>Parmesan cheese</li>
                <li>Worcestershire sauce</li>
                <li>Mustard</li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    `,
  }),
};

export const OrderedList: StoryObj<ListComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <ol tedi-list ${argsToTemplate(args)}>
        <li>School homework</li>
        <li>
          Chores
          <ol tedi-list ${argsToTemplate(args)}>
            <li>Wash dishes</li>
            <li>
              Fold laundry
              <ol tedi-list ${argsToTemplate(args)}>
                <li>Iron the sheets</li>
                <li>Hang dresses</li>
              </ol>
            </li>
          </ol>
        </li>
        <li>Walk the dog</li>
        <li>Water the flowers</li>
      </ol>
    `,
  }),
};

export const NoStyleList: StoryObj<ListComponent> = {
  args: {
    styled: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <ul tedi-list ${argsToTemplate(args)}>
        <li>
          Caesar salad
          <ul tedi-list ${argsToTemplate(args)}>
            <li>
              Dressing
              <ul tedi-list ${argsToTemplate(args)}>
                <li>Lemon juice</li>
                <li>Anchovies</li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    `,
  }),
};

/** Chromatic snapshot for List: add every new visual variant here too. */
export const VisualTest: StoryObj<ListComponent> = {
  tags: ["!dev", "!autodocs"],
  parameters: { chromatic: { disableSnapshot: false } },
  render: () => ({
    template: `
      <tedi-row [cols]="1" [gapY]="5">
        <tedi-col>
          <div [tediVerticalSpacing]="0.5">
            <p tedi-text modifiers="bold">Unordered list</p>
            <ul tedi-list>
              <li>Potato</li>
              <li>Caesar salad</li>
              <li>
                Caesar salad
                <ul tedi-list>
                  <li>
                    Dressing
                    <ul tedi-list>
                      <li>Lemon juice</li>
                      <li>Anchovies</li>
                      <li>Parmesan cheese</li>
                      <li>Worcestershire sauce</li>
                      <li>Mustard</li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </tedi-col>
        <tedi-col>
          <div [tediVerticalSpacing]="0.5">
            <p tedi-text modifiers="bold">Ordered list</p>
            <ol tedi-list>
              <li>School homework</li>
              <li>
                Chores
                <ol tedi-list>
                  <li>Wash dishes</li>
                  <li>
                    Fold laundry
                    <ol tedi-list>
                      <li>Iron the sheets</li>
                      <li>Hang dresses</li>
                    </ol>
                  </li>
                </ol>
              </li>
              <li>Walk the dog</li>
              <li>Water the flowers</li>
            </ol>
          </div>
        </tedi-col>
        <tedi-col>
          <div [tediVerticalSpacing]="0.5">
            <p tedi-text modifiers="bold">No style</p>
            <ul tedi-list [styled]="false">
              <li>
                Caesar salad
                <ul tedi-list [styled]="false">
                  <li>
                    Dressing
                    <ul tedi-list [styled]="false">
                      <li>Lemon juice</li>
                      <li>Anchovies</li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </tedi-col>
      </tedi-row>
    `,
  }),
};
