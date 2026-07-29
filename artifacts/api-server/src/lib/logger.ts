/* Structured logging for Cloudflare Workers.
 *
 * Replaces pino. pino cannot run here: esbuild-plugin-pino emitted a separate
 * thread-stream worker that depends on node:worker_threads, which the Workers
 * runtime does not implement. Workers Logs ingests whatever is written to
 * console as JSON and indexes the fields, so a plain console writer gives the
 * same queryable output with no transport machinery.
 *
 * The call signature is unchanged from pino — logger.error({ err }, "message") —
 * so route code did not need editing.
 */

type Fields = Record<string, unknown>;

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 } as const;
type Level = keyof typeof LEVELS;

const MIN_LEVEL: number =
  LEVELS[(process.env.LOG_LEVEL as Level) ?? "info"] ?? LEVELS.info;

/** Mirrors pino's redact list — these must never reach the log sink. */
const REDACT = new Set(["authorization", "cookie", "set-cookie", "token", "password"]);

function replacer(key: string, value: unknown): unknown {
  if (REDACT.has(key.toLowerCase())) return "[Redacted]";
  // Errors are not JSON-serializable by default; keep name/message/stack.
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

function emit(level: Level, fields: Fields | string, msg?: string): void {
  if (LEVELS[level] < MIN_LEVEL) return;

  const hasFields = typeof fields === "object" && fields !== null;
  const record = {
    level,
    time: new Date().toISOString(),
    msg: hasFields ? msg : (fields as string),
    ...(hasFields ? (fields as Fields) : {}),
  };

  let line: string;
  try {
    line = JSON.stringify(record, replacer);
  } catch {
    // Circular structure — fall back to something still useful.
    line = JSON.stringify({ level, time: record.time, msg: record.msg });
  }

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (fields: Fields | string, msg?: string) => emit("debug", fields, msg),
  info: (fields: Fields | string, msg?: string) => emit("info", fields, msg),
  warn: (fields: Fields | string, msg?: string) => emit("warn", fields, msg),
  error: (fields: Fields | string, msg?: string) => emit("error", fields, msg),
};
