import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { CheckboxComponent } from "./checkbox.component";
import { CheckboxCardComponent } from "../checkbox-card/checkbox-card.component";
import { CheckboxGroupComponent } from "../checkbox-group/checkbox-group.component";
import { CheckboxCardGroupComponent } from "../checkbox-card-group/checkbox-card-group.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { TextComponent } from "../../base/text/text.component";
import { LabelComponent } from "../../content/label/label.component";
import { IconComponent } from "../../base/icon/icon.component";
import { TooltipComponent } from "../../overlay/tooltip/tooltip.component";
import { TooltipTriggerComponent } from "../../overlay/tooltip/tooltip-trigger/tooltip-trigger.component";
import { TooltipContentComponent } from "../../overlay/tooltip/tooltip-content/tooltip-content.component";
import { InfoButtonComponent } from "../../buttons/info-button/info-button.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { AlertComponent } from "../../notifications/alert/alert.component";

type StoryCheckboxComponent = CheckboxComponent & {
  indeterminate: boolean;
};

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.41.64?node-id=4228-72936&m=dev" target="_blank">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/796203-checkbox" target="_blank">Zeroheight ↗</a>
 */
export default {
  title: "TEDI-Ready/Components/Form/Checkbox",
  component: CheckboxComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CheckboxComponent,
        CheckboxCardComponent,
        CheckboxGroupComponent,
        CheckboxCardGroupComponent,
        RowComponent,
        ColComponent,
        TextComponent,
        LabelComponent,
        IconComponent,
        TooltipComponent,
        TooltipTriggerComponent,
        TooltipContentComponent,
        InfoButtonComponent,
        FeedbackTextComponent,
        AlertComponent,
        ReactiveFormsModule,
      ],
    }),
  ],
  argTypes: {
    size: {
      control: "radio",
      options: ["default", "large"],
      description: "Size of the checkbox.",
      table: {
        category: "Checkbox",
        type: {
          summary: "CheckboxSize",
          detail: "default \nlarge",
        },
        defaultValue: {
          summary: "default",
        },
      },
    },
    invalid: {
      control: "boolean",
      description: "Show the checkbox in an invalid state.",
      table: {
        category: "Checkbox",
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "false",
        },
      },
    },
    disabled: {
      control: "boolean",
      description: "Disable the checkbox.",
      table: {
        category: "Checkbox",
        type: {
          summary: "boolean",
        },
      },
    },
    indeterminate: {
      control: "boolean",
      description:
        "Show an indeterminate state, marked with a dash, that is neither checked nor unchecked. Interacting with the checkbox clears it.",
      table: {
        category: "Checkbox",
      },
    },
    variant: {
      control: "radio",
      options: ["primary", "secondary"],
      description: "Visual variant of the checkbox card.",
      table: {
        category: "Checkbox Card",
        type: {
          summary: "CheckboxCardVariant",
          detail: "primary \nsecondary",
        },
        defaultValue: {
          summary: "primary",
        },
      },
    },
    showIndicator: {
      control: "boolean",
      description:
        "Show the checkbox indicator. When false, the checkbox is visually hidden but stays functional.",
      table: {
        category: "Checkbox Card",
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "true",
        },
      },
    },
    groupLabel: {
      control: "text",
      description: "Label text displayed above the checkbox group.",
      table: {
        category: "Checkbox Group",
        type: {
          summary: "string",
        },
      },
    },
    groupDirection: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Layout direction of the checkboxes.",
      table: {
        category: "Checkbox Group",
        type: {
          summary: "CheckboxGroupDirection",
          detail: "horizontal \nvertical",
        },
        defaultValue: {
          summary: "horizontal",
        },
      },
    },
  },
} as Meta<StoryCheckboxComponent>;

export const Default: StoryObj<StoryCheckboxComponent & { disabled: boolean }> =
  {
    parameters: { chromatic: { disableSnapshot: true } },
    args: {
      size: "default",
      invalid: false,
      disabled: false,
      indeterminate: false,
    },
    render: (args) => ({
      props: args,
      template: `
      <label tedi-label color="primary" class="flex align-items-center gap-2">
        <input tedi-checkbox type="checkbox" ${argsToTemplate(args)} />
        Tekst
      </label>
    `,
    }),
  };

/**
 * Default size is used on desktop, large size is applied automatically on mobile screen sizes.
 * Use in tables where the checkbox has no text. **Otherwise, prefer using default size.**
 */
