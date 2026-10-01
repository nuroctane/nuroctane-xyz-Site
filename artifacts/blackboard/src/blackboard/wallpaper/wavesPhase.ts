/** Keep shader inputs small even after a long Safari tab suspension.
 * Each axis wraps after its own scaling: wrapping time earlier would jump the
 * pattern at non-square viewport ratios. The normal map repeats seamlessly. */
export function wavesPhase(seconds: number, aspect: number): readonly [number, number] {
  const phase = seconds * 0.12 * 0.12 * 0.3;
  const wrap = (value: number) => value - Math.floor(value);
  return [wrap(phase * aspect), wrap(phase * 1.68)];
}
