import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";
import { Component, inject } from "@angular/core";
import { ModalComponent } from "./modal.component";
import { ModalHeaderComponent } from "./modal-header/modal-header.component";
import { ModalContentComponent } from "./modal-content/modal-content.component";
import { ModalFooterComponent } from "./modal-footer/modal-footer.component";
import { ModalService } from "./modal.service";
import { ModalRef } from "./modal-ref";
import { MODAL_DATA } from "./modal.types";
import { ButtonComponent } from "../../buttons/button/button.component";
import { LabelComponent } from "../../form/label/label.component";
import { SelectComponent, SelectOptionComponent } from "@tedi-design-system/angular/community";
import { IconComponent } from "../../base/icon/icon.component";
import { ScrollFadeComponent } from "../../helpers/scroll-fade/scroll-fade.component";

const defaultOptions = [
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
  { value: "3", label: "Option 3" },
  { value: "4", label: "Option 4" },
  { value: "5", label: "Option 5" },
];

interface StoryModalData {
  title: string;
  description?: string;
  showClose?: boolean;
  options: { value: string; label: string }[];
}

const sharedModalImports = [
  ModalComponent,
  ModalHeaderComponent,
  ModalContentComponent,
  ModalFooterComponent,
  ButtonComponent,
  LabelComponent,
  SelectComponent,
  SelectOptionComponent,
];

@Component({
  standalone: true,
  selector: "story-modal-content",
  imports: sharedModalImports,
  template: `
    <tedi-modal>
      <tedi-modal-header [showClose]="data.showClose ?? true">
        <h1>{{ data.title }}</h1>
        @if (data.description) {
          <p tedi-modal-description>{{ data.description }}</p>
        }
      </tedi-modal-header>
      <tedi-modal-content>
        <div>
          <label tedi-label for="select-1">Label</label>
          <tedi-select inputId="select-1" state="default">
            @for (option of data.options; track option.value) {
              <tedi-select-option [value]="option.value" [label]="option.label" />
            }
          </tedi-select>
        </div>
        <div>
          <label tedi-label for="select-2">Label</label>
          <tedi-select inputId="select-2" state="default">
            @for (option of data.options; track option.value) {
              <tedi-select-option [value]="option.value" [label]="option.label" />
            }
          </tedi-select>
        </div>
      </tedi-modal-content>
      <tedi-modal-footer>
        <button tedi-button variant="secondary" (click)="ref.close('cancel')">Cancel</button>
        <button tedi-button (click)="ref.close('confirm')">Continue</button>
      </tedi-modal-footer>
    </tedi-modal>
  `,
})
class StoryModalContentComponent {
  readonly data = inject(MODAL_DATA) as StoryModalData;
  readonly ref = inject(ModalRef);
}

@Component({
  standalone: true,
  selector: "story-scrollable-content",
  imports: sharedModalImports,
  template: `
    <tedi-modal>
      <tedi-modal-header>
        <h1>{{ data.title }}</h1>
      </tedi-modal-header>
      <tedi-modal-content>
        @for (i of fields; track i) {
          <div>
            <label tedi-label [for]="'select-' + i">Label</label>
            <tedi-select [inputId]="'select-' + i" state="default">
              @for (option of data.options; track option.value) {
                <tedi-select-option [value]="option.value" [label]="option.label" />
              }
            </tedi-select>
          </div>
        }
      </tedi-modal-content>
      <tedi-modal-footer>
        <button tedi-button variant="secondary" (click)="ref.close()">Cancel</button>
        <button tedi-button (click)="ref.close()">Save</button>
      </tedi-modal-footer>
    </tedi-modal>
  `,
})
class StoryScrollableContentComponent {
  readonly data = inject(MODAL_DATA) as StoryModalData;
  readonly ref = inject(ModalRef);
  readonly fields = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
}

