import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { TableOfContentsComponent } from "./table-of-contents.component";
import { TableOfContentsItemComponent } from "./table-of-contents-item/table-of-contents-item.component";

type StoryTableOfContentsComponent = TableOfContentsComponent & {
  items: Array<string> | Record<string, string[]>;
};

/**
 * Sticky/Fixed positioning will not work inside Storybook iframes, open up the iframe URL in a new tab to see the effect.
 *
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

const affix = (items: string[], name: string) =>
  (items as string[]).map((item) => `${item}_${name}`);

export const Default: Story = {
  render: ({ items, ...args }) => {
    const modifiedItems = affix(items as string[], "default");
    return {
      props: { items, modifiedItems, ...args },
      template: `
    <div>
      <tedi-table-of-contents ${argsToTemplate(args)}>
        @for(item of items; track item; let i = $index) {
          <tedi-table-of-contents-item
            [idTo]="modifiedItems[i]"
          >
            {{ item }}
          </tedi-table-of-contents-item>
        }
      </tedi-table-of-contents>
    </div>
    `,
    };
  },
};

export const Seeking: Story = {
  args: {
    position: "sticky",
  },
  render: ({ items, ...args }) => {
    const modifiedItems = affix(items as string[], "seeking");
    return {
      props: { items, modifiedItems, ...args },
      template: `
    <div style="display: flex">
      <div style="margin-bottom: 1000px;">
        @for(item of items; track item; let i = $index) {
          <div id="{{ modifiedItems[i] }}" style="margin-top: 100px;">
            <h2>{{ item }}</h2>
            <p style="max-width: 40rem">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              euismod, nunc ut aliquam aliquam, nunc nisl aliquet nunc, euismod
              aliquam nisl nunc euismod nunc.
            </p>
          </div>
        }
      </div>

      <div>
        <tedi-table-of-contents ${argsToTemplate(args)}>
          @for(item of items; track item; let i = $index) {
            <tedi-table-of-contents-item
              [idTo]="modifiedItems[i]"
            >
              {{ item }}
            </tedi-table-of-contents-item>
          }
        </tedi-table-of-contents>
      </div>
    </div>
    `,
    };
  },
};

export const NestedItems: Story = {
  args: {
    items: {
      Introduction: [],
      "Getting Started": ["Installation", "Quick Start"],
      Components: ["Buttons", "Cards", "Modals"],
      "API Reference": [],
    },
    position: "sticky",
  },
  render: ({ items, ...args }) => ({
    props: { Object, items, ...args },
    template: `
    <div style="display: flex">
      <div style="margin-bottom: 1000px;">
        @for(item of Object.keys(items); track item) {
          <div id="{{ item }}" style="margin-top: 100px;">
            <h2>{{ item }}</h2>
            <p style="max-width:40rem">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              euismod, nunc ut aliquam aliquam, nunc nisl aliquet nunc, euismod
              aliquam nisl nunc euismod nunc.
            </p>

          @if(items[item]?.length) {
            @for(subItem of items[item]; track subItem) {
              <div id="{{ subItem }}" style="margin-top: 50px; margin-left: 2rem;">
                <h4>{{ subItem }}</h4>
                <p style="max-width:40rem">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  euismod, nunc ut aliquam aliquam, nunc nisl aliquet nunc, euismod
                  aliquam nisl nunc euismod nunc.
                </p>
              </div>
            }
          }
          </div>
        }
      </div>

      <tedi-table-of-contents ${argsToTemplate(args)}>
          @for(item of Object.keys(items); track item) {
            <tedi-table-of-contents-item
              [idTo]="item"
            >
              <div>{{ item }}</div>

              <ng-container ngProjectAs="tedi-table-of-contents-item"> <!-- workaround for https://github.com/angular/angular/issues/57345 -->
                @if(items[item]?.length) {
                  @for(subItem of items[item]; track subItem) {
                    <tedi-table-of-contents-item
                      [idTo]="subItem"
                    >
                      {{ subItem }}
                    </tedi-table-of-contents-item>
                  }
                }
              </ng-container>
            </tedi-table-of-contents-item>
            }
      </tedi-table-of-contents>
    </div>
    `,
  }),
};
