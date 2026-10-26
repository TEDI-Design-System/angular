import {
  CdkOverlayOrigin,
  ConnectedOverlayPositionChange,
  ConnectedPosition,
  OverlayRef,
} from "@angular/cdk/overlay";
import { ElementRef, NgZone } from "@angular/core";
import {
  FloatingOverlayOrigin,
  FloatingPositionStrategy,
  INLINE_OVERLAY_CONTAINER_ATTR,
  OVERLAY_HOST_CLASS,
  raiseOverlayContainer,
} from "./floating-position-strategy";

const BOTTOM_START: ConnectedPosition = {
  originX: "start",
  originY: "bottom",
  overlayX: "start",
  overlayY: "top",
  offsetY: 4,
};
const TOP_START: ConnectedPosition = {
  originX: "start",
  originY: "top",
  overlayX: "start",
  overlayY: "bottom",
  offsetY: -4,
};

type Box = { top: number; left: number; width: number; height: number };

const stubRect = (element: Element, box: Box) => {
  element.getBoundingClientRect = () =>
    ({
      ...box,
      x: box.left,
      y: box.top,
      right: box.left + box.width,
      bottom: box.top + box.height,
    }) as DOMRect;
};

const setViewport = (width: number, height: number) => {
  Object.defineProperty(document.documentElement, "clientWidth", {
    configurable: true,
    value: width,
  });
  Object.defineProperty(document.documentElement, "clientHeight", {
    configurable: true,
    value: height,
  });
};

const zone = {
  run: <T>(fn: () => T) => fn(),
  runOutsideAngular: <T>(fn: () => T) => fn(),
} as unknown as NgZone;