@Component({
  standalone: true,
  selector: "story-scrollable-fade-content",
  imports: [...sharedModalImports, ScrollFadeComponent],
  template: `
    <tedi-modal>
      <tedi-modal-header>
        <h1>{{ data.title }}</h1>
      </tedi-modal-header>
      <tedi-modal-content>
        <tedi-scroll-fade fadePosition="both" fadeSize="10">
          @for (i of fields; track i) {
            <div style="padding: 8px 0;">
              <label tedi-label [for]="'select-' + i">Label</label>
              <tedi-select [inputId]="'select-' + i" state="default">
                @for (option of data.options; track option.value) {
                  <tedi-select-option [value]="option.value" [label]="option.label" />
                }
              </tedi-select>
            </div>
          }
        </tedi-scroll-fade>
      </tedi-modal-content>
      <tedi-modal-footer>
        <button tedi-button variant="secondary" (click)="ref.close()">Cancel</button>
        <button tedi-button (click)="ref.close()">Save</button>
      </tedi-modal-footer>
    </tedi-modal>
  `,
})
class StoryScrollableFadeContentComponent {
  readonly data = inject(MODAL_DATA) as StoryModalData;
  readonly ref = inject(ModalRef);
  readonly fields = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
}

@Component({
  standalone: true,
  selector: "story-footer-left-right",
  imports: sharedModalImports,
  template: `
    <tedi-modal>
      <tedi-modal-header>
        <h1>{{ data.title }}</h1>
      </tedi-modal-header>
      <tedi-modal-content>
        <div>
          <label tedi-label for="select-1">Label</label>
          <tedi-select inputId="select-1" state="default">
            @for (option of data.options; track option.value) {
              <tedi-select-option [value]="option.value" [label]="option.label" />
            }
          </tedi-select>
        </div>
      </tedi-modal-content>
      <tedi-modal-footer style="justify-content: space-between;">
        <button tedi-button variant="secondary" (click)="ref.close()">Cancel</button>
        <button tedi-button (click)="ref.close()">Continue</button>
      </tedi-modal-footer>
    </tedi-modal>
  `,
})
class StoryFooterLeftRightComponent {
  readonly data = inject(MODAL_DATA) as StoryModalData;
  readonly ref = inject(ModalRef);
}

@Component({
  standalone: true,
  selector: "story-footer-three-buttons",
  imports: [...sharedModalImports, IconComponent],
  template: `
    <tedi-modal>
      <tedi-modal-header>
        <h1>{{ data.title }}</h1>
      </tedi-modal-header>
      <tedi-modal-content>
        <div>
          <label tedi-label for="select-1">Label</label>
          <tedi-select inputId="select-1" state="default">
            @for (option of data.options; track option.value) {
              <tedi-select-option [value]="option.value" [label]="option.label" />
            }
          </tedi-select>
        </div>
      </tedi-modal-content>
      <tedi-modal-footer style="justify-content: space-between;">
        <button tedi-button variant="neutral" (click)="ref.close()">
          <tedi-icon name="arrow_back" />
          Back
        </button>
        <div class="flex gap-3">
          <button tedi-button variant="secondary" (click)="ref.close()">Cancel</button>
          <button tedi-button (click)="ref.close()">Continue</button>
        </div>
      </tedi-modal-footer>
    </tedi-modal>
  `,
})
class StoryFooterThreeButtonsComponent {
  readonly data = inject(MODAL_DATA) as StoryModalData;
  readonly ref = inject(ModalRef);
}