export const Size: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="12" [gapY]="3">
        <tedi-col width="9" [md]="{ width: 6 }">
          <p tedi-text modifiers="bold">Default</p>
        </tedi-col>
        <tedi-col width="3" [md]="{ width: 6 }">
          <input tedi-checkbox type="checkbox" aria-label="Vaikimisi" />
        </tedi-col>
        <tedi-col width="9" [md]="{ width: 6 }">
          <div class="flex flex-column gap-3">
            <p tedi-text modifiers="bold">Large</p>
            <tedi-alert type="warning" [showClose]="false">
              <p tedi-text>Applied automatically on mobile screen sizes.</p>
              <p tedi-text modifiers="bold">Otherwise, prefer using default size.</p>
            </tedi-alert>
          </div>
        </tedi-col>
        <tedi-col width="3" [md]="{ width: 6 }">
          <input tedi-checkbox type="checkbox" size="large" aria-label="Suur" />
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const Vertical: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-checkbox-group label="Vali tooraine" direction="vertical">
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" checked />
          Kartul
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" checked />
          Porgand
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" />
          Kapsas
        </label>
      </tedi-checkbox-group>
    `,
  }),
};

export const Horizontal: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-checkbox-group label="Vali tooraine">
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" checked />
          Kartul
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" checked />
          Porgand
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" />
          Kapsas
        </label>
      </tedi-checkbox-group>
    `,
  }),
};

export const VerticalTree: StoryObj<CheckboxComponent> = {
  render: (args) => {
    setTimeout(() => {
      const parent = document.querySelector(
        "#parentCB input",
      ) as HTMLInputElement;
      const children = Array.from(
        document.querySelectorAll("#childrenCB input"),
      ) as HTMLInputElement[];

      function updateParent() {
        const checked = children.map((c) => c.checked);
        const all = checked.every((v) => v === true);
        const none = checked.every((v) => v === false);

        parent.checked = all;
        parent.indeterminate = !all && !none;
      }

      updateParent();

      children.forEach((c) => c.addEventListener("change", updateParent));

      parent.addEventListener("change", () => {
        const targetState = parent.checked;
        children.forEach((c) => (c.checked = targetState));
        updateParent();
      });
    });

    return {
      props: args,
      template: `
        <tedi-checkbox-group label="Vali tooraine" direction="vertical">
          <label tedi-label id="parentCB" color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Juurviljad
          </label>
          <tedi-checkbox-group id="childrenCB" direction="vertical" style="padding-left: 32px;">
            <label tedi-label color="primary" class="flex align-items-center gap-2">
              <input tedi-checkbox type="checkbox" checked />
              Kartul
            </label>
            <label tedi-label color="primary" class="flex align-items-center gap-2">
              <input tedi-checkbox type="checkbox" checked />
              Porgand
            </label>
            <label tedi-label color="primary" class="flex align-items-center gap-2">
              <input tedi-checkbox type="checkbox" />
              Kapsas
            </label>
            <label tedi-label color="primary" class="flex align-items-center gap-2">
              <input tedi-checkbox type="checkbox" />
              Kaalikas
            </label>
            <label tedi-label color="primary" class="flex align-items-center gap-2">
              <input tedi-checkbox type="checkbox" />
              Peet
            </label>
          </tedi-checkbox-group>
        </tedi-checkbox-group>
      `,
    };
  },
};

