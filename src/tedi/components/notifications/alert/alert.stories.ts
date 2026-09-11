import {
  type Meta,
  type StoryObj,
  moduleMetadata,
  argsToTemplate,
} from "@storybook/angular";

import { AlertComponent } from "./alert.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { IconComponent } from "../../base";
import { TextComponent } from "../../base/text/text.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-(work-in-progress)?node-id=4438-86446&t=lPIIY0laoX80DnVD-4" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/63ede6-alert" target="_blank">Zeroheight ↗</a>
 */

export default {
  title: "TEDI-Ready/Components/Notifications/Alert",
  component: AlertComponent,
  decorators: [
    moduleMetadata({
      imports: [
        AlertComponent,
        ButtonComponent,
        RowComponent,
        IconComponent,
        TextComponent,
      ],
    }),
  ],
  argTypes: {
    title: {
      control: "text",
      description:
        "An optional title for the alert, typically used to summarize the message's purpose. Appears in top of the alert.",
    },
    titleElement: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6", "div"],
      description:
        "The HTML tag to be used for the alert title. Useful for WCAG compliance.",
      defaultValue: {
        summary: "h2",
      },
    },
    type: {
      control: "radio",
      options: ["info", "success", "warning", "danger"],
      description:
        "Defines the visual and contextual type of the alert. This determines the icon, color, and overall style, making it clear whether the alert is informational, a success message, a warning, or an error.",
      defaultValue: {
        summary: "info",
      },
    },
    icon: {
      control: "text",
      description:
        "Specifies an optional icon to display in the alert. See the icon component for more details.",
    },
    showClose: {
      control: "boolean",
      description: "If true, a close button will be displayed.",
      defaultValue: {
        summary: false,
      },
    },
    role: {
      control: "select",
      options: ["alert", "status", "none"],
      description:
        "The ARIA role of the alert, informing screen readers about the alert's purpose. Options: \n - <b>alert</b> for high-priority messages that demand immediate attention. \n - <b>status</b> for less urgent messages providing feedback or updates.\n - <b>none</b> used when no ARIA role is needed.",
      defaultValue: {
        summary: "alert",
      },
    },
    variant: {
      control: "select",
      options: ["default", "global", "noSideBorders"],
      description:
        "Defines the visual and contextual type of the alert. \n - <b>global</b> indicates that the alert is intended to span the full width of the page, typically for critical or prominent messages. \n - <b>noSideBorders</b> removes the side borders from the alert for a cleaner appearance. This also sets the border radius to 0.",
    },
    size: {
      control: "radio",
      options: ["default", "small"],
      description:
        "Alert size variant. \n - <b>default</b> standard padding and body text size. \n - <b>small</b> reduced padding and smaller body text.",
      table: {
        type: { summary: "AlertSize" },
        defaultValue: { summary: "default" },
      },
    },
    open: {
      control: "boolean",
      description: "Is alert open?",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
  },
} as Meta<AlertComponent>;

type Story = StoryObj<AlertComponent>;

export const Default: Story = {
  args: {
    title: "Pealkiri",
    type: "info",
    icon: "",
    showClose: false,
    role: "alert",
    titleElement: "h2",
    size: "default",
    open: true,
  },
  render: (args) => ({
    props: args,
    template: `
    <tedi-alert ${argsToTemplate(args)}>
      Sisu kirjeldus. <a href="#">Tekstisisene lingi näide</a>
    </tedi-alert>`,
  }),
};

export const Size: Story = {
  render: (args) => ({
    props: args,
    template: `
    <tedi-row [cols]="1" [gap]="3">
      <p tedi-text modifiers="bold">Default</p>
      <tedi-alert type="info" size="default">
        Sisu kirjeldus
      </tedi-alert>
      <p tedi-text modifiers="bold">Small</p>
      <tedi-alert type="info" size="small">
        Sisu kirjeldus
      </tedi-alert>
    </tedi-row>
    `,
  }),
};

export const Headless: Story = {
  render: (args) => ({
    props: args,
    template: `
    <tedi-alert>
      Sisu kirjeldus
    </tedi-alert>
    `,
  }),
};