describe("FloatingPositionStrategy", () => {
  let container: HTMLElement;
  let host: HTMLElement;
  let pane: HTMLElement;
  let origin: HTMLElement;
  let attached: boolean;
  let direction: "ltr" | "rtl";
  let overlayRef: OverlayRef;

  const create = (
    overrides: Partial<{
      origin: FloatingOverlayOrigin;
      positions: ConnectedPosition[];
      flexibleDimensions: boolean;
    }> = {},
  ) =>
    new FloatingPositionStrategy(
      {
        origin: () => overrides.origin ?? origin,
        positions: () => overrides.positions ?? [BOTTOM_START, TOP_START],
        flexibleDimensions: () => overrides.flexibleDimensions ?? false,
      },
      zone,
    );

  beforeEach(() => {
    container = document.createElement("div");
    container.classList.add("cdk-overlay-container");
    host = document.createElement("div");
    pane = document.createElement("div");
    host.appendChild(pane);
    container.appendChild(host);
    origin = document.createElement("button");
    document.body.append(origin, container);

    attached = true;
    direction = "ltr";
    overlayRef = {
      hostElement: host,
      overlayElement: pane,
      hasAttached: () => attached,
      getDirection: () => direction,
    } as unknown as OverlayRef;

    setViewport(1000, 800);
    stubRect(origin, { top: 100, left: 50, width: 80, height: 40 });
    stubRect(pane, { top: 0, left: 0, width: 200, height: 100 });
  });

  afterEach(() => {
    origin.remove();
    container.remove();
    host.remove();
    setViewport(0, 0);
  });

  const open = (strategy = create()) => {
    strategy.attach(overlayRef);
    strategy.apply();
    return strategy;
  };

  it("moves the host next to the container so it floats in the document", () => {
    create().attach(overlayRef);

    expect(host.parentElement).toBe(document.body);
    expect(host.classList).toContain(OVERLAY_HOST_CLASS);
  });

  it("keeps the host in an inline container", () => {
    container.setAttribute(INLINE_OVERLAY_CONTAINER_ATTR, "");

    create().attach(overlayRef);

    expect(host.parentElement).toBe(container);
    expect(host.classList).not.toContain(OVERLAY_HOST_CLASS);
  });

  it("keeps the host in the fixed container for a fixed or sticky origin", () => {
    const sticky = document.createElement("div");
    sticky.style.position = "sticky";
    sticky.appendChild(origin);
    document.body.appendChild(sticky);
    const strategy = create();

    strategy.attach(overlayRef);
    expect(host.parentElement).toBe(container);

    document.body.appendChild(origin);
    strategy.attach(overlayRef);
    expect(host.parentElement).toBe(document.body);

    sticky.remove();
  });

  describe("when the container's parent could clip the pane", () => {
    let root: HTMLElement;

    beforeEach(() => {
      root = document.createElement("div");
      document.body.appendChild(root);
      root.appendChild(container);
    });

    afterEach(() => {
      root.remove();
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    });

    it("keeps the host in the container under a scrolling root", () => {
      root.style.overflow = "auto";

      create().attach(overlayRef);

      expect(host.parentElement).toBe(container);
    });

    it("floats the host when a positioned box sits between it and the clipping one", () => {
      const clipping = document.createElement("div");
      clipping.style.overflow = "hidden";
      document.body.appendChild(clipping);
      clipping.appendChild(root);
      root.style.position = "relative";

      create().attach(overlayRef);

      expect(host.parentElement).toBe(root);
      clipping.remove();
    });

    it("ignores body overflow that propagates to the viewport", () => {
      document.body.style.overflow = "hidden";

      create().attach(overlayRef);

      expect(host.parentElement).toBe(root);
    });

    it("respects body overflow when html sets its own", () => {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      create().attach(overlayRef);

      expect(host.parentElement).toBe(container);
    });
  });

  it("does nothing without a container", () => {
    host.remove();

    create().attach(overlayRef);

    expect(host.parentElement).toBeNull();
  });

  it("places the pane at the first position that fits and reports it once", () => {
    const strategy = create();
    const changes: ConnectedOverlayPositionChange[] = [];
    strategy.positionChanges.subscribe((change) => changes.push(change));

    open(strategy);
    strategy.apply();

    expect(pane.style.top).toBe("144px");
    expect(pane.style.left).toBe("50px");
    expect(changes.map((change) => change.connectionPair)).toEqual([
      BOTTOM_START,
    ]);
  });

  it("flips to the next position when the first does not fit", () => {
    stubRect(origin, { top: 750, left: 50, width: 80, height: 40 });

    open();

    expect(pane.style.top).toBe("646px");
  });

  it("picks the position showing the most of the pane when none fits", () => {
    setViewport(1000, 300);
    stubRect(origin, { top: 200, left: 50, width: 80, height: 20 });
    stubRect(pane, { top: 0, left: 0, width: 200, height: 250 });

    open();

    expect(pane.style.top).toBe("-54px");
  });

  it("aligns start and end with the text direction", () => {
    direction = "rtl";

    open();

    expect(pane.style.left).toBe("-70px");
  });

  it("centres on the origin and applies horizontal offsets", () => {
    open(
      create({
        positions: [
          {
            originX: "end",
            originY: "center",
            overlayX: "start",
            overlayY: "center",
            offsetX: 8,
          },
        ],
      }),
    );

    expect(pane.style.top).toBe("70px");
    expect(pane.style.left).toBe("138px");
  });

  it("positions relative to the host, whatever forms its containing block", () => {
    stubRect(host, { top: -500, left: 20, width: 0, height: 0 });

    open();

    expect(pane.style.top).toBe("644px");
    expect(pane.style.left).toBe("30px");
  });

  it("accepts ElementRef, CdkOverlayOrigin and point origins", () => {
    const origins: FloatingOverlayOrigin[] = [
      new ElementRef(origin),
      Object.assign(Object.create(CdkOverlayOrigin.prototype), {
        elementRef: new ElementRef(origin),
      }),
      { x: 10, y: 20 },
      { x: 10, y: 20, width: 30, height: 40 },
    ];

    for (const value of origins) {
      open(create({ origin: value, positions: [BOTTOM_START] })).detach();
    }

    expect(pane.style.top).toBe("64px");
    expect(pane.style.left).toBe("10px");
  });

  it("does nothing without positions", () => {
    open(create({ positions: [] }));

    expect(pane.style.top).toBe("");
  });

  describe("with flexible dimensions", () => {
    beforeEach(() => {
      stubRect(pane, { top: 0, left: 0, width: 200, height: 900 });
    });

    it("caps the height to the space below", () => {
      open(create({ flexibleDimensions: true }));

      expect(pane.style.maxHeight).toBe("656px");
      expect(pane.style.top).toBe("144px");
    });

    it("caps the height to the space above and keeps the pane on the trigger", () => {
      stubRect(origin, { top: 700, left: 50, width: 80, height: 40 });

      open(create({ flexibleDimensions: true }));

      expect(pane.style.maxHeight).toBe("696px");
      expect(pane.style.top).toBe("0px");
    });

    it("leaves centred panes the whole viewport", () => {
      open(
        create({
          flexibleDimensions: true,
          positions: [
            {
              originX: "end",
              originY: "center",
              overlayX: "start",
              overlayY: "center",
            },
          ],
        }),
      );

      expect(pane.style.maxHeight).toBe("800px");
    });
  });

  describe("tracking", () => {
    it("repositions on resize and on scrolls outside the pane", () => {
      const strategy = open();
      const inner = document.createElement("div");
      pane.appendChild(inner);
      stubRect(origin, { top: 200, left: 50, width: 80, height: 40 });

      inner.dispatchEvent(new Event("scroll"));
      expect(pane.style.top).toBe("144px");

      document.body.dispatchEvent(new Event("scroll"));
      expect(pane.style.top).toBe("244px");

      stubRect(origin, { top: 300, left: 50, width: 80, height: 40 });
      window.dispatchEvent(new Event("resize"));
      expect(pane.style.top).toBe("344px");

      strategy.detach();
      stubRect(origin, { top: 400, left: 50, width: 80, height: 40 });
      window.dispatchEvent(new Event("resize"));
      expect(pane.style.top).toBe("344px");
    });

    it("observes the pane and origin, and follows a new origin element", () => {
      const observed: Element[][] = [];
      const disconnect = jest.fn();
      (window as unknown as { ResizeObserver: unknown }).ResizeObserver =
        class {
          readonly targets: Element[] = [];
          constructor() {
            observed.push(this.targets);
          }
          observe(target: Element) {
            this.targets.push(target);
          }
          disconnect = disconnect;
        };

      let current: Element = origin;
      const other = document.createElement("span");
      stubRect(other, { top: 0, left: 0, width: 0, height: 0 });
      const strategy = new FloatingPositionStrategy(
        {
          origin: () => current,
          positions: () => [BOTTOM_START, TOP_START],
          flexibleDimensions: () => false,
        },
        zone,
      );

      open(strategy);
      strategy.apply();
      current = other;
      strategy.apply();
      strategy.detach();

      expect(observed).toEqual([
        [pane, origin],
        [pane, other],
      ]);
      expect(disconnect).toHaveBeenCalledTimes(2);
      delete (window as unknown as { ResizeObserver?: unknown }).ResizeObserver;
    });

    it("skips updates once detached and completes on dispose", () => {
      const strategy = create();
      strategy.attach(overlayRef);
      attached = false;
      strategy.apply();

      expect(pane.style.top).toBe("");

      strategy.dispose();
      expect(strategy.positionChanges.isStopped).toBe(true);
    });
  });

  it("returns itself from the setters CdkConnectedOverlay calls", () => {
    const strategy = create();

    expect(
      strategy
        .setOrigin()
        .withPositions()
        .withFlexibleDimensions()
        .withPush()
        .withGrowAfterOpen()
        .withViewportMargin()
        .withLockedPosition()
        .withTransformOriginOn(),
    ).toBe(strategy);
  });
});

describe("raiseOverlayContainer", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body
      .querySelectorAll(`.${OVERLAY_HOST_CLASS}, .unrelated`)
      .forEach((el) => el.remove());
    container.remove();
  });

  it("moves the container after floating hosts and keeps focus", () => {
    const button = document.createElement("button");
    container.appendChild(button);
    button.focus();
    const floating = document.createElement("div");
    floating.classList.add(OVERLAY_HOST_CLASS);
    const unrelated = document.createElement("div");
    unrelated.classList.add("unrelated");
    document.body.append(unrelated, floating);

    raiseOverlayContainer(container);

    expect(document.body.lastElementChild).toBe(container);
    expect(document.activeElement).toBe(button);
  });

  it("leaves the container alone when no floating host follows it", () => {
    const unrelated = document.createElement("div");
    unrelated.classList.add("unrelated");
    document.body.appendChild(unrelated);

    raiseOverlayContainer(container);

    expect(container.nextElementSibling).toBe(unrelated);
  });

  it("does nothing for a detached container", () => {
    container.remove();

    expect(() => raiseOverlayContainer(container)).not.toThrow();
  });
});