export const Separate: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="1" [gapY]="4">
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" />
          Nõustun tingimustega
        </label>
        <label tedi-label color="primary" [required]="true" class="flex align-items-center">
          <input tedi-checkbox type="checkbox" style="margin-right: var(--form-checkbox-radio-inner-spacing)" />
          Nõustun tingimustega
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" />
          <tedi-icon name="stethoscope" [size]="16" />
          Analüüsid
        </label>
        <div class="flex align-items-center gap-1">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Analüüsid
          </label>
          <tedi-tooltip>
            <tedi-tooltip-trigger>
              <button tedi-info-button></button>
            </tedi-tooltip-trigger>
            <tedi-tooltip-content>
              Tooltip text
            </tedi-tooltip-content>
          </tedi-tooltip>
        </div>
        <div>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Analüüsid
          </label>
          <tedi-feedback-text text="Valik tagab vereanalüüside võtmise ning tulemuste tõlgendamise" />
        </div>
      </tedi-row>
    `,
  }),
};

export const Group: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [gapY]="3" [xs]="{cols: 1}" [md]="{cols: 2}">
        <tedi-checkbox-group label="Tooraine" direction="vertical">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Kartul
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Piim
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Banaanid
          </label>
          <tedi-feedback-text text="Tegemist on veidi veidra valikuga, kuid vähemalt ühe baaselemendi peab valima" />
        </tedi-checkbox-group>
        <tedi-checkbox-group label="Tooraine">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Kartul
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Piim
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Banaanid
          </label>
          <tedi-feedback-text text="Tegemist on veidi veidra valikuga, kuid vähemalt ühe baaselemendi peab valima" />
        </tedi-checkbox-group>
        <tedi-checkbox-group label="Tooraine" direction="vertical">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Kartul
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Peet
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Kapsas
          </label>
          <tedi-feedback-text text="Vähemalt 1 tooraine on kohustuslik valida" type="error" />
        </tedi-checkbox-group>
        <tedi-checkbox-group label="Tooraine">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Kartul
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Peet
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Kapsas
          </label>
          <tedi-feedback-text text="Vähemalt 1 tooraine on kohustuslik valida" type="error" />
        </tedi-checkbox-group>
      </tedi-row>
    `,
  }),
};

/**
 * Checkbox cards with primary and secondary variants. Primary uses a filled background when selected, secondary uses an outline border.
 */
export const CardsDefault: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [gapY]="3" [xs]="{cols: 1}" [md]="{cols: 2}">
        <tedi-col class="flex flex-column gap-2">
          <p tedi-text modifiers="bold">Primary</p>
          <tedi-checkbox-card-group>
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" checked />
              Kartul
            </label>
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" />
              Peet
            </label>
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" />
              Kapsas
            </label>
          </tedi-checkbox-card-group>
        </tedi-col>
        <tedi-col class="flex flex-column gap-2">
          <p tedi-text modifiers="bold">Secondary</p>
          <tedi-checkbox-card-group>
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" checked />
              Kartul
            </label>
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" />
              Peet
            </label>
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" />
              Kapsas
            </label>
          </tedi-checkbox-card-group>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

/**
 * Checkbox cards with a description below the label text.
 */
export const CardsWithDescription: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    styles: [
      `
        .cards-with-description__stretch {
          display: flex;
        }

        .cards-with-description__stretch label[tedi-checkbox-card] {
          flex: 1 1 12rem;
        }
      `,
    ],
    template: `
    <div class="flex flex-column gap-4">
      <div class="flex flex-column gap-2">
        <p tedi-text modifiers="bold">Primary</p>
        <tedi-checkbox-card-group class="cards-with-description__stretch">
          <label tedi-checkbox-card variant="primary">
            <input tedi-checkbox type="checkbox" checked />
            Kartul
            <tedi-feedback-text text="Tärkliserikas mugulköögivili, mida kasutatakse laialt toiduks." />
          </label>
          <label tedi-checkbox-card variant="primary">
            <input tedi-checkbox type="checkbox" />
            Peet
            <tedi-feedback-text text="Magusamaitseline juurvili, mida süüakse nii toorelt kui ka kuumtöödeldult." />
          </label>
          <label tedi-checkbox-card variant="primary">
            <input tedi-checkbox type="checkbox" />
            Kapsas
            <tedi-feedback-text text="Lehtköögivili, mille tihedaid lehti kasutatakse mitmesugustes roogades." />
          </label>
        </tedi-checkbox-card-group>
      </div>
      <div class="flex flex-column gap-2">
        <p tedi-text modifiers="bold">Secondary</p>
        <tedi-checkbox-card-group class="cards-with-description__stretch">
          <label tedi-checkbox-card variant="secondary">
            <input tedi-checkbox type="checkbox" checked />
            Kartul
            <tedi-feedback-text text="Tärkliserikas mugulköögivili, mida kasutatakse laialt toiduks." />
          </label>
          <label tedi-checkbox-card variant="secondary">
            <input tedi-checkbox type="checkbox" />
            Peet
            <tedi-feedback-text text="Magusamaitseline juurvili, mida süüakse nii toorelt kui ka kuumtöödeldult." />
          </label>
          <label tedi-checkbox-card variant="secondary">
            <input tedi-checkbox type="checkbox" />
            Kapsas
            <tedi-feedback-text text="Lehtköögivili, mille tihedaid lehti kasutatakse mitmesugustes roogades." />
          </label>
        </tedi-checkbox-card-group>
      </div>
    </div>
    `,
  }),
};