export const Global: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="1" [gap]="3">
        <tedi-alert title="Pealkiri" variant="global">
          Sisu kirjeldus
        </tedi-alert>
        <tedi-alert variant="global">
          Sisu kirjeldus
        </tedi-alert>
      </tedi-row>
    `,
  }),
};

export const WithoutSideBorders: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="1" [gap]="3">
        <tedi-alert variant="noSideBorders" title="Pealkiri">
          Sisu kirjeldus
        </tedi-alert>
        <tedi-alert variant="noSideBorders">
          Sisu kirjeldus
        </tedi-alert>
      </tedi-row>
    `,
  }),
};

export const WithIcon: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="1" [gap]="3">
        <tedi-alert title="Pealkiri" icon="check_circle">
          Sisu kirjeldus
        </tedi-alert>
        <tedi-alert icon="check_circle">
          Sisu kirjeldus
        </tedi-alert>
      </tedi-row>
    `,
  }),
};

export const WithCloseButton: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="1" [gap]="3">
        <tedi-alert title="Pealkiri" [showClose]="true">
          Sisu kirjeldus
        </tedi-alert>
        <tedi-alert [showClose]="true">
          Sisu kirjeldus
        </tedi-alert>
      </tedi-row>
    `,
  }),
};

export const AlertTypes: Story = {
  render: (args) => ({
    props: args,
    template: `
    <tedi-row [cols]="1" [gap]="3">
      <tedi-alert type="info" icon="info">
        See on infoteade.
      </tedi-alert>
      <tedi-alert type="success" icon="check_circle">
        See on õnnestumisteade.
      </tedi-alert>
      <tedi-alert type="warning" icon="warning">
        See on hoiatusteade.
      </tedi-alert>
      <tedi-alert type="danger" icon="error">
        See on veateade.
      </tedi-alert>
    </tedi-row>
    `,
  }),
};

export const WithoutTitleLongText: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-alert type="warning" icon="warning">
        Teie kontol on mitu lahendamata teadet, mis vajavad tähelepanu. Palun vaadake üle oma profiili andmed ja kinnitage need enne jätkamist.
        Süsteem salvestab muudatused automaatselt, kuid soovitame need siiski üle kontrollida.
        Mõned väljad võivad olla puudulikud või vananenud ning vajavad täiendamist.
        Kui teil on küsimusi, võtke palun ühendust klienditoega.
      </tedi-alert>
    `,
  }),
};

export const WithoutTitleLongTextAndClosingButton: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-alert type="info" icon="info" [showClose]="true">
        Teie kontol on mitu lahendamata teadet, mis vajavad tähelepanu. Palun vaadake üle oma profiili andmed ja kinnitage need enne jätkamist.
        Süsteem salvestab muudatused automaatselt, kuid soovitame need siiski üle kontrollida.
        Mõned väljad võivad olla puudulikud või vananenud ning vajavad täiendamist.
        Kui teil on küsimusi, võtke palun ühendust klienditoega.
      </tedi-alert>
    `,
  }),
};

export const WithTitleLongTextAndClosingButton: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-alert type="danger" icon="error" [showClose]="true" title="Pealkiri">
        Teie kontol on mitu lahendamata teadet, mis vajavad tähelepanu. Palun vaadake üle oma profiili andmed ja kinnitage need enne jätkamist.
        Süsteem salvestab muudatused automaatselt, kuid soovitame need siiski üle kontrollida.
        Mõned väljad võivad olla puudulikud või vananenud ning vajavad täiendamist.
        Kui teil on küsimusi, võtke palun ühendust klienditoega.
      </tedi-alert>
    `,
  }),
};

/**
 * Project an element with the `tedi-alert-action` attribute to fill the
 * right-side slot — for example a CTA button that takes the user somewhere
 * relevant. When set, the default close button (`showClose`) is hidden, so the
 * action slot is responsible for any dismiss affordance it wants to expose.
 */
export const WithActionButton: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-alert type="warning" icon="warning">
        Teie profiililt puudub foto — lisage see, et kolleegid saaksid teid jagatud dokumentides ära tunda.
        <button tedi-button tedi-alert-action variant="secondary">Ava profiil <tedi-icon name="arrow_forward" [size]="24" /></button>
      </tedi-alert>
    `,
  }),
};
