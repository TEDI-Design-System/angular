import {
  type Meta,
  type StoryObj,
  moduleMetadata,
  applicationConfig,
} from "@storybook/angular";
import { Component, inject } from "@angular/core";
import { provideAnimations } from "@angular/platform-browser/animations";

import { ToastComponent } from "./toast.component";
import { ToastService } from "../../../services/toast/toast.service";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { VerticalSpacingDirective } from "../../../directives/vertical-spacing/vertical-spacing.directive";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.30.43?node-id=4511-78722" target="_blank">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/35370f-toast" target="_BLANK">Zeroheight ↗</a><hr/>
 *
 * ## Usage
 *
 * Inject `ToastService` and call one of the convenience methods:
 *
 * ```typescript
 * import { ToastService } from '@tedi-design-system/angular/tedi';
 *
 * export class MyComponent {
 *   private toastService = inject(ToastService);
 *
 *   showNotification() {
 *     this.toastService.success('Title', 'Content text', { icon: 'icon_name' });
 *   }
 * }
 * ```
 *
 * ## Accessibility
 *
 * Toasts use CDK live announcer for accessibility:
 * - `role="status"` (default): For non-critical notifications. Screen readers announce politely.
 * - `role="alert"` (default for danger): For critical errors. Screen readers announce immediately.
 * - `role="none"`: When no screen reader announcement is needed.
 */
export default {
  title: "TEDI-Ready/Components/Notifications/Toast",
  component: ToastComponent,
  decorators: [
    moduleMetadata({
      imports: [
        ToastComponent,
        RowComponent,
        ColComponent,
        ButtonComponent,
        VerticalSpacingDirective,
      ],
    }),
    applicationConfig({
      providers: [
        provideAnimations(),
      ],
    }),
  ],
  argTypes: {
    title: {
      control: "text",
      description:
        "Title of the toast notification.",
    },
    content: {
      control: "text",
      description:
        "Toast text content.",
    },
    type: {
      control: "radio",
      options: ["info", "success", "warning", "error"],
      description:
        "Type of the toast notification determining its color scheme.",
      defaultValue: {
        summary: "info",
      },
    },
    icon: {
      control: "text",
      description:
        "Specifies an optional icon to display in the toast notification. See the icon component for more details.",
    },
    duration: {
      control: "number",
      description: "Toast duration in milliseconds. Set to 0 for persistent toast.",
      defaultValue: { summary: 6000 }
    },
    showProgressBar: {
      control: "boolean",
      description: "Whether to show the progress bar for timed toasts.",
      defaultValue: { summary: false }
    },
    pauseOnHover: {
      control: "boolean",
      description: "Whether to pause the auto-close timer when hovering over the toast.",
      defaultValue: { summary: true }
    },
    role: {
      control: "select",
      options: ["alert", "status", "none"],
      description:
        "The ARIA role of the toast, informing screen readers about the notification's priority. Options: \n - <b>alert</b> for high-priority messages that demand immediate attention. \n - <b>status</b> for less urgent messages providing feedback or updates.\n - <b>none</b> used when no ARIA role is needed.",
      defaultValue: {
        summary: "alert",
      },
    },
  },
} as Meta<ToastComponent>;

type Story = StoryObj<ToastComponent>;

@Component({
  selector: "toast-default-demo",
  standalone: true,
  imports: [ButtonComponent, RowComponent, ColComponent, VerticalSpacingDirective],
  template: `
    <div [tediVerticalSpacing]="0.5">
      <tedi-row>
        <tedi-col [lg]="12">
          <button tedi-button (click)="showSuccess()">Show success toast</button>
        </tedi-col>
      </tedi-row>
      <tedi-row>
        <tedi-col>
          <button tedi-button (click)="showWarning()">Show warning toast</button>
        </tedi-col>
      </tedi-row>
      <tedi-row>
        <tedi-col>
          <button tedi-button (click)="showDanger()">Show danger toast</button>
        </tedi-col>
      </tedi-row>
      <tedi-row>
        <tedi-col>
          <button tedi-button (click)="showInfo()">Show info toast</button>
        </tedi-col>
      </tedi-row>
    </div>
  `,
})
class ToastDefaultDemoComponent {
  private readonly toastService = inject(ToastService);

  showSuccess() {
    this.toastService.success("Notice", "Something was successful!");
  }

  showWarning() {
    this.toastService.warning("Notice", "Warning!");
  }

  showDanger() {
    this.toastService.danger("Notice", "Something went wrong!");
  }

  showInfo() {
    this.toastService.info("Notice", "Some info text that can usually be very long!");
  }
}

/**
 * Default toast notifications with different types.
 */
