import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { StandaloneNav } from "./StandaloneNav";
import { MiniAudio } from "../components/hud/MiniAudio";
import { ScrollToTop } from "../components/hud/ScrollToTop";
import { useStandaloneScroll } from "../hooks/useStandaloneScroll";
import { trackEvent } from "../lib/analytics";
import { shouldLoadFoglampMap } from "../lib/foglampEmbed";
import "../cli-page.css";

/* ── Content ────────────────────────────────────────────────────────────── */

type OsKey = "windows" | "unix";

const INSTALL: Record<
  OsKey,
  { label: string; badge: string; cmd: string; hint: string; prompt: string }
> = {
  windows: {
    label: "Windows",
    badge: "PS",
    cmd: "irm https://raw.githubusercontent.com/nuroctane/nur-cli/main/install.ps1 | iex",
    hint: "PowerShell · builds + PATH + full stack",
    prompt: "PS>",
  },
  unix: {
    label: "macOS / Linux",
    badge: "SH",
    cmd: "curl -fsSL https://raw.githubusercontent.com/nuroctane/nur-cli/main/install.sh | bash",
    hint: "Terminal · builds from source + full stack",
    prompt: "$",
  },
};

const BINARY = {
  href: "https://github.com/nuroctane/nur-cli/releases/latest/download/nur-windows-x86_64.exe",
  releases: "https://github.com/nuroctane/nur-cli/releases/latest",
  name: "nur-windows-x86_64.exe",
};

const FOGLAMP_SCAN_URL = "https://www.foglamp.dev/scan/nurcli-oxpatc";
const FOGLAMP_PREVIEW_URL = `${FOGLAMP_SCAN_URL}/opengraph-image`;
const FOGLAMP_DESKTOP_QUERY = "(min-width: 721px)";

const AFTER = [
  {
    cmd: "nur auth login",
    note: "key → ~/.nur/auth.json  (or set NUR_API_KEY)",
  },
  { cmd: "nur", note: "open the gold TUI" },
  { cmd: "nur doctor", note: "health check" },
];

const NAV = [
  { id: "efficiency", label: "Token path" },
  { id: "memory", label: "Memory" },
  { id: "install", label: "Install" },
  { id: "demo", label: "Map" },
  { id: "features", label: "Surface" },
  { id: "commands", label: "Commands" },
  { id: "inspirations", label: "Credits" },
] as const;

const TOKEN_PATH = [
  {
    id: "01",
    label: "ASSEMBLE",
    title: "Load only the working state",
    body: "Project rules, the selected skill, compact memory snapshots, dialogue, and tool schemas become one inspectable request.",
    meta: "local · before inference",
  },
  {
    id: "02",
    label: "PRUNE",
    title: "Remove context that stopped earning rent",
    body: "Duplicate reads are superseded, useless results are dropped, and large bodies become pointers instead of permanent prompt bulk.",
    meta: "Headroom · spill · context store",
  },
  {
    id: "03",
    label: "ROUTE",
    title: "Translate once for the active backend",
    body: "Responses, Chat Completions, Anthropic Messages, native Gemini, Cursor Agent, and local servers share one agent loop.",
    meta: "62 catalog routes",
  },
  {
    id: "04",
    label: "INFER",
    title: "The provider does the expensive work",
    body: "Nur sends the full current round, streams output back, and keeps provider storage disabled where the protocol supports it.",
    meta: "store=false · stream · cancel",
  },
  {
    id: "05",
    label: "METER",
    title: "Record what the backend reports",
    body: "Input, output, reasoning, cached tokens, serving route, and list-price estimates land in session status, usage JSONL, and receipts.",
    meta: "observed usage · not an invoice",
  },
  {
    id: "06",
    label: "CONTINUE",
    title: "Compact before the window becomes the failure",
    body: "Reserve-based compaction keeps the recent working edge while durable memory, backups, and exact spilled results stay local.",
    meta: "summary · recent tail · deep state",
  },
] as const;

const EFFICIENCY_SIGNALS = [
  {
    value: "ON",
    label: "Headroom default",
    body: "Successful tool results are compressed inline when headroom-ai is present.",
  },
  {
    value: "12K",
    label: "default inline ceiling",
    body: "Oversized tool output spills to disk and returns as a compact recoverable pointer.",
  },
  {
    value: "15%",
    label: "large-window reserve",
    body: "Auto-compaction protects response and tool room instead of filling the last token.",
  },
  {
    value: "0",
    label: "provider storage request",
    body: "The internal request asks supported backends not to retain a server-side response object.",
  },
] as const;

const MEMORY_LAYERS = [
  {
    code: "L0",
    title: "Live turn",
    path: "session.input_items",
    body: "Current dialogue, tool calls, results, and the working tail sent to inference.",
    mode: "PAID INPUT",
  },
  {
    code: "L1",
    title: "Context store",
    path: "~/.nur/context-store/",
    body: "Large exact documents and tool results stay addressable through peek, slice, and search.",
    mode: "LOCAL POINTER",
  },
  {
    code: "L2",
    title: "Session ledger",
    path: "~/.nur/sessions/",
    body: "Resumable transcript, usage aggregate, JSON backup, and pre-compaction snapshot.",
    mode: "LOCAL DURABLE",
  },
  {
    code: "L3",
    title: "Routed memory",
    path: "~/.nur/native-memory/",
    body: "Hierarchical entries, vectors, and graph relations retrieved through one central memory router.",
    mode: "LOCAL INDEXED",
  },
  {
    code: "L4",
    title: "Permanent memory",
    path: "~/.optmem · ~/.plur",
    body: "Weighted long-term memory and engrams survive session, model, provider, and compaction changes.",
    mode: "LOCAL EXTERNAL",
  },
  {
    code: "L5",
    title: "Audit trail",
    path: "~/.nur/usage.jsonl · receipts/",
    body: "Observed provider usage and hash-chained request/tool evidence remain inspectable after the turn.",
    mode: "LOCAL APPEND",
  },
] as const;

type FeatureTab = {
  id: string;
  label: string;
  blurb: string;
  body: ReactNode;
};

