import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";

import { CommonModule } from "@angular/common";
import {
  IconComponent,
  TextComponent,
  ButtonComponent,
  StatusBadgeComponent,
  CollapseComponent,
} from "@tedi-design-system/angular/tedi";
import { AccordionIconComponent } from "./accordion-icon/accordion-icon.component";
import { AccordionItemContentComponent } from "./accordion-item-content/accordion-item-content.component";
import { AccordionItemHeaderComponent } from "./accordion-item-header/accordion-item-header.component";
import { AccordionItemComponent } from "./accordion-item/accordion-item.component";
import { AccordionComponent } from "./accordion/accordion.component";
import { CheckboxComponent } from "../../form/checkbox/checkbox/checkbox.component";

const contentExample = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

export default {
  title: "Community/Cards/Accordion",
  component: AccordionComponent,
  subcomponents: {
    AccordionIconComponent,
    AccordionItemComponent,
    AccordionItemHeaderComponent,
    AccordionItemContentComponent,
  },
  decorators: [
    moduleMetadata({
      declarations: [],
      imports: [
        CommonModule,
        AccordionComponent,
        AccordionIconComponent,
        AccordionItemComponent,
        AccordionItemHeaderComponent,
        AccordionItemContentComponent,
        TextComponent,
        IconComponent,
        ButtonComponent,
        CheckboxComponent,
        StatusBadgeComponent,
        CollapseComponent,
      ],
    }),
  ],
  parameters: {
    status: {
      type: ["deprecated", "existsInTediReady"],
    },
  },
} as Meta<AccordionComponent>;

type AccordionStory = StoryObj<AccordionComponent>;

export const Default: AccordionStory = {
  render: () => {
    return {
      template: `<tedi-accordion
    [defaultOpenItems]="['accordion-2']"
    [singleOpen]="true"
  >
    <div [style]="{ display: 'flex', 'flex-direction': 'column', gap: '10px' }">
      <tedi-accordion-item id="accordion-1">
        <tedi-accordion-item-header [indicator]="true">
          <p tedi-text color="secondary">Title</p>
        </tedi-accordion-item-header>
        <tedi-accordion-item-content>
          <p tedi-text color="secondary">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </tedi-accordion-item-content>
      </tedi-accordion-item>

      <tedi-accordion-item id="accordion-2">
        <tedi-accordion-item-header openText="Open" closeText="Close">
          <p tedi-text color="secondary">Title</p>
        </tedi-accordion-item-header>
        <tedi-accordion-item-content>
          <p tedi-text color="secondary">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </tedi-accordion-item-content>
      </tedi-accordion-item>
    </div>
  </tedi-accordion>`,
    };
  },
};

export const Variants: AccordionStory = {
  render: () => {
    return {
      template: `
      <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-16);">
        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header openText="Open" closeText="Close">
              Title
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>
              ${contentExample}
            </tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header openText="Open" closeText="Close">
              Title
              <tedi-status-badge color="success" text="Approved" />
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>
              ${contentExample}
            </tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header openText="Open" closeText="Close">
              <tedi-status-badge color="success" text="Approved" />
              <tedi-icon name="description" color="secondary" [size]="18"></tedi-icon>
              Title
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>
              ${contentExample}
            </tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header openText="Open" closeText="Close">
              <tedi-status-badge color="success" text="Approved" />
              <tedi-icon name="account_circle" color="brand" background="brand-secondary" [size]="16"></tedi-icon>
              Title
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>
              ${contentExample}
            </tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header [indicator]="true">
              Title
              <tedi-status-badge color="success" text="Approved" />
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>
              ${contentExample}
            </tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header [indicator]="true" indicatorPosition="start">
              Title
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>
              ${contentExample}
            </tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header [indicator]="true">
              Title<span tedi-text color="tertiary" modifiers="small"style="margin-left: auto">Description</span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>
              ${contentExample}
            </tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header [indicator]="true">
              <div>
                Title<br />
                Description
              </div>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>
              ${contentExample}
            </tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header [indicator]="true">
              <div>
                Title<br />
                Description
              </div>
              <span tedi-text color="tertiary" modifiers="small"style="margin-left: auto">Description</span>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>
              ${contentExample}
            </tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item #item1>
            <tedi-accordion-item-header [clickable]="false">
              <tedi-collapse
                openText="Title"
                closeText="Title"
                (click)="item1.toggle()"
              />
              <button
                tedi-button
                tedi-accordion-header-end
                variant="secondary"
                (click)="$event.stopPropagation();"
              >
                Select
              </button>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>
              ${contentExample}
            </tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>

        <tedi-accordion>
          <tedi-accordion-item [selected]="true" #item2>
            <tedi-accordion-item-header [clickable]="false">
              <tedi-collapse
                openText="Title"
                closeText="Title"
                (click)="item2.toggle()"
              />
              
              <button
                tedi-button
                tedi-accordion-header-end
                (click)="$event.stopPropagation();"
              >
                  <tedi-icon name="done"></tedi-icon>
                Selected
              </button>
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>
              ${contentExample}
            </tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>
      </div>`,
    };
  },
};