export const Default: Story = {
  decorators: [
    moduleMetadata({
      imports: [ToastDefaultDemoComponent],
    }),
  ],
  parameters: {
    docs: {
      source: {
        code: `
this.toastService.success("Notice", "Something was successful!");
this.toastService.warning("Notice", "Warning!");
this.toastService.danger("Notice", "Something went wrong!");
this.toastService.info("Notice", "Some info text!");
        `,
        language: "typescript",
        type: "code",
      },
    },
  },
  render: () => ({
    template: `<toast-default-demo />`,
  }),
};

@Component({
  selector: "toast-icon-demo",
  standalone: true,
  imports: [ButtonComponent, RowComponent, ColComponent, VerticalSpacingDirective],
  template: `
    <button tedi-button (click)="showWithCustomIcon()">With icon</button>
  `,
})
class ToastIconDemoComponent {
  private readonly toastService = inject(ToastService);

  showWithCustomIcon() {
    this.toastService.info("With Icon", "Using a custom icon", { icon: "info" });
  }
}

/**
 * Toasts with or without icons. Icons are only shown when explicitly provided.
 */
export const WithIcon: Story = {
  decorators: [
    moduleMetadata({
      imports: [ToastIconDemoComponent],
    }),
  ],
  parameters: {
    docs: {
      source: {
        code: `this.toastService.info("With Icon", "Using a custom icon", { icon: "info" });`,
        language: "typescript",
        type: "code",
      },
    },
  },
  render: () => ({
    template: `<toast-icon-demo />`,
  }),
};

@Component({
  selector: "toast-timer-demo",
  standalone: true,
  imports: [ButtonComponent, RowComponent, ColComponent, VerticalSpacingDirective],
  template: `
    <tedi-row gap="2">
      <tedi-col>
        <button tedi-button (click)="show(2)">Auto close in 2s</button>
      </tedi-col>
      <tedi-col>
        <button tedi-button (click)="show(10)">Auto close in 10s</button>
      </tedi-col>
    </tedi-row>
  `,
})
class ToastTimerDemoComponent {
  private readonly toastService = inject(ToastService);

  show(delay: number) {
    this.toastService.info(`${delay}s delay`, `Closes after ${delay} seconds`, {
      duration: delay * 1000,
      showProgressBar: true,
    });
  }
}

/**
 * Toasts with custom auto-close durations and progress bar.
 */
export const CustomTimerForAutoclose: Story = {
  decorators: [
    moduleMetadata({
      imports: [ToastTimerDemoComponent],
    }),
  ],
  parameters: {
    docs: {
      source: {
        code: `
this.toastService.info("2s delay", "Closes after 2 seconds", {
  duration: 2000,
  showProgressBar: true
});

this.toastService.info("10s delay", "Closes after 10 seconds", {
  duration: 10000,
  showProgressBar: true
});
        `,
        language: "typescript",
        type: "code",
      },
    },
  },
  render: () => ({
    template: `<toast-timer-demo />`,
  }),
};

