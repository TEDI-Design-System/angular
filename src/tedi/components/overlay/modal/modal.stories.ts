import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Component, inject, Input, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { map } from "rxjs";
import { ModalComponent } from "./modal.component";
import { ModalHeaderComponent } from "./modal-header/modal-header.component";
import { ModalContentComponent } from "./modal-content/modal-content.component";
import { ModalFooterComponent } from "./modal-footer/modal-footer.component";
import { ModalService } from "./modal.service";
import { ModalRef } from "./modal-ref";
import { MODAL_DATA, ModalConfig, ModalFullscreen } from "./modal.types";
import { ButtonComponent } from "../../buttons/button/button.component";
import { LabelComponent } from "../../form/label/label.component";
import { IconComponent } from "../../base/icon/icon.component";
import { ScrollFadeComponent } from "../../helpers/scroll-fade/scroll-fade.component";
import { TextFieldComponent } from "../../form/text-field/text-field.component";
import { FormFieldComponent } from "../../form/form-field/form-field.component";
import { DateFieldComponent } from "../../form/date-field/date-field.component";
import { ToastService } from "../../../services/toast/toast.service";
import { formatDate } from "../../../utils/date.util";

interface StoryModalData {
  title: string;
  description?: string;
  showClose?: boolean;
}

const sharedModalImports = [
  ModalComponent,
  ModalHeaderComponent,
  ModalContentComponent,
  ModalFooterComponent,
  ButtonComponent,
  LabelComponent,
  TextFieldComponent,
  FormFieldComponent,
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
        <tedi-form-field>
          <label tedi-label for="field-1">Label</label>
          <input tedi-text-field id="field-1" />
        </tedi-form-field>
        <tedi-form-field>
          <label tedi-label for="field-2">Label</label>
          <input tedi-text-field id="field-2" />
        </tedi-form-field>
      </tedi-modal-content>
      <tedi-modal-footer>
        <button tedi-button variant="secondary" (click)="ref.close('cancel')">
          Cancel
        </button>
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
  imports: [...sharedModalImports, DateFieldComponent],
  template: `
    <tedi-modal>
      <tedi-modal-header>
        <h1>{{ data.title }}</h1>
      </tedi-modal-header>
      <tedi-modal-content>
        <h3 style="margin: 0;">Teenus</h3>
        <tedi-form-field>
          <label tedi-label for="service">Teenus</label>
          <input tedi-text-field id="service" />
        </tedi-form-field>
        <tedi-form-field>
          <label tedi-label for="institution">Asutus</label>
          <input tedi-text-field id="institution" />
        </tedi-form-field>
        <tedi-form-field>
          <label tedi-label for="persons">Isikud</label>
          <input tedi-text-field id="persons" />
        </tedi-form-field>
        <tedi-form-field>
          <label tedi-label for="priority">Prioriteet</label>
          <input tedi-text-field id="priority" />
        </tedi-form-field>
        <tedi-form-field>
          <label tedi-label for="description">Probleemi kirjeldus</label>
          <input tedi-text-field id="description" />
        </tedi-form-field>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <tedi-form-field>
            <label tedi-label for="start-date">Alguskuupäev</label>
            <tedi-date-field inputId="start-date" />
          </tedi-form-field>
          <tedi-form-field>
            <label tedi-label for="end-date">Lõppkuupäev</label>
            <tedi-date-field inputId="end-date" />
          </tedi-form-field>
        </div>
        <hr
          style="border: none; border-top: 1px solid var(--modal-border-inner); margin: 0;"
        />
        <h3 style="margin: 0;">Kontaktisik</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <tedi-form-field>
            <label tedi-label for="contact-first-name">Eesnimi</label>
            <input tedi-text-field id="contact-first-name" />
          </tedi-form-field>
          <tedi-form-field>
            <label tedi-label for="contact-last-name">Perenimi</label>
            <input tedi-text-field id="contact-last-name" />
          </tedi-form-field>
        </div>
        <tedi-form-field>
          <label tedi-label for="contact-id">Isikukood</label>
          <input tedi-text-field id="contact-id" />
        </tedi-form-field>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <tedi-form-field>
            <label tedi-label for="contact-phone">Telefon</label>
            <input tedi-text-field id="contact-phone" type="tel" />
          </tedi-form-field>
          <tedi-form-field>
            <label tedi-label for="contact-email">E-post</label>
            <input tedi-text-field id="contact-email" type="email" />
          </tedi-form-field>
        </div>
        <tedi-form-field>
          <label tedi-label for="contact-address">Aadress</label>
          <input tedi-text-field id="contact-address" />
        </tedi-form-field>
        <hr
          style="border: none; border-top: 1px solid var(--modal-border-inner); margin: 0;"
        />
        <h3 style="margin: 0;">Esindaja</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <tedi-form-field>
            <label tedi-label for="rep-first-name">Eesnimi</label>
            <input tedi-text-field id="rep-first-name" />
          </tedi-form-field>
          <tedi-form-field>
            <label tedi-label for="rep-last-name">Perenimi</label>
            <input tedi-text-field id="rep-last-name" />
          </tedi-form-field>
        </div>
        <tedi-form-field>
          <label tedi-label for="rep-id">Isikukood</label>
          <input tedi-text-field id="rep-id" />
        </tedi-form-field>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <tedi-form-field>
            <label tedi-label for="rep-phone">Telefon</label>
            <input tedi-text-field id="rep-phone" type="tel" />
          </tedi-form-field>
          <tedi-form-field>
            <label tedi-label for="rep-email">E-post</label>
            <input tedi-text-field id="rep-email" type="email" />
          </tedi-form-field>
        </div>
        <tedi-form-field>
          <label tedi-label for="rep-address">Aadress</label>
          <input tedi-text-field id="rep-address" />
        </tedi-form-field>
        <tedi-form-field>
          <label tedi-label for="rep-relation">Seos isikuga</label>
          <input tedi-text-field id="rep-relation" />
        </tedi-form-field>
      </tedi-modal-content>
      <tedi-modal-footer>
        <button tedi-button variant="secondary" (click)="ref.close()">
          Katkesta
        </button>
        <button tedi-button (click)="ref.close()">Lisa</button>
      </tedi-modal-footer>
    </tedi-modal>
  `,
})
class StoryScrollableContentComponent {
  readonly data = inject(MODAL_DATA) as StoryModalData;
  readonly ref = inject(ModalRef);
}

