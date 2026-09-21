/** Independent per-tab history, retained across normal and hard refreshes. */
export function rememberChoice(key: string, id: string): void {
  try { sessionStorage.setItem(key, id); } catch { /* Storage can be disabled. */ }
}

export function chooseExceptPrevious<T>(items: readonly T[], previous: string | null, id: (item: T) => string, random = Math.random): T {
  if (!items.length) throw new Error('Cannot choose from an empty collection');
  const eligible = items.filter(item => id(item) !== previous);
  const pool = eligible.length ? eligible : items;
  return pool[Math.floor(random() * pool.length)];
}

export function refreshChoice<T>(key: string, items: readonly T[], id: (item: T) => string): T {
  let previous: string | null = null;
  try { previous = sessionStorage.getItem(key); } catch { /* Use a fresh draw. */ }
  const choice = chooseExceptPrevious(items, previous, id);
  rememberChoice(key, id(choice));
  return choice;
}
