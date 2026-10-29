import { Meta, StoryObj } from "@storybook/angular";
import { PrintDirective } from "./print.directive";
import { ButtonComponent } from "../../components/buttons/button/button.component";

const BREAKS = ["auto", "avoid", "avoid-column", "avoid-page", "avoid-region"];

/**
 * <a href="https://www.tedi.ee/1ee8444b7/p/161c42-print" target="_BLANK">Zeroheight ↗</a>
 *
 * `tediPrint` applies the print helper classes from `@tedi-design-system/core`
 * to the element it sits on. The classes only take effect inside `@media print`,
 * so **open the browser's print preview** to see what any of these stories do.
 *
 * `tediPrint="show"` cancels a `no-print` on the same element — that is how you
 * opt a component that hides itself when printing (buttons, header, sidenav,
 * footer, breadcrumbs) back into the printed page. It cannot reveal an
 * element that an ancestor hid.
 *
 * The break inputs need the attribute present, so use a bare `tediPrint` when
 * visibility is not being changed: `<div tediPrint breakInside="avoid">`.
 **/

export default {
  title: "TEDI-Ready/Components/Helpers/Print",
  component: PrintDirective,
  parameters: {
    status: {
      type: ["devComponent"],
    },
  },
  argTypes: {
    tediPrint: {
      description: "Controls the visibility of the element when printing.",
      control: { type: "radio", labels: { "": "none" } },
      options: ["", "show", "hide"],
      table: {
        type: { summary: "PrintVisibility | ''" },
        defaultValue: { summary: "''" },
      },
    },
    breakBefore: {
      description: "Sets `break-before` on the element when printing.",
      control: "select",
      options: BREAKS,
      table: { type: { summary: "PrintBreak" } },
    },
    breakAfter: {
      description: "Sets `break-after` on the element when printing.",
      control: "select",
      options: BREAKS,
      table: { type: { summary: "PrintBreak" } },
    },
    breakInside: {
      description: "Sets `break-inside` on the element when printing.",
      control: "select",
      options: BREAKS,
      table: { type: { summary: "PrintBreak" } },
    },
  },
} as Meta<PrintDirective>;

export const Default: StoryObj<PrintDirective> = {
  args: {
    tediPrint: "",
  },
  render: (args) => ({
    props: args,
    template: `
      <div
        [tediPrint]="tediPrint"
        [breakBefore]="breakBefore"
        [breakAfter]="breakAfter"
        [breakInside]="breakInside"
      >
        <p>This section is controlled by the tediPrint directive.</p>
      </div>
      <p>This section is always printed.</p>
    `,
    moduleMetadata: {
      imports: [PrintDirective],
    },
  }),
};

/**
 * Buttons and the layout components hide themselves when printing.
 * `tediPrint="show"` puts one back on the page.
 */
export const Visibility: StoryObj<PrintDirective> = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 8px;">
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          <button tedi-button>Hidden when printing (default)</button>
          <button tedi-button tediPrint="show">Printed anyway</button>
        </div>
        <p tediPrint="hide">This paragraph prints on screen only.</p>
        <p tediPrint="show">
          This paragraph has no <code>no-print</code> to cancel, so
          <code>show</code> changes nothing for it.
        </p>
      </div>
    `,
    moduleMetadata: {
      imports: [PrintDirective, ButtonComponent],
    },
  }),
};