@Component({
  standalone: true,
  selector: "story-scrollable-fade-content",
  imports: [...sharedModalImports, ScrollFadeComponent, DateFieldComponent],
  template: `
    <tedi-modal>
      <tedi-modal-header>
        <h1>{{ data.title }}</h1>
      </tedi-modal-header>
      <tedi-modal-content>
        <tedi-scroll-fade fadePosition="both" fadeSize="10">
          <div
            style="display: flex; flex-direction: column; gap: 16px; padding: 8px 0;"
          >
            <h3 style="margin: 0;">Teenus</h3>
            <tedi-form-field>
              <label tedi-label for="fade-service">Teenus</label>
              <input tedi-text-field id="fade-service" />
            </tedi-form-field>
            <tedi-form-field>
              <label tedi-label for="fade-institution">Asutus</label>
              <input tedi-text-field id="fade-institution" />
            </tedi-form-field>
            <tedi-form-field>
              <label tedi-label for="fade-persons">Isikud</label>
              <input tedi-text-field id="fade-persons" />
            </tedi-form-field>
            <tedi-form-field>
              <label tedi-label for="fade-priority">Prioriteet</label>
              <input tedi-text-field id="fade-priority" />
            </tedi-form-field>
            <tedi-form-field>
              <label tedi-label for="fade-description"
                >Probleemi kirjeldus</label
              >
              <input tedi-text-field id="fade-description" />
            </tedi-form-field>
            <div
              style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;"
            >
              <tedi-form-field>
                <label tedi-label for="fade-start-date">Alguskuupäev</label>
                <tedi-date-field inputId="fade-start-date" />
              </tedi-form-field>
              <tedi-form-field>
                <label tedi-label for="fade-end-date">Lõppkuupäev</label>
                <tedi-date-field inputId="fade-end-date" />
              </tedi-form-field>
            </div>
            <hr
              style="border: none; border-top: 1px solid var(--modal-border-inner); margin: 0;"
            />
            <h3 style="margin: 0;">Kontaktisik</h3>
            <div
              style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;"
            >
              <tedi-form-field>
                <label tedi-label for="fade-contact-first-name">Eesnimi</label>
                <input tedi-text-field id="fade-contact-first-name" />
              </tedi-form-field>
              <tedi-form-field>
                <label tedi-label for="fade-contact-last-name">Perenimi</label>
                <input tedi-text-field id="fade-contact-last-name" />
              </tedi-form-field>
            </div>
            <tedi-form-field>
              <label tedi-label for="fade-contact-id">Isikukood</label>
              <input tedi-text-field id="fade-contact-id" />
            </tedi-form-field>
            <div
              style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;"
            >
              <tedi-form-field>
                <label tedi-label for="fade-contact-phone">Telefon</label>
                <input tedi-text-field id="fade-contact-phone" type="tel" />
              </tedi-form-field>
              <tedi-form-field>
                <label tedi-label for="fade-contact-email">E-post</label>
                <input tedi-text-field id="fade-contact-email" type="email" />
              </tedi-form-field>
            </div>
            <tedi-form-field>
              <label tedi-label for="fade-contact-address">Aadress</label>
              <input tedi-text-field id="fade-contact-address" />
            </tedi-form-field>
            <hr
              style="border: none; border-top: 1px solid var(--modal-border-inner); margin: 0;"
            />
            <h3 style="margin: 0;">Esindaja</h3>
            <div
              style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;"
            >
              <tedi-form-field>
                <label tedi-label for="fade-rep-first-name">Eesnimi</label>
                <input tedi-text-field id="fade-rep-first-name" />
              </tedi-form-field>
              <tedi-form-field>
                <label tedi-label for="fade-rep-last-name">Perenimi</label>
                <input tedi-text-field id="fade-rep-last-name" />
              </tedi-form-field>
            </div>
            <tedi-form-field>
              <label tedi-label for="fade-rep-id">Isikukood</label>
              <input tedi-text-field id="fade-rep-id" />
            </tedi-form-field>
            <div
              style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;"
            >
              <tedi-form-field>
                <label tedi-label for="fade-rep-phone">Telefon</label>
                <input tedi-text-field id="fade-rep-phone" type="tel" />
              </tedi-form-field>
              <tedi-form-field>
                <label tedi-label for="fade-rep-email">E-post</label>
                <input tedi-text-field id="fade-rep-email" type="email" />
              </tedi-form-field>
            </div>
            <tedi-form-field>
              <label tedi-label for="fade-rep-address">Aadress</label>
              <input tedi-text-field id="fade-rep-address" />
            </tedi-form-field>
            <tedi-form-field>
              <label tedi-label for="fade-rep-relation">Seos isikuga</label>
              <input tedi-text-field id="fade-rep-relation" />
            </tedi-form-field>
          </div>
        </tedi-scroll-fade>
      </tedi-modal-content>
      <tedi-modal-footer>
        <button tedi-button variant="secondary" (click)="ref.close()">
          Katkesta
        </button>
        <button tedi-button (click)="ref.close()">Lisa</button>
      </tedi-modal-footer>
    </tedi-modal>
  `,
})
class StoryScrollableFadeContentComponent {
  readonly data = inject(MODAL_DATA) as StoryModalData;
  readonly ref = inject(ModalRef);
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
        <tedi-form-field>
          <label tedi-label for="field-1">Label</label>
          <input tedi-text-field id="field-1" />
        </tedi-form-field>
      </tedi-modal-content>
      <tedi-modal-footer style="justify-content: space-between;">
        <button tedi-button variant="secondary" (click)="ref.close()">
          Cancel
        </button>
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
        <tedi-form-field>
          <label tedi-label for="field-1">Label</label>
          <input tedi-text-field id="field-1" />
        </tedi-form-field>
      </tedi-modal-content>
      <tedi-modal-footer style="justify-content: space-between;">
        <button tedi-button variant="neutral" (click)="ref.close()">
          <tedi-icon name="arrow_back" />
          Back
        </button>
        <div class="flex gap-3">
          <button tedi-button variant="secondary" (click)="ref.close()">
            Cancel
          </button>
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
        <tedi-form-field>
          <label tedi-label for="field-1">Label</label>
          <input tedi-text-field id="field-1" />
        </tedi-form-field>
      </tedi-modal-content>
    </tedi-modal>
  `,
})
class StoryNoFooterComponent {
  readonly data = inject(MODAL_DATA) as StoryModalData;
  readonly ref = inject(ModalRef);
}

@Component({
  standalone: true,
  selector: "story-modal-with-toast",
  imports: [
    ModalComponent,
    ModalHeaderComponent,
    ModalContentComponent,
    ModalFooterComponent,
    ButtonComponent,
    LabelComponent,
    FormFieldComponent,
    DateFieldComponent,
  ],
  template: `
    <tedi-modal>
      <tedi-modal-header>
        <h1>{{ data.title }}</h1>
      </tedi-modal-header>
      <tedi-modal-content>
        <tedi-form-field>
          <label tedi-label for="toast-date">Date</label>
          <tedi-date-field inputId="toast-date" [(value)]="selectedDate" />
        </tedi-form-field>
      </tedi-modal-content>
      <tedi-modal-footer>
        <button tedi-button variant="secondary" (click)="ref.close()">
          Cancel
        </button>
        <button tedi-button (click)="confirm()">Confirm</button>
      </tedi-modal-footer>
    </tedi-modal>
  `,
})
class StoryModalWithToastComponent {
  readonly data = inject(MODAL_DATA) as StoryModalData;
  readonly ref = inject(ModalRef);
  private readonly toastService = inject(ToastService);

  readonly selectedDate = signal<Date | null>(null);

  confirm() {
    const date = this.selectedDate();
    const formatted = date ? formatDate(date) : "no date selected";
    this.toastService.success("Saved", `Selected date: ${formatted}`);
    this.ref.close();
  }
}

@Component({
  standalone: true,
  selector: "story-discard-changes",
  imports: [
    ModalComponent,
    ModalHeaderComponent,
    ModalFooterComponent,
    ButtonComponent,
  ],
  template: `
    <tedi-modal>
      <tedi-modal-header [showClose]="false">
        <h2>Discard changes?</h2>
        <p tedi-modal-description>Your edits will be lost.</p>
      </tedi-modal-header>
      <tedi-modal-footer>
        <button tedi-button variant="secondary" (click)="ref.close(false)">
          Keep editing
        </button>
        <button tedi-button variant="danger" (click)="ref.close(true)">
          Discard
        </button>
      </tedi-modal-footer>
    </tedi-modal>
  `,
})
class StoryDiscardChangesComponent {
  readonly ref = inject<ModalRef<boolean>>(ModalRef);
}

@Component({
  standalone: true,
  selector: "story-guarded-form",
  imports: [...sharedModalImports, ReactiveFormsModule],
  template: `
    <tedi-modal>
      <tedi-modal-header>
        <h1>Edit contact</h1>
        <p tedi-modal-description>Edit a field, then close the modal.</p>
      </tedi-modal-header>
      <tedi-modal-content>
        <form [formGroup]="form" id="guarded-form" (ngSubmit)="save()">
          <tedi-form-field>
            <label tedi-label for="guarded-name">Name</label>
            <input tedi-text-field id="guarded-name" formControlName="name" />
          </tedi-form-field>
          <tedi-form-field>
            <label tedi-label for="guarded-email">E-mail</label>
            <input
              tedi-text-field
              id="guarded-email"
              type="email"
              formControlName="email"
            />
          </tedi-form-field>
        </form>
      </tedi-modal-content>
      <tedi-modal-footer>
        <button tedi-button variant="secondary" (click)="ref.close()">
          Cancel
        </button>
        <button tedi-button type="submit" form="guarded-form">Save</button>
      </tedi-modal-footer>
    </tedi-modal>
  `,
})
class StoryGuardedFormComponent {
  readonly ref = inject(ModalRef);
  private readonly modalService = inject(ModalService);

  readonly form = new FormGroup({
    name: new FormControl("Mari Maasikas"),
    email: new FormControl("mari@example.com"),
  });

  constructor() {
    this.ref.canClose = () =>
      this.form.pristine ||
      this.modalService
        .open<boolean>(StoryDiscardChangesComponent, { size: "small" })
        .closed.pipe(map(Boolean));
  }

  save() {
    this.form.markAsPristine();
    this.ref.close(this.form.getRawValue());
  }
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
      imports: [...sharedModalImports, IconComponent],
    }),
  ],

  argTypes: {
    size: {
      table: {
        type: { summary: "'default' | 'small'" },
        defaultValue: { summary: "'default'" },
        category: "ModalConfig",
      },
      description:
        "Modal size variant. Controls padding and heading size. Close button defaults to match this variant unless `closeButtonSize` is set explicitly on `<tedi-modal-header>`.",
    },
    width: {
      table: {
        type: { summary: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | string" },
        defaultValue: { summary: "'sm'" },
        category: "ModalConfig",
      },
      description:
        "Modal width — preset token or custom CSS value (e.g. `'800px'`, `'60%'`).",
    },
    maxWidth: {
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "'95vw'" },
        category: "ModalConfig",
      },
      description:
        "Max-width cap (e.g. `'75%'`, `'60vw'`). Overrides the default 95vw limit.",
    },
    position: {
      table: {
        type: { summary: "'center' | 'top' | 'bottom' | 'left' | 'right'" },
        defaultValue: { summary: "'center'" },
        category: "ModalConfig",
      },
      description:
        "Position of the modal on screen. `'left'` / `'right'` create side/drawer modals. `'top'` and `'bottom'` anchor the modal to the corresponding edge with a fixed margin — useful for mobile bottom-sheet patterns.",
    },
    scrollBehavior: {
      table: {
        type: { summary: "'content' | 'page'" },
        defaultValue: { summary: "'content'" },
        category: "ModalConfig",
      },
      description:
        "Scroll behavior when content overflows. `'content'` scrolls inside the modal, `'page'` scrolls the full overlay.",
    },
    fullscreen: {
      table: {
        type: { summary: "boolean | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'" },
        defaultValue: { summary: "false" },
        category: "ModalConfig",
      },
      description:
        "Fullscreen mode. `true` = always fullscreen. A breakpoint string (e.g. `'md'`) makes the modal fullscreen below that breakpoint.",
    },
    closeOnBackdropClick: {
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
        category: "ModalConfig",
      },
      description: "Whether clicking the backdrop closes the modal.",
    },
    closeOnEscape: {
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
        category: "ModalConfig",
      },
      description: "Whether pressing Escape closes the modal.",
    },
    showClose: {
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
        category: "ModalConfig",
      },
      description:
        "Whether to show a close button in the header. Set via `[showClose]` on `<tedi-modal-header>`.",
    },
    closeButtonSize: {
      table: {
        type: { summary: "ClosingButtonSize" },
        category: "ModalConfig",
      },
      description:
        "Size of the close button. When unset, tracks the modal `size` variant (default → standard, small → compact). Set via `[closeButtonSize]` on `<tedi-modal-header>` to override.",
    },
    data: {
      table: { type: { summary: "unknown" }, category: "ModalConfig" },
      description:
        "Data passed to the modal content component. Accessible via `inject(MODAL_DATA)`.",
    },
    ariaLabel: {
      table: { type: { summary: "string" }, category: "ModalConfig" },
      description: "ARIA label for the dialog element.",
    },
    ariaLabelledBy: {
      table: { type: { summary: "string" }, category: "ModalConfig" },
      description: "ID of the element that labels the dialog.",
    },
  },
} as Meta<ModalComponent>;

export const Default: StoryObj = {
  args: {
    size: "default",
    width: "md",
    maxWidth: "",
    position: "center",
    scrollBehavior: "content",
    fullscreen: false,
    closeOnBackdropClick: true,
    closeOnEscape: true,
    showClose: true,
  },
  argTypes: {
    size: { control: "select", options: ["default", "small"] },
    width: { control: "text" },
    maxWidth: { control: "text" },
    position: {
      control: "select",
      options: ["center", "top", "bottom", "left", "right"],
    },
    scrollBehavior: { control: "select", options: ["content", "page"] },
    fullscreen: {
      control: "text",
      description:
        "Set `true` for always fullscreen or a breakpoint string (`sm`, `md`, `lg`, `xl`, `xxl`).",
    },
    closeOnBackdropClick: { control: "boolean" },
    closeOnEscape: { control: "boolean" },
    showClose: { control: "boolean" },
  },
  parameters: {
    docs: {
      source: {
        code: `
private modalService = inject(ModalService);

this.modalService.open(MyModalContent, {
  data: { title: 'Modal title' },
  size: 'default',
  width: 'md',
  position: 'center',
  scrollBehavior: 'content',
  fullscreen: false,
  closeOnBackdropClick: true,
  closeOnEscape: true,
});

// --- Modal content component ---
@Component({
  imports: [ModalComponent, ModalHeaderComponent, ModalContentComponent, ModalFooterComponent, ButtonComponent],
  template: \`
    <tedi-modal>
      <tedi-modal-header [showClose]="data.showClose">
        <h1>{{ data.title }}</h1>
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
  render: (args) => {
    @Component({
      standalone: true,
      selector: "story-default-demo",
      imports: [ButtonComponent],
      template: `
        <button tedi-button variant="secondary" (click)="open()">
          Open modal
        </button>
      `,
    })
    class DefaultDemoComponent {
      private readonly modalService = inject(ModalService);

      @Input() size!: string;
      @Input() width!: string;
      @Input() maxWidth!: string;
      @Input() position!: string;
      @Input() scrollBehavior!: string;
      @Input() fullscreen!: boolean | string;
      @Input() closeOnBackdropClick!: boolean;
      @Input() closeOnEscape!: boolean;
      @Input() showClose!: boolean;

      private parseFullscreen(): boolean | string {
        if (this.fullscreen === "true" || this.fullscreen === true) return true;
        if (this.fullscreen === "false" || this.fullscreen === false)
          return false;
        return this.fullscreen;
      }

      open() {
        this.modalService.open(StoryModalContentComponent, {
          data: { title: "Modal title", showClose: this.showClose },
          size: this.size as "default" | "small",
          width: this.width,
          maxWidth: this.maxWidth || undefined,
          position: this.position as "center" | "top" | "left" | "right",
          scrollBehavior: this.scrollBehavior as "content" | "page",
          fullscreen: this.parseFullscreen() as ModalFullscreen,
          closeOnBackdropClick: this.closeOnBackdropClick,
          closeOnEscape: this.closeOnEscape,
        });
      }
    }

    return {
      template: `<story-default-demo
        [size]="size"
        [width]="width"
        [maxWidth]="maxWidth"
        [position]="position"
        [scrollBehavior]="scrollBehavior"
        [fullscreen]="fullscreen"
        [closeOnBackdropClick]="closeOnBackdropClick"
        [closeOnEscape]="closeOnEscape"
        [showClose]="showClose"
      />`,
      moduleMetadata: {
        imports: [DefaultDemoComponent],
      },
      props: args,
    };
  },
};

export const Position: StoryObj = {
  parameters: {
    chromatic: { disableSnapshot: true },
    docs: {
      source: {
        code: `
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
      selector: "story-position-demo",
      imports: [ButtonComponent],
      template: `
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <button tedi-button variant="secondary" (click)="openCenter()">
            Center
          </button>
          <button tedi-button variant="secondary" (click)="openTop()">
            Top-aligned
          </button>
          <button tedi-button variant="secondary" (click)="openRight()">
            Side (right)
          </button>
          <button tedi-button variant="secondary" (click)="openLeft()">
            Side (left)
          </button>
        </div>
      `,
    })
    class PositionDemoComponent {
      private readonly modalService = inject(ModalService);

