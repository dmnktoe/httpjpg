import {
  editableAttrs,
  mergeBlokStyles,
  sizesFromWidths,
  spacingStyle,
  widthStyle,
} from "./use-blok";

describe("spacingStyle", () => {
  it("returns nothing when no spacing is set", () => {
    expect(spacingStyle({ _uid: "1" } as never)).toEqual({ css: {}, style: {} });
  });

  it("reads a fixed class and carries the token through a variable", () => {
    expect(spacingStyle({ mt: "4" } as never)).toEqual({
      css: { mt: { base: "var(--sb-mt)" } },
      style: { "--sb-mt": "var(--jpg-spacing-4)" },
    });
  });

  it("adds a class and variable for each breakpoint the editor set", () => {
    expect(spacingStyle({ pt: "2", ptMd: "4", ptLg: "8" } as never)).toEqual({
      css: { pt: { base: "var(--sb-pt)", md: "var(--sb-pt-md)", lg: "var(--sb-pt-lg)" } },
      style: {
        "--sb-pt": "var(--jpg-spacing-2)",
        "--sb-pt-md": "var(--jpg-spacing-4)",
        "--sb-pt-lg": "var(--jpg-spacing-8)",
      },
    });
  });

  it("leaves unset breakpoints to the min-width cascade", () => {
    expect(spacingStyle({ mb: "2", mbLg: "8" } as never)).toEqual({
      css: { mb: { base: "var(--sb-mb)", lg: "var(--sb-mb-lg)" } },
      style: { "--sb-mb": "var(--jpg-spacing-2)", "--sb-mb-lg": "var(--jpg-spacing-8)" },
    });
  });

  it("only touches desktop when only desktop is set", () => {
    expect(spacingStyle({ ptLg: "24" } as never)).toEqual({
      css: { pt: { lg: "var(--sb-pt-lg)" } },
      style: { "--sb-pt-lg": "var(--jpg-spacing-24)" },
    });
  });

  it("keeps zero and ignores empty CMS fields", () => {
    expect(spacingStyle({ mt: "0", mb: "" } as never)).toEqual({
      css: { mt: { base: "var(--sb-mt)" } },
      style: { "--sb-mt": "var(--jpg-spacing-0)" },
    });
  });
});

describe("spacingStyle defaults", () => {
  it("fills an empty base value without touching the breakpoints the editor set", () => {
    expect(spacingStyle({ mbLg: "8" } as never, { mb: "4" })).toEqual({
      css: { mb: { base: "var(--sb-mb)", lg: "var(--sb-mb-lg)" } },
      style: { "--sb-mb": "var(--jpg-spacing-4)", "--sb-mb-lg": "var(--jpg-spacing-8)" },
    });
  });

  it("lets the editor's base value win over the default", () => {
    expect(spacingStyle({ mb: "0" } as never, { mb: "4" }).style).toEqual({
      "--sb-mb": "var(--jpg-spacing-0)",
    });
  });
});

describe("widthStyle", () => {
  it("returns nothing when no width is set", () => {
    expect(widthStyle({})).toEqual({ css: {}, style: {} });
  });

  it("passes percentages through a variable per breakpoint", () => {
    expect(widthStyle({ width: "100%", widthMd: "50%", widthLg: "30%" })).toEqual({
      css: { width: { base: "var(--sb-w)", md: "var(--sb-w-md)", lg: "var(--sb-w-lg)" } },
      style: { "--sb-w": "100%", "--sb-w-md": "50%", "--sb-w-lg": "30%" },
    });
  });

  it("leaves the base width alone when only tablet is set", () => {
    expect(widthStyle({ widthMd: "50%" })).toEqual({
      css: { width: { md: "var(--sb-w-md)" } },
      style: { "--sb-w-md": "50%" },
    });
  });
});

describe("mergeBlokStyles", () => {
  it("combines classes and variables", () => {
    expect(
      mergeBlokStyles(widthStyle({ width: "50%" }), spacingStyle({ mt: "4" } as never)),
    ).toEqual({
      css: { width: { base: "var(--sb-w)" }, mt: { base: "var(--sb-mt)" } },
      style: { "--sb-w": "50%", "--sb-mt": "var(--jpg-spacing-4)" },
    });
  });
});

describe("sizesFromWidths", () => {
  it("defaults to 100vw when no width is provided", () => {
    expect(sizesFromWidths({})).toBe("100vw");
  });

  it("converts percentages to vw and orders breakpoints largest-first", () => {
    expect(sizesFromWidths({ width: "100%", widthMd: "50%", widthLg: "30%" })).toBe(
      "(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw",
    );
  });

  it("includes only the breakpoints that are set", () => {
    expect(sizesFromWidths({ widthMd: "50%" })).toBe("(min-width: 768px) 50vw, 100vw");
  });
});

describe("editableAttrs", () => {
  it("returns an object for a blok with a _uid", () => {
    expect(editableAttrs({ _uid: "abc" })).toBeTypeOf("object");
  });
});
