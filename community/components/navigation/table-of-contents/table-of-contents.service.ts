import { inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";

@Injectable()
export class TableOfContentsService {
  scrollOnClick = true;

  private _active = signal<string>("");

  private router = inject(Router);

  get active() {
    return this._active.asReadonly();
  }

  setActive(id: string) {
    this._active.set(id !== this._active() ? id : "");
  }

  seekTo(id: string) {
    if (!id) {
      this.router.navigate([], {
        fragment: undefined,
        queryParamsHandling: "preserve",
      });
      return;
    }
    if (this.scrollOnClick) {
      const targetElement = document.getElementById(id);
      targetElement?.scrollIntoView({ behavior: "smooth" });
      this.router.navigate([], {
        fragment: id,
        queryParamsHandling: "preserve",
      });
    }
  }
}
