import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { CardButtonComponent } from "./card-button.component";
import { CardComponent } from "../../content/card/card.component";
import { CardContentComponent } from "../../content/card/card-content/card-content.component";
import { CardIconComponent } from "../../content/card/card-icon/card-icon.component";
import { CardRowComponent } from "../../content/card/card-row/card-row.component";
import { TextComponent } from "../../base/text/text.component";
import { IconComponent } from "../../base/icon/icon.component";
import { StatusBadgeComponent } from "../../tags/status-badge/status-badge.component";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { TextGroupComponent } from "../../content/text-group/text-group.component";
import { TextGroupLabelComponent } from "../../content/text-group/text-group-label.component";
import { TextGroupValueComponent } from "../../content/text-group/text-group-value.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { VerticalSpacingDirective } from "../../../directives/vertical-spacing/vertical-spacing.directive";
import { ShowAtDirective } from "../../../directives/show-at/show-at.directive";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.54.76?node-id=4620-85618&m=dev" target="_blank">Figma ↗</a>
 *
 * CardButton is an interactive wrapper around a `tedi-card`. The host anchor
 * or button provides the semantics and applies hover, active, focus and
 * disabled states to the card and its blocks inside. Any card composition
 * works inside it — content blocks, rows and icon cells. Do not place other
 * interactive elements inside.
 */
export default {
  title: "TEDI-Ready/Components/Buttons/CardButton",
  component: CardButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CardButtonComponent,
        CardComponent,
        CardContentComponent,
        CardIconComponent,
        CardRowComponent,
        TextComponent,
        IconComponent,
        StatusBadgeComponent,
        SeparatorComponent,
        TextGroupComponent,
        TextGroupLabelComponent,
        TextGroupValueComponent,
        RowComponent,
        ColComponent,
        VerticalSpacingDirective,
        ShowAtDirective,
      ],
    }),
  ],
} as Meta<CardButtonComponent>;

