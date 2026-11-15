import { generateLightning } from "./lightning";

describe("geometría del relámpago", () => {
  it("crea un zigzag dentro del lienzo y con avance vertical", () => {
    const bolt = generateLightning(120, 300, 400, () => 0.75);
    expect(bolt).toHaveLength(10);
    expect(bolt[0]).toEqual({ x: 120, y: 0 });
    expect(bolt.at(-1)?.y).toBeCloseTo(272);
    expect(bolt.every((point) => point.x >= 0 && point.x <= 300)).toBe(true);
    expect(bolt.slice(1).every((point, index) => point.y > bolt[index].y)).toBe(true);
  });
});