@Component({
  standalone: true,
  selector: "story-no-footer",
  imports: sharedModalImports,
  template: `
    <tedi-modal>
      <tedi-modal-header>
        <h1>{{ data.title }}</h1>
      </tedi-modal-header>
      <tedi-modal-content>
        <div>
          <label tedi-label for="select-1">Label</label>
          <tedi-select inputId="select-1" state="default">
            @for (option of data.options; track option.value) {
              <tedi-select-option [value]="option.value" [label]="option.label" />
            }
          </tedi-select>
        </div>
      </tedi-modal-content>
    </tedi-modal>
  `,
})
class StoryNoFooterComponent {
  readonly data = inject(MODAL_DATA) as StoryModalData;
  readonly ref = inject(ModalRef);
}

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.23.38?node-id=4626-89579&m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/31221b-modal" target="_blank">Zeroheight ↗</a>
 *
 * ---
 *
 * ## Service-based modal (ModalService)
 *
 * Open modals programmatically via `ModalService.open()`. This uses Angular CDK Dialog
 * under the hood and handles focus trapping, scroll blocking, backdrop, and keyboard
 * events automatically.
 *
 * ```ts
 * private modalService = inject(ModalService);
 *
 * openModal() {
 *   const ref = this.modalService.open(MyContentComponent, {
 *     data: { title: 'Hello' },
 *     width: 'md',
 *     position: 'center',
 *   });
 *
 *   ref.closed.subscribe(result => console.log(result));
 * }
 * ```
 *
 * The content component wraps everything in `<tedi-modal>` and injects `MODAL_DATA` / `ModalRef`:
 *
 * ```ts
 * @Component({
 *   imports: [ModalComponent, ModalHeaderComponent, ModalContentComponent, ModalFooterComponent, ButtonComponent],
 *   template: `
 *     <tedi-modal>
 *       <tedi-modal-header>
 *         <h1>{{ data.title }}</h1>
 *       </tedi-modal-header>
 *       <tedi-modal-content>
 *         <!-- Content -->
 *       </tedi-modal-content>
 *       <tedi-modal-footer>
 *         <button tedi-button (click)="ref.close()">Close</button>
 *       </tedi-modal-footer>
 *     </tedi-modal>
 *   `,
 * })
 * class MyContentComponent {
 *   data = inject(MODAL_DATA);
 *   ref = inject(ModalRef);
 * }
 * ```
 *
 * ## Template-based modal (deprecated)
 *
 * The `<tedi-modal>` component with `[(open)]` binding is deprecated.
 * Migrate to `ModalService.open()` for new code.
 *
 * ```html
 * <button tedi-button (click)="open = true">Open modal</button>
 * <tedi-modal [(open)]="open" size="default" width="sm" position="center">
 *   <tedi-modal-header>
 *     <h1>Title</h1>
 *   </tedi-modal-header>
 *   <tedi-modal-content>
 *     <!-- Content -->
 *   </tedi-modal-content>
 *   <tedi-modal-footer>
 *     <button tedi-button variant="secondary" (click)="open = false">Cancel</button>
 *     <button tedi-button (click)="open = false">Continue</button>
 *   </tedi-modal-footer>
 * </tedi-modal>
 * ```
 */

export default {
  title: "TEDI-Ready/Components/Overlay/Modal",
  component: ModalComponent,
  decorators: [
    moduleMetadata({
      imports: [
        ...sharedModalImports,
        IconComponent,
      ],
    }),
  ],
  parameters: {},
} as Meta<ModalComponent>;