const FEATURE_TABS: FeatureTab[] = [
  {
    id: "harness",
    label: "Harness",
    blurb: "Modes, providers, budgets, resume.",
    body: (
      <ul className="cli-feat-list">
        <li>
          <strong>Multi-provider</strong> via <code>/login</code> — 62 (OpenAI,
          Anthropic, Gemini, xAI, Groq, OpenRouter, Ollama, Meta Model API,
          Cursor, OpenCode Zen/Go, …)
        </li>
        <li>
          <strong>Signed into the vendor CLI = signed into nur</strong> — Claude
          Code, Codex, Grok, Kimi, Cursor, OpenCode, Antigravity/gcloud sessions
          are imported automatically, and refreshed when stale. No key to paste.
        </li>
        <li>
          <strong>OMP as universal credential fallback</strong> — saved nur
          keys/sessions always win first; only then vendor CLI, then Oh My Pi
          via <code>omp token &lt;provider&gt;</code> (
          <code>~/.omp/agent/agent.db</code>). Successful OMP imports are saved
          so the next resolve skips the shell-out. Same path feeds{" "}
          <code>/failover</code>, cross-provider subagents, and t3-style probes.
        </li>
        <li>
          <strong>Token-saving by default</strong> — <strong>Headroom</strong>{" "}
          inline tool-result compress · OptMem · OMP-style supersedeReads +
          dropUseless · contextPromotion · optional <code>/prewalk</code>{" "}
          (strong plans → smol at first edit) · optional remote compact endpoint
          · Anthropic prompt-cache · economy <code>omp</code> onto smol roles
        </li>
        <li>
          <strong>Cursor as a first-class provider</strong> —{" "}
          <code>cursor-agent login</code> (no pasted API key). Chat runs through{" "}
          <code>cursor-agent -p</code>; nur keeps the tool loop, approvals, plan
          mode, and cross-provider subagents. Optional{" "}
          <code>NUR_CURSOR_NATIVE=1</code> for full Cursor Agent delegate.
        </li>
        <li>
          <strong>OpenCode Zen + Go</strong> — live model lists from both
          gateways; Go ids as <code>opencode-go/…</code>;{" "}
          <code>opencode auth login</code> / <code>OPENCODE_API_KEY</code> /{" "}
          <code>auth.json</code>.
        </li>
        <li>
          Permission modes: <strong>manual</strong> / <strong>plan</strong> /{" "}
          <strong>auto</strong> · Shift+Tab mid-turn
        </li>
        <li>
          Tool loop · approvals · Esc cancel · subagents · todos · plan mode ·{" "}
          <code>bg</code> for long jobs off the turn
        </li>
        <li>
          <strong>Cross-provider subagents</strong> — the <code>agent</code>{" "}
          tool takes an optional <code>provider</code> (and optional{" "}
          <code>model</code>), so a child can run on a different provider than
          the parent. Natural-language aliases resolve: claude / sonnet / opus →
          anthropic, grok → xai, gemini / flash / pro → google, cursor → cursor,{" "}
          <code>antigravity</code> stays its own provider.
        </li>
        <li>
          A routed subagent uses <strong>that provider&apos;s</strong> stored
          credentials, and auto-imports a logged-in vendor CLI or OMP session
          when there is no key on disk. No credentials at all → the spawn is{" "}
          <strong>blocked</strong>, never silently re-run on the parent:{" "}
          <code>/login</code> opens pre-selected to that provider, and after
          sign-in nur injects the exact re-deploy call.
        </li>
        <li>
          <strong>Fan-out</strong> — several <code>agent</code> calls in one
          response run concurrently, <strong>up to 4 at a time</strong>; the
          rest queue behind the cap
        </li>
        <li>
          <code>/swarm</code> subagent grid <strong>auto-surfaces</strong> the
          moment a subagent spawns, and every pane names the provider that child
          ran on — <code>hide</code> dismisses it for the turn, <code>off</code>{" "}
          freezes, <code>clear</code> drops finished runs, <code>detail</code>{" "}
          adds the status row
        </li>
        <li>
          Session budgets · tool-result spill · smarter auto-compact · live{" "}
          <code>/theme</code>
        </li>
        <li>
          <code>/model</code> live model list · <code>/plugins</code>{" "}
          marketplace · <code>/fusion</code> multi-model debate
        </li>
        <li>
          <code>/local</code> bundled llama.cpp · <code>/bench</code> worktree
          benchmarks (<code>/bench optimize</code> = GEPA) ·{" "}
          <code>nur gateway</code> Telegram bot
        </li>
        <li>
          Natural-language + slash skill activation — /skill-name or plain
          phrases · <code>/factory-overnight</code> (Fractal-first, Unix
          preferred)
        </li>
        <li>Take over other agents: Claude · Codex · Cursor · Grok</li>
        <li>
          <strong>takeover</strong> <code>/takeover</code> ·{" "}
          <code>/hijack</code> — migrate a Claude/Codex/Cursor/Grok session into
          nur & resume it; press <code>c</code> to switch between the sessions
          and takeover windows
        </li>
      </ul>
    ),
  },
  {
    id: "tools",
    label: "Tools",
    blurb: "Read, edit, shell, web, browsers, git.",
    body: (
      <ul className="cli-feat-list">
        <li>
          <strong>read</strong> — <code>read_file</code> · <code>list_dir</code>{" "}
          · <code>grep</code> · <code>glob</code>
        </li>
        <li>
          <strong>edit</strong> — <code>write_file</code> ·{" "}
          <code>edit_file</code> · <code>multi_edit</code> ·{" "}
          <code>apply_patch</code>
        </li>
        <li>
          <strong>shell</strong> — <code>bash</code> (sandboxed)
        </li>
        <li>
          <strong>vision</strong> — <code>look</code> ·{" "}
          <code>extract_frames</code> (sparse keyframes, not spam)
        </li>
        <li>
          <strong>web</strong> — <code>web_search</code> ·{" "}
          <code>web_fetch</code>
        </li>
        <li>
          <strong>browser</strong> — real default browser via agent-browser-cli
        </li>
        <li>
          <strong>terminal-browser</strong> —{" "}
          <a href="https://terminal-browser.com/">terminal-browser.com</a>{" "}
          in-terminal Chromium (<code>terminal_browser</code> · <code>/tb</code>
          ); Windows host fallback via agent-browser-cli
        </li>
        <li>
          <strong>git</strong> — <code>git_status</code> · <code>git_diff</code>
        </li>
        <li>
          <strong>knowledge</strong> — <code>graphify</code> ·{" "}
          <code>graphjin</code> · <code>plur</code> · <code>ruflo</code> ·{" "}
          <code>executor</code> · <code>skill</code> · <code>memory</code> ·{" "}
          <code>headroom</code> · <code>optmem</code>
        </li>
        <li>
          <strong>diagrams</strong> — <code>excalidraw</code> ·{" "}
          <code>tldraw</code> · <code>/diagram</code> router (architecture →
          Excalidraw · offline → tldraw · ink/math → penecho)
        </li>
        <li>
          <strong>delegation</strong> — <code>agent</code> (optional{" "}
          <code>provider</code> / <code>model</code>, up to 4 concurrent) ·{" "}
          <code>omp</code> (economy/balanced · Oh My Pi + <code>omp token</code>{" "}
          bridge) · <code>fractal</code> · <code>penecho</code> ·{" "}
          <code>t3code</code> · <code>akarso</code> · <code>bg</code>
        </li>
        <li>
          <strong>egaki</strong> — image / video / speech CLI (
          <code>/egaki</code> · <code>/image</code>) · ChatGPT, xAI OAuth, Egaki
          plan, or BYOK
        </li>
        <li>
          <strong>plan</strong> — <code>todo_write</code> ·{" "}
          <code>submit_plan</code>
        </li>
      </ul>
    ),
  },
  {
    id: "vision",
    label: "Vision",
    blurb: "Images, video, design-from-ref.",
    body: (
      <ul className="cli-feat-list">
        <li>
          <code>look</code> — attach workspace images or short video so the
          model sees them
        </li>
        <li>
          <code>extract_frames</code> — sparse keyframes via ffmpeg →{" "}
          <code>.nur/frames/</code>
        </li>
        <li>Media paths in prompts auto-attach when the file exists</li>
        <li>
          Design-from-video workflow: frames → inspect → design tokens →
          implement
        </li>
        <li>
          mp4 under ~20&nbsp;MB can go direct; longer clips prefer sparse frames
        </li>
      </ul>
    ),
  },
  {
    id: "ecosystem",
    label: "Ecosystem",
    blurb: "Graph, memory, plugins, skills as /name.",
    body: (
      <ul className="cli-feat-list">
        <li>
          <strong>Graphify</strong> — code knowledge graph
        </li>
        <li>
          <strong>GraphJin</strong> — governed live data via the{" "}
          <code>graphjin</code> tool · <code>/graphjin</code> (<code>/gj</code>)
          catalog · schema · explain · query · security · ask ·{" "}
          <em>detect-only</em>, nur never installs it for you
        </li>
        <li>
          <strong>PLUR</strong> — shared engram memory across tools/sessions
        </li>
        <li>
          <strong>Ruflo</strong> — vector memory + swarm helpers
        </li>
        <li>
          <strong>Executor</strong> — MCP / OpenAPI gateway
        </li>
        <li>
          <strong>omp</strong> — Oh My Pi coding-agent backend + universal{" "}
          <code>omp token</code> auth fallback for every provider
        </li>
        <li>
          <strong>Headroom</strong> — inline tool-result compress{" "}
          <em>on by default</em> (<code>headroom</code> · <code>/headroom</code>
          )
        </li>
        <li>
          <strong>OptMem</strong> — permanent memory at <code>~/.optmem</code> (
          <code>optmem</code> · <code>/optmem</code> · <code>/memo</code>: wake
          · note · nap · recall · doctor)
        </li>
        <li>
          <strong>egaki</strong> — image / video / speech (<code>/egaki</code> ·{" "}
          <code>/image</code>) · <code>egaki login --provider chatgpt</code> /
          xai-oauth / plan / BYOK
        </li>
        <li>
          <strong>fractal</strong> — recursive agent trees in git worktrees via{" "}
          <code>/fractal</code> · <em>Unix only</em> (use WSL or Linux/macOS; no
          Windows native) · Python 3.12–3.14,{" "}
          <code>pipx install plasma-fractal</code>
        </li>
        <li>
          <strong>factory-overnight</strong> — Fractal-first overnight factory
          from <code>HANDOFF.md</code> (<code>/factory-overnight</code>, Unix
          preferred)
        </li>
        <li>
          <strong>penecho</strong> — infinite-canvas sidecar bridged from nur
          auth (<code>/penecho</code>)
        </li>
        <li>
          <strong>t3code</strong> — vendor-CLI auth delegation: driver probing,
          env isolation, pairing tokens
        </li>
        <li>
          <strong>terminal-browser</strong> — ecosystem-wired Chromium for the
          TUI (<code>/tb</code> · <code>/terminal-browser</code>)
        </li>
        <li>
          <strong>bg</strong> — long-running jobs off the agent turn (
          <code>bg</code> tool · <code>/bg</code>)
        </li>
        <li>
          <strong>Plugins</strong> — Superpowers, Vercel, Firecrawl, Fable,
          Chrome DevTools, …
        </li>
        <li>
          <strong>AKM</strong> — skill package manager · 800+ cybersecurity /
          design packs
        </li>
        <li>
          <strong>Cua</strong> — full-desktop computer-use driver
        </li>
      </ul>
    ),
  },
  {
    id: "tui",
    label: "TUI",
    blurb: "Gold transcript, peeks, keys.",
    body: (
      <ul className="cli-feat-list">
        <li>
          Nur-gold streaming transcript · thought / tool cards · duration chips
        </li>
        <li>
          <strong>Queued follow-ups</strong> with send-now ·{" "}
          <strong>green/red edit diffs</strong> in the transcript
        </li>
        <li>
          <strong>Prompt menu</strong> (right-click): fork · edit · revert ·
          copy
        </li>
        <li>Peek · drag-select · scrollbar · sticky prompt</li>
        <li>Ctrl+A / C / V / X · reverse-search prompt history (Ctrl+R)</li>
        <li>
          Approval mini-diff · y / a / n · sessions browser ·{" "}
          <code>/theme</code> live color themes
        </li>
        <li>
          <code>/sidegraph</code> — right-panel live node-graph of the current
          query (parallel subagents fan out and rejoin; steers draw back-edges).
          Pan / zoom where supported, drag the border to resize, right-click a
          node to peek · <code>on</code> | <code>off</code> | <code>hide</code>
        </li>
        <li>
          <code>/swarm</code> panes are <strong>click-to-peek</strong> — the
          modal lists that child&apos;s tool trace, each entry unfolds in place
          to full args + output, <code>c</code> copies one entry, Ctrl+C copies
          the lot, <code>e</code> expands the modal
        </li>
        <li>
          <strong>Ghost-cell recovery</strong> — full terminal clear on resize,
          focus regain, sidegraph open/close, peek close, theme change, and
          returning from foreground children (ConPTY-safe)
        </li>
        <li>
          Command palette spans the full window width — widen the terminal, read
          more of every tip
        </li>
        <li>Splash: NUR logotype + active provider · lean banner</li>
      </ul>
    ),
  },
  {
    id: "reliability",
    label: "Hardening",
    blurb: "Secrets, sandbox, doctor.",
    body: (
      <ul className="cli-feat-list">
        <li>
          Secrets only in <code>~/.nur/auth.json</code> (or env) — never in the
          repo
        </li>
        <li>
          Atomic writes under <code>~/.nur/</code> · session + compaction
          backups
        </li>
        <li>Sandbox · denylist · SSRF blocks · permissions / hooks TOML</li>
        <li>
          API retries · install SHA-256 · <code>nur doctor</code>
        </li>
        <li>
          <strong>Auto-update</strong> — nur checks GitHub Releases on launch
          (off the render thread, never blocking startup) and self-installs a
          newer build. <code>nur update</code> forces the check now; opt out
          with <code>auto_update = false</code> in config or{" "}
          <code>NUR_SKIP_AUTO_UPDATE=1</code>.
        </li>
        <li>
          <strong>Long runs stay alive</strong> — the real context window is
          read from the model catalog, auto-compaction runs as often as a run
          needs (and carries the in-flight work across), and streaming retries
          with backoff instead of dying on one 429
        </li>
        <li>
          <strong>No hidden turn caps</strong> — subagents inherit the parent
          budget verbatim
        </li>
        <li>
          Logs: <code>~/.nur/nur.log</code>
        </li>
      </ul>
    ),
  },
];

