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

interface Rotation {
  version: 1;
  catalogue: string[];
  remaining: string[];
  recent: string[];
}

const memoryRotations = new Map<string, Rotation>();

/** A shuffled full-library rotation, with a five-track cooldown across cycles. */
export function refreshShuffledChoice<T>(key: string, items: readonly T[], id: (item: T) => string, random = Math.random): T {
  const byId = new Map(items.map(item => [id(item), item]));
  const catalogue = [...byId.keys()];
  if (!catalogue.length) throw new Error('Cannot choose from an empty collection');
  const stateKey = `${key}:rotation`;
  let saved: Rotation | undefined;
  let previous: string | null = null;
  try {
    previous = sessionStorage.getItem(key);
    const raw: unknown = JSON.parse(sessionStorage.getItem(stateKey) ?? 'null');
    if (raw && typeof raw === 'object') {
      const candidate = raw as Partial<Rotation>;
      if (candidate.version === 1 && [candidate.catalogue, candidate.remaining, candidate.recent]
        .every(value => Array.isArray(value) && value.every(entry => typeof entry === 'string'))) {
        saved = candidate as Rotation;
      }
    }
  } catch { saved = memoryRotations.get(stateKey); }

  const validIds = (values: string[]) => [...new Set(values)].filter(value => byId.has(value));
  const cooldown = Math.min(5, catalogue.length - 1);
  const recent = cooldown ? validIds(saved?.recent ?? (previous ? [previous] : [])).slice(-cooldown) : [];
  const shuffle = (values: string[]) => {
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
  };
  // New songs join the unfinished cycle; removed songs cannot linger in history.
  let remaining = saved
    ? validIds([...saved.remaining, ...catalogue.filter(value => !saved.catalogue.includes(value))])
    : [];
  if (!remaining.length) remaining = shuffle([...catalogue]);
  let index = remaining.findIndex(value => !recent.includes(value));
  // Recover gracefully from inconsistent saved state (or a drastically smaller library).
  if (index < 0) {
    remaining = shuffle([...catalogue]);
    index = remaining.findIndex(value => !recent.includes(value));
  }
  const [chosen] = remaining.splice(index, 1);
  const rotation: Rotation = {
    version: 1, catalogue, remaining, recent: [...recent, chosen].slice(-cooldown),
  };
  if (!cooldown) rotation.recent = [];
  memoryRotations.set(stateKey, rotation);
  try { sessionStorage.setItem(stateKey, JSON.stringify(rotation)); } catch { /* Retain the in-page fallback. */ }
  rememberChoice(key, chosen);
  return byId.get(chosen)!;
}
