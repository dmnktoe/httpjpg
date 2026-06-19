import { render } from "@testing-library/react";

import { SbWorkList } from "./SbWorkList";

describe("SbWorkList", () => {
  it("returns null without resolvable stories", () => {
    const { container } = render(
      <SbWorkList blok={{ _uid: "1", component: "work_list", work: [] } as never} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a work list from embedded stories", () => {
    const { container } = render(
      <SbWorkList
        blok={
          {
            _uid: "2",
            component: "work_list",
            columns: "2",
            work: [
              {
                uuid: "u1",
                name: "Project",
                slug: "project",
                full_slug: "work/project",
                content: { title: "Project", images: [] },
              },
            ],
          } as never
        }
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });
});
