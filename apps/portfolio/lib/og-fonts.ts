interface FontSpec {
  family: string;
  cssUrl: string;
  satoriName: string;
}

const FONT_SPECS: readonly FontSpec[] = [
  {
    family: "Inter",
    cssUrl: "https://fonts.googleapis.com/css2?family=Inter&display=swap",
    satoriName: "Sans",
  },
  {
    family: "Anton",
    cssUrl: "https://fonts.googleapis.com/css2?family=Anton&display=swap",
    satoriName: "Headline",
  },
  {
    family: "Noto Sans Mono",
    cssUrl: "https://fonts.googleapis.com/css2?family=Noto+Sans+Mono&display=swap",
    satoriName: "NotoMono",
  },
  {
    family: "Noto Sans Symbols 2",
    cssUrl: "https://fonts.googleapis.com/css2?family=Noto+Sans+Symbols+2&display=swap",
    satoriName: "NotoSymbols",
  },
  {
    family: "Noto Serif Tibetan",
    cssUrl: "https://fonts.googleapis.com/css2?family=Noto+Serif+Tibetan&display=swap",
    satoriName: "NotoTibetan",
  },
  {
    family: "Noto Sans Gurmukhi",
    cssUrl: "https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi&display=swap",
    satoriName: "NotoGurmukhi",
  },
];

export interface SatoriFont {
  name: string;
  data: ArrayBuffer;
  weight: 400;
  style: "normal";
}

let fontsPromise: Promise<SatoriFont[]> | null = null;

export function loadFonts(): Promise<SatoriFont[]> {
  if (fontsPromise) {
    return fontsPromise;
  }
  const promise = Promise.all(
    FONT_SPECS.map(async ({ family, cssUrl, satoriName }): Promise<SatoriFont> => {
      const cssRes = await fetch(cssUrl);
      if (!cssRes.ok) {
        throw new Error(`og/work: ${family} CSS fetch failed (${cssRes.status})`);
      }
      const css = await cssRes.text();
      const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.ttf)\)/);
      if (!match) {
        throw new Error(`og/work: ${family} TTF URL not found in CSS`);
      }
      const fontRes = await fetch(match[1]!);
      if (!fontRes.ok) {
        throw new Error(`og/work: ${family} binary fetch failed (${fontRes.status})`);
      }
      return {
        name: satoriName,
        data: await fontRes.arrayBuffer(),
        weight: 400,
        style: "normal",
      };
    }),
  ).catch((err) => {
    fontsPromise = null;
    throw err;
  });
  fontsPromise = promise;
  return promise;
}