/**
 * Checkbox cards with icons before the label text, with and without a description.
 */
export const CardsWithIcons: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    styles: [
      `
        .cards-with-icons__stretch {
          display: flex;
        }

        .cards-with-icons__stretch label[tedi-checkbox-card] {
          flex: 1 1 12rem;
        }
      `,
    ],
    template: `
    <div class="flex flex-column gap-4">
      <tedi-row [gapY]="3" [xs]="{cols: 1}" [md]="{cols: 2}">
        <tedi-col class="flex flex-column gap-2">
          <p tedi-text modifiers="bold">Primary</p>
          <tedi-checkbox-card-group>
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" checked />
              <tedi-icon name="directions_subway" [size]="18" />
              Trammiga
            </label>
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" />
              <tedi-icon name="directions_walk" [size]="18" />
              Jalgsi
            </label>
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" />
              <tedi-icon name="directions_car" [size]="18" />
              Autoga
            </label>
          </tedi-checkbox-card-group>
        </tedi-col>
        <tedi-col class="flex flex-column gap-2">
          <p tedi-text modifiers="bold">Secondary</p>
          <tedi-checkbox-card-group>
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" checked />
              <tedi-icon name="directions_subway" [size]="18" />
              Trammiga
            </label>
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" />
              <tedi-icon name="directions_walk" [size]="18" />
              Jalgsi
            </label>
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" />
              <tedi-icon name="directions_car" [size]="18" />
              Autoga
            </label>
          </tedi-checkbox-card-group>
        </tedi-col>
      </tedi-row>
      <div class="flex flex-column gap-2">
        <p tedi-text modifiers="bold">Primary with description</p>
        <tedi-checkbox-card-group class="cards-with-icons__stretch">
          <label tedi-checkbox-card variant="primary">
            <input tedi-checkbox type="checkbox" checked />
            <tedi-icon name="directions_subway" [size]="18" />
            Trammiga
            <tedi-feedback-text text="Soovitatud variant, vähendab ummikuid" />
          </label>
          <label tedi-checkbox-card variant="primary">
            <input tedi-checkbox type="checkbox" />
            <tedi-icon name="directions_walk" [size]="18" />
            Jalgsi
            <tedi-feedback-text text="Soovitatud variant, vähendab ummikuid" />
          </label>
          <label tedi-checkbox-card variant="primary">
            <input tedi-checkbox type="checkbox" />
            <tedi-icon name="directions_car" [size]="18" />
            Autoga
            <tedi-feedback-text text="Kui soovid kiiremini kohale jõuda, tekitab ummikuid" />
          </label>
        </tedi-checkbox-card-group>
      </div>
      <div class="flex flex-column gap-2">
        <p tedi-text modifiers="bold">Secondary with description</p>
        <tedi-checkbox-card-group class="cards-with-icons__stretch">
          <label tedi-checkbox-card variant="secondary">
            <input tedi-checkbox type="checkbox" checked />
            <tedi-icon name="directions_subway" [size]="18" />
            Trammiga
            <tedi-feedback-text text="Soovitatud variant, vähendab ummikuid" />
          </label>
          <label tedi-checkbox-card variant="secondary">
            <input tedi-checkbox type="checkbox" />
            <tedi-icon name="directions_walk" [size]="18" />
            Jalgsi
            <tedi-feedback-text text="Soovitatud variant, vähendab ummikuid" />
          </label>
          <label tedi-checkbox-card variant="secondary">
            <input tedi-checkbox type="checkbox" />
            <tedi-icon name="directions_car" [size]="18" />
            Autoga
            <tedi-feedback-text text="Kui soovid kiiremini kohale jõuda, tekitab ummikuid" />
          </label>
        </tedi-checkbox-card-group>
      </div>
    </div>
    `,
  }),
};

type GridPlace = [row: number, column: number | string];

