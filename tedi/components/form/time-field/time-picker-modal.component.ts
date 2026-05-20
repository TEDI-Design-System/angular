import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { ButtonComponent } from "../../buttons/button/button.component";
import { ModalComponent } from "../../overlay/modal/modal.component";
import { ModalContentComponent } from "../../overlay/modal/modal-content/modal-content.component";
import { ModalFooterComponent } from "../../overlay/modal/modal-footer/modal-footer.component";
import { ModalHeaderComponent } from "../../overlay/modal/modal-header/modal-header.component";
import { ModalRef } from "../../overlay/modal/modal-ref";
import { MODAL_DATA } from "../../overlay/modal/modal.types";
import { TediTranslationPipe } from "../../../services/translation/translation.pipe";
import {
  TimePickerComponent,
  TimePickerVariant,
} from "../time-picker/time-picker.component";

export interface TimePickerModalData {
  value: string | null;
  variant: TimePickerVariant;
  timeSlots: string[];
  columns: number;
  showSlotIndicator: boolean;
  minuteStep: number;
}

@Component({
  selector: "tedi-time-picker-modal",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    ButtonComponent,
    ModalComponent,
    ModalContentComponent,
    ModalFooterComponent,
    ModalHeaderComponent,
    TediTranslationPipe,
    TimePickerComponent,
  ],
  templateUrl: "./time-picker-modal.component.html",
  styleUrl: "./time-picker-modal.component.scss",
})
export class TimePickerModalComponent implements AfterViewInit, OnDestroy {
  readonly data = inject(MODAL_DATA) as TimePickerModalData;
  private readonly ref = inject(ModalRef<string | null>);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly draft = signal<string | null>(this.data.value);

  ngAfterViewInit(): void {
    this.host.nativeElement.addEventListener("keydown", this.onCaptureKeydown, true);
  }

  ngOnDestroy(): void {
    this.host.nativeElement.removeEventListener("keydown", this.onCaptureKeydown, true);
  }

  cancel(): void {
    this.ref.close(undefined);
  }

  confirm(): void {
    this.ref.close(this.draft());
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.confirm();
  }

  private onCaptureKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Enter") return;
    if (event.target instanceof HTMLButtonElement) return;
    const form = this.host.nativeElement.querySelector("form");
    if (!form) return;
    event.preventDefault();
    event.stopPropagation();
    form.requestSubmit();
  };
}