      openCenter() {
        this.modalService.open(StoryModalContentComponent, {
          data: { title: "Center modal" },
          width: "md",
        });
      }

      openTop() {
        this.modalService.open(StoryModalContentComponent, {
          data: { title: "Top-aligned modal" },
          width: "md",
          position: "top",
        });
      }

      openRight() {
        this.modalService.open(StoryModalContentComponent, {
          data: { title: "Side modal (right)" },
          width: "sm",
          position: "right",
        });
      }

      openLeft() {
        this.modalService.open(StoryModalContentComponent, {
          data: { title: "Side modal (left)" },
          width: "sm",
          position: "left",
        });
      }
    }

    return {
      template: "<story-position-demo />",
      moduleMetadata: {
        imports: [PositionDemoComponent],
      },
    };
  },
};

export const Size: StoryObj = {
  parameters: {
    chromatic: { disableSnapshot: true },
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
          <button tedi-button variant="secondary" (click)="openSmall()">
            Open small modal
          </button>
          <button tedi-button variant="secondary" (click)="openDefault()">
            Open default modal
          </button>
        </div>
      `,
    })
    class SizeDemoComponent {
      private readonly modalService = inject(ModalService);

      openSmall() {
        this.modalService.open(StoryModalContentComponent, {
          data: { title: "Small modal" },
          size: "small",
          width: "sm",
        });
      }

      openDefault() {
        this.modalService.open(StoryModalContentComponent, {
          data: { title: "Default modal" },
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
    chromatic: { disableSnapshot: true },
    docs: {
      source: {
        code: `
// Preset widths: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
this.modalService.open(MyModalContent, {
  data: { title: 'Width: md' },
  width: 'md',
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
          <button tedi-button variant="secondary" (click)="openWidth('xs')">
            xs
          </button>
          <button tedi-button variant="secondary" (click)="openWidth('sm')">
            sm
          </button>
          <button tedi-button variant="secondary" (click)="openWidth('md')">
            md
          </button>
          <button tedi-button variant="secondary" (click)="openWidth('lg')">
            lg
          </button>
          <button tedi-button variant="secondary" (click)="openWidth('xl')">
            xl
          </button>
        </div>
      `,
    })
    class WidthDemoComponent {
      private readonly modalService = inject(ModalService);

      openWidth(width: string) {
        this.modalService.open(StoryModalContentComponent, {
          data: { title: `Width: ${width}` },
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

export const CustomWidth: StoryObj = {
  name: "Custom width",
  parameters: {
    chromatic: { disableSnapshot: true },
    docs: {
      source: {
        code: `
// Custom width with maxWidth cap — responsive via CSS
this.modalService.open(MyModalContent, {
  data: { title: 'Custom width modal' },
  position: 'left',
  width: '800px',
  maxWidth: '75%',
});`,
        language: "typescript",
        type: "code",
      },
    },
  },
  args: {
    width: "800px",
    maxWidth: "75%",
    position: "left",
  },
  argTypes: {
    width: {
      control: "text",
      description: "Custom CSS width value (e.g. '800px', '50vw', '60%').",
    },
    maxWidth: {
      control: "text",
      description:
        "Max-width cap (e.g. '75%', '60vw'). Overrides the default 95vw limit.",
    },
    position: {
      control: "select",
      options: ["center", "top", "left", "right"],
      description: "Position of the modal.",
    },
  },
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent, StoryModalContentComponent],
    }),
  ],
  render: (args) => {
    @Component({
      standalone: true,
      selector: "story-custom-width-demo",
      imports: [ButtonComponent],
      template: `
        <button tedi-button variant="secondary" (click)="open()">
          Open modal
        </button>
      `,
    })
    class CustomWidthDemoComponent {
      private readonly modalService = inject(ModalService);

      @Input() width!: string;
      @Input() maxWidth!: string;
      @Input() position!: "center" | "top" | "left" | "right";

      open() {
        this.modalService.open(StoryModalContentComponent, {
          data: { title: `Width: ${this.width}, max: ${this.maxWidth}` },
          position: this.position,
          width: this.width,
          maxWidth: this.maxWidth || undefined,
        });
      }
    }

    return {
      template:
        '<story-custom-width-demo [width]="width" [maxWidth]="maxWidth" [position]="position" />',
      moduleMetadata: {
        imports: [CustomWidthDemoComponent],
      },
      props: args,
    };
  },
};

export const Fullscreen: StoryObj = {
  parameters: {
    chromatic: { disableSnapshot: true },
    docs: {
      source: {
        code: `
// Always fullscreen
this.modalService.open(MyModalContent, {
  data: { title: 'Fullscreen modal' },
  width: 'md',
  fullscreen: true,
});

// Fullscreen below 'md' breakpoint
this.modalService.open(MyModalContent, {
  data: { title: 'Fullscreen below md' },
  width: 'md',
  fullscreen: 'md',
});

// Fullscreen below 'sm' breakpoint (mobile only)
this.modalService.open(MyModalContent, {
  data: { title: 'Fullscreen on mobile' },
  width: 'md',
  fullscreen: 'sm',
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
      selector: "story-fullscreen-demo",
      imports: [ButtonComponent],
      template: `
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <button tedi-button variant="secondary" (click)="openAlways()">
            Always fullscreen
          </button>
          <button tedi-button variant="secondary" (click)="openMd()">
            Fullscreen below md
          </button>
          <button tedi-button variant="secondary" (click)="openSm()">
            Fullscreen on mobile
          </button>
        </div>
      `,
    })
    class FullscreenDemoComponent {
      private readonly modalService = inject(ModalService);

      openAlways() {
        this.modalService.open(StoryModalContentComponent, {
          data: { title: "Fullscreen modal" },
          width: "md",
          fullscreen: true,
        });
      }

      openMd() {
        this.modalService.open(StoryModalContentComponent, {
          data: { title: "Fullscreen below md" },
          width: "md",
          fullscreen: "md",
        });
      }

      openSm() {
        this.modalService.open(StoryModalContentComponent, {
          data: { title: "Fullscreen on mobile" },
          width: "md",
          fullscreen: "sm",
        });
      }
    }

    return {
      template: "<story-fullscreen-demo />",
      moduleMetadata: {
        imports: [FullscreenDemoComponent],
      },
    };
  },
};

export const ScrollableContent: StoryObj = {
  parameters: {
    chromatic: { disableSnapshot: true },
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
      imports: [
        ButtonComponent,
        StoryScrollableContentComponent,
        StoryScrollableFadeContentComponent,
      ],
    }),
  ],
  render: () => {
    @Component({
      standalone: true,
      selector: "story-scrollable-demo",
      imports: [ButtonComponent],
      template: `
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <button tedi-button variant="secondary" (click)="openScrollbar()">
            Content scrollbar
          </button>
          <button tedi-button variant="secondary" (click)="openFade()">
            Content fade
          </button>
          <button tedi-button variant="secondary" (click)="openPageScroll()">
            Page scroll
          </button>
        </div>
      `,
    })
    class ScrollableDemoComponent {
      private readonly modalService = inject(ModalService);

      openScrollbar() {
        this.modalService.open(StoryScrollableContentComponent, {
          data: { title: "Uus toiming" },
          width: "md",
        });
      }

      openFade() {
        this.modalService.open(StoryScrollableFadeContentComponent, {
          data: { title: "Uus toiming" },
          width: "md",
        });
      }

      openPageScroll() {
        this.modalService.open(StoryScrollableContentComponent, {
          data: { title: "Uus toiming" },
          width: "md",
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

export const WithDescription: StoryObj = {
  name: "With header description",
  parameters: {
    chromatic: { disableSnapshot: true },
    docs: {
      source: {
        code: `
// Add a <p tedi-modal-description> inside <tedi-modal-header>:
// <tedi-modal-header>
//   <h1>Title</h1>
//   <p tedi-modal-description>Description text</p>
// </tedi-modal-header>
this.modalService.open(MyModalContent, {
  data: { title: 'With description', description: 'Additional description in the header.' },
  width: 'md',
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
      selector: "story-description-demo",
      imports: [ButtonComponent],
      template: `
        <button tedi-button variant="secondary" (click)="open()">
          With description
        </button>
      `,
    })
    class DescriptionDemoComponent {
      private readonly modalService = inject(ModalService);

      open() {
        this.modalService.open(StoryModalContentComponent, {
          data: {
            title: "With description",
            description:
              "This modal has additional description text in the header.",
          },
          width: "md",
        });
      }
    }

    return {
      template: "<story-description-demo />",
      moduleMetadata: {
        imports: [DescriptionDemoComponent],
      },
    };
  },
};

export const NoBackdropClose: StoryObj = {
  name: "No backdrop close",
  parameters: {
    chromatic: { disableSnapshot: true },
    docs: {
      source: {
        code: `
this.modalService.open(MyModalContent, {
  data: { title: 'No backdrop close' },
  width: 'md',
  closeOnBackdropClick: false,
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
      selector: "story-no-backdrop-demo",
      imports: [ButtonComponent],
      template: `
        <button tedi-button variant="secondary" (click)="open()">
          No backdrop close
        </button>
      `,
    })
    class NoBackdropDemoComponent {
      private readonly modalService = inject(ModalService);

      open() {
        this.modalService.open(StoryModalContentComponent, {
          data: { title: "No backdrop close" },
          width: "md",
          closeOnBackdropClick: false,
        });
      }
    }

    return {
      template: "<story-no-backdrop-demo />",
      moduleMetadata: {
        imports: [NoBackdropDemoComponent],
      },
    };
  },
};

export const NoCloseButton: StoryObj = {
  name: "No close button",
  parameters: {
    chromatic: { disableSnapshot: true },
    docs: {
      source: {
        code: `
// Set showClose on the modal content component's <tedi-modal-header>:
// <tedi-modal-header [showClose]="false">
this.modalService.open(MyModalContent, {
  data: { title: 'No close button', showClose: false },
  width: 'md',
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
      selector: "story-no-close-demo",
      imports: [ButtonComponent],
      template: `
        <button tedi-button variant="secondary" (click)="open()">
          No close button
        </button>
      `,
    })
    class NoCloseDemoComponent {
      private readonly modalService = inject(ModalService);

      open() {
        this.modalService.open(StoryModalContentComponent, {
          data: { title: "No close button", showClose: false },
          width: "md",
        });
      }
    }

    return {
      template: "<story-no-close-demo />",
      moduleMetadata: {
        imports: [NoCloseDemoComponent],
      },
    };
  },
};

export const FooterVariants: StoryObj = {
  parameters: {
    chromatic: { disableSnapshot: true },
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
  data: { title: 'Title' }
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
          <button tedi-button variant="secondary" (click)="openDefault()">
            Open modal
          </button>
          <button tedi-button variant="secondary" (click)="openLeftRight()">
            Left right buttons
          </button>
          <button tedi-button variant="secondary" (click)="openThreeButtons()">
            Three buttons
          </button>
          <button tedi-button variant="secondary" (click)="openNoFooter()">
            No footer
          </button>
        </div>
      `,
    })
    class FooterDemoComponent {
      private readonly modalService = inject(ModalService);

      private readonly data: StoryModalData = { title: "Title" };

      openDefault() {
        this.modalService.open(StoryModalContentComponent, {
          data: this.data,
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

export const WithToast: StoryObj = {
  name: "With date picker and toast",
  parameters: {
    chromatic: { disableSnapshot: true },
    docs: {
      source: {
        code: `
@Component({
  imports: [ModalComponent, ModalHeaderComponent, ModalContentComponent, ModalFooterComponent, ButtonComponent, LabelComponent, FormFieldComponent, DateFieldComponent],
  template: \`
    <tedi-modal>
      <tedi-modal-header>
        <h1>{{ data.title }}</h1>
      </tedi-modal-header>
      <tedi-modal-content>
        <tedi-form-field>
          <label tedi-label for="toast-date">Date</label>
          <tedi-date-field inputId="toast-date" [(value)]="selectedDate" />
        </tedi-form-field>
      </tedi-modal-content>
      <tedi-modal-footer>
        <button tedi-button variant="secondary" (click)="ref.close()">Cancel</button>
        <button tedi-button (click)="confirm()">Confirm</button>
      </tedi-modal-footer>
    </tedi-modal>
  \`,
})
class MyModalContent {
  data = inject(MODAL_DATA);
  ref = inject(ModalRef);
  private toastService = inject(ToastService);

  selectedDate = signal<Date | null>(null);

  confirm() {
    const date = this.selectedDate();
    this.toastService.success("Saved", \`Selected date: \${date ? formatDate(date) : "no date selected"}\`);
  }
}

// Open from a host component:
this.modalService.open(MyModalContent, {
  data: { title: 'Pick a date' },
  width: 'sm',
});`,
        language: "typescript",
        type: "code",
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent, StoryModalWithToastComponent],
    }),
  ],
  render: () => {
    @Component({
      standalone: true,
      selector: "story-with-toast-demo",
      imports: [ButtonComponent],
      template: `
        <button tedi-button variant="secondary" (click)="open()">
          Open modal
        </button>
      `,
    })
    class WithToastDemoComponent {
      private readonly modalService = inject(ModalService);

      open() {
        this.modalService.open(StoryModalWithToastComponent, {
          data: { title: "Pick a date" },
          width: "sm",
        });
      }
    }

    return {
      template: "<story-with-toast-demo />",
      moduleMetadata: {
        imports: [WithToastDemoComponent],
      },
    };
  },
};

export const ConfirmBeforeClosing: StoryObj = {
  name: "Confirm before closing",
  parameters: {
    chromatic: { disableSnapshot: true },
    docs: {
      description: {
        story:
          "Set `ModalRef.canClose` to keep the modal open until the user confirms. It runs on every close except `ModalService.closeAll()` and browser navigation, which needs a `canDeactivate` route guard.",
      },
      source: {
        code: `
class EditContactComponent {
  ref = inject(ModalRef);
  private modalService = inject(ModalService);

  form = new FormGroup({
    name: new FormControl('Mari Maasikas'),
    email: new FormControl('mari@example.com'),
  });

  constructor() {
    this.ref.canClose = () =>
      this.form.pristine ||
      this.modalService
        .open<boolean>(DiscardChangesComponent, { size: 'small' })
        .closed.pipe(map(Boolean));
  }

  save() {
    this.form.markAsPristine();
    this.ref.close(this.form.getRawValue());
  }
}

class DiscardChangesComponent {
  ref = inject<ModalRef<boolean>>(ModalRef);
  // Keep editing → ref.close(false), Discard → ref.close(true)
}`,
        language: "typescript",
        type: "code",
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent, StoryGuardedFormComponent],
    }),
  ],
  render: () => {
    @Component({
      standalone: true,
      selector: "story-confirm-close-demo",
      imports: [ButtonComponent],
      template: `
        <button tedi-button variant="secondary" (click)="open()">
          Edit contact
        </button>
      `,
    })
    class ConfirmCloseDemoComponent {
      private readonly modalService = inject(ModalService);

      open() {
        this.modalService.open(StoryGuardedFormComponent, { width: "md" });
      }
    }

    return {
      template: "<story-confirm-close-demo />",
      moduleMetadata: {
        imports: [ConfirmCloseDemoComponent],
      },
    };
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole("button", {
        name: "Edit contact",
      }),
    );
    const dialog = within(
      await within(document.body).findByRole("dialog", {
        name: "Edit contact",
      }),
    );

    const confirmDialog = () =>
      within(document.body).findByRole("dialog", { name: "Discard changes?" });
    const openDialogs = () => document.querySelectorAll("cdk-dialog-container");

    await userEvent.type(dialog.getByLabelText("Name"), " Jr");
    await userEvent.keyboard("{Escape}");
    await userEvent.click(
      within(await confirmDialog()).getByRole("button", {
        name: "Keep editing",
      }),
    );

    await waitFor(() => expect(openDialogs()).toHaveLength(1));
    await expect(dialog.getByLabelText("Name")).toHaveValue("Mari Maasikas Jr");

    await userEvent.keyboard("{Escape}");
    await userEvent.click(
      within(await confirmDialog()).getByRole("button", { name: "Discard" }),
    );

    await waitFor(() => expect(openDialogs()).toHaveLength(0));
  },
};

export const TemplateBased: StoryObj<ModalComponent> = {
  name: "Template-based (deprecated)",
  parameters: {
    chromatic: { disableSnapshot: true },
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
    },
    template: `
      <button tedi-button variant="secondary" (click)="open = true">Open modal</button>
      <tedi-modal [(open)]="open">
        <tedi-modal-header>
          <h1>Title</h1>
        </tedi-modal-header>
        <tedi-modal-content>
          <tedi-form-field>
            <label tedi-label for="tpl-field-1">Label</label>
            <input tedi-text-field id="tpl-field-1" />
          </tedi-form-field>
          <tedi-form-field>
            <label tedi-label for="tpl-field-2">Label</label>
            <input tedi-text-field id="tpl-field-2" />
          </tedi-form-field>
        </tedi-modal-content>
        <tedi-modal-footer>
          <button tedi-button variant="secondary" (click)="open = false">Cancel</button>
          <button tedi-button (click)="open = false">Continue</button>
        </tedi-modal-footer>
      </tedi-modal>
    `,
  }),
};

/**
 * Visual-regression only. Opened through `ModalService`, the non-deprecated API, so the
 * baseline is of the DOM consumers actually get: a `cdk-overlay-pane` holding CDK Dialog's
 * own container, focus trap and backdrop, rather than the deprecated template-mode markup.
 * `ariaLabel` gives the dialog its accessible name.
 */
const VR_DATA: StoryModalData = {
  title: "Title",
  description: "Supporting description text.",
};

// `ariaLabel` is what names the dialog: without it CDK renders `role="dialog"`
// with no accessible name and the a11y gate fails every story below.
const VR_CONFIG = { data: VR_DATA, ariaLabel: VR_DATA.title } as const;

/**
 * The trigger for a visual-regression story: one button that opens a modal from a `ModalConfig`.
 * Every variant below differs only in that config, so the component is built per story rather
 * than copied.
 */
const vrRender = (config: ModalConfig<StoryModalData>) => () => {
  @Component({
    standalone: true,
    selector: "story-open-vr-demo",
    imports: [ButtonComponent],
    template: `
      <button tedi-button variant="secondary" (click)="open()">
        Open modal
      </button>
    `,
  })
  class OpenVrDemoComponent {
    private readonly modalService = inject(ModalService);

    open() {
      this.modalService.open(StoryModalContentComponent, config);
    }
  }

  return {
    template: `<story-open-vr-demo />`,
    moduleMetadata: { imports: [OpenVrDemoComponent] },
  };
};

const VR_DECORATORS = [
  moduleMetadata({ imports: [ButtonComponent, StoryModalContentComponent] }),
];

const vrPlay = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  // `findByRole` polls, so the click cannot land inside the first render pass
  // before the trigger exists. Nothing here waits on a fixed delay.
  const trigger = await within(canvasElement).findByRole("button", {
    name: "Open modal",
  });
  await userEvent.click(trigger);

  // Polled, three conditions at once: the CDK overlay pane exists, the modal
  // body inside it has rendered, and CDK's `autoFocus: "first-tabbable"` has
  // moved focus into the dialog. The focus move is the settle signal that
  // matters: it is queued after the dialog's first render, so once it has
  // happened there is no further deferred open work to race the screenshot.
  await waitFor(() => {
    const pane = document.querySelector(".cdk-overlay-pane");
    expect(pane).not.toBeNull();
    expect(pane?.querySelector(".tedi-modal-footer")).not.toBeNull();
    expect(pane?.contains(document.activeElement)).toBe(true);
  });
};

/**
 * Visual-regression only. Every other story renders a closed trigger, so the dialog itself was
 * never captured. These render the variants that exist only while open, one snapshot each.
 *
 * `tags` has to be a literal on each story: the CSF indexer reads it statically, so a tag
 * returned from a helper is silently ignored and the story lands in the sidebar anyway.
 */
export const OpenForVisualTest: StoryObj = {
  tags: ["!dev", "!autodocs"],
  decorators: VR_DECORATORS,
  render: vrRender({ ...VR_CONFIG, width: "md" }),
  play: vrPlay,
};

/** Visual-regression only. `size: "small"` tightens the header, body and footer padding. */
export const OpenSmallForVisualTest: StoryObj = {
  tags: ["!dev", "!autodocs"],
  decorators: VR_DECORATORS,
  render: vrRender({ ...VR_CONFIG, width: "sm", size: "small" }),
  play: vrPlay,
};

/** Visual-regression only. `position: "top"` pins the dialog to the top of the backdrop. */
export const OpenPositionTopForVisualTest: StoryObj = {
  tags: ["!dev", "!autodocs"],
  decorators: VR_DECORATORS,
  render: vrRender({ ...VR_CONFIG, width: "sm", position: "top" }),
  play: vrPlay,
};

/**
 * Visual-regression only. A side position turns the modal into a full-height drawer, which is a
 * different frame rather than a different width.
 */
export const OpenPositionDrawerForVisualTest: StoryObj = {
  tags: ["!dev", "!autodocs"],
  decorators: VR_DECORATORS,
  render: vrRender({ ...VR_CONFIG, width: "sm", position: "right" }),
  play: vrPlay,
};

/**
 * Visual-regression only. Fullscreen drops the backdrop padding and the radius, so it changes
 * more than the dialog's size.
 */
export const OpenFullscreenForVisualTest: StoryObj = {
  tags: ["!dev", "!autodocs"],
  decorators: VR_DECORATORS,
  render: vrRender({ ...VR_CONFIG, fullscreen: true }),
  play: vrPlay,
};

/**
 * Visual-regression only. The widest preset with `scrollBehavior: "page"`: the frame keeps its
 * edges while the overlay scrolls, which is the other scrolling frame.
 */
export const OpenWidePageScrollForVisualTest: StoryObj = {
  tags: ["!dev", "!autodocs"],
  decorators: VR_DECORATORS,
  render: vrRender({ ...VR_CONFIG, width: "xl", scrollBehavior: "page" }),
  play: vrPlay,
};
