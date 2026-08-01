const SEARCH_TIMEOUT_MS = 4_000;
const SEARCH_CACHE_MS = 10 * 60 * 1_000;
const SEARCH_CACHE_MAX = 100;
const USER_AGENT = "nuroctane.xyz book discovery (https://nuroctane.xyz)";

export interface BookSearchResult {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  year?: string;
  source: string;
  sources: string[];
  sourceUrl?: string;
}

export interface BookSearchResponse {
  results: BookSearchResult[];
  sources: string[];
}

interface CachedSearch {
  expiresAt: number;
  response: BookSearchResponse;
}

const cache = new Map<string, CachedSearch>();

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function firstString(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return value.map(asString).find(Boolean);
  }
  return asString(value);
}

function cleanDescription(value: unknown): string | undefined {
  const raw = firstString(value);
  if (!raw) return undefined;
  const text = raw
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.slice(0, 2_000) : undefined;
}

function safeHttpsUrl(value: unknown): string | undefined {
  const raw = asString(value);
  if (!raw) return undefined;
  try {
    const url = new URL(raw.startsWith("//") ? `https:${raw}` : raw.replace(/^http:/, "https:"));
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

async function fetchJson(url: URL): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`${url.hostname} returned ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function searchGoogle(query: string): Promise<BookSearchResult[]> {
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", "8");
  url.searchParams.set("printType", "books");
  url.searchParams.set("projection", "lite");
  url.searchParams.set("source", "nuroctane.xyz");
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  if (key) url.searchParams.set("key", key);

  const data = asRecord(await fetchJson(url));
  const items = Array.isArray(data?.items) ? data.items : [];
  return items.flatMap((raw): BookSearchResult[] => {
    const item = asRecord(raw);
    const volume = asRecord(item?.volumeInfo);
    const title = asString(volume?.title);
    if (!item || !volume || !title) return [];
    const imageLinks = asRecord(volume.imageLinks);
    const id = asString(item.id) ?? crypto.randomUUID();
    return [{
      id: `google:${id}`,
      title,
      author: firstString(volume.authors) ?? "",
      coverUrl: safeHttpsUrl(imageLinks?.thumbnail ?? imageLinks?.smallThumbnail),
      description: cleanDescription(volume.description),
      year: asString(volume.publishedDate),
      source: "Google Books",
      sources: ["Google Books"],
      sourceUrl: `https://books.google.com/books?id=${encodeURIComponent(id)}`,
    }];
  });
}

async function searchOpenLibrary(query: string): Promise<BookSearchResult[]> {
  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("q", query);
  url.searchParams.set("fields", "key,title,author_name,cover_i,first_publish_year,first_sentence");
  // Open Library sometimes ranks sequels above an exact work/title match; a
  // slightly wider batch lets the local relevance pass recover that exact hit.
  url.searchParams.set("limit", "16");

  const data = asRecord(await fetchJson(url));
  const docs = Array.isArray(data?.docs) ? data.docs : [];
  return docs.flatMap((raw): BookSearchResult[] => {
    const doc = asRecord(raw);
    const title = asString(doc?.title);
    const key = asString(doc?.key);
    if (!doc || !title || !key) return [];
    const coverId = typeof doc.cover_i === "number" ? doc.cover_i : undefined;
    return [{
      id: `openlibrary:${key}`,
      title,
      author: firstString(doc.author_name) ?? "",
      coverUrl: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : undefined,
      description: cleanDescription(doc.first_sentence),
      year: typeof doc.first_publish_year === "number" ? String(doc.first_publish_year) : undefined,
      source: "Open Library",
      sources: ["Open Library"],
      sourceUrl: `https://openlibrary.org${key}`,
    }];
  });
}

