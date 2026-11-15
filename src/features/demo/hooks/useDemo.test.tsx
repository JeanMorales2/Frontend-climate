import { act, renderHook } from "@testing-library/react";
import { useDemo } from "./useDemo";

describe("useDemo", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("recorre cada clima en ambos temas y puede detenerse", () => {
    const { result } = renderHook(() => useDemo("es"));
    expect(result.current.total).toBe(14);
    act(() => result.current.start());
    expect(result.current.step?.icon).toBe("01d");
    expect(result.current.step?.theme).toBe("light");
    act(() => jest.advanceTimersByTime(3000));
    expect(result.current.step?.theme).toBe("dark");
    act(() => result.current.stop());
    expect(result.current.running).toBe(false);
  });
});