const SLASH_COMMANDS: { cmd: string; desc: string }[] = [
  { cmd: "/help", desc: "commands + keyboard shortcuts" },
  { cmd: "/commands", desc: "commands + keyboard shortcuts  (alias of /help)" },
  {
    cmd: "/login",
    desc: "provider · API key, browser, or CLI import (Claude/Codex/Cursor/OpenCode/OMP) - /login <provider> pre-selects",
  },
  {
    cmd: "/logout",
    desc: "sign out the active provider - clears auth.json + that provider's per-provider key/session copies",
  },
  { cmd: "/model", desc: "show and switch models for the active provider" },
  { cmd: "/models", desc: "show and switch models  (alias of /model)" },
  { cmd: "/plugins", desc: "browse · install · enable marketplace plugins" },
  {
    cmd: "/plugin",
    desc: "browse · install · enable marketplace plugins  (alias of /plugins)",
  },
  { cmd: "/mode", desc: "permission: manual | plan | auto  (or Shift+Tab)" },
  { cmd: "/plan", desc: "switch to plan mode (read-only explore)" },
  { cmd: "/manual", desc: "switch to manual mode (approve writes/shell)" },
  { cmd: "/auto", desc: "switch to auto-approve mode" },
  { cmd: "/compact", desc: "summarize conversation, free context" },
  { cmd: "/clear", desc: "clear the transcript display" },
  { cmd: "/new", desc: "start a fresh session" },
  { cmd: "/cd", desc: "change working directory (tools sandbox here)" },
  { cmd: "/pwd", desc: "print the current working directory" },
  { cmd: "/theme", desc: "choose a live color theme (/theme <name>)" },
  {
    cmd: "/sessions",
    desc: "browse & open past sessions — press c to switch to takeover",
  },
  { cmd: "/resume", desc: "browse & open past sessions (alias of /sessions)" },
  {
    cmd: "/takeover",
    desc: "import a Claude/Codex/Cursor/Grok session & resume it — all workspaces, tab to narrow, c to switch to sessions",
  },
  {
    cmd: "/hijack",
    desc: "take over a foreign agent session (alias of /takeover)",
  },
  {
    cmd: "/optmem",
    desc: "OptMem permanent memory (~/.optmem): wake | note | nap | recall | doctor",
  },
  { cmd: "/memo", desc: "OptMem permanent memory  (alias of /optmem)" },
  {
    cmd: "/headroom",
    desc: "context compression doctor — inline tool-result compress on by default",
  },
  {
    cmd: "/prewalk",
    desc: "OMP-style: strong model plans, then smol at first edit - on|off|status|into <model>|reset",
  },
  {
    cmd: "/egaki",
    desc: "image / video / speech via egaki — login --provider chatgpt | xai-oauth | plan | BYOK",
  },
  { cmd: "/image", desc: "egaki image gen  (alias of /egaki)" },
  {
    cmd: "/bg",
    desc: "background jobs: list | <id> result | cancel | run <cmd>",
  },
  { cmd: "/jobs", desc: "background jobs  (alias of /bg)" },
  { cmd: "/excalidraw", desc: "hand-drawn publishable diagrams" },
  {
    cmd: "/diagram",
    desc: "router: architecture→excalidraw · offline→tldraw · ink/math→penecho",
  },
  { cmd: "/how-to-illustrate", desc: "diagram-type + tool router" },
  {
    cmd: "/illustrate",
    desc: "diagram-type + tool router  (alias of /how-to-illustrate)",
  },
  {
    cmd: "/factory-overnight",
    desc: "fractal-first overnight factory from HANDOFF.md (Unix preferred)",
  },
  {
    cmd: "/akarso",
    desc: "post/schedule/reply across 14 social platforms (native akarso tool)",
  },
  {
    cmd: "/openseo",
    desc: "SEO research/audits via OpenSEO MCP (open-source Semrush/Ahrefs alt)",
  },
  {
    cmd: "/dialkit",
    desc: "live-tune interface parameters — dials/sliders across React/Svelte/Vue/Solid",
  },
  { cmd: "/budget", desc: "session spend ceiling" },
  { cmd: "/poor", desc: "cost-saver lean prompt" },
  { cmd: "/usage", desc: "token usage + cost for this session" },
  {
    cmd: "/cost",
    desc: "token usage + cost for this session  (alias of /usage)",
  },
  { cmd: "/context", desc: "context-window utilization" },
  { cmd: "/status", desc: "session snapshot: model · mode · cwd · tokens" },
  { cmd: "/doctor", desc: "health check: version · auth · ecosystem · shell" },
  { cmd: "/effort", desc: "reasoning effort: minimal → xhigh" },
  { cmd: "/turns", desc: "per-session agent-turn ceiling (0 = unlimited)" },
  { cmd: "/fusion", desc: "multi-model debate → one synthesized answer" },
  { cmd: "/local", desc: "run a model locally via bundled llama.cpp" },
  {
    cmd: "/bench",
    desc: "benchmark models on your tasks: add | list | run <name> [models] | remove | optimize (GEPA)",
  },
  {
    cmd: "/failover",
    desc: "cross-provider failover + privacy tiers · keys via env, /login, vendor CLI, or omp token",
  },
  { cmd: "/undo", desc: "revert the last file edit this session" },
  { cmd: "/receipt", desc: "session receipt — hash-chained verification" },
  { cmd: "/cua", desc: "computer-use desktop driver on / off / status" },
  { cmd: "/graph", desc: "inline live execution-graph card for the turn" },
  {
    cmd: "/sidegraph",
    desc: "right-panel live node-graph — fan-out, steers, peek · on | off | hide",
  },
  {
    cmd: "/swarm",
    desc: "inline subagent grid — auto-surfaces when a subagent spawns, each pane names the provider · detail | hide | off | clear",
  },
  { cmd: "/subagents", desc: "inline subagent grid  (alias of /swarm)" },
  { cmd: "/agents", desc: "inline subagent grid  (alias of /swarm)" },
  {
    cmd: "/fractal",
    desc: "recursive agent tree in git worktrees — Unix only (use WSL on Windows)",
  },
  {
    cmd: "/penecho",
    desc: "penecho infinite canvas — ink · MathJax · plots · animations",
  },
  { cmd: "/pen", desc: "penecho canvas  (alias of /penecho)" },
  { cmd: "/drawings", desc: "penecho canvas  (alias of /penecho)" },
  {
    cmd: "/t3code",
    desc: "vendor-CLI auth delegation — driver probing · delegate · pairing tokens",
  },
  {
    cmd: "/tb",
    desc: "terminal-browser: open | ls | action | setup (Windows host fallback via agent-browser-cli)",
  },
  { cmd: "/terminal-browser", desc: "terminal-browser  (alias of /tb)" },
  { cmd: "/draw", desc: "open / build interactive tldraw offline boards" },
  { cmd: "/steer", desc: "inject a message into the running turn (no cancel)" },
  { cmd: "/scan", desc: "map the codebase → shareable foglamp scan" },
  { cmd: "/goal", desc: "set a standing session goal" },
  { cmd: "/btw", desc: "one-off note on the next message" },
  { cmd: "/bro", desc: "chill mode: plain words, straight answers (toggle)" },
  { cmd: "/codesearch", desc: "fast ripgrep over the workspace" },
  {
    cmd: "/cs",
    desc: "fast ripgrep over the workspace  (alias of /codesearch)",
  },
  { cmd: "/mc", desc: "manage MCP servers via Executor" },
  { cmd: "/mcp", desc: "manage MCP servers via Executor  (alias of /mc)" },
  { cmd: "/skills", desc: "list installed skills (also /name for any skill)" },
  {
    cmd: "/adhd",
    desc: "sticky ADHD-friendly output for this session (toggle)",
  },
  {
    cmd: "/site-cli",
    desc: "skill: HAR capture → derived site API client/CLI",
  },
  { cmd: "/fable-method", desc: "skill: Fable think-act-prove loop" },
  { cmd: "/fable-loop", desc: "skill: orchestrated Fable multi-step loop" },
  {
    cmd: "/fable-judge",
    desc: "skill: adversarial verification of finished work",
  },
  { cmd: "/tech-spec", desc: "skill: typed call-stack architecture handoff" },
  { cmd: "/design-eng", desc: "skill: Emil design-eng UI/motion craft" },
  {
    cmd: "/skeuo",
    desc: "skill: dark skeuomorphic UI — knobs, sliders, tactile depth (/skeuomorphic-ui)",
  },
  { cmd: "/test-driven-development", desc: "skill: TDD red-green-refactor" },
  { cmd: "/systematic-debugging", desc: "skill: root-cause-first debugging" },
  {
    cmd: "/<skill>",
    desc: "any installed skill — sticky toggle or /skill <prompt> one-shot",
  },
  { cmd: "/memory", desc: "show ~/.nur/memory.md excerpt" },
  {
    cmd: "/graphify",
    desc: "knowledge graph status / query / path / explain / extract",
  },
  {
    cmd: "/graphjin",
    desc: "governed live data: catalog | schema | explain | query | security | ask",
  },
  { cmd: "/gj", desc: "governed live data  (alias of /graphjin)" },
  { cmd: "/plur", desc: "shared engram memory" },
  { cmd: "/ruflo", desc: "vector memory / swarm" },
  { cmd: "/ecosystem", desc: "ecosystem readiness" },
  { cmd: "/todos", desc: "show session task list" },
  { cmd: "/init", desc: "generate a NUR.md project guide" },
  { cmd: "/config", desc: "show config + data paths" },
  { cmd: "/permissions", desc: "show or reload allow/deny/ask rules" },
  { cmd: "/hooks", desc: "show local tool hook status" },
  { cmd: "/feedback", desc: "file a GitHub issue from here" },
  { cmd: "/bug", desc: "report an issue (GitHub link)" },
  { cmd: "/tips", desc: "mouse + keyboard interaction tips" },
  { cmd: "/exit", desc: "quit" },
  { cmd: "/quit", desc: "quit  (alias of /exit)" },
];