/**
 * Lays a state matrix out on a grid whose columns never wrap into the row labels.
 * Every item gets a desktop and a mobile grid position, swapped below `md`:
 * `mobileLayout="rows"` puts each row label on its own line above cells that
 * share the width;
 * `mobileLayout="columns"` splits the matrix into one section per column.
 * Each cell is rendered once, so input ids and radio names stay unique. Card
 * groups in error cells (`.state-matrix__error`) keep their natural width, while
 * the message may widen the column to stay on one line, and wraps only when the
 * matrix runs out of room. `desktopGrid` sets a minimum column width, row height
 * and gaps for the desktop layout.
 */
const stateMatrix = ({
  headers,
  rows,
  alignItems = "start",
  mobileLayout = "rows",
  desktopGrid,
}: {
  headers: string[];
  rows: { label: string; cells: string[] }[];
  alignItems?: "start" | "center";
  mobileLayout?: "rows" | "columns";
  desktopGrid?: {
    columnWidth: string;
    rowHeight: string;
    columnGap: string;
    rowGap: string;
  };
}) => {
  const columns = headers.length;
  const sectionSize = rows.length + 1;
  const byColumns = mobileLayout === "columns";

  const item = (
    tag: string,
    content: string,
    desktop: GridPlace | null,
    mobile: GridPlace | null,
    className = "",
  ) => {
    const classes = [
      className,
      desktop ? "" : "state-matrix__mobile-only",
      mobile ? "" : "state-matrix__desktop-only",
    ].join(" ");
    const style = [
      desktop ? `--d-row: ${desktop[0]}; --d-col: ${desktop[1]};` : "",
      mobile ? `--m-row: ${mobile[0]}; --m-col: ${mobile[1]};` : "",
    ].join(" ");
    return `<${tag} class="${classes.trim()}" style="${style.trim()}">${content}</${tag}>`;
  };

  const headerItems = headers.map((header, c) =>
    item(
      "strong",
      header,
      [1, c + 2],
      byColumns ? [c * sectionSize + 1, "1 / -1"] : [1, c + 1],
      byColumns && c > 0 ? "state-matrix__section-title" : "",
    ),
  );

  const rowItems = rows.map(({ label, cells }, r) => {
    const labels = byColumns
      ? headers.map((_, c) =>
          item("strong", label, c === 0 ? [r + 2, 1] : null, [
            c * sectionSize + r + 2,
            1,
          ]),
        )
      : [
          item(
            "strong",
            label,
            [r + 2, 1],
            [2 * r + 2, "1 / -1"],
            "state-matrix__row-label",
          ),
        ];
    const cellItems = cells.map((cell, c) =>
      item(
        "div",
        cell,
        [r + 2, c + 2],
        byColumns ? [c * sectionSize + r + 2, 2] : [2 * r + 3, c + 1],
      ),
    );
    return [...labels, ...cellItems].join("");
  });

  return `
    <div class="state-matrix state-matrix--${mobileLayout} ${desktopGrid ? "state-matrix--fixed" : ""}" style="--_columns: ${columns}; --_align: ${alignItems}; ${desktopGrid ? `--_column-width: ${desktopGrid.columnWidth}; --_row-height: ${desktopGrid.rowHeight}; --_column-gap: ${desktopGrid.columnGap}; --_row-gap: ${desktopGrid.rowGap};` : ""}">
      <div class="state-matrix__grid">
        ${item("span", "", [1, 1], null)}
        ${headerItems.join("")}
        ${rowItems.join("")}
      </div>
    </div>`;
};

const stateMatrixStyles = [
  `
  .state-matrix__grid {
    display: grid;
    grid-template-columns: max-content repeat(
        var(--_columns),
        minmax(min-content, max-content)
      );
    gap: var(--layout-grid-gutters-16) var(--layout-grid-gutters-24);
    align-items: var(--_align);
  }

  .state-matrix__grid > * {
    grid-row: var(--d-row);
    grid-column: var(--d-col);
  }

  .state-matrix__grid > .state-matrix__mobile-only {
    display: none;
  }

  .state-matrix__error > :first-child {
    width: max-content;
  }

  @media (min-width: 48rem) {
    .state-matrix--fixed .state-matrix__grid {
      grid-template-columns:
        minmax(var(--_column-width), max-content)
        repeat(var(--_columns), minmax(var(--_column-width), max-content));
      grid-auto-rows: minmax(var(--_row-height), auto);
      gap: var(--_row-gap) var(--_column-gap);
    }
  }

  @media (max-width: 47.98rem) {
    .state-matrix--rows .state-matrix__grid {
      grid-template-columns: repeat(var(--_columns), minmax(0, 1fr));
    }

    .state-matrix--columns .state-matrix__grid {
      grid-template-columns: max-content minmax(0, 1fr);
    }

    .state-matrix__grid > * {
      grid-row: var(--m-row);
      grid-column: var(--m-col);
    }

    .state-matrix__grid > .state-matrix__mobile-only {
      display: block;
    }

    .state-matrix__grid > .state-matrix__desktop-only {
      display: none;
    }

    .state-matrix__row-label,
    .state-matrix__section-title {
      margin-top: var(--layout-grid-gutters-08);
    }
  }
`,
];

