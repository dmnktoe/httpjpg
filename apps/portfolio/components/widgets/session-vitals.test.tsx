import { render, screen } from "@testing-library/react";
import { act } from "react";
import { beforeEach, vi } from "vitest";

const { reporters } = vi.hoisted(() => ({
  reporters: [] as Array<(metric: { name: string; value: number }) => void>,
}));

vi.mock("next/web-vitals", () => ({
  useReportWebVitals: (report: (metric: { name: string; value: number }) => void) => {
    reporters.push(report);
  },
}));

import { VITAL_NAMES } from "@/lib/web-vitals";

import { SessionVitals } from "./session-vitals";

function report(name: string, value: number) {
  act(() => {
    for (const reporter of reporters) {
      reporter({ name, value });
    }
  });
}

beforeEach(() => {
  reporters.length = 0;
});

describe("SessionVitals", () => {
  it("lists every vital before any has been measured", () => {
    render(<SessionVitals />);

    for (const name of VITAL_NAMES) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(screen.getAllByText("—")).toHaveLength(VITAL_NAMES.length);
  });

  it("fills in a vital once it is reported", () => {
    render(<SessionVitals />);

    report("LCP", 1200);

    expect(screen.getAllByText("—")).toHaveLength(VITAL_NAMES.length - 1);
  });

  it("ignores a metric that is not one of the tracked vitals", () => {
    render(<SessionVitals />);

    report("Next.js-hydration", 42);

    expect(screen.getAllByText("—")).toHaveLength(VITAL_NAMES.length);
  });

  it("formats a reported vital rather than printing the raw number", () => {
    render(<SessionVitals />);

    report("LCP", 1200);

    expect(screen.getByText("1.2s")).toBeInTheDocument();
    expect(screen.queryByText("1200")).not.toBeInTheDocument();
  });

  it("takes the latest value when a vital is reported more than once", () => {
    render(<SessionVitals />);

    report("CLS", 0.012);
    expect(screen.getByText("0.012")).toBeInTheDocument();

    report("CLS", 0.25);

    expect(screen.getByText("0.25")).toBeInTheDocument();
    expect(screen.queryByText("0.012")).not.toBeInTheDocument();
  });
});
