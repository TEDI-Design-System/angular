import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { TableOfContentsComponent } from "./table-of-contents.component";
import { TableOfContentsItemComponent } from "./table-of-contents-item/table-of-contents-item.component";

type StoryTableOfContentsComponent = TableOfContentsComponent & {
  items: Array<string | Record<string, string[]>>;
};

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.23.38?node-id=8826-63667&m=dev" target="_BLANK">Figma ↗</a><br />
 * <a href="https://tedi.tehik.ee/1ee8444b7/p/467bb3-table-of-contents" target="_BLANK">Zeroheight ↗</a>
 **/
const meta: Meta<StoryTableOfContentsComponent> = {
  title: "Community/Navigation/Table of Contents",
  component: TableOfContentsComponent,
  decorators: [
    moduleMetadata({
      imports: [TableOfContentsComponent, TableOfContentsItemComponent],
    }),
  ],
  args: {
    items: ["Introduction", "Getting Started", "Components", "API Reference"],
    heading: "Table of Contents",
  },
};

export default meta;

type Story = StoryObj<StoryTableOfContentsComponent>;

export const Default: Story = {
  render: ({ items, ...args }) => ({
    props: { items, ...args },
    template: `
    <div>
      <tedi-table-of-contents ${argsToTemplate(args)}>
        @for(item of items; track item) {
          <tedi-table-of-contents-item
            [idTo]="item"
          >
            {{ item }}
          </tedi-table-of-contents-item>
        }
      </tedi-table-of-contents>
    </div>
    `,
  }),
};

export const Seeking: Story = {
  args: {
    position: "fixed",
  },
  render: ({ items, ...args }) => ({
    props: { items, ...args },
    template: `
    <div style="display: flex">

      <div style="margin-bottom: 1000px;">
        @for(item of items; track item) {
          <div id="{{ item }}" style="margin-top: 100px;">
            <h2>{{ item }}</h2>
            <p style="max-width:40rem">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              euismod, nunc ut aliquam aliquam, nunc nisl aliquet nunc, euismod
              aliquam nisl nunc euismod nunc.
            </p>
          </div>
        }
      </div>

      <div>
        <tedi-table-of-contents ${argsToTemplate(args)}>
          @for(item of items; track item) {
            <tedi-table-of-contents-item
              [idTo]="item"
            >
              {{ item }}
            </tedi-table-of-contents-item>
          }
        </tedi-table-of-contents>
      </div>
    </div>
    `,
  }),
};

export const NestedItems: Story = {
  args: {
    items: [
      "Introduction",
      { "Getting Started": ["Installation", "Quick Start"] },
      { Components: ["Buttons", "Cards", "Modals"] },
      "API Reference",
    ],
    position: "fixed",
  },
  render: ({ items, ...args }) => ({
    props: { Array, items, ...args },
    template: `
    <div>
      <tedi-table-of-contents ${argsToTemplate(args)}>
        @for(item of items; track item) {
          @if(Array.isArray(item)) {
            @for(subItem of item; track subItem) {
              <tedi-table-of-contents-item
                [idTo]="subItem"
              >
                {{ subItem }}
              </tedi-table-of-contents-item>
            }
          } @else {
            <tedi-table-of-contents-item
              [idTo]="item"
            >
              {{ item }}
            </tedi-table-of-contents-item>
          }
        }
      </tedi-table-of-contents>
    </div>
    `,
  }),
};