type Story = StoryObj<CardButtonComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <a tedi-card-button href="#">
        <tedi-card>
          <tedi-card-content class="flex align-items-center justify-content-between gap-3">
            <div>
              <p tedi-text modifiers="bold">Töövõime</p>
              <p tedi-text modifiers="small" color="secondary">Näiteks töövõimetuslehed, töövõime hindamine</p>
            </div>
            <tedi-icon name="arrow_right_alt" color="secondary" />
          </tedi-card-content>
        </tedi-card>
      </a>
    `,
  }),
};

export const CardRow: Story = {
  render: () => ({
    template: `
      <div [tediVerticalSpacing]="1">
        <a tedi-card-button href="#">
          <tedi-card>
            <tedi-card-content class="flex align-items-center gap-3">
              <p tedi-text modifiers="bold">8:30</p>
              <div class="flex-fill">
                <p tedi-text modifiers="bold">Kardioloog</p>
                <p tedi-text modifiers="small" color="secondary">Valdkond</p>
              </div>
              <span tedi-text color="brand" class="flex align-items-center gap-2">
                <span *showAt="'sm'" aria-hidden="true">Broneerima</span>
                <tedi-icon name="arrow_right_alt" color="brand" label="Broneerima" />
              </span>
            </tedi-card-content>
          </tedi-card>
        </a>
        <a tedi-card-button href="#">
          <tedi-card>
            <tedi-card-content class="flex align-items-center gap-3">
              <tedi-icon name="monitor_heart" color="secondary" />
              <div class="flex-fill">
                <p tedi-text modifiers="bold">Kardioloog</p>
                <p tedi-text modifiers="small" color="secondary">Valdkond</p>
              </div>
              <span tedi-text color="brand" class="flex align-items-center gap-2">
                <span *showAt="'sm'" aria-hidden="true">Broneerima</span>
                <tedi-icon name="arrow_right_alt" color="brand" label="Broneerima" />
              </span>
            </tedi-card-content>
          </tedi-card>
        </a>
        <a tedi-card-button href="#">
          <tedi-card>
            <tedi-card-content class="flex align-items-center gap-3">
              <div class="flex-fill">
                <p tedi-text modifiers="bold">Kardioloog</p>
                <tedi-status-badge color="success" text="Kindlustatud | Tervisekassa" />
              </div>
              <span tedi-text color="brand" class="flex align-items-center gap-2">
                <span *showAt="'sm'" aria-hidden="true">Broneerima</span>
                <tedi-icon name="arrow_right_alt" color="brand" label="Broneerima" />
              </span>
            </tedi-card-content>
          </tedi-card>
        </a>
      </div>
    `,
  }),
};

export const CardShortcutWithIconCard: Story = {
  render: () => ({
    template: `
      <tedi-row [cols]="1" [lg]="{ cols: 3 }" [gap]="3">
        <a tedi-card-button href="#">
          <tedi-card>
            <tedi-card-row>
              <tedi-card-icon>
                <tedi-icon name="euro_symbol" />
              </tedi-card-icon>
              <tedi-card-content class="flex align-items-center justify-content-between gap-3">
                <div>
                  <p tedi-text modifiers="bold">Isiku toetused</p>
                  <p tedi-text modifiers="small" color="secondary">Toetused mis on isikule ette nähtud</p>
                </div>
                <tedi-icon name="arrow_right_alt" color="secondary" />
              </tedi-card-content>
            </tedi-card-row>
          </tedi-card>
        </a>
        <a tedi-card-button href="#">
          <tedi-card>
            <tedi-card-row>
              <tedi-card-icon>
                <tedi-icon name="checklist" />
              </tedi-card-icon>
              <tedi-card-content class="flex align-items-center justify-content-between gap-3">
                <div>
                  <p tedi-text modifiers="bold">Isiku hindamised</p>
                  <p tedi-text modifiers="small" color="secondary">Hindamised toetuste saamiseks</p>
                </div>
                <tedi-icon name="arrow_right_alt" color="secondary" />
              </tedi-card-content>
            </tedi-card-row>
          </tedi-card>
        </a>
        <a tedi-card-button href="#">
          <tedi-card>
            <tedi-card-row>
              <tedi-card-icon>
                <tedi-icon name="contract" />
              </tedi-card-icon>
              <tedi-card-content class="flex align-items-center justify-content-between gap-3">
                <div>
                  <p tedi-text modifiers="bold">Isiku teenused</p>
                  <p tedi-text modifiers="small" color="secondary">Teenused mis on võimaldatud peale hinnagu andmist</p>
                </div>
                <tedi-icon name="arrow_right_alt" color="secondary" />
              </tedi-card-content>
            </tedi-card-row>
          </tedi-card>
        </a>
      </tedi-row>
    `,
  }),
};

export const AsButton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use a button host when the card triggers an action instead of navigating. Only the button host supports the disabled state.",
      },
    },
  },
  render: () => ({
    template: `
      <button tedi-card-button type="button">
        <tedi-card>
          <tedi-card-content class="flex align-items-center justify-content-between gap-3">
            <div>
              <p tedi-text modifiers="bold">Töövõime</p>
              <p tedi-text modifiers="small" color="secondary">Näiteks töövõimetuslehed, töövõime hindamine</p>
            </div>
            <tedi-icon name="arrow_right_alt" color="secondary" />
          </tedi-card-content>
        </tedi-card>
      </button>
    `,
  }),
};

export const States: Story = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },
  render: () => ({
    template: `
      <tedi-row [cols]="1" [sm]="{ cols: 6 }" [gapY]="3" alignItems="center">
        <tedi-col width="1">
          <p tedi-text modifiers="bold">Default</p>
        </tedi-col>
        <tedi-col width="5">
          <a tedi-card-button id="Default" href="#">
            <tedi-card>
              <tedi-card-row>
                <tedi-card-icon><tedi-icon name="euro_symbol" /></tedi-card-icon>
                <tedi-card-content class="flex align-items-center justify-content-between gap-3">
                  <div>
                    <p tedi-text modifiers="bold">Isiku toetused</p>
                    <p tedi-text modifiers="small" color="secondary">Toetused mis on isikule ette nähtud</p>
                  </div>
                  <tedi-icon name="arrow_right_alt" color="secondary" />
                </tedi-card-content>
              </tedi-card-row>
            </tedi-card>
          </a>
        </tedi-col>
        <tedi-col width="1">
          <p tedi-text modifiers="bold">Hover</p>
        </tedi-col>
        <tedi-col width="5">
          <a tedi-card-button id="Hover" href="#">
            <tedi-card>
              <tedi-card-row>
                <tedi-card-icon><tedi-icon name="euro_symbol" /></tedi-card-icon>
                <tedi-card-content class="flex align-items-center justify-content-between gap-3">
                  <div>
                    <p tedi-text modifiers="bold">Isiku toetused</p>
                    <p tedi-text modifiers="small" color="secondary">Toetused mis on isikule ette nähtud</p>
                  </div>
                  <tedi-icon name="arrow_right_alt" color="secondary" />
                </tedi-card-content>
              </tedi-card-row>
            </tedi-card>
          </a>
        </tedi-col>
        <tedi-col width="1">
          <p tedi-text modifiers="bold">Active</p>
        </tedi-col>
        <tedi-col width="5">
          <a tedi-card-button id="Active" href="#">
            <tedi-card>
              <tedi-card-row>
                <tedi-card-icon><tedi-icon name="euro_symbol" /></tedi-card-icon>
                <tedi-card-content class="flex align-items-center justify-content-between gap-3">
                  <div>
                    <p tedi-text modifiers="bold">Isiku toetused</p>
                    <p tedi-text modifiers="small" color="secondary">Toetused mis on isikule ette nähtud</p>
                  </div>
                  <tedi-icon name="arrow_right_alt" color="secondary" />
                </tedi-card-content>
              </tedi-card-row>
            </tedi-card>
          </a>
        </tedi-col>
        <tedi-col width="1">
          <p tedi-text modifiers="bold">Focus</p>
        </tedi-col>
        <tedi-col width="5">
          <a tedi-card-button id="Focus" href="#">
            <tedi-card>
              <tedi-card-row>
                <tedi-card-icon><tedi-icon name="euro_symbol" /></tedi-card-icon>
                <tedi-card-content class="flex align-items-center justify-content-between gap-3">
                  <div>
                    <p tedi-text modifiers="bold">Isiku toetused</p>
                    <p tedi-text modifiers="small" color="secondary">Toetused mis on isikule ette nähtud</p>
                  </div>
                  <tedi-icon name="arrow_right_alt" color="secondary" />
                </tedi-card-content>
              </tedi-card-row>
            </tedi-card>
          </a>
        </tedi-col>
        <tedi-col width="1">
          <p tedi-text modifiers="bold">Disabled</p>
        </tedi-col>
        <tedi-col width="5">
          <button tedi-card-button id="Disabled" disabled>
            <tedi-card>
              <tedi-card-row>
                <tedi-card-icon><tedi-icon name="euro_symbol" /></tedi-card-icon>
                <tedi-card-content class="flex align-items-center justify-content-between gap-3">
                  <div>
                    <p tedi-text modifiers="bold">Isiku toetused</p>
                    <p tedi-text modifiers="small" color="secondary">Toetused mis on isikule ette nähtud</p>
                  </div>
                  <tedi-icon name="arrow_right_alt" color="secondary" />
                </tedi-card-content>
              </tedi-card-row>
            </tedi-card>
          </button>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const TabCard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Mobile navigation pattern: full-width tab cards with a brand title, description and a centered arrow.",
      },
    },
  },
  render: () => ({
    template: `
      <div [tediVerticalSpacing]="1">
        <a tedi-card-button href="#">
          <tedi-card>
            <tedi-card-content class="flex align-items-center justify-content-between gap-3">
              <div>
                <h4 tedi-text color="brand">Minu andmed</h4>
                <p tedi-text modifiers="small" color="secondary">Isikuandmed ja sinu perearstiga seotud info.</p>
              </div>
              <tedi-icon name="arrow_right_alt" color="secondary" />
            </tedi-card-content>
          </tedi-card>
        </a>
        <a tedi-card-button href="#">
          <tedi-card>
            <tedi-card-content class="flex align-items-center justify-content-between gap-3">
              <div>
                <h4 tedi-text color="brand">Minu retseptid</h4>
                <p tedi-text modifiers="small" color="secondary">Retseptid ja meditsiiniseadme kaardid.</p>
              </div>
              <tedi-icon name="arrow_right_alt" color="secondary" />
            </tedi-card-content>
          </tedi-card>
        </a>
        <a tedi-card-button href="#">
          <tedi-card>
            <tedi-card-content class="flex align-items-center justify-content-between gap-3">
              <div>
                <h4 tedi-text color="brand">Minu vaktsineerimised</h4>
                <p tedi-text modifiers="small" color="secondary">Vaktsineerimiste ülevaade ja immuniseerimiskava.</p>
              </div>
              <tedi-icon name="arrow_right_alt" color="secondary" />
            </tedi-card-content>
          </tedi-card>
        </a>
      </div>
    `,
  }),
};

