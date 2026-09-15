export function shouldLoadFoglampMap(
  matchesDesktop: boolean,
  alreadyLoaded: boolean,
): boolean {
  return matchesDesktop || alreadyLoaded;
}