async function searchLibraryOfCongress(query: string): Promise<BookSearchResult[]> {
  const url = new URL("https://www.loc.gov/books/");
  url.searchParams.set("q", query);
  url.searchParams.set("fo", "json");
  url.searchParams.set("at", "results");
  url.searchParams.set("c", "6");

  const data = asRecord(await fetchJson(url));
  const results = Array.isArray(data?.results) ? data.results : [];
  return results.flatMap((raw): BookSearchResult[] => {
    const item = asRecord(raw);
    const title = asString(item?.title);
    const id = asString(item?.id);
    if (!item || !title || !id) return [];
    return [{
      id: `loc:${id}`,
      title,
      author: firstString(item.contributor) ?? "",
      coverUrl: safeHttpsUrl(firstString(item.image_url)),
      description: cleanDescription(item.description),
      year: asString(item.date),
      source: "Library of Congress",
      sources: ["Library of Congress"],
      sourceUrl: safeHttpsUrl(id),
    }];
  });
}

async function searchInternetArchive(query: string): Promise<BookSearchResult[]> {
  const safeQuery = query.replace(/[(){}[\]"\\]/g, " ").replace(/\s+/g, " ").trim();
  const url = new URL("https://archive.org/advancedsearch.php");
  url.searchParams.set("q", `(title:(${safeQuery}) OR creator:(${safeQuery})) AND mediatype:(texts)`);
  for (const field of ["identifier", "title", "creator", "date", "description"]) {
    url.searchParams.append("fl[]", field);
  }
  url.searchParams.set("rows", "6");
  url.searchParams.set("page", "1");
  url.searchParams.set("output", "json");

  const data = asRecord(await fetchJson(url));
  const response = asRecord(data?.response);
  const docs = Array.isArray(response?.docs) ? response.docs : [];
  return docs.flatMap((raw): BookSearchResult[] => {
    const doc = asRecord(raw);
    const title = asString(doc?.title);
    const identifier = asString(doc?.identifier);
    if (!doc || !title || !identifier) return [];
    return [{
      id: `archive:${identifier}`,
      title,
      author: firstString(doc.creator) ?? "",
      coverUrl: `https://archive.org/services/img/${encodeURIComponent(identifier)}`,
      description: cleanDescription(doc.description),
      year: asString(doc.date)?.slice(0, 10),
      source: "Internet Archive",
      sources: ["Internet Archive"],
      sourceUrl: `https://archive.org/details/${encodeURIComponent(identifier)}`,
    }];
  });
}

async function searchCrossref(query: string): Promise<BookSearchResult[]> {
  const url = new URL("https://api.crossref.org/v1/works");
  url.searchParams.set("query.bibliographic", query);
  url.searchParams.set("filter", "type:book");
  url.searchParams.set("rows", "6");
  url.searchParams.set("select", "DOI,title,author,published,type,abstract,URL");
  url.searchParams.set("mailto", "civetadeicollegium@gmail.com");

  const data = asRecord(await fetchJson(url));
  const message = asRecord(data?.message);
  const items = Array.isArray(message?.items) ? message.items : [];
  return items.flatMap((raw): BookSearchResult[] => {
    const item = asRecord(raw);
    const title = firstString(item?.title);
    const doi = asString(item?.DOI);
    if (!item || !title || !doi) return [];
    const authors = Array.isArray(item.author) ? item.author : [];
    const author = authors.map((entry) => {
      const person = asRecord(entry);
      return [asString(person?.given), asString(person?.family)].filter(Boolean).join(" ");
    }).filter(Boolean).slice(0, 3).join(", ");
    const published = asRecord(item.published);
    const dateParts = Array.isArray(published?.["date-parts"])
      ? published["date-parts"] as unknown[]
      : [];
    const firstDate = Array.isArray(dateParts[0]) ? dateParts[0] : [];
    return [{
      id: `crossref:${doi}`,
      title,
      author,
      description: cleanDescription(item.abstract),
      year: typeof firstDate[0] === "number" ? String(firstDate[0]) : undefined,
      source: "Crossref",
      sources: ["Crossref"],
      sourceUrl: safeHttpsUrl(item.URL) ?? `https://doi.org/${encodeURIComponent(doi)}`,
    }];
  });
}

async function searchGutenberg(query: string): Promise<BookSearchResult[]> {
  const url = new URL("https://gutendex.com/books/");
  url.searchParams.set("search", query);

  const data = asRecord(await fetchJson(url));
  const results = Array.isArray(data?.results) ? data.results.slice(0, 6) : [];
  return results.flatMap((raw): BookSearchResult[] => {
    const item = asRecord(raw);
    const title = asString(item?.title);
    const id = typeof item?.id === "number" ? String(item.id) : undefined;
    if (!item || !title || !id) return [];
    const authors = Array.isArray(item.authors) ? item.authors : [];
    const author = authors.map((entry) => asString(asRecord(entry)?.name)).filter(Boolean).join(", ");
    const formats = asRecord(item.formats);
    return [{
      id: `gutenberg:${id}`,
      title,
      author,
      coverUrl: safeHttpsUrl(formats?.["image/jpeg"]),
      description: cleanDescription(item.summaries),
      source: "Project Gutenberg",
      sources: ["Project Gutenberg"],
      sourceUrl: `https://www.gutenberg.org/ebooks/${id}`,
    }];
  });
}

function canonical(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function relevanceScore(result: BookSearchResult, query: string): number {
  const normalizedQuery = canonical(query);
  const title = canonical(result.title);
  const author = canonical(result.author);
  const haystack = `${title} ${author}`.trim();
  const tokens = normalizedQuery.split(" ").filter((token) => token.length > 1);
  let score = 0;
  if (title === normalizedQuery) score += 120;
  if (haystack === normalizedQuery) score += 80;
  if (haystack.includes(normalizedQuery)) score += 55;
  if (normalizedQuery.startsWith(`${title} `)) score += 35;
  if (title.startsWith(normalizedQuery)) score += 25;
  score += tokens.filter((token) => haystack.includes(token)).length * 8;
  if (tokens.length > 0 && tokens.every((token) => haystack.includes(token))) score += 30;
  if (result.coverUrl) score += 4;
  if (result.description) score += 2;
  score += ({
    "Google Books": 10,
    "Open Library": 9,
    Crossref: 5,
    "Project Gutenberg": 4,
    "Internet Archive": 3,
    "Library of Congress": 2,
  } as Record<string, number>)[result.source] ?? 0;
  return score;
}

function dedupe(resultsBySource: BookSearchResult[][], query: string): BookSearchResult[] {
  const merged = new Map<string, BookSearchResult>();
  const interleaved: BookSearchResult[] = [];
  const longest = Math.max(0, ...resultsBySource.map((results) => results.length));
  for (let index = 0; index < longest; index++) {
    for (const results of resultsBySource) {
      if (results[index]) interleaved.push(results[index]);
    }
  }

  for (const result of interleaved) {
    const key = `${canonical(result.title)}|${canonical(result.author).split(" ").slice(-2).join(" ")}`;
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, { ...result });
      continue;
    }
    existing.coverUrl ??= result.coverUrl;
    existing.description ??= result.description;
    existing.year ??= result.year;
    existing.sourceUrl ??= result.sourceUrl;
    for (const source of result.sources) {
      if (!existing.sources.includes(source)) existing.sources.push(source);
    }
  }

  return [...merged.values()]
    .map((result, index) => ({ result, index, score: relevanceScore(result, query) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ result }) => result)
    .slice(0, 20);
}

export async function searchBooks(query: string): Promise<BookSearchResponse> {
  const cacheKey = canonical(query);
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.response;

  const providers = [
    ["Google Books", searchGoogle],
    ["Open Library", searchOpenLibrary],
    ["Crossref", searchCrossref],
    ["Library of Congress", searchLibraryOfCongress],
    ["Internet Archive", searchInternetArchive],
    ["Project Gutenberg", searchGutenberg],
  ] as const;
  const settled = await Promise.allSettled(providers.map(([, search]) => search(query)));
  const resultsBySource: BookSearchResult[][] = [];
  const sources: string[] = [];
  settled.forEach((result, index) => {
    if (result.status === "fulfilled") {
      sources.push(providers[index][0]);
      resultsBySource.push(result.value);
    }
  });

  const response = { results: dedupe(resultsBySource, query), sources };
  if (cache.size >= SEARCH_CACHE_MAX) cache.delete(cache.keys().next().value as string);
  cache.set(cacheKey, { response, expiresAt: Date.now() + SEARCH_CACHE_MS });
  return response;
}