const stateRows: {
  label: string;
  id: string;
  attrs?: string;
  labelAttrs?: string;
  feedback?: boolean;
  unselected?: boolean;
}[] = [
  { label: "Default", id: "Default" },
  { label: "Hover", id: "Hover" },
  { label: "Active", id: "Active" },
  { label: "Focus", id: "Focus" },
  { label: "Disabled", id: "Disabled", attrs: "disabled" },
  { label: "Error", id: "Error", attrs: '[invalid]="true"', feedback: true },
  { label: "Mandatory", id: "Mandatory", labelAttrs: '[required]="true"' },
  {
    label: "Indeterminate",
    id: "Indeterminate",
    attrs: '[indeterminate]="true"',
    unselected: false,
  },
];

const stateCell = (
  { id, attrs = "", labelAttrs = "", feedback }: (typeof stateRows)[number],
  selected: boolean,
) => `
  <div>
    <label tedi-label color="primary" class="flex align-items-center" ${labelAttrs}>
      <input tedi-checkbox type="checkbox" style="margin-right: var(--form-checkbox-radio-inner-spacing)" id="${id}${selected ? "Selected" : "Unselected"}" ${selected ? "checked" : ""} ${attrs} />
      Tekst
    </label>
    ${feedback ? '<tedi-feedback-text text="Kohustuslik väli" type="error" />' : ""}
  </div>`;

/** Gives the States matrix more room between columns and rows on desktop. */
const statesDesktopGrid = {
  columnWidth: "10.375rem",
  rowHeight: "2.5rem",
  columnGap: "var(--layout-grid-gutters-16)",
  rowGap: "var(--layout-grid-gutters-08)",
};

export const States: StoryObj<CheckboxComponent> = {
  parameters: {
    pseudo: {
      hover: ["#HoverUnselected", "#HoverSelected"],
      active: ["#ActiveUnselected", "#ActiveSelected"],
      focusVisible: ["#FocusUnselected", "#FocusSelected"],
    },
  },
  render: (args) => ({
    props: args,
    template: stateMatrix({
      headers: ["Unselected", "Selected"],
      alignItems: "center",
      desktopGrid: statesDesktopGrid,
      rows: stateRows.map((row) => ({
        label: row.label,
        cells: [
          row.unselected === false ? "" : stateCell(row, false),
          stateCell(row, true),
        ],
      })),
    }),
    styles: stateMatrixStyles,
  }),
};

const cardStates: { label: string; attrs?: string }[] = [
  { label: "Default" },
  { label: "Hover" },
  { label: "Active" },
  { label: "Focus" },
  { label: "Disabled", attrs: "disabled" },
];

const cardStateId = (variant: string, state: string, selected: boolean) =>
  `${variant}${state}${selected ? "Selected" : "Unselected"}`;

const cardStatesPseudo = (variant: string) => {
  const ids = (state: string) =>
    [false, true].map(
      (selected) => `#${cardStateId(variant, state, selected)}`,
    );
  return {
    hover: ids("Hover"),
    active: ids("Active"),
    focusVisible: ids("Focus"),
  };
};

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const cardStatesTemplate = (variant: "primary" | "secondary") => {
  const card = (selected: boolean, id = "", attrs = "") => `
          <label tedi-checkbox-card variant="${variant}">
            <input tedi-checkbox type="checkbox" ${id ? `id="${id}"` : ""} ${selected ? "checked" : ""} ${attrs} />
            Tekst
          </label>`;
  const errorGroup = (selected: boolean, message: string) => `
        <div class="flex flex-column gap-1 state-matrix__error">
          <tedi-checkbox-card-group>${card(selected)}${card(false)}
          </tedi-checkbox-card-group>
          <tedi-feedback-text text="${message}" type="error" />
        </div>`;

  return stateMatrix({
    headers: ["Unselected", "Selected"],
    alignItems: "center",
    mobileLayout: "columns",
    rows: [
      ...cardStates.map(({ label, attrs }) => ({
        label,
        cells: [false, true].map((selected) =>
          card(
            selected,
            cardStateId(capitalize(variant), label, selected),
            attrs,
          ),
        ),
      })),
      {
        label: "Error",
        cells: [
          errorGroup(false, "Kohustuslik on valida vähemalt 1 väärtus"),
          errorGroup(true, "Kohustuslik on valida vähemalt 2 väärtust"),
        ],
      },
    ],
  });
};