export const ComplexCard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Any card composition works inside the wrapper — rows, icon cells, separators, text groups and badges. Avoid interactive elements inside.",
      },
    },
  },
  render: () => ({
    template: `
      <a tedi-card-button href="#">
        <tedi-card>
          <tedi-card-row>
            <tedi-card-icon>
              <tedi-icon name="prescriptions" />
            </tedi-card-icon>
            <tedi-card-content class="flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <p tedi-text modifiers="bold">Amlodipiin 50mg</p>
                <p tedi-text modifiers="small" color="secondary">Amlodipin-rathiopharm 50mg</p>
              </div>
              <div class="flex flex-wrap align-items-center gap-3">
                <tedi-status-badge color="success" variant="bordered" text="Kehtiv" />
                <p tedi-text modifiers="small" color="secondary">Kehtiv kuni 12.05.2024</p>
                <tedi-icon name="arrow_right_alt" color="secondary" />
              </div>
            </tedi-card-content>
          </tedi-card-row>
          <tedi-separator />
          <tedi-card-row>
            <tedi-card-icon>
              <tedi-icon name="info" />
            </tedi-card-icon>
            <tedi-card-content>
              <tedi-row [cols]="1" [md]="{ cols: 3 }" [gap]="1">
                <tedi-col>
                  <tedi-text-group type="vertical">
                    <tedi-text-group-label>Toimeaine</tedi-text-group-label>
                    <tedi-text-group-value>Amlodipiin</tedi-text-group-value>
                  </tedi-text-group>
                </tedi-col>
                <tedi-col>
                  <tedi-text-group type="vertical">
                    <tedi-text-group-label>Kogus</tedi-text-group-label>
                    <tedi-text-group-value>30 tk</tedi-text-group-value>
                  </tedi-text-group>
                </tedi-col>
                <tedi-col>
                  <tedi-text-group type="vertical">
                    <tedi-text-group-label>Välja ostmata</tedi-text-group-label>
                    <tedi-text-group-value>5 / 6 retsepti</tedi-text-group-value>
                  </tedi-text-group>
                </tedi-col>
              </tedi-row>
            </tedi-card-content>
          </tedi-card-row>
        </tedi-card>
      </a>
    `,
  }),
};
