# David Davieson

**DevOps Engineer · Cybersecurity · Agentic Systems**

**[ `daviddavieson@gmail.com` ] · [ `https://nuroctane.xyz` ] · [ `github.com/nuroctane` ] · [ `linkedin.com/in/david-davieson` ]**

***

## SUMMARY

> **Software engineer and security practitioner.** I build and secure agentic systems, cloud security automation, local AI infrastructure, and production web and mobile products across Rust, TypeScript, Python, and AWS.
>
> Independently I ship a Rust coding agent with sandboxed, permission-gated execution and a signed supply chain, agent-to-vault brokering for vault-backed tool use, a self-custodial wallet harness with threshold signing, real-time orbital visualization, privacy-first OCR, and manufacturing-oriented configuration. Backed by customer success across **$1B+ AUM**, **$1.2M+ ARR retention**, **$1.7M+ capital deployment**, and technical support leadership.

## SELECTED PRODUCTS

* **[ NurCLI — Multi-Provider Coding Agent ]** · [nuroctane.xyz/cli](https://www.nuroctane.xyz/cli) · [GitHub](https://github.com/nuroctane/nur-cli)
  * Build and ship a **Rust** coding agent (v0.53) across **70 provider routes** and **54 native tools**: streaming tool loop, subagents, manual/plan/auto permission modes that gate side effects before they run, session resume, native vision, and `/takeover`, which imports live Claude Code, Codex, Cursor, and Grok Build sessions.
  * **Jev judgment layer:** wove TypeSafe Jev typed judgments into the harness itself. One batched call gates tool calls, verifies results, and drives compaction that keeps surviving context verbatim and writes no summary, over a **142-system Jev library** with keyless local engines (openJev-verdict-2.0 on CPU, Bespoke-Nimble-9B on NVIDIA/MLX, Laya on Apple Neural Engine) and direct engines such as Liquid d1-ultra.
  * **Gold TUI (ratatui/crossterm):** viewport-rendered transcript read as prose with clickable file paths, an F6 session inspector for changes, tools, agents, and context, inline image previews over kitty/sixel/iTerm2, live theme previews, question modals, and a reduced-motion mode.
  * **Context as the core discipline:** OMP-style response-reserve compaction, content-addressed spill of oversized tool results, preserved provider prompt caches, semantic search (sgrep) as the first read path, and a local usage ledger across seven agents' logs, so every failover, subagent, and judgment reports its real token and cost impact.
  * **Security and supply chain:** sandboxed execution (shell denylists, timeouts, SSRF-guarded fetches, atomic IO), LOCAL/TEE/ZDR privacy tiers whose failover never silently downgrades, DPAPI-encrypted credentials at rest, signed updates and skill packs, hash-chained session receipts, and Enclave security agents over native MCP.
  * **Memory and ecosystem:** hierarchical Connectome notes with an append-only chronicle, a local vector index, the Graphify knowledge graph, and an optional HelixDB graph-vector mirror behind a durable outbox, recalled through one intent-routed query; plus a plugin marketplace and natural-language skill activation.
* **[ Free Everything Downloader — iOS Media Shortcut ]** · [RoutineHub](https://routinehub.co/shortcut/26384/) · [GitHub](https://github.com/nuroctane/free-everything-downloader)
  * Shipped a **RoutineHub** shortcut (v1.7) that turns a shared link into the saved file: on-device resolution for Facebook, X, Bluesky, Mastodon, Pinterest, TikTok and Threads in roughly 0.1–1 s, with yt-dlp in a-Shell mini for YouTube and Instagram.
  * On-device fast path first and a server extractor only on a miss, capped at a minute; no key, paywall or checkout, and no watermark where the source allows it.
* **[ Keeper Agent — Vault Broker for Agent Workflows ]** · [GitHub](https://github.com/nuroctane/keeper-agent)
  * Built a local CLI, desktop and browser administrator, and HTTPS broker that lets agents use a **Keeper Personal vault** through named, preconfigured actions — never record IDs, raw secrets, URLs or browser control.
  * Scoped per-client grants, a loopback-only TLS-pinned broker, isolated browser sessions closed after each action, and metadata-only audit logs; passwords, TOTP and API keys stay in the vault instead of in prompts.
* **[ StarConverter — exFAT ↔ NTFS Conversion Workbench ]** · [GitHub](https://github.com/nuroctane/StarConverter)
  * Building a **Rust** analyze / plan / convert / verify / rollback workbench that keeps file-data extents in place where possible, relocates only conflicts, and constructs new filesystem metadata transactionally.
  * Pre-alpha: image inspection, object-graph reconstruction, capability-gated planner, and fuzz targets. Conversion of live volumes stays blocked until the capability model clears it; no current executable writes disks.
* **[ StackWallet — Self-Custodial Agentic Wallet Harness ]** · [GitHub](https://github.com/nuroctane/StackWallet)
  * Building a local-first wallet harness across **44 chain families** behind one adapter contract, with wallets in policy-bound folders and an agent console whose proposals pass simulation, policy and an approval queue before signing.
  * Real threshold signatures: devices and the agent each hold a share, so no single place holds a complete key and the agent cannot move funds without a human co-signature; no server, with a Tauri 2 desktop around a Rust core.
* **[ hermes-local-models — Local Multi-Model AI Router ]** · [GitHub](https://github.com/nuroctane/hermes-local-models)
  * Built an OpenAI-compatible local router over GGUF inventories so Hermes and other agent CLIs can use local weights as a primary path with configurable cloud fallback when a provider drops.
  * Automated cross-platform discovery, llama-server presets, model selection, and fallback routing to keep the agent loop running without a paid-inference hard stop.

## PROFESSIONAL EXPERIENCE

### CAPITAL ONE
**`DevOps Engineer, Cyber`** | *(2025–Oct 2026)*
> * Own CI/CD and release engineering for a portfolio of critical services: **40+ pipelines**, **200+ production deploys per week**, and **99.95% SLO** across AWS and Kubernetes.
> * Cut commit-to-production lead time from **45 minutes to under 10** (**-78%**) with reusable workflows, ephemeral runners, and preview environments.
> * Embedded security into every pipeline: SAST, dependency, secret, and container scanning plus Terraform/OPA policy gates; remediated **300+ IaC misconfigurations** before merge.
> * Drove MTTR from **4 hours to under 45 minutes** with Splunk/Panther detection-as-code, automated triage runbooks, and blameless incident reviews.
> * Reduced cloud spend **~22%** through rightsizing, autoscaling, and spot capacity while keeping cyber controls audit-ready for Cloud, Identity, and Compliance.

### CHARTER COMMUNICATIONS
**`Customer Solutions`** | *(May 2025–Sep 2025)*
> * Delivered sales and retention solutions for commercial and residential connected services at top-tier performance levels.
> * Built a churn-reduction framework that defended **$1.2M+ ARR** and increased customer LTV approximately **25%** through CRM risk signals and proactive field dispatch upgrades.

### BLOCKDAEMON
**`Customer Success Manager`** | *(Feb 2023–May 2025)*
> * Owned the lifecycle for **$1B+ AUM** institutional clients on high-availability blockchain node infrastructure and MPC wallets — uptime and recovery were the product.
> * Established Grafana and Amazon Athena KPI cadences and drove **MTTR below 24 hours** on supported flows.
> * Co-led feature rollouts and product launches by reviewing pull requests, deploying previews, and translating live client failures into engineering work across sales, compliance, product, and engineering.
> * Diagnosed critical API discrepancies in Postman and delivered engineering-ready reproductions that prevented deployment delays.

### APPLE
**`Technical Support Lead`** | *(2022–2023)*
> * Mentored **10–15 specialists** to exceed **70% NPS** and **85% CSAT** while reporting performance trends to senior management.
> * Owned escalations, coaching loops, and privacy and device-management standards under high-volume load.

### COINBASE
**`Technical Support Lead`** | *(2022)*
> * Led technical support protocols for teams of **5–7** across DeFi/CeFi operations, rollups, yield farming, and smart-contract interactions.
> * Implemented client OpSec practices spanning hardware wallets, TOTP, and encrypted backups so high-volume institutional-adjacent workflows did not skip the safety steps.

## SECURITY & OPERATIONAL IMPACT

* **200+ production deploys per week** across 40+ pipelines at 99.95% SLO
* **-78%** commit-to-production lead time (45 min → under 10)
* **MTTR 4 hours → under 45 minutes**
* **300+** IaC misconfigurations remediated pre-merge
* **~22%** cloud spend reduction
* **$1B+ AUM** with **$1.2M+ ARR** retained
* **$1.7M+** SME capital deployment
* **70%+ NPS** and **85%+ CSAT** team performance

## SKILLS & TOOLING

| DOMAIN | TECHNOLOGIES / COMPETENCIES |
| :--- | :--- |
| **Languages** | TypeScript/JavaScript, Python, Rust, Go, Swift, Kotlin, Solidity, SQL |
| **Agentic & Local AI** | Multi-provider model APIs, tool calling, MCP, subagents, typed judgment layers (TypeSafe Jev), plugins, skills, permission systems, Ollama, llama-server, GGUF routing, ONNX Runtime |
| **Systems & Safety** | Tokio, ratatui/crossterm TUIs, filesystem conversion pipelines, capability models, fuzzing, sandboxed command execution, permissioned tool use |
| **Security Engineering** | Threat modeling, detection-as-code, SIEM/SOAR (Splunk, Panther), IAM and least privilege, secrets management, policy-as-code (Terraform, OPA), SAST/DAST, incident response, compliance evidence |
| **Product & Web** | React, Next.js, Vite, Three.js, CesiumJS, GSAP, Tailwind CSS, design systems, responsive and accessible UI |
| **Mobile** | SwiftUI, Jetpack Compose, Capacitor, AVFoundation, Media3, Core Data, Room, Hilt |
| **Backend & Delivery** | Node.js, Express, Python, REST, CI/CD, Vercel, Upstash Redis, Firebase, pnpm monorepos, GitHub Actions |
| **Cloud & Operations** | AWS EC2/S3/Lambda/VPC/Athena/GuardDuty/Security Hub/KMS, Terraform, Docker, Kubernetes, Grafana, Prometheus, Postman |
| **FinTech & Blockchain** | Commercial credit, EVM, wagmi/viem, RainbowKit, SIWE, RPC nodes, MPC wallets, DeFi/CeFi operations |
| **Customer Systems** | Technical discovery, enterprise onboarding, lifecycle ownership, KPI/SLO reporting, CRM analytics, Salesforce, Jira, Confluence |

## LEADERSHIP

* **ATX Tunerz Society — Vice President** · Help lead an Austin automotive community focused on car culture, meetups, and member support; drive **community impact** through events and coordination, and run the club’s public digital presence at [tunerzsociety.site](https://tunerzsociety.site).

## ADDITIONAL BUILDS

* **[ StarSleep — Dual-Native Sleep Application ]** · [GitHub](https://github.com/nuroctane/StarSleep)
  * SwiftUI and Jetpack Compose applications with on-device natal calculations, 12-dimension nightly scoring, and layered ambient audio.
* **[ ERC-721M — NFT Liquidity Standard ]** · [GitHub](https://github.com/Zodomo/ERC721M)
  * Collaborated on an EVM token standard and smart-contract surface for redistributing NFT secondary-market liquidity.
* **[ Observatory — 3D Web Observatory ]** · [nuroctane.xyz/observatory](https://www.nuroctane.xyz/observatory)
  * Multi-mode 3D observatory: Cesium Earth explore, CelesTrak/SGP4 live satellite field, NASA Eyes/Horizons mission hooks, solar system and constellation sky chart, plus Swiss Ephemeris (WASM) with every major house system and ayanamsa.
* **[ MODKEYS — 3D Keyboard Product Configurator ]** · [nuroctane.xyz/modkeys](https://www.nuroctane.xyz/modkeys)
  * React/Vite configurator for mechanical keyboard plates and keycaps with exact geometry, undo/redo, shareable URL-encoded builds, KLE JSON, SVG manufacturing templates, specification sheets, and PDF export.
* **[ SnipOCR — Private Cross-Platform Screenshot OCR ]** · [GitHub](https://github.com/nuroctane/snipocr)
  * Windows and macOS tray utilities that watch screenshot folders and the clipboard, run OCR fully on-device across Windows.Media.Ocr, Apple Vision, RapidOCR, and ONNX Runtime, and return editable text without uploading capture content.

## EDUCATION

* **University of North Texas** — BA, Communications, 2021 · Student Council · Cross-Examination Debate
* **Houston Community College** — AS, Computer Science · EPA Universal Technician (TX), Cert. 102116565

## LANGUAGES

English (native) · Spanish (advanced writing, intermediate speaking)
