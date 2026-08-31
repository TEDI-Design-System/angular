import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from "@angular/core";

@Component({
  standalone: true,
  selector: "tedi-attachment-actions",
  template: "<ng-content />",
  styleUrl: "./attachment-actions.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "tedi-attachment-actions",
    "[class.tedi-attachment-actions--padded]": "padded()",
  },
})
export class AttachmentActionsComponent {
  /**
   * Adds a 12px gap between the actions and 8px inline padding to the group.
   * Enable for labeled (text) buttons, whose neutral variant has no horizontal
   * padding of its own and would otherwise touch the card edge. Leave off for
   * icon-only buttons, which sit flush.
   * @default false
   */
  padded = input(false, { transform: booleanAttribute });
}
