import { renderHook } from "@testing-library/react";

import { useHasMounted } from "./use-has-mounted";

describe("useHasMounted", () => {
  it("is true in the browser", () => {
    const { result } = renderHook(() => useHasMounted());
    expect(result.current).toBe(true);
  });
});