export const Default: StoryObj = {
  parameters: {
    docs: {
      source: {
        code: `
// --- Opening the modal ---
private modalService = inject(ModalService);

// Center (default)
this.modalService.open(MyModalContent, {
  data: { title: 'Center modal' },
  width: 'md',
});

// Top-aligned
this.modalService.open(MyModalContent, {
  data: { title: 'Top-aligned modal' },
  width: 'md',
  position: 'top',
});

// Side (right or left)
this.modalService.open(MyModalContent, {
  data: { title: 'Side modal' },
  width: 'sm',
  position: 'right', // or 'left'
});

// No backdrop close
this.modalService.open(MyModalContent, {
  data: { title: 'No backdrop close' },
  width: 'md',
  closeOnBackdropClick: false,
});

// No close button — set showClose on <tedi-modal-header>
// <tedi-modal-header [showClose]="false">

// Mobile fullscreen
this.modalService.open(MyModalContent, {
  data: { title: 'Mobile fullscreen' },
  width: 'md',
  mobileFullscreen: true,
});

// --- Modal content component ---
@Component({
  imports: [ModalComponent, ModalHeaderComponent, ModalContentComponent, ModalFooterComponent, ButtonComponent],
  template: \`
    <tedi-modal>
      <tedi-modal-header>
        <h1>{{ data.title }}</h1>
        <p tedi-modal-description>Optional description</p>
      </tedi-modal-header>
      <tedi-modal-content>
        <!-- Your content here -->
      </tedi-modal-content>
      <tedi-modal-footer>
        <button tedi-button variant="secondary" (click)="ref.close('cancel')">Cancel</button>
        <button tedi-button (click)="ref.close('confirm')">Continue</button>
      </tedi-modal-footer>
    </tedi-modal>
  \`,
})
class MyModalContent {
  data = inject(MODAL_DATA);
  ref = inject(ModalRef);
}`,
        language: "typescript",
        type: "code",
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent, StoryModalContentComponent],
    }),
  ],
  render: () => {
    @Component({
      standalone: true,
      selector: "story-service-demo",
      imports: [ButtonComponent],
      template: `
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <button tedi-button (click)="openCenter()">Open center modal</button>
          <button tedi-button (click)="openTop()">Open top-aligned modal</button>
          <button tedi-button (click)="openRight()">Open side modal (right)</button>
          <button tedi-button (click)="openLeft()">Open side modal (left)</button>
          <button tedi-button (click)="openNoBackdropClose()">No backdrop close</button>
          <button tedi-button (click)="openNoCloseButton()">No close button</button>
          <button tedi-button (click)="openWithDescription()">With description</button>
          <button tedi-button (click)="openMobileFullscreen()">Mobile fullscreen</button>
        </div>
      `,
    })
    class ServiceDemoComponent {
      private readonly modalService = inject(ModalService);
      lastResult: string | null = null;

      private readonly options = defaultOptions;

      openCenter() {
        const ref = this.modalService.open<string>(StoryModalContentComponent, {
          data: { title: "Center modal", options: this.options },
          width: "md",
        });
        ref.closed.subscribe((r) => this.lastResult = r ?? "dismissed");
      }

      openTop() {
        const ref = this.modalService.open<string>(StoryModalContentComponent, {
          data: { title: "Top-aligned modal", options: this.options },
          width: "md",
          position: "top",
        });
        ref.closed.subscribe((r) => this.lastResult = r ?? "dismissed");
      }

      openRight() {
        const ref = this.modalService.open<string>(StoryModalContentComponent, {
          data: { title: "Side modal (right)", options: this.options },
          width: "sm",
          position: "right",
        });
        ref.closed.subscribe((r) => this.lastResult = r ?? "dismissed");
      }

      openLeft() {
        const ref = this.modalService.open<string>(StoryModalContentComponent, {
          data: { title: "Side modal (left)", options: this.options },
          width: "sm",
          position: "left",
        });
        ref.closed.subscribe((r) => this.lastResult = r ?? "dismissed");
      }

      openNoBackdropClose() {
        const ref = this.modalService.open<string>(StoryModalContentComponent, {
          data: { title: "No backdrop close", options: this.options },
          width: "md",
          closeOnBackdropClick: false,
        });
        ref.closed.subscribe((r) => this.lastResult = r ?? "dismissed");
      }

      openNoCloseButton() {
        const ref = this.modalService.open<string>(StoryModalContentComponent, {
          data: { title: "No close button", showClose: false, options: this.options },
          width: "md",
        });
        ref.closed.subscribe((r) => this.lastResult = r ?? "dismissed");
      }

      openMobileFullscreen() {
        const ref = this.modalService.open<string>(StoryModalContentComponent, {
          data: { title: "Mobile fullscreen", options: this.options },
          width: "md",
          mobileFullscreen: true,
        });
        ref.closed.subscribe((r) => this.lastResult = r ?? "dismissed");
      }

      openWithDescription() {
        const ref = this.modalService.open<string>(StoryModalContentComponent, {
          data: {
            title: "With description",
            description: "This modal has additional description text in the header.",
            options: this.options,
          },
          width: "md",
        });
        ref.closed.subscribe((r) => this.lastResult = r ?? "dismissed");
      }
    }

    return {
      template: "<story-service-demo />",
      moduleMetadata: {
        imports: [ServiceDemoComponent],
      },
    };
  },
};

export const Size: StoryObj = {
  parameters: {
    docs: {
      source: {
        code: `
// Small size — compact padding, smaller heading and close button
this.modalService.open(MyModalContent, {
  data: { title: 'Small modal' },
  size: 'small',
  width: 'sm',
});

// Default size — standard padding and heading
this.modalService.open(MyModalContent, {
  data: { title: 'Default modal' },
  size: 'default', // default, can be omitted
  width: 'sm',
});`,
        language: "typescript",
        type: "code",
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent, StoryModalContentComponent],
    }),
  ],
  render: () => {
    @Component({
      standalone: true,
      selector: "story-size-demo",
      imports: [ButtonComponent],
      template: `
        <div style="display: flex; gap: 16px;">
          <button tedi-button (click)="openSmall()">Open small modal</button>
          <button tedi-button (click)="openDefault()">Open default modal</button>
        </div>
      `,
    })
    class SizeDemoComponent {
      private readonly modalService = inject(ModalService);
      private readonly options = defaultOptions;

      openSmall() {
        this.modalService.open(StoryModalContentComponent, {
          data: { title: "Small modal", options: this.options },
          size: "small",
          width: "sm",
        });
      }

      openDefault() {
        this.modalService.open(StoryModalContentComponent, {
          data: { title: "Default modal", options: this.options },
          size: "default",
          width: "sm",
        });
      }
    }

    return {
      template: "<story-size-demo />",
      moduleMetadata: {
        imports: [SizeDemoComponent],
      },
    };
  },
};

