import { act, render, screen } from "@testing-library/react";

import { CustomCursor } from "./custom-cursor";

const { mockReducedMotion } = vi.hoisted(() => ({
  mockReducedMotion: vi.fn<() => boolean | null>(),
}));
vi.mock("motion/react", () => ({ useReducedMotion: () => mockReducedMotion() }));

// The cursor batches pointer moves through rAF; run the callback immediately so
// the transform lands within the same act() block.
function stubRaf() {
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
}

function cursorElement() {
  return screen.getByText(/[✦◆✧◇⬥⬦👋]/u) as HTMLElement;
}

function mouseOver(target: Element) {
  act(() => {
    target.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
  });
}

beforeEach(() => {
  mockReducedMotion.mockReturnValue(false);
  stubRaf();
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
  document.body.style.cursor = "";
});

describe("CustomCursor", () => {
  it("renders the cursor symbol and hides the native cursor by default", () => {
    render(<CustomCursor symbol="✦" />);

    expect(screen.getByText("✦")).toBeInTheDocument();
    expect(document.body.style.cursor).toBe("none");
    expect(document.documentElement.style.cursor).toBe("none");
  });

  it("renders nothing and keeps the native cursor when reduced motion is preferred", () => {
    mockReducedMotion.mockReturnValue(true);

    const { container } = render(<CustomCursor symbol="✦" />);

    expect(container.firstChild).toBeNull();
    expect(document.body.style.cursor).toBe("");
  });

  it("restores the native cursor on unmount", () => {
    const { unmount } = render(<CustomCursor />);

    unmount();

    expect(document.body.style.cursor).toBe("");
    expect(document.documentElement.style.cursor).toBe("");
  });

  it("follows the pointer and reveals itself on the first move", () => {
    render(<CustomCursor />);
    const cursor = cursorElement();
    expect(cursor).toHaveStyle({ opacity: "0" });

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 40, clientY: 80 }));
    });

    expect(cursor.style.transform).toContain("translate3d(40px, 80px, 0)");
    expect(cursor.style.opacity).toBe("1");
  });

  it("coalesces repeated moves into a single frame", () => {
    const raf = vi.fn().mockReturnValue(1);
    vi.stubGlobal("requestAnimationFrame", raf);
    render(<CustomCursor />);

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 1, clientY: 1 }));
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 2, clientY: 2 }));
    });

    expect(raf).toHaveBeenCalledOnce();
  });

  it("switches to a wave symbol over draggable elements", () => {
    const draggable = document.createElement("div");
    draggable.setAttribute("data-draggable", "true");
    document.body.appendChild(draggable);
    render(<CustomCursor />);

    mouseOver(draggable);

    expect(screen.getByText("👋")).toBeInTheDocument();
  });

  it("ignores repeated mouseover on the same draggable element", () => {
    const draggable = document.createElement("div");
    draggable.setAttribute("draggable", "true");
    document.body.appendChild(draggable);
    render(<CustomCursor />);

    mouseOver(draggable);
    mouseOver(draggable);

    expect(screen.getByText("👋")).toBeInTheDocument();
  });

  it("cycles the symbol over interactive elements", () => {
    const link = document.createElement("a");
    link.href = "/";
    document.body.appendChild(link);
    render(<CustomCursor symbol="✦" />);

    mouseOver(link);

    expect(screen.queryByText("✦")).not.toBeInTheDocument();
  });

  it("shows the data-cursor label over annotated elements", () => {
    const button = document.createElement("button");
    button.setAttribute("data-cursor", "view work");
    document.body.appendChild(button);
    render(<CustomCursor />);

    mouseOver(button);

    expect(screen.getByText("view work")).toBeInTheDocument();
  });

  it("hides the label when showLabel is false", () => {
    const button = document.createElement("button");
    button.setAttribute("data-cursor", "view work");
    document.body.appendChild(button);
    render(<CustomCursor showLabel={false} />);

    mouseOver(button);

    expect(screen.queryByText("view work")).not.toBeInTheDocument();
  });

  it("clears the label when moving from an annotated to a plain interactive element", () => {
    const button = document.createElement("button");
    button.setAttribute("data-cursor", "view work");
    const link = document.createElement("a");
    link.href = "/";
    document.body.append(button, link);
    render(<CustomCursor />);

    mouseOver(button);
    mouseOver(link);

    expect(screen.queryByText("view work")).not.toBeInTheDocument();
  });

  it("resets to the base symbol when leaving an interactive element", () => {
    const link = document.createElement("a");
    link.href = "/";
    const plain = document.createElement("div");
    document.body.append(link, plain);
    render(<CustomCursor symbol="✦" />);

    mouseOver(link);
    mouseOver(plain);

    expect(screen.getByText("✦")).toBeInTheDocument();
  });

  it("keeps the base symbol when moving between plain elements", () => {
    const plain = document.createElement("div");
    document.body.appendChild(plain);
    render(<CustomCursor symbol="✦" />);

    mouseOver(plain);

    expect(screen.getByText("✦")).toBeInTheDocument();
  });

  it("hides itself when the pointer leaves the document", () => {
    render(<CustomCursor />);
    const cursor = cursorElement();
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 10, clientY: 10 }));
    });
    expect(cursor.style.opacity).toBe("1");

    act(() => {
      window.dispatchEvent(new MouseEvent("mouseout", { relatedTarget: null }));
    });

    expect(cursor.style.opacity).toBe("0");
  });

  it("stays visible when the pointer moves to another element inside the page", () => {
    render(<CustomCursor />);
    const cursor = cursorElement();
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 10, clientY: 10 }));
    });

    act(() => {
      window.dispatchEvent(
        new MouseEvent("mouseout", { relatedTarget: document.createElement("div") }),
      );
    });

    expect(cursor.style.opacity).toBe("1");
  });

  it("grows the symbol while dragging", () => {
    const draggable = document.createElement("div");
    draggable.setAttribute("data-draggable", "true");
    document.body.appendChild(draggable);
    render(<CustomCursor size={20} />);

    mouseOver(draggable);

    expect(screen.getByText("👋")).toHaveStyle({ fontSize: "24px" });
  });

  it("applies the configured size and color", () => {
    render(<CustomCursor size={32} color="red" symbol="✦" />);

    expect(screen.getByText("✦")).toHaveStyle({ fontSize: "32px", color: "rgb(255, 0, 0)" });
  });

  it("removes its listeners on unmount", () => {
    const removeEventListener = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(<CustomCursor />);
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 1, clientY: 1 }));
    });
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith("mousemove", expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith("mouseover", expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith("mouseout", expect.any(Function));
    removeEventListener.mockRestore();
  });

  it("cancels a pending frame on unmount", () => {
    const cancel = vi.fn();
    vi.stubGlobal("requestAnimationFrame", vi.fn().mockReturnValue(7));
    vi.stubGlobal("cancelAnimationFrame", cancel);

    const { unmount } = render(<CustomCursor />);
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 1, clientY: 1 }));
    });
    unmount();

    expect(cancel).toHaveBeenCalledWith(7);
  });

  it("positions the label alongside the cursor", () => {
    const button = document.createElement("button");
    button.setAttribute("data-cursor", "open");
    document.body.appendChild(button);
    render(<CustomCursor />);

    mouseOver(button);
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 15, clientY: 25 }));
    });

    expect(screen.getByText("open").style.transform).toContain("translate3d(15px, 25px, 0)");
  });

  it("cleans up its injected cursor-hiding stylesheet on unmount", () => {
    const before = document.head.querySelectorAll("style").length;

    const { unmount } = render(<CustomCursor />);
    expect(document.head.querySelectorAll("style").length).toBeGreaterThan(before);

    unmount();
    expect(document.head.querySelectorAll("style").length).toBe(before);
  });
});
