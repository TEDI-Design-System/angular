import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";
import { ModalHeaderComponent } from "./modal-header.component";
import { ModalComponent } from "../modal.component";
import { viewChild } from "@angular/core";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";

class MockModalComponent {
  open = {
    value: false,
    set: jest.fn(function (val: boolean) {
      this.value = val;
    }),
  };
}

@Component({
  standalone: true,
  imports: [ModalHeaderComponent],
  template: `
    <tedi-modal-header [showClose]="showClose">
      Header Content
    </tedi-modal-header>
  `,
})
class TestHostComponent {
  showClose = true;
  header = viewChild.required(ModalHeaderComponent);
}

describe("ModalHeaderComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let component: ModalHeaderComponent;
  let modal: MockModalComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: ModalComponent, useClass: MockModalComponent },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    host = fixture.componentInstance;
    component = host.header();
    modal = TestBed.inject(ModalComponent) as unknown as MockModalComponent;
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should show close button when showClose = true", () => {
    const btn = fixture.nativeElement.querySelector("button");
    expect(btn).not.toBeNull();
  });

  it("should hide close button when showClose = false", () => {
    host.showClose = false;
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector("button");
    expect(btn).toBeNull();
  });

  it("should close modal when close button is clicked", () => {
    const btn = fixture.nativeElement.querySelector("button")!;
    modal.open.value = true;

    btn.click();
    fixture.detectChanges();

    expect(modal.open.set).toHaveBeenCalledWith(false);
  });

  it("should close modal via closeModal() method", () => {
    modal.open.value = true;

    component.closeModal();
    fixture.detectChanges();

    expect(modal.open.set).toHaveBeenCalledWith(false);
  });
});
