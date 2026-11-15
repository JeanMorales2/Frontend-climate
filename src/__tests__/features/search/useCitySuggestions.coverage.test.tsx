import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCitySuggestions } from "@/features/search/hooks/useCitySuggestions";

describe("useCitySuggestions", () => {
  it("no consulta valores cortos y devuelve vacío ante respuesta no válida", async () => {
    jest.useFakeTimers(); global.fetch = jest.fn().mockResolvedValue({ ok: false, json: jest.fn() }); const client = new QueryClient({ defaultOptions: { queries: { retry: false } } }); const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const { result, rerender } = renderHook(({ value }) => useCitySuggestions(value), { initialProps: { value: "M" }, wrapper }); expect(result.current.fetchStatus).toBe("idle"); rerender({ value: "Lima" }); await act(async () => { await jest.advanceTimersByTimeAsync(300); }); await waitFor(() => expect(result.current.data).toEqual([])); client.clear(); jest.useRealTimers();
  });
});