const CLI_SUBCOMMANDS: { cmd: string; desc: string }[] = [
  { cmd: "nur", desc: "open interactive gold TUI" },
  { cmd: 'nur "prompt"', desc: "start with a prompt" },
  { cmd: "nur -c", desc: "continue last session in this directory" },
  { cmd: "nur -r <id>", desc: "resume a specific session" },
  { cmd: 'nur run "…" -y', desc: "headless + auto-approve" },
  { cmd: "nur --mode plan", desc: "plan mode from the shell" },
  { cmd: "nur --continuous", desc: "sovereign loop until DONE" },
  { cmd: "nur auth login", desc: "store API key locally" },
  { cmd: "nur auth status", desc: "auth status (never prints the full key)" },
  { cmd: "nur auth logout", desc: "remove the saved key / OAuth session" },
  { cmd: "nur install", desc: "one-stop stack install / repair" },
  {
    cmd: "nur update",
    desc: "force the update now - GitHub release, else git pull + rebuild + reinstall",
  },
  {
    cmd: "nur update --check",
    desc: "dry-run: report whether a newer release is available",
  },
  { cmd: "nur doctor", desc: "health check" },
  { cmd: "nur ecosystem ensure", desc: "install / repair knowledge packs" },
  {
    cmd: "nur ecosystem status",
    desc: "ecosystem readiness without touching anything",
  },
  {
    cmd: "nur plugins",
    desc: "marketplace from the shell - list | install | enable | disable | uninstall",
  },
  { cmd: "nur sessions", desc: "list sessions" },
  { cmd: "nur usage", desc: "usage log" },
  { cmd: "nur gateway", desc: "Telegram bot mode" },
  {
    cmd: "nur local",
    desc: "local llama.cpp server control - up | down | status | models",
  },
  {
    cmd: "nur bench",
    desc: "benchmark harness - add | list | run | remove | optimize (GEPA)",
  },
  { cmd: "nur browser setup", desc: "stage browser extension once" },
  { cmd: "nur browser status", desc: "browser toolchain readiness" },
  {
    cmd: "nur install-hook",
    desc: "install the Orca agent hook for usage/status reporting",
  },
];

type Inspiration = {
  name: string;
  href: string;
  why: string;
  group: "agents" | "research" | "libs" | "stack" | "plugins";
};