export const CardStatesPrimary: StoryObj<CheckboxComponent> = {
  parameters: { pseudo: cardStatesPseudo("Primary") },
  render: (args) => ({
    props: args,
    template: cardStatesTemplate("primary"),
    styles: stateMatrixStyles,
  }),
};

export const CardStatesSecondary: StoryObj<CheckboxComponent> = {
  parameters: { pseudo: cardStatesPseudo("Secondary") },
  render: (args) => ({
    props: args,
    template: cardStatesTemplate("secondary"),
    styles: stateMatrixStyles,
  }),
};
/**
 * The group supports two form-binding modes:
 *
 * - **Group-level**: bind `[formControl]` to `<tedi-checkbox-group>`. The group
 *   coordinates `checked` and `disabled` across children. Emits the selected
 *   values as `string[]` on a single control.
 * - **Individual-level (Angular native)**: bind `[formControl]` to each
 *   `<input type="checkbox">` using Angular's built-in
 *   `CheckboxControlValueAccessor`. Each control holds a boolean.
 */
export const WithReactiveForms: StoryObj<CheckboxComponent> = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => {
    const tagsControl = new FormControl<string[]>(["urgent"]);
    const featuresControl = new FormControl<string[]>(["analytics", "export"]);
    const readControl = new FormControl<boolean>(true);
    const writeControl = new FormControl<boolean>(false);
    const adminControl = new FormControl<boolean>(false);

    return {
      props: {
        tagsControl,
        featuresControl,
        readControl,
        writeControl,
        adminControl,
      },
      template: `
        <tedi-row cols="1" [gapY]="3">
          <tedi-col>
            <tedi-checkbox-group label="Sildid" [formControl]="tagsControl">
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-checkbox type="checkbox" value="urgent" />
                Kiireloomuline
              </label>
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-checkbox type="checkbox" value="review" />
                Ülevaatamisel
              </label>
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-checkbox type="checkbox" value="draft" disabled />
                Mustand
              </label>
            </tedi-checkbox-group>
          </tedi-col>

          <tedi-col>
            <tedi-checkbox-group label="Funktsioonid" [formControl]="featuresControl">
              <tedi-checkbox-card-group>
                <label tedi-checkbox-card variant="primary">
                  <input tedi-checkbox type="checkbox" value="analytics" />
                  Analüütika
                </label>
                <label tedi-checkbox-card variant="primary">
                  <input tedi-checkbox type="checkbox" value="export" />
                  Eksport
                </label>
                <label tedi-checkbox-card variant="primary">
                  <input tedi-checkbox type="checkbox" value="audit-log" />
                  Auditilogi
                </label>
              </tedi-checkbox-card-group>
            </tedi-checkbox-group>
          </tedi-col>

          <tedi-col>
            <tedi-checkbox-group label="Õigused">
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-checkbox type="checkbox" [formControl]="readControl" />
                Lugemine
              </label>
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-checkbox type="checkbox" [formControl]="writeControl" />
                Kirjutamine
              </label>
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-checkbox type="checkbox" [formControl]="adminControl" />
                Administraator
              </label>
            </tedi-checkbox-group>
          </tedi-col>

          <tedi-col>
            <tedi-alert type="info" [showClose]="false">
              <pre tedi-text modifiers="small">{{ {
  tags: {
    value: tagsControl.value,
    touched: tagsControl.touched,
    dirty: tagsControl.dirty
  },
  features: {
    value: featuresControl.value,
    touched: featuresControl.touched,
    dirty: featuresControl.dirty
  },
  permissions: {
    read: readControl.value,
    write: writeControl.value,
    admin: adminControl.value
  }
} | json }}</pre>
            </tedi-alert>
          </tedi-col>
        </tedi-row>
      `,
    };
  },
};