@Component({
  selector: "toast-persistent-demo",
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <button tedi-button (click)="showPersistent()">Show persistent toast</button>
  `,
})
class ToastPersistentDemoComponent {
  private readonly toastService = inject(ToastService);

  showPersistent() {
    this.toastService.warning("Persistent", "Stays until closed", {
      duration: 0,
    });
  }
}

/**
 * Persistent toast that stays visible until manually closed.
 */
export const PersistentToast: Story = {
  decorators: [
    moduleMetadata({
      imports: [ToastPersistentDemoComponent],
    }),
  ],
  parameters: {
    docs: {
      source: {
        code: `this.toastService.warning("Persistent", "Stays until closed", { duration: 0 });`,
        language: "typescript",
        type: "code",
      },
    },
  },
  render: () => ({
    template: `<toast-persistent-demo />`,
  }),
};

@Component({
  selector: "toast-position-demo",
  standalone: true,
  imports: [ButtonComponent, RowComponent, ColComponent, VerticalSpacingDirective],
  template: `
    <div [tediVerticalSpacing]="0.5">
      <tedi-row gap="2">
        <tedi-col>
          <button tedi-button variant="secondary" (click)="showTopLeft()">
            Top Left
          </button>
        </tedi-col>
        <tedi-col>
          <button tedi-button variant="secondary" (click)="showTopRight()">
            Top Right
          </button>
        </tedi-col>
      </tedi-row>
      <tedi-row gap="2">
        <tedi-col>
          <button tedi-button variant="secondary" (click)="showBottomLeft()">
            Bottom Left
          </button>
        </tedi-col>
        <tedi-col>
          <button tedi-button variant="secondary" (click)="showBottomRight()">
            Bottom Right
          </button>
        </tedi-col>
      </tedi-row>
    </div>
  `,
})
class ToastPositionDemoComponent {
  private readonly toastService = inject(ToastService);

  showTopLeft() {
    this.toastService.info("Top Left", "Positioned at top-left corner.", {
      position: "top-left",
    });
  }

  showTopRight() {
    this.toastService.info("Top Right", "Positioned at top-right corner.", {
      position: "top-right",
    });
  }

  showBottomLeft() {
    this.toastService.info("Bottom Left", "Positioned at bottom-left corner.", {
      position: "bottom-left",
    });
  }

  showBottomRight() {
    this.toastService.info("Bottom Right", "Positioned at bottom-right corner.", {
      position: "bottom-right",
    });
  }
}

/**
 * Toast notifications at different screen positions.
 * Default and also recommended value is "bottom-right"
 */
export const Positions: Story = {
  decorators: [
    moduleMetadata({
      imports: [ToastPositionDemoComponent],
    }),
  ],
  parameters: {
    docs: {
      source: {
        code: `
this.toastService.info("Top Left", "Message", { position: "top-left" });
this.toastService.info("Top Right", "Message", { position: "top-right" });
this.toastService.info("Bottom Left", "Message", { position: "bottom-left" });
this.toastService.info("Bottom Right", "Message", { position: "bottom-right" });
        `,
        language: "typescript",
        type: "code",
      },
    },
  },
  render: () => ({
    template: `<toast-position-demo />`,
  }),
};

@Component({
  selector: "toast-hover-demo",
  standalone: true,
  imports: [ButtonComponent, RowComponent, ColComponent],
  template: `
    <tedi-row gap="2">
      <tedi-col>
        <button tedi-button (click)="showPauseOnHover()">
          Pause on hover
        </button>
      </tedi-col>
      <tedi-col>
        <button tedi-button (click)="showNoPause()">
          No pause on hover
        </button>
      </tedi-col>
    </tedi-row>
  `,
})
class ToastHoverDemoComponent {
  private readonly toastService = inject(ToastService);

  showPauseOnHover() {
    this.toastService.info("Pauses", "Timer stops when hovered", {
      showProgressBar: true,
    });
  }

  showNoPause() {
    this.toastService.danger("No Pause", "Closes even if hovered", {
      showProgressBar: true,
      pauseOnHover: false,
    });
  }
}

/**
 * Toasts with hover behavior control. By default, hovering pauses the auto-close timer.
 */
export const HoverBehavior: Story = {
  decorators: [
    moduleMetadata({
      imports: [ToastHoverDemoComponent],
    }),
  ],
  parameters: {
    docs: {
      source: {
        code: `
this.toastService.info("Pauses", "Timer stops when hovered", {
  showProgressBar: true
});

this.toastService.danger("No Pause", "Closes even if hovered", {
  showProgressBar: true,
  pauseOnHover: false
});
        `,
        language: "typescript",
        type: "code",
      },
    },
  },
  render: () => ({
    template: `<toast-hover-demo />`,
  }),
};

@Component({
  selector: "toast-wcag-demo",
  standalone: true,
  imports: [ButtonComponent, RowComponent, ColComponent],
  template: `
    <tedi-row gap="2">
      <tedi-col>
        <button tedi-button (click)="showStatus()">
          Success (role=status)
        </button>
      </tedi-col>
      <tedi-col>
        <button tedi-button (click)="showAlert()">
          Error (role=alert)
        </button>
      </tedi-col>
      <tedi-col>
        <button tedi-button (click)="showNone()">
          Info (role=none)
        </button>
      </tedi-col>
    </tedi-row>
  `,
})
class ToastWcagDemoComponent {
  private readonly toastService = inject(ToastService);

  showStatus() {
    this.toastService.success("Success", "Screen reader announces politely");
  }

  showAlert() {
    this.toastService.danger("Error", "Screen reader announces immediately");
  }

  showNone() {
    this.toastService.info("Info", "No screen reader announcement", {
      role: "none"
    });
  }
}

/**
 * Toasts with different ARIA roles for screen reader accessibility.
 */
export const WCAGCompliance: Story = {
  decorators: [
    moduleMetadata({
      imports: [ToastWcagDemoComponent],
    }),
  ],
  parameters: {
    docs: {
      source: {
        code: `
// Polite announcement (default for success, info, warning)
this.toastService.success("Success", "Screen reader announces politely");

// Assertive announcement - danger() defaults to role="alert"
this.toastService.danger("Error", "Screen reader announces immediately");
this.toastService.info("Info", "No screen reader announcement", { role: "none" });
        `,
        language: "typescript",
        type: "code",
      },
    },
  },
  render: () => ({
    template: `<toast-wcag-demo />`,
  }),
};