export const Width: StoryObj = {
  parameters: {
    docs: {
      source: {
        code: `
// Preset widths: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
this.modalService.open(MyModalContent, {
  data: { title: 'Width: md' },
  width: 'md',
});

// Custom width — any CSS value (percentage, px, rem, etc.)
this.modalService.open(MyModalContent, {
  data: { title: 'Width: 80%' },
  width: '80%',
});`,
        language: "typescript",
        type: "code",
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent, StoryModalContentComponent],
    }),
  ],
  render: () => {
    @Component({
      standalone: true,
      selector: "story-width-demo",
      imports: [ButtonComponent],
      template: `
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <button tedi-button (click)="openWidth('xs')">xs</button>
          <button tedi-button (click)="openWidth('sm')">sm</button>
          <button tedi-button (click)="openWidth('md')">md</button>
          <button tedi-button (click)="openWidth('lg')">lg</button>
          <button tedi-button (click)="openWidth('xl')">xl</button>
          <button tedi-button (click)="openWidth('80%')">80%</button>
          <button tedi-button (click)="openWidth('600px')">600px</button>
        </div>
      `,
    })
    class WidthDemoComponent {
      private readonly modalService = inject(ModalService);
      private readonly options = defaultOptions;

      openWidth(width: string) {
        this.modalService.open(StoryModalContentComponent, {
          data: { title: `Width: ${width}`, options: this.options },
          width,
        });
      }
    }

    return {
      template: "<story-width-demo />",
      moduleMetadata: {
        imports: [WidthDemoComponent],
      },
    };
  },
};

export const ScrollableContent: StoryObj = {
  parameters: {
    docs: {
      source: {
        code: `
// --- Content scrollbar (default) ---
this.modalService.open(MyModalContent, {
  data: { title: 'Scrollable modal' },
  width: 'sm',
});

// --- Content fade ---
// Wrap content in <tedi-scroll-fade> inside the content component.
//
// @Component({
//   imports: [..., ScrollFadeComponent],
//   template: \`
//     <tedi-modal>
//       <tedi-modal-content>
//         <tedi-scroll-fade fadePosition="both" fadeSize="10">
//           <!-- scrollable content here -->
//         </tedi-scroll-fade>
//       </tedi-modal-content>
//     </tedi-modal>
//   \`,
// })
this.modalService.open(MyFadeContent, {
  data: { title: 'Fade modal' },
  width: 'sm',
});

// --- Page scroll ---
// The whole page scrolls instead of modal content.
this.modalService.open(MyModalContent, {
  data: { title: 'Page scroll modal' },
  width: 'sm',
  scrollBehavior: 'page',
});`,
        language: "typescript",
        type: "code",
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent, StoryScrollableContentComponent, StoryScrollableFadeContentComponent],
    }),
  ],
  render: () => {
    @Component({
      standalone: true,
      selector: "story-scrollable-demo",
      imports: [ButtonComponent],
      template: `
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <button tedi-button (click)="openScrollbar()">Content scrollbar</button>
          <button tedi-button (click)="openFade()">Content fade</button>
          <button tedi-button (click)="openPageScroll()">Page scroll</button>
        </div>
      `,
    })
    class ScrollableDemoComponent {
      private readonly modalService = inject(ModalService);
      private readonly options = defaultOptions;

      openScrollbar() {
        this.modalService.open(StoryScrollableContentComponent, {
          data: { title: "Title", options: this.options },
          width: "sm",
        });
      }

      openFade() {
        this.modalService.open(StoryScrollableFadeContentComponent, {
          data: { title: "Title", options: this.options },
          width: "sm",
        });
      }

      openPageScroll() {
        this.modalService.open(StoryScrollableContentComponent, {
          data: { title: "Title", options: this.options },
          width: "sm",
          scrollBehavior: "page",
        });
      }
    }

    return {
      template: "<story-scrollable-demo />",
      moduleMetadata: {
        imports: [ScrollableDemoComponent],
      },
    };
  },
};

