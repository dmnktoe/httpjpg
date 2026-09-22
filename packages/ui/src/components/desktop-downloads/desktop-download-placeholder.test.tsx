import { render } from "@testing-library/react";

import { DesktopDownloadPlaceholder } from "./desktop-download-placeholder";
import { DESKTOP_FILE_KINDS } from "./lib";

describe("DesktopDownloadPlaceholder", () => {
  it("draws a labelled glyph for every file kind", () => {
    for (const kind of DESKTOP_FILE_KINDS) {
      const { container, unmount } = render(<DesktopDownloadPlaceholder kind={kind} />);
      expect(container.querySelector("svg")).not.toBeNull();
      expect(container.textContent).toMatch(/PDF|ZIP|IMG|VID|SND|DOC|FILE/);
      unmount();
    }
  });
});