export const IconAccordion: AccordionStory = {
  render: () => {
    return {
      template: `
      <tedi-accordion-item id="accordion-1">
        <tedi-accordion-icon>
          <div [style]="{ display: 'flex', 'align-items': 'center', gap: '8px' }">
            <tedi-icon
              name="business_center"
              color="secondary"
              size="18"
            />
            <p tedi-text modifiers="bold" color="secondary">
              Töövõime
            </p>
          </div>
        </tedi-accordion-icon>
        <tedi-accordion-item-header [indicator]="true">
          <p tedi-text color="secondary">Title</p>
        </tedi-accordion-item-header>
        <tedi-accordion-item-content>
          <p tedi-text color="secondary">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </tedi-accordion-item-content>
      </tedi-accordion-item>`,
    };
  },
};

export const ColoredHeaders: AccordionStory = {
  render: () => {
    return {
      template: `<tedi-accordion
  >
    <div [style]="{ display: 'flex', 'flex-direction': 'column', gap: '10px' }">
      <tedi-accordion-item id="accordion-1">
        <tedi-accordion-item-header [indicator]="true">
          Title
        </tedi-accordion-item-header>
        <tedi-accordion-item-content>
          <p tedi-text color="secondary">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </tedi-accordion-item-content>
      </tedi-accordion-item>

      <tedi-accordion-item id="accordion-2">
        <tedi-accordion-item-header [indicator]="true" variant="brand">
          <span tedi-text color="white">Brand header variant</span>
        </tedi-accordion-item-header>
        <tedi-accordion-item-content>
          <p tedi-text color="secondary">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </tedi-accordion-item-content>
      </tedi-accordion-item>

      <tedi-accordion-item id="accordion-3">
        <tedi-accordion-item-header [indicator]="true" background="brand-quaternary">
          <span tedi-text color="brand">Brand quaternary header background</span>
        </tedi-accordion-item-header>
        <tedi-accordion-item-content>
          <p tedi-text color="secondary">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </tedi-accordion-item-content>
      </tedi-accordion-item>

      <tedi-accordion-item id="accordion-4">
        <tedi-accordion-item-header [indicator]="true" background="warning-primary">
          Warning primary background
        </tedi-accordion-item-header>
        <tedi-accordion-item-content>
          <p tedi-text color="secondary">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </tedi-accordion-item-content>
      </tedi-accordion-item>
    </div>
  </tedi-accordion>`,
    };
  },
};

export const AccordionWithEndContent: AccordionStory = {
  render: () => {
    const checkboxClickHandler = (e: Event) => {
      e.stopPropagation();
    };
    return {
      props: {
        checkboxClickHandler,
      },
      template: `
      <tedi-accordion-item id="accordion-item-end-1">
        <tedi-accordion-item-header [indicator]="true">
          <p tedi-text color="brand">Title</p>
          <div tedi-accordion-header-end>
            <tedi-checkbox inputId="accordion-checkbox" (click)="checkboxClickHandler($event)" />
          </div>
        </tedi-accordion-item-header>
        <tedi-accordion-item-content>
          <p tedi-text color="secondary">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </tedi-accordion-item-content>
      </tedi-accordion-item>`,
    };
  },
};

export const Custom: AccordionStory = {
  render: () => {
    return {
      template: `
      <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-16);">
        <tedi-accordion>
          <tedi-accordion-item>
            <tedi-accordion-item-header openText="Open" closeText="Close">
              <img tedi-accordion-start-before-title src="custom_accordion_1.png" alt="Accordion example" />
              <div>
                <strong>
                  Mari Maasikas
                </strong><br/>
                <span>
                  mari.maasikas&#64;gmail.com
                </span>
              </div>
              <tedi-status-badge color="success" text="Approved" style="margin-left: auto" />
            </tedi-accordion-item-header>
            <tedi-accordion-item-content>
              ${contentExample}
            </tedi-accordion-item-content>
          </tedi-accordion-item>
        </tedi-accordion>
      </div>`,
    };
  },
};