const INSPIRATIONS: Inspiration[] = [
  {
    group: "agents",
    name: "Claude Code",
    href: "https://docs.anthropic.com/en/docs/claude-code",
    why: "permission modes · Shift+Tab · skills shape · todos · subagents · session resume patterns",
  },
  {
    group: "agents",
    name: "OpenAI Codex CLI",
    href: "https://github.com/openai/codex",
    why: "CLI agent ergonomics · plan/auto practice · resume-codex bridge",
  },
  {
    group: "agents",
    name: "Cursor",
    href: "https://cursor.com",
    why: "cursor-agent CLI provider · /login without API key · resume-cursor · IDE density",
  },
  {
    group: "agents",
    name: "OpenCode",
    href: "https://opencode.ai",
    why: "Zen + Go gateway · opencode auth login · DCP/context pruning · plugin catalog",
  },
  {
    group: "agents",
    name: "Oh My Pi",
    href: "https://omp.sh",
    why: "omp token credential vault for all providers · economy delegate · supersedeReads / contextPromotion patterns",
  },
  {
    group: "agents",
    name: "Grok CLI",
    href: "https://x.ai",
    why: "resume-grok path · browser sign-in patterns for xAI",
  },
  {
    group: "agents",
    name: "Kimi Code",
    href: "https://www.kimi.com/code/docs/en/",
    why: "browser OAuth + coding-plan models via /login · Moonshot Kimi",
  },
  {
    group: "agents",
    name: "Antigravity",
    href: "https://antigravity.google",
    why: "agy CLI session imported by /login · its own provider id for cross-provider subagents",
  },
  {
    group: "agents",
    name: "chagent",
    href: "https://github.com/SirTenzin/chagent",
    why: "takeover / session migration engine behind /takeover · /hijack",
  },
  {
    group: "agents",
    name: "Orca ADE",
    href: "https://www.onorca.dev/",
    why: "agent host panels · status/usage hooks · OSC state signaling · nur install-hook",
  },
  {
    group: "agents",
    name: "Aider",
    href: "https://aider.chat",
    why: "git-aware coding agent lineage · repo-as-context discipline",
  },
  {
    group: "agents",
    name: "Cline",
    href: "https://github.com/cline/cline",
    why: "tool-loop approval UX · autonomous coding agent patterns",
  },
  {
    group: "agents",
    name: "Continue",
    href: "https://continue.dev",
    why: "open multi-provider agent UX · local model paths",
  },
  {
    group: "agents",
    name: "OpenHands",
    href: "https://github.com/All-Hands-AI/OpenHands",
    why: "agent runtime + sandbox thinking for long-running tasks",
  },
  {
    group: "agents",
    name: "Goose",
    href: "https://github.com/block/goose",
    why: "local-first agent CLI design language",
  },
  {
    group: "agents",
    name: "Windsurf",
    href: "https://windsurf.com",
    why: "flow-state agent IDE patterns in the competitive set",
  },
  {
    group: "agents",
    name: "Devin",
    href: "https://devin.ai",
    why: "autonomous software engineer bar NurCLI aims to rival from the terminal",
  },
  {
    group: "agents",
    name: "Warp",
    href: "https://www.warp.dev",
    why: "modern terminal UX density · AI-native shell expectations",
  },
  {
    group: "agents",
    name: "Zed",
    href: "https://zed.dev",
    why: "fast collaborative editor agent surface in the same era",
  },
  {
    group: "agents",
    name: "Amp",
    href: "https://ampcode.com",
    why: "dense agent harness / tool-card transcript inspiration",
  },
  {
    group: "agents",
    name: "Factory",
    href: "https://factory.ai",
    why: "agentic software delivery product bar",
  },
  {
    group: "agents",
    name: "Roo Code",
    href: "https://github.com/RooCodeInc/Roo-Code",
    why: "open VS Code agent modes + tool approvals",
  },
  {
    group: "agents",
    name: "Kilo Code",
    href: "https://kilocode.com",
    why: "open agent IDE lineage adjacent to Cline/Roo",
  },
  {
    group: "research",
    name: "Prime Agent",
    href: "https://github.com/PrimeIntellect-ai/prime-agent",
    why: "RLM runtime · persistent REPL · continual harness · durable goals · async admission patterns",
  },
  {
    group: "research",
    name: "Recursive Language Models",
    href: "https://arxiv.org/abs/2512.24601",
    why: "prompt-as-variable context control · programmatic inspection beyond a chat window",
  },
  {
    group: "research",
    name: "Shepherd",
    href: "https://github.com/shepherd-agents/shepherd",
    why: "retained outputs · reversible execution traces · review/apply/discard supervision model",
  },
  {
    group: "research",
    name: "Shepherd paper",
    href: "https://arxiv.org/abs/2605.10913",
    why: "programmable meta-agents through reversible agentic execution traces",
  },
  {
    group: "research",
    name: "Anima Connectome",
    href: "https://animalabs.ai/connectome",
    why: "append-only chronicle · hierarchical identity memory · loss of resolution without loss of record",
  },
  {
    group: "research",
    name: "Agent-native memory",
    href: "https://arxiv.org/abs/2606.24775",
    why: "localized consolidation and multi-resolution memory behind native-memory tiers",
  },
  {
    group: "research",
    name: "OpenAI Agents SDK",
    href: "https://openai.github.io/openai-agents-python/",
    why: "portable handoff packets · input/output guardrails · tracing and session patterns",
  },
  {
    group: "research",
    name: "Firecrawl AnyDoc",
    href: "https://github.com/firecrawl/anydoc",
    why: "local Rust document-to-Markdown ingestion before RLM slice/search",
  },
  {
    group: "research",
    name: "AWS Dogwood",
    href: "https://github.com/dogwood-policy/dogwood",
    why: "optional runtime verification policy surface for agent tool calls",
  },
  {
    group: "libs",
    name: "Ratatui",
    href: "https://ratatui.rs",
    why: "the entire Nur-gold TUI — cards, borders, scroll, layout",
  },
  {
    group: "libs",
    name: "crossterm",
    href: "https://github.com/crossterm-rs/crossterm",
    why: "terminal input / rendering backend",
  },
  {
    group: "libs",
    name: "Tokio",
    href: "https://tokio.rs",
    why: "async runtime for tools, streams, and cancel",
  },
  {
    group: "libs",
    name: "reqwest",
    href: "https://github.com/seanmonstar/reqwest",
    why: "HTTP client for every provider adapter",
  },
  {
    group: "libs",
    name: "Serde",
    href: "https://serde.rs",
    why: "config, sessions, auth, tool payloads",
  },
  {
    group: "libs",
    name: "Clap",
    href: "https://github.com/clap-rs/clap",
    why: "CLI surface: subcommands, flags, help",
  },
  {
    group: "libs",
    name: "tui-markdown",
    href: "https://crates.io/crates/tui-markdown",
    why: "markdown rendering inside the transcript",
  },
  {
    group: "libs",
    name: "tui-scrollview",
    href: "https://crates.io/crates/tui-scrollview",
    why: "scrollable transcript viewport",
  },
  {
    group: "libs",
    name: "ratatui-image",
    href: "https://crates.io/crates/ratatui-image",
    why: "inline image peeks (sixel / kitty / iTerm2) — behind the image-peek feature",
  },
  {
    group: "libs",
    name: "unicode-width",
    href: "https://github.com/unicode-rs/unicode-width",
    why: "column-exact TUI layout — wide glyphs, CJK, emoji stay inside their panes",
  },
  {
    group: "libs",
    name: "arboard",
    href: "https://github.com/1Password/arboard",
    why: "system clipboard behind Ctrl+A/C/V/X and drag-select auto-copy",
  },
  {
    group: "libs",
    name: "sha2",
    href: "https://github.com/RustCrypto/hashes",
    why: "install SHA-256 verification · hash-chained /receipt",
  },
  {
    group: "libs",
    name: "tracing",
    href: "https://github.com/tokio-rs/tracing",
    why: "structured logs into ~/.nur/nur.log",
  },
  {
    group: "libs",
    name: "toml",
    href: "https://github.com/toml-rs/toml",
    why: "config · permissions.toml · hooks.toml",
  },
  {
    group: "libs",
    name: "llama.cpp",
    href: "https://github.com/ggerganov/llama.cpp",
    why: "bundled local inference via /local",
  },
  {
    group: "libs",
    name: "ripgrep",
    href: "https://github.com/BurntSushi/ripgrep",
    why: "fast workspace search under the hood — grep / glob shell out to rg when present",
  },
  {
    group: "libs",
    name: "ignore",
    href: "https://crates.io/crates/ignore",
    why: "gitignore-aware parallel walk when no system ripgrep is on PATH",
  },
  {
    group: "libs",
    name: "tree-sitter",
    href: "https://tree-sitter.github.io/tree-sitter/",
    why: "local AST parsing behind Graphify code maps",
  },
  {
    group: "libs",
    name: "FFmpeg",
    href: "https://ffmpeg.org",
    why: "extract_frames sparse keyframe pipeline",
  },
  {
    group: "stack",
    name: "Graphify",
    href: "https://github.com/Graphify-Labs/graphify",
    why: "code knowledge graph — query / path / explain",
  },
  {
    group: "stack",
    name: "GraphJin",
    href: "https://graphjin.com/",
    why: "governed live data behind the graphjin tool + /graphjin — detected, never auto-installed",
  },
  {
    group: "stack",
    name: "PLUR",
    href: "https://plur.ai/",
    why: "shared engram memory across agents & sessions",
  },
  {
    group: "stack",
    name: "Ruflo",
    href: "https://github.com/ruvnet/ruflo",
    why: "vector memory + swarm / hive-mind helpers",
  },
  {
    group: "stack",
    name: "Executor",
    href: "https://executor.sh",
    why: "MCP / OpenAPI gateway catalog",
  },
  {
    group: "stack",
    name: "Akarso",
    href: "https://akarso.co",
    why: "post/schedule across 14 social platforms — native akarso tool + /akarso",
  },
  {
    group: "stack",
    name: "OpenSEO",
    href: "https://openseo.so",
    why: "open-source Semrush/Ahrefs alt — SEO research/audits via MCP + /openseo",
  },
  {
    group: "stack",
    name: "Foglamp Scan",
    href: "https://www.foglamp.dev/scan",
    why: "shareable codebase architecture map via /scan",
  },
  {
    group: "stack",
    name: "tldraw offline",
    href: "https://offline.tldraw.com/",
    why: "local .tldraw boards the agent can open / build via /draw",
  },
  {
    group: "stack",
    name: "fractal",
    href: "https://github.com/plasma-ai/fractal",
    why: "hierarchical recursive agent loops in git worktrees — theirs, driven by nur via /fractal and the fractal tool (Apache-2.0)",
  },
  {
    group: "stack",
    name: "penecho",
    href: "https://github.com/penecho/penecho",
    why: "think with AI beyond the chat box — infinite canvas run as a sidecar, nur only bridges auth + launches it (AGPL-3.0)",
  },
  {
    group: "stack",
    name: "t3code",
    href: "https://github.com/pingdotgg/t3code",
    why: "vendor-CLI auth delegation — nur mirrors its driver-probing / no-secret-storage pattern in the t3code tool (MIT)",
  },
  {
    group: "stack",
    name: "Headroom",
    href: "https://github.com/headroomlabs-ai/headroom",
    why: "inline tool-result compress · on by default · /headroom",
  },
  {
    group: "stack",
    name: "OptMem",
    href: "https://github.com/VictorTaelin/OptMem",
    why: "permanent memory at ~/.optmem · /optmem · /memo",
  },
  {
    group: "stack",
    name: "egaki",
    href: "https://github.com/remorses/egaki",
    why: "image / video / speech CLI · /egaki · /image",
  },
  {
    group: "stack",
    name: "agent-browser-cli",
    href: "https://github.com/sleepinginsummer/agent-browser-cli",
    why: "real default-browser perception + control",
  },
  {
    group: "stack",
    name: "terminal-browser",
    href: "https://terminal-browser.com/",
    why: "in-terminal Chromium · /tb · Windows host fallback via agent-browser-cli",
  },
  {
    group: "stack",
    name: "Cua",
    href: "https://github.com/trycua/cua",
    why: "computer-use desktop driver (/cua)",
  },
  {
    group: "stack",
    name: "AKM",
    href: "https://www.npmjs.com/package/akm-cli",
    why: "skill package manager across Claude / OpenCode / Cursor",
  },
  {
    group: "stack",
    name: "Excalidraw",
    href: "https://excalidraw.com",
    why: "hand-drawn architecture diagrams from the agent",
  },
  {
    group: "stack",
    name: "excalidraw-cli",
    href: "https://github.com/ahmadawais/excalidraw-cli",
    why: "agent-native .excalidraw create / export / checkpoint CLI",
  },
  {
    group: "stack",
    name: "Telegram Bot API",
    href: "https://core.telegram.org/bots/api",
    why: "nur gateway — each chat message is a headless agent turn",
  },
  {
    group: "stack",
    name: "OpenRouter",
    href: "https://openrouter.ai/",
    why: "400+ models through one key · failover-friendly routing",
  },
  {
    group: "stack",
    name: "Ollama",
    href: "https://ollama.com/",
    why: "local OpenAI-compat models on localhost:11434",
  },
  {
    group: "stack",
    name: "Groq",
    href: "https://groq.com/",
    why: "LPU-fast cloud inference provider path",
  },
  {
    group: "stack",
    name: "Meta Model API",
    href: "https://developer.meta.com/ai/products/meta-model-api/",
    why: "Muse Spark vendor default · OpenAI-compatible API",
  },
  {
    group: "stack",
    name: "GitHub Models",
    href: "https://docs.github.com/en/github-models",
    why: "inference via GitHub credentials · multi-publisher catalog",
  },
  {
    group: "stack",
    name: "Hugging Face",
    href: "https://huggingface.co/",
    why: "HF Inference router · key or browser sign-in",
  },
  {
    group: "stack",
    name: "Bun",
    href: "https://bun.sh",
    why: "runtime for omp and fast JS tooling",
  },
  {
    group: "stack",
    name: "uv",
    href: "https://github.com/astral-sh/uv",
    why: "Python toolchain for Graphify installs",
  },
  {
    group: "stack",
    name: "Node.js",
    href: "https://nodejs.org",
    why: "PLUR · Ruflo · Executor · skills · browser · AKM",
  },
  {
    group: "stack",
    name: "Rust",
    href: "https://www.rust-lang.org",
    why: "the harness language — speed, safety, single binary",
  },
  {
    group: "plugins",
    name: "Superpowers",
    href: "https://github.com/obra/superpowers",
    why: "workflow skills marketplace pack",
  },
  {
    group: "plugins",
    name: "Fable Method",
    href: "https://github.com/Sahir619/fable-method",
    why: "adversarial verify loop · fable-judge · fable-loop",
  },
  {
    group: "plugins",
    name: "Agent Skills",
    href: "https://agentskills.io/home",
    why: "open SKILL.md format · natural-language skill activation",
  },
  {
    group: "plugins",
    name: "Vercel Agent Skills",
    href: "https://github.com/vercel-labs/agent-skills",
    why: "Next.js / AI SDK / platform skill packs",
  },
  {
    group: "plugins",
    name: "skills CLI",
    href: "https://github.com/vercel-labs/skills",
    why: "the installer nur ecosystem ensure drives to land packs into ~/.agents/skills",
  },
  {
    group: "plugins",
    name: "Emil design-eng",
    href: "https://emilkowal.ski",
    why: "UI polish & motion craft skill",
  },
  {
    group: "plugins",
    name: "Emil Kowalski Skills",
    href: "https://github.com/emilkowalski/skills",
    why: "the design pack auto-provisioned on ecosystem ensure",
  },
  {
    group: "plugins",
    name: "Builder.io Skills",
    href: "https://github.com/BuilderIO/skills",
    why: "agent efficiency — efficient-fable · plan-arbiter · stay-within-limits · visual-plan",
  },
  {
    group: "plugins",
    name: "Matt Pocock Skills",
    href: "https://github.com/mattpocock/skills",
    why: "real-engineering pack — grill-me · triage · tdd · to-spec · handoff",
  },
  {
    group: "plugins",
    name: "Addy Osmani Agent Skills",
    href: "https://github.com/addyosmani/agent-skills",
    why: "production engineering — context engineering · frontend UI · security · shipping",
  },
  {
    group: "plugins",
    name: "Anthropic Official Skills",
    href: "https://github.com/anthropics/skills",
    why: "the public Agent Skills examples the format is read against",
  },
  {
    group: "plugins",
    name: "clone-website",
    href: "https://github.com/JCodesMore/ai-website-cloner-template",
    why: "website reverse-engineering skill auto-provisioned with the packs",
  },
  {
    group: "plugins",
    name: "GitHub Spec Kit",
    href: "https://github.com/github/spec-kit",
    why: "spec-before-code kit in the /plugins catalog",
  },
  {
    group: "plugins",
    name: "Firecrawl",
    href: "https://www.firecrawl.dev",
    why: "web crawl plugin for agent research",
  },
  {
    group: "plugins",
    name: "Chrome DevTools",
    href: "https://developer.chrome.com/docs/devtools",
    why: "browser debugging plugin surface",
  },
  {
    group: "plugins",
    name: "Anthropic Cybersecurity Skills",
    href: "https://github.com/mukul975/Anthropic-Cybersecurity-Skills",
    why: "817 security playbooks mirrored into skills",
  },
  {
    group: "plugins",
    name: "Model Context Protocol",
    href: "https://modelcontextprotocol.io",
    why: "MCP servers via Executor /mc",
  },
  {
    group: "plugins",
    name: "Gemini API",
    href: "https://ai.google.dev/gemini-api/docs",
    why: "Google Gemini provider · key or browser SSO",
  },
  {
    group: "plugins",
    name: "OpenAI Responses API",
    href: "https://platform.openai.com/docs/api-reference/responses",
    why: "multimodal + tool-calling protocol shape",
  },
  {
    group: "plugins",
    name: "Anthropic Messages API",
    href: "https://docs.anthropic.com",
    why: "tool-use + extended thinking streaming patterns",
  },
  {
    group: "plugins",
    name: "Dialkit",
    href: "https://github.com/joshpuckett/dialkit",
    why: "live-tune interface parameters — dials/sliders across frameworks · /dialkit",
  },
  {
    group: "plugins",
    name: "LangExtract",
    href: "https://github.com/google/langextract",
    why: "structured extraction from text via LLMs with source grounding",
  },
  {
    group: "plugins",
    name: "nanocodex",
    href: "https://github.com/gakonst/nanocodex",
    why: "minimal Rust coding agent — reference tools incl. web_search",
  },
  {
    group: "plugins",
    name: "Skeuomorphic UI",
    href: "https://github.com/Saurabh-2607/Skills",
    why: "dark skeuomorphic components skill · /skeuo",
  },
  {
    group: "plugins",
    name: "recent.design",
    href: "https://recent.design/skills",
    why: "curated design-engineer skill index (Emil, ibelick, OKLCH, …)",
  },
];