export const FooterVariants: StoryObj = {
  parameters: {
    docs: {
      source: {
        code: `
// Default footer — buttons aligned to the right
// <tedi-modal-footer>
//   <button tedi-button variant="secondary" (click)="ref.close()">Cancel</button>
//   <button tedi-button (click)="ref.close()">Continue</button>
// </tedi-modal-footer>

// Left-right footer — space-between alignment
// <tedi-modal-footer style="justify-content: space-between;">
//   <button tedi-button variant="secondary" (click)="ref.close()">Cancel</button>
//   <button tedi-button (click)="ref.close()">Continue</button>
// </tedi-modal-footer>

// Three buttons — back button on the left, cancel + continue on the right
// <tedi-modal-footer style="justify-content: space-between;">
//   <button tedi-button variant="neutral" (click)="ref.close()">
//     <tedi-icon name="arrow_back" />
//     Back
//   </button>
//   <div class="flex gap-3">
//     <button tedi-button variant="secondary" (click)="ref.close()">Cancel</button>
//     <button tedi-button (click)="ref.close()">Continue</button>
//   </div>
// </tedi-modal-footer>

// No footer — simply omit <tedi-modal-footer>

this.modalService.open(MyModalContent, {
  data: { title: 'Title' },
  size: 'small',
});`,
        language: "typescript",
        type: "code",
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [
        ButtonComponent,
        StoryModalContentComponent,
        StoryFooterLeftRightComponent,
        StoryFooterThreeButtonsComponent,
        StoryNoFooterComponent,
      ],
    }),
  ],
  render: () => {
    @Component({
      standalone: true,
      selector: "story-footer-demo",
      imports: [ButtonComponent],
      template: `
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <button tedi-button (click)="openDefault()">Open modal</button>
          <button tedi-button (click)="openLeftRight()">Left right buttons</button>
          <button tedi-button (click)="openThreeButtons()">Three buttons</button>
          <button tedi-button (click)="openNoFooter()">No footer</button>
        </div>
      `,
    })
    class FooterDemoComponent {
      private readonly modalService = inject(ModalService);
      private readonly options = defaultOptions;
      private readonly data: StoryModalData = { title: "Title", options: this.options };

      openDefault() {
        this.modalService.open(StoryModalContentComponent, {
          data: this.data,
          size: "small",
        });
      }

      openLeftRight() {
        this.modalService.open(StoryFooterLeftRightComponent, {
          data: this.data,
        });
      }

      openThreeButtons() {
        this.modalService.open(StoryFooterThreeButtonsComponent, {
          data: this.data,
        });
      }

      openNoFooter() {
        this.modalService.open(StoryNoFooterComponent, {
          data: this.data,
        });
      }
    }

    return {
      template: "<story-footer-demo />",
      moduleMetadata: {
        imports: [FooterDemoComponent],
      },
    };
  },
};

export const TemplateBased: StoryObj<ModalComponent> = {
  name: "Template-based (deprecated)",
  parameters: {
    docs: {
      source: {
        code: `
<!-- Template-based modal (deprecated — use ModalService instead) -->
<button tedi-button (click)="open = true">Open modal</button>
<tedi-modal [(open)]="open" size="default" width="sm" position="center">
  <tedi-modal-header>
    <h1>Title</h1>
  </tedi-modal-header>
  <tedi-modal-content>
    <!-- Content -->
  </tedi-modal-content>
  <tedi-modal-footer>
    <button tedi-button variant="secondary" (click)="open = false">Cancel</button>
    <button tedi-button (click)="open = false">Continue</button>
  </tedi-modal-footer>
</tedi-modal>`,
        language: "html",
        type: "code",
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      open: false,
      options: defaultOptions,
    },
    template: `
      <button tedi-button (click)="open = true">Open modal</button>
      <tedi-modal [(open)]="open">
        <tedi-modal-header>
          <h1>Title</h1>
        </tedi-modal-header>
        <tedi-modal-content>
          <div>
            <label tedi-label for="select-1">Label</label>
            <tedi-select inputId="select-1" state="default">
              @for (option of options; track option.value) {
                <tedi-select-option [value]="option.value" [label]="option.label" />
              }
            </tedi-select>
          </div>
          <div>
            <label tedi-label for="select-2">Label</label>
            <tedi-select inputId="select-2" state="default">
              @for (option of options; track option.value) {
                <tedi-select-option [value]="option.value" [label]="option.label" />
              }
            </tedi-select>
          </div>
        </tedi-modal-content>
        <tedi-modal-footer>
          <button tedi-button variant="secondary" (click)="open = false">Cancel</button>
          <button tedi-button (click)="open = false">Continue</button>
        </tedi-modal-footer>
      </tedi-modal>
    `,
  }),
};
