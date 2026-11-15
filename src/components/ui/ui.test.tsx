import { act, render, renderHook, screen } from "@testing-library/react";
import { Card } from "./Card";
import { AnimatedNumber } from "./AnimatedNumber";
import { useDebounce } from "@/hooks/useDebounce";

describe("utilidades de presentaciÃ³n", () => {
  afterEach(() => jest.useRealTimers());
  it("renderiza una tarjeta con y sin clase adicional", () => {
    const { rerender } = render(<Card>contenido</Card>);
    expect(screen.getByText("contenido").closest("article")).toHaveClass("panel");
    rerender(<Card className="featured">contenido</Card>);
    expect(screen.getByText("contenido").closest("article")).toHaveClass("featured");
  });
  it("formatea nÃºmeros, prefijos y valores no numÃ©ricos", () => {
    const { rerender } = render(<AnimatedNumber value={12} />);
    expect(screen.getByLabelText("12")).toBeInTheDocument();
    rerender(<AnimatedNumber value="~12.3Â°C" />);
    expect(screen.getByLabelText("~12.3Â°C")).toBeInTheDocument();
    rerender(<AnimatedNumber value="sin dato" />);
    expect(screen.getByLabelText("sin dato")).toBeInTheDocument();
  });
  it("retrasa valores y cancela el temporizador reemplazado", () => {
    jest.useFakeTimers();
    const { result, rerender, unmount } = renderHook(({ value }) => useDebounce(value, 100), { initialProps: { value: "uno" } });
    rerender({ value: "dos" });
    expect(result.current).toBe("uno");
    act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe("dos");
    rerender({ value: "tres" });
    unmount();
    act(() => jest.runOnlyPendingTimers());
    expect(result.current).toBe("dos");
  });
});