const INSP_GROUPS: { id: Inspiration["group"]; label: string }[] = [
  { id: "agents", label: "Agent products & patterns" },
  { id: "research", label: "Research & architecture sources" },
  { id: "libs", label: "Libraries & runtimes" },
  { id: "stack", label: "Knowledge stack" },
  { id: "plugins", label: "Plugins · methods · protocols" },
];

/* ── Helpers ────────────────────────────────────────────────────────────── */

function detectOs(): OsKey {
  if (typeof navigator === "undefined") return "unix";
  const ua = navigator.userAgent || "";
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData?.platform ||
    navigator.platform ||
    "";
  if (/Win/i.test(platform) || /Windows/i.test(ua)) return "windows";
  return "unix";
}

function useReveal() {
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(".cli-reveal"),
    );
    if (!nodes.length) return;

    if (typeof IntersectionObserver === "undefined") {
      nodes.forEach((n) => n.classList.add("cli-reveal--in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("cli-reveal--in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
}

function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      {
        // account for sticky header + jump nav
        rootMargin: "-28% 0px -55% 0px",
        threshold: [0.08, 0.2, 0.4],
      },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return active;
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  // keep URL shareable without fighting SPA router
  try {
    history.replaceState(null, "", `#${id}`);
  } catch {
    /* ignore */
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function CopyBtn({
  text,
  eventLabel,
  className = "",
  label = "Copy",
}: {
  text: string;
  eventLabel: string;
  className?: string;
  label?: string;
}) {
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");

  const onCopy = useCallback(
    async (e?: { stopPropagation?: () => void }) => {
      e?.stopPropagation?.();
      const ok = await copyText(text);
      setState(ok ? "ok" : "err");
      if (ok) trackEvent("Cli Copy", { label: eventLabel });
      window.setTimeout(() => setState("idle"), 1400);
    },
    [text, eventLabel],
  );

  return (
    <button
      type="button"
      className={`cli-copy${state === "ok" ? " cli-copy--ok" : ""}${state === "err" ? " cli-copy--err" : ""}${className ? ` ${className}` : ""}`}
      onClick={() => onCopy()}
      aria-label={state === "ok" ? "Copied" : `Copy ${label}`}
    >
      {state === "ok" ? "Copied" : state === "err" ? "Failed" : label}
    </button>
  );
}

function InstallCard({
  osKey,
  recommended,
}: {
  osKey: OsKey;
  recommended: boolean;
}) {
  const item = INSTALL[osKey];
  const [flash, setFlash] = useState(false);

  const onCardCopy = useCallback(async () => {
    const ok = await copyText(item.cmd);
    if (ok) {
      setFlash(true);
      trackEvent("Cli Copy", { label: `install-card-${osKey}` });
      window.setTimeout(() => setFlash(false), 1200);
    }
  }, [item.cmd, osKey]);

  return (
    <div
      className={`cli-term${recommended ? " cli-term--hot" : ""}${flash ? " cli-term--flash" : ""}`}
      role="group"
      aria-label={`${item.label} install`}
    >
      <div className="cli-term-bar">
        <span className="cli-term-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="cli-term-title">
          <span className="cli-term-badge">{item.badge}</span>
          {item.label}
          {recommended && <span className="cli-pill">your OS</span>}
        </span>
        <CopyBtn text={item.cmd} eventLabel={`install-${osKey}`} />
      </div>
      <button
        type="button"
        className="cli-term-body-btn"
        onClick={onCardCopy}
        aria-label={`Copy ${item.label} install command`}
      >
        <pre className="cli-term-body">
          <code>
            <span className="cli-prompt">{item.prompt}</span>{" "}
            <span className="cli-cmd-text">{item.cmd}</span>
          </code>
        </pre>
        <span className="cli-term-tap">
          {flash ? "copied to clipboard" : "click command to copy"}
        </span>
      </button>
      <p className="cli-term-hint">{item.hint}</p>
    </div>
  );
}

type NurVersion = {
  version: string;
  tag: string;
  name?: string | null;
  publishedAt?: string | null;
  htmlUrl: string;
  fetchedAt?: string;
};

function useNurCliVersion() {
  const [data, setData] = useState<NurVersion | null>(null);
  const [status, setStatus] = useState<"loading" | "live" | "error">("loading");
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: number | undefined;
    const seen = { version: "" as string };
    const POLL_MS = 5 * 60 * 1000;

    const apply = (payload: NurVersion) => {
      if (cancelled || !payload?.version) return;
      if (seen.version && seen.version !== payload.version) {
        setFlash(true);
        window.setTimeout(() => setFlash(false), 1600);
        trackEvent("Cli Version Update", { version: payload.version });
      }
      seen.version = payload.version;
      setData(payload);
      setStatus("live");
    };

    const pollOnce = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/nur-cli-version", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as NurVersion;
        apply(json);
      } catch {
        if (!cancelled && !seen.version) setStatus("error");
      }
    };

    void pollOnce();
    pollTimer = window.setInterval(pollOnce, POLL_MS);

    const onVis = () => {
      if (document.visibilityState === "visible") void pollOnce();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      if (pollTimer) window.clearInterval(pollTimer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return { data, status, flash };
}

function FoglampMap() {
  const [loaded, setLoaded] = useState(() =>
    typeof window !== "undefined"
      ? shouldLoadFoglampMap(
          window.matchMedia(FOGLAMP_DESKTOP_QUERY).matches,
          false,
        )
      : false,
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const focusAfterLoad = useRef(false);

  useEffect(() => {
    const query = window.matchMedia(FOGLAMP_DESKTOP_QUERY);
    const syncWithViewport = () => {
      setLoaded((current) => shouldLoadFoglampMap(query.matches, current));
    };

    syncWithViewport();
    query.addEventListener("change", syncWithViewport);
    return () => query.removeEventListener("change", syncWithViewport);
  }, []);

  useEffect(() => {
    if (!loaded || !focusAfterLoad.current) return;
    focusAfterLoad.current = false;
    const frame = window.requestAnimationFrame(() =>
      iframeRef.current?.focus(),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [loaded]);

  const openMap = (location: "header" | "footer") => {
    trackEvent("Cli Foglamp Open", { location });
  };

  return (
    <div className="cli-map-shell">
      <div className="cli-term-bar cli-map-bar">
        <span className="cli-term-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="cli-term-title">foglamp · NurCLI architecture</span>
        <span className="cli-map-actions">
          <span className="cli-map-status">
            <i aria-hidden /> interactive
          </span>
          <a
            href={FOGLAMP_SCAN_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => openMap("header")}
          >
            Open <span aria-hidden>↗</span>
          </a>
        </span>
      </div>

      <div className="cli-map-stage">
        {loaded ? (
          <iframe
            ref={iframeRef}
            src={FOGLAMP_SCAN_URL}
            title="Interactive Foglamp map of the NurCLI codebase"
            className="cli-map-frame"
            loading="eager"
            allow="fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            tabIndex={0}
          />
        ) : (
          <div className="cli-map-preview">
            <img
              src={FOGLAMP_PREVIEW_URL}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div className="cli-map-preview-copy">
              <span>// living architecture</span>
              <p>
                Trace the systems, tools, providers, and memory layers behind
                NurCLI.
              </p>
              <button
                type="button"
                className="cli-map-load"
                onClick={() => {
                  focusAfterLoad.current = true;
                  setLoaded(true);
                  trackEvent("Cli Foglamp Load", { source: "mobile-preview" });
                }}
              >
                Explore interactive map <span aria-hidden>→</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="cli-map-foot">
        <span>Drag to pan · scroll to zoom</span>
        <a
          href={FOGLAMP_SCAN_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => openMap("footer")}
        >
          Open full scan <span aria-hidden>↗</span>
        </a>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function CliPage() {
  useStandaloneScroll();
  useReveal();
  const {
    data: nurVer,
    status: verStatus,
    flash: verFlash,
  } = useNurCliVersion();

  // Match nur-cli TUI canvas on the document (overscroll + body).
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("cli-theme");
    return () => html.classList.remove("cli-theme");
  }, []);

  const navIds = useMemo(() => NAV.map((n) => n.id), []);
  const activeSection = useActiveSection(navIds);

  const detected = useMemo(() => detectOs(), []);
  const [preferredOs, setPreferredOs] = useState<OsKey>(detected);
  const [showOtherOs, setShowOtherOs] = useState(false);

  const [tab, setTab] = useState(FEATURE_TABS[0].id);
  const [cmdView, setCmdView] = useState<"slash" | "cli">("slash");
  const [cmdQuery, setCmdQuery] = useState("");
  const tablistRef = useRef<HTMLDivElement>(null);
  const featureBaseId = useId();

  const active = FEATURE_TABS.find((t) => t.id === tab) ?? FEATURE_TABS[0];
  const otherOs: OsKey = preferredOs === "windows" ? "unix" : "windows";

  const filteredCmds = useMemo(() => {
    const src = cmdView === "slash" ? SLASH_COMMANDS : CLI_SUBCOMMANDS;
    const q = cmdQuery.trim().toLowerCase();
    if (!q) return src;
    return src.filter(
      (row) =>
        row.cmd.toLowerCase().includes(q) || row.desc.toLowerCase().includes(q),
    );
  }, [cmdView, cmdQuery]);

  useEffect(() => {
    trackEvent("Cli View");
  }, []);

  // deep-link #section on mount
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (hash && (navIds as readonly string[]).includes(hash)) {
      // next frame so layout is ready
      requestAnimationFrame(() => scrollToId(hash));
    }
  }, [navIds]);

  const onFeatureKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const idx = FEATURE_TABS.findIndex((t) => t.id === tab);
    let next = idx;
    if (e.key === "ArrowRight") next = (idx + 1) % FEATURE_TABS.length;
    if (e.key === "ArrowLeft")
      next = (idx - 1 + FEATURE_TABS.length) % FEATURE_TABS.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = FEATURE_TABS.length - 1;
    const id = FEATURE_TABS[next].id;
    setTab(id);
    trackEvent("Cli Feature Tab", { tab: id });
    const btn = tablistRef.current?.querySelector<HTMLButtonElement>(
      `#${featureBaseId}-${id}`,
    );
    btn?.focus();
  };

  return (
    <div className="standalone-page cli-page">
      <a className="cli-skip" href="#efficiency">
        Skip to token path
      </a>
      <ScrollToTop />
      <StandaloneNav />

      <div className="standalone-header cli-topbar">
        <span className="standalone-prefix">NUR://</span>CONTEXT ENGINE
        <MiniAudio />
      </div>

      {/* sticky jump rail */}
      <nav className="cli-jump" aria-label="On this page">
        <div className="cli-jump-inner">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`cli-jump-item${activeSection === item.id ? " cli-jump-item--on" : ""}`}
              onClick={() => {
                scrollToId(item.id);
                trackEvent("Cli Jump", { section: item.id });
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <header className="cli-hero cli-reveal">
        <div className="cli-hero-rail" aria-hidden>
          <span>UNIT / NUR-62</span>
          <span>STATE / LOCAL-FIRST</span>
          <span>MODE / USER-ROUTED</span>
        </div>
        <div className="cli-hero-brand">
          <img
            src="/assets/nodes/nur-cli-logo.png"
            alt=""
            className="cli-logo"
            width={80}
            height={80}
            draggable={false}
          />
          <div className="cli-hero-copy">
            <p className="cli-kicker">[ MULTI-PROVIDER TERMINAL AGENT ]</p>
            <div className="cli-title-row">
              <h1 className="cli-title">NurCLI</h1>
              <a
                className={`cli-version${verStatus === "live" ? " cli-version--live" : ""}${verStatus === "loading" && !nurVer ? " cli-version--loading" : ""}${verStatus === "error" && !nurVer ? " cli-version--err" : ""}${verFlash ? " cli-version--flash" : ""}`}
                href={
                  nurVer?.htmlUrl ||
                  "https://github.com/nuroctane/nur-cli/releases/latest"
                }
                target="_blank"
                rel="noreferrer"
                title={
                  nurVer?.publishedAt
                    ? `Released ${new Date(nurVer.publishedAt).toLocaleString()}`
                    : "Latest GitHub release"
                }
                onClick={() =>
                  trackEvent("Cli Version Click", {
                    version: nurVer?.version || "unknown",
                  })
                }
              >
                <span className="cli-version-dot" aria-hidden />
                <span className="cli-version-label">
                  {verStatus === "loading" && !nurVer
                    ? "fetching…"
                    : verStatus === "error" && !nurVer
                      ? "offline"
                      : `v${nurVer?.version ?? "—"}`}
                </span>
                {verStatus === "live" && (
                  <span className="cli-version-live">live</span>
                )}
              </a>
            </div>
            <p className="cli-display-line">SPEND CONTEXT LIKE IT MATTERS.</p>
            <p className="cli-tagline">
              A Rust agent harness built to keep paid context working: compress
              tool noise, preserve exact results locally, route across 62
              backends, meter observed usage, and compact before the window
              becomes the failure.
            </p>
            <div className="cli-hero-cta">
              <button
                type="button"
                className="cli-btn cli-btn--primary"
                onClick={() => {
                  scrollToId("install");
                  trackEvent("Cli CTA", { target: "install" });
                }}
              >
                Install NurCLI
              </button>
              <button
                type="button"
                className="cli-btn"
                onClick={() => {
                  scrollToId("efficiency");
                  trackEvent("Cli CTA", { target: "efficiency" });
                }}
              >
                Trace the token path
              </button>
              <a
                className="cli-btn"
                href="https://github.com/nuroctane/nur-cli"
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent("Cli Link", { target: "github" })}
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        <ul className="cli-stats" aria-label="Highlights">
          <li>
            <strong>62</strong>
            <span>provider routes</span>
          </li>
          <li>
            <strong>ON</strong>
            <span>inline compression</span>
          </li>
          <li>
            <strong>LOCAL</strong>
            <span>sessions + deep memory</span>
          </li>
          <li>
            <strong
              className={
                verFlash ? "cli-stat-ver cli-stat-ver--flash" : "cli-stat-ver"
              }
            >
              {nurVer
                ? `v${nurVer.version}`
                : verStatus === "loading"
                  ? "…"
                  : "nur"}
            </strong>
            <span>{nurVer ? "latest release" : "binary · nur"}</span>
          </li>
        </ul>
      </header>

      {/* Token path */}
      <section
        className="cli-section cli-reveal cli-efficiency"
        id="efficiency"
      >
        <div className="cli-section-hd cli-section-hd--split">
          <div>
            <p className="cli-section-code">SYS.TRACE / REQUEST-LIFECYCLE</p>
            <h2 className="cli-h2">
              <span className="cli-h2-num">01</span> Token path
            </h2>
          </div>
          <p className="cli-lead">
            The useful unit is not a chat bubble. It is the entire round trip
            from local working state to inference and back into a smaller,
            resumable state.
          </p>
        </div>

        <ol className="cli-token-path">
          {TOKEN_PATH.map((stage) => (
            <li key={stage.id}>
              <div className="cli-path-index">
                <span>{stage.id}</span>
                <small>{stage.label}</small>
              </div>
              <div className="cli-path-copy">
                <h3>{stage.title}</h3>
                <p>{stage.body}</p>
              </div>
              <samp>{stage.meta}</samp>
            </li>
          ))}
        </ol>

        <div className="cli-signal-grid" aria-label="Token efficiency defaults">
          {EFFICIENCY_SIGNALS.map((signal) => (
            <article key={signal.label}>
              <strong>{signal.value}</strong>
              <h3>{signal.label}</h3>
              <p>{signal.body}</p>
            </article>
          ))}
        </div>

        <div className="cli-honesty-strip">
          <span className="cli-honesty-mark">!</span>
          <div>
            <strong>Observed usage, not a provider invoice.</strong>
            <p>
              Nur records the tokens a backend reports and estimates cost from
              model catalogs. Retries, subscription credits, gateway markups,
              and backends without usage telemetry can differ from the provider
              dashboard.
            </p>
          </div>
          <a
            href="https://nuroctane.github.io/nur-cli/configuration/#session-budgets-interactive"
            target="_blank"
            rel="noreferrer"
          >
            Set hard budgets ↗
          </a>
        </div>
      </section>

      {/* Memory */}
      <section className="cli-section cli-reveal cli-memory" id="memory">
        <div className="cli-section-hd cli-section-hd--split">
          <div>
            <p className="cli-section-code">SYS.MEM / RETENTION-TOPOLOGY</p>
            <h2 className="cli-h2">
              <span className="cli-h2-num">02</span> Memory by layer
            </h2>
          </div>
          <p className="cli-lead">
            Context is temporary compute. Memory is durable local state. Nur
            keeps the exact artifacts close, then injects compact pointers and
            routed snapshots.
          </p>
        </div>

        <div className="cli-memory-grid">
          {MEMORY_LAYERS.map((layer) => (
            <article key={layer.code}>
              <div className="cli-memory-topline">
                <span>{layer.code}</span>
                <samp>{layer.mode}</samp>
              </div>
              <h3>{layer.title}</h3>
              <code>{layer.path}</code>
              <p>{layer.body}</p>
            </article>
          ))}
        </div>

        <div
          className="cli-memory-flow"
          role="img"
          aria-label="Memory flow from live context to local storage and selective recall"
        >
          <span>LIVE CONTEXT</span>
          <i aria-hidden>→</i>
          <span>COMPRESS / SPILL</span>
          <i aria-hidden>→</i>
          <span>LOCAL DURABLE STATE</span>
          <i aria-hidden>→</i>
          <span>ROUTED RECALL</span>
        </div>
      </section>

      {/* Install */}
      <section className="cli-section cli-reveal" id="install">
        <div className="cli-section-hd">
          <h2 className="cli-h2">
            <span className="cli-h2-num">03</span> Install
          </h2>
          <p className="cli-lead">
            One shot. Drops <code>nur</code> on your PATH, pulls runtime deps it
            can, wires the full agent stack — then you open the TUI.
          </p>
        </div>

        <div
          className="cli-os-switch"
          role="group"
          aria-label="Choose platform"
        >
          {(Object.keys(INSTALL) as OsKey[]).map((key) => (
            <button
              key={key}
              type="button"
              className={`cli-os-btn${preferredOs === key ? " cli-os-btn--on" : ""}`}
              aria-pressed={preferredOs === key}
              onClick={() => {
                setPreferredOs(key);
                setShowOtherOs(false);
                trackEvent("Cli OS", { os: key });
              }}
            >
              {INSTALL[key].label}
              {detected === key && (
                <span className="cli-pill cli-pill--soft">detected</span>
              )}
            </button>
          ))}
        </div>

        <div className="cli-install-primary">
          <InstallCard
            osKey={preferredOs}
            recommended={preferredOs === detected}
          />
        </div>

        {preferredOs === "windows" && (
          <div className="cli-binary cli-reveal">
            <div className="cli-binary-hd">
              <span className="cli-term-badge">EXE</span>
              <span>Prefer no build step?</span>
            </div>
            <p className="cli-binary-body">
              Download the prebuilt Windows binary → double-click → same full
              install (PATH, prereqs, ecosystem), then NurCLI opens.
            </p>
            <div className="cli-binary-actions">
              <a
                className="cli-btn cli-btn--primary"
                href={BINARY.href}
                onClick={() => trackEvent("Cli Binary", { target: "exe" })}
              >
                ↓ {BINARY.name}
              </a>
              <a
                className="cli-btn"
                href={BINARY.releases}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent("Cli Binary", { target: "releases" })}
              >
                All releases
              </a>
            </div>
          </div>
        )}

        <div className="cli-other-os">
          <button
            type="button"
            className="cli-text-btn"
            aria-expanded={showOtherOs}
            onClick={() => setShowOtherOs((v) => !v)}
          >
            {showOtherOs ? "Hide" : "Show"} {INSTALL[otherOs].label} install
            <span className="cli-chev" aria-hidden>
              {showOtherOs ? "▴" : "▾"}
            </span>
          </button>
          {showOtherOs && (
            <div className="cli-other-os-panel">
              <InstallCard osKey={otherOs} recommended={false} />
            </div>
          )}
        </div>

        <div className="cli-after">
          <p className="cli-after-label">// after install</p>
          <ol className="cli-steps">
            {AFTER.map((row, i) => (
              <li key={row.cmd}>
                <span className="cli-step-num">{i + 1}</span>
                <div className="cli-step-body">
                  <div className="cli-step-cmd">
                    <code>{row.cmd}</code>
                    <CopyBtn
                      text={row.cmd}
                      eventLabel={`after-${row.cmd}`}
                      label="Copy"
                    />
                  </div>
                  <span className="cli-step-note">{row.note}</span>
                </div>
              </li>
            ))}
          </ol>
          <p className="cli-after-note">
            Or run <code>nur</code> and use <code>/login</code> in the TUI —
            pick any of 62 providers, paste a key, or sign in with the browser
            where available.{" "}
            <a
              href="https://nuroctane.github.io/nur-cli/"
              target="_blank"
              rel="noreferrer"
            >
              Full docs →
            </a>
          </p>
        </div>
      </section>

      {/* Demo */}
      <section className="cli-section cli-reveal" id="demo">
        <div className="cli-section-hd">
          <p className="cli-section-code">SYS.MAP / LIVE-IMPLEMENTATION</p>
          <h2 className="cli-h2">
            <span className="cli-h2-num">04</span> See the machine
          </h2>
          <p className="cli-lead">
            The gold TUI is the control surface. Foglamp is the live
            architecture underneath it.
          </p>
        </div>
        <figure className="cli-demo">
          <div className="cli-term-bar cli-demo-bar">
            <span className="cli-term-dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <span className="cli-term-title">nur · gold TUI</span>
          </div>
          <img
            src="/assets/nur-demo.gif"
            alt="NurCLI demo — gold TUI streaming an agent session"
            className="cli-demo-gif"
            loading="lazy"
            decoding="async"
          />
        </figure>

        <FoglampMap />
      </section>

      {/* Features */}
      <section className="cli-section cli-reveal" id="features">
        <div className="cli-section-hd">
          <p className="cli-section-code">SYS.SURFACE / OPERATOR-CONTROLS</p>
          <h2 className="cli-h2">
            <span className="cli-h2-num">05</span> Operator surface
          </h2>
          <p className="cli-lead">
            Choose a subsystem. Arrow keys move across the tab rail when
            focused.
          </p>
        </div>

        <div
          className="cli-tabs"
          role="tablist"
          aria-label="Feature groups"
          ref={tablistRef}
          onKeyDown={onFeatureKey}
        >
          {FEATURE_TABS.map((t) => {
            const selected = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`${featureBaseId}-${t.id}`}
                aria-selected={selected}
                aria-controls={`${featureBaseId}-panel`}
                tabIndex={selected ? 0 : -1}
                className={`cli-tab${selected ? " cli-tab--on" : ""}`}
                onClick={() => {
                  setTab(t.id);
                  trackEvent("Cli Feature Tab", { tab: t.id });
                }}
              >
                <span className="cli-tab-label">{t.label}</span>
                <span className="cli-tab-blurb">{t.blurb}</span>
              </button>
            );
          })}
        </div>

        <div
          className="cli-tab-panel"
          role="tabpanel"
          id={`${featureBaseId}-panel`}
          aria-labelledby={`${featureBaseId}-${active.id}`}
          key={active.id}
        >
          <p className="cli-panel-kicker">{active.label}</p>
          {active.body}
        </div>
      </section>

      {/* Commands */}
      <section className="cli-section cli-reveal" id="commands">
        <div className="cli-section-hd">
          <p className="cli-section-code">SYS.INDEX / COMMAND-SURFACE</p>
          <h2 className="cli-h2">
            <span className="cli-h2-num">06</span> Commands
          </h2>
          <p className="cli-lead">
            Slash commands in the TUI, or shell subcommands from your terminal.
            Every installed skill is also a slash command: /skill-name (sticky)
            or /skill-name &lt;prompt&gt; (one-shot).
          </p>
        </div>

        <div className="cli-cmd-toolbar">
          <div
            className="cli-tabs cli-tabs--compact"
            role="tablist"
            aria-label="Command lists"
          >
            <button
              type="button"
              role="tab"
              aria-selected={cmdView === "slash"}
              className={`cli-tab${cmdView === "slash" ? " cli-tab--on" : ""}`}
              onClick={() => {
                setCmdView("slash");
                setCmdQuery("");
              }}
            >
              /slash
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={cmdView === "cli"}
              className={`cli-tab${cmdView === "cli" ? " cli-tab--on" : ""}`}
              onClick={() => {
                setCmdView("cli");
                setCmdQuery("");
              }}
            >
              shell
            </button>
          </div>

          <label className="cli-search">
            <span className="cli-search-icon" aria-hidden>
              ⌕
            </span>
            <input
              type="search"
              value={cmdQuery}
              onChange={(e) => setCmdQuery(e.target.value)}
              placeholder={
                cmdView === "slash" ? "Filter /commands…" : "Filter nur …"
              }
              autoComplete="off"
              spellCheck={false}
            />
            {cmdQuery && (
              <button
                type="button"
                className="cli-search-clear"
                onClick={() => setCmdQuery("")}
                aria-label="Clear filter"
              >
                ×
              </button>
            )}
          </label>
        </div>

        <div className="cli-cmd-meta">
          <span>
            {filteredCmds.length}
            {cmdQuery
              ? ` match${filteredCmds.length === 1 ? "" : "es"}`
              : " total"}
          </span>
          <span className="cli-cmd-tip">Click a row to copy the command</span>
        </div>

        <div className="cli-cmd-table" key={`${cmdView}-${cmdQuery}`}>
          {filteredCmds.length === 0 ? (
            <p className="cli-empty">No commands match “{cmdQuery}”.</p>
          ) : (
            filteredCmds.map((row) => (
              <button
                type="button"
                className="cli-cmd-row"
                key={row.cmd}
                onClick={async () => {
                  const ok = await copyText(row.cmd);
                  if (ok) trackEvent("Cli Copy", { label: `cmd-${row.cmd}` });
                }}
              >
                <code className="cli-cmd-name">{row.cmd}</code>
                <span className="cli-cmd-desc">{row.desc}</span>
              </button>
            ))
          )}
        </div>
        <p className="cli-after-note">
          Full reference:{" "}
          <a
            href="https://nuroctane.github.io/nur-cli/commands/"
            target="_blank"
            rel="noreferrer"
          >
            nuroctane.github.io/nur-cli/commands
          </a>
        </p>
      </section>

      {/* Inspirations */}
      <section className="cli-section cli-reveal" id="inspirations">
        <div className="cli-section-hd">
          <p className="cli-section-code">SYS.CREDITS / LINEAGE-LEDGER</p>
          <h2 className="cli-h2">
            <span className="cli-h2-num">07</span> Credits
          </h2>
          <p className="cli-lead">
            NurCLI is an original Rust harness built in public lineage. This
            ledger names the products, papers, libraries, tools, protocols, and
            skill authors whose work shaped a module, pattern, or bundled
            capability. {INSPIRATIONS.length} sources, linked.
          </p>
        </div>

        {INSP_GROUPS.map((g) => {
          const items = INSPIRATIONS.filter((i) => i.group === g.id);
          return (
            <div key={g.id} className="cli-insp-group">
              <h3 className="cli-h3">{g.label}</h3>
              <ul className="cli-insp-list">
                {items.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="cli-insp-link"
                      onClick={() =>
                        trackEvent("Cli Inspiration", { name: item.name })
                      }
                    >
                      {item.name}
                    </a>
                    <span className="cli-insp-why">{item.why}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        <p className="cli-footer-note">
          Built with Ratatui · crossterm · tokio · reqwest · serde · clap — and
          a lot of late nights. Not affiliated with Meta, Anthropic, OpenAI, or
          any provider listed above.
        </p>
      </section>
    </div>
  );
}
