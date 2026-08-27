# David Davieson

**Product Engineer · Agentic Systems · Customer Success**

**[ `daviddavieson@gmail.com` ] · [ `https://nuroctane.xyz` ] · [ `github.com/nuroctane` ] · [ `linkedin.com/in/david-davieson` ]**

***

## SUMMARY

> **Product engineer and technical operator.** I build and ship agentic systems, local AI infrastructure, 3D web products, native mobile apps, and institutional integrations across Rust, TypeScript, and Python.
>
> My work combines systems depth with commercial ownership: an agent harness spanning 60+ model providers, real-time orbital visualization, privacy-first OCR, and manufacturing-oriented configuration—backed by customer success across **$1B+ AUM**, **$1.2M+ ARR retention**, **$1.7M+ capital deployment**, and technical support leadership.

## SELECTED PRODUCTS

* **[ NurCLI — Multi-Provider Agent Harness ]** · [nuroctane.xyz/cli](https://www.nuroctane.xyz/cli) · [GitHub](https://github.com/nuroctane/nur-cli)
  * Built a production-minded **Rust** agent harness spanning 60+ providers with a streaming TUI, tool loop, subagents, todos, auto-compaction, session resume, native vision, and manual/plan/auto permission modes that gate side effects before they run.
  * Designed the plugin marketplace and natural-language skill system, hardened command sandbox, one-command provisioning, and persistent knowledge integrations across Graphify, PLUR, Ruflo, and Executor so every tool call is permissioned, inspectable, and recoverable.
  * Hardened the agent loop for security-critical work: sandboxed command execution (shell denylists, timeouts, SSRF-guarded fetches, atomic IO), per-provider privacy tiers (LOCAL/TEE/ZDR) whose failover never silently downgrades, and tamper-evident, hash-chained session receipts; shipped an audit-grade skill stack spanning a Solidity smart-contract auditor that orchestrates specialist subagents into severity-ranked findings, an on-chain exploit investigator, and 800+ cybersecurity playbooks (red-team attack simulation, detection engineering, hardening) delivered through the AKM package manager.
  * Designed agent memory as a persistent world model: memoir-style hierarchical memory on the M1–M4 agent-native framework with append-only tiers that age from near-verbatim working notes to coarse recollection, retrieved through one intent-routed path that fans a single query embedding across native memory, a local vector index, the knowledge graph, and a tenant-partitioned HelixDB graph-vector resident behind a durable local outbox — deduplicated by memory ID before prompt injection.
  * Engineered context management as the core discipline: auto-compaction against an OMP-style response reserve instead of a premature fixed percentage, oversized tool results spilled to content-addressed disk and reloaded exactly across sessions, provider prompt caches preserved turn-to-turn, and every model request assembled as one inspectable artifact with failover, fusion, subagents, and memory inference all reporting their real token and cost impact.
* **[ StarConverter — exFAT ↔ NTFS Conversion Workbench ]** · [GitHub](https://github.com/nuroctane/StarConverter)
  * Building a **Rust** analyze / plan / convert / verify / rollback workbench that keeps file-data extents in place where possible, relocates only conflicts, and constructs new filesystem metadata transactionally.
  * Pre-alpha: image inspection, object-graph reconstruction, capability-gated planner, and fuzz targets. Conversion of live volumes stays blocked until the capability model clears it; no current executable writes disks.
* **[ Observatory — 3D Web Observatory ]** · [nuroctane.xyz/observatory](https://www.nuroctane.xyz/observatory)
  * Multi-mode 3D observatory: Cesium Earth explore, CelesTrak/SGP4 live satellite field, NASA Eyes/Horizons mission hooks, solar system and constellation sky chart, plus Swiss Ephemeris (WASM) with every major house system and ayanamsa.
  * Live orbital coverage and footprints with search, constellation filtering, two-hour data refreshes, and time controls for replaying or accelerating the scene, plus progressive globe and rover data panels.
* **[ MODKEYS — 3D Keyboard Product Configurator ]** · [nuroctane.xyz/modkeys](https://www.nuroctane.xyz/modkeys)
  * Built a React/Vite configurator for mechanical keyboard plates and keycaps with exact geometry, undo/redo, shareable URL-encoded builds, and dual mobile/desktop shells.
  * Connected Express/Vercel and Upstash Redis services and shipped KLE JSON, SVG manufacturing-template, specification-sheet, and PDF export workflows so a configured build leaves the browser as shop-ready geometry and docs.
* **[ SnipOCR — Private Cross-Platform Screenshot OCR ]** · [GitHub](https://github.com/nuroctane/snipocr)
  * Built Windows and macOS tray utilities that watch screenshot folders and the clipboard, run OCR fully on-device, and return editable text without uploading capture content.
  * Unified Windows.Media.Ocr, Apple Vision, RapidOCR, and ONNX Runtime behind a shared multi-engine workflow with optional hardware acceleration and no cloud round-trip.
* **[ hermes-local-models — Local Multi-Model AI Router ]** · [GitHub](https://github.com/nuroctane/hermes-local-models)
  * Built an OpenAI-compatible local router over GGUF inventories so Hermes and other agent CLIs can use local weights as a primary path with configurable cloud fallback when a provider drops.
  * Automated cross-platform discovery, llama-server presets, model selection, and fallback routing to keep the agent loop running without a paid-inference hard stop.

## PROFESSIONAL EXPERIENCE

### CAPITAL ONE
**`Teller`** | *(2025–Present)*
> * Orchestrate end-to-end commercial financing for SMEs across working-capital, private-credit-aligned, and growth facilities.
> * Facilitated **$1.7M+ in capital deployment** by matching borrower profiles to underwriting constraints and driving discovery through term-fit handoff.
> * Use CRM analytics to keep pipeline velocity up without relaxing the quality gate on underwriting.

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

## COMMERCIAL & OPERATIONAL IMPACT

* **MTTR below 24 hours** on supported infrastructure flows
* **70%+ NPS** and **85%+ CSAT** team performance
* **$1B+ AUM** institutional customer lifecycle ownership
* **$1.2M+ ARR** defended through retention systems
* Approximately **25%** customer LTV improvement
* **$1.7M+** SME capital deployment

## SKILLS & TOOLING

| DOMAIN | TECHNOLOGIES / COMPETENCIES |
| :--- | :--- |
| **Languages** | TypeScript/JavaScript, Python, Rust, Swift, Kotlin, Solidity, SQL |
| **Agentic & Local AI** | Multi-provider model APIs, tool calling, subagents, plugins, skills, permission systems, Ollama, llama-server, GGUF routing, ONNX Runtime |
| **Systems & Safety** | Filesystem conversion pipelines, capability models, fuzzing, sandboxed command execution, permissioned tool use |
| **Product & Web** | React, Next.js, Vite, Three.js, CesiumJS, GSAP, Tailwind CSS, design systems, responsive and accessible UI |
| **IDEs & Editors** | Zed, VS Code, Cursor, Windsurf, Neovim, JetBrains Suite |
| **Mobile** | SwiftUI, Jetpack Compose, Capacitor, AVFoundation, Media3, Core Data, Room, Hilt |
| **Backend & Delivery** | Node.js, Express, Python, REST, Vercel, Upstash Redis, Firebase, pnpm monorepos, GitHub Actions |
| **Cloud & Operations** | AWS EC2/S3/Lambda/VPC/Athena, Docker, Kubernetes operations, Grafana, Prometheus, Postman |
| **FinTech & Blockchain** | Commercial credit, EVM, wagmi/viem, RainbowKit, SIWE, RPC nodes, MPC wallets, DeFi/CeFi operations |
| **Customer Systems** | Technical discovery, enterprise onboarding, lifecycle ownership, KPI/SLO reporting, CRM analytics, Salesforce, Jira, Confluence |

## LEADERSHIP

* **ATX Tunerz Society — Vice President** · Help lead an Austin automotive community focused on car culture, meetups, and member support; drive **community impact** through events and coordination, and run the club’s public digital presence at [tunerzsociety.site](https://tunerzsociety.site).

## ADDITIONAL BUILDS

* **[ Blackjack — Odds-First Mobile Web3 Table ]** · [GitHub](https://github.com/nuroctane/blackjack)
  * Multi-deck blackjack engine with full rules, recursive dealer outcomes, exact bust probability, SIWE/GitHub authentication, and a Capacitor mobile shell.
* **[ StarSleep — Dual-Native Sleep Application ]** · [GitHub](https://github.com/nuroctane/StarSleep)
  * SwiftUI and Jetpack Compose applications with on-device natal calculations, 12-dimension nightly scoring, and layered ambient audio.
* **[ Milady Derivatives Intelligence ]** · [GitHub](https://github.com/nuroctane/milady-derivatives)
  * NFT collection intelligence pipeline with deterministic enrichment, lineage mapping, optimized imagery, open JSON APIs, and Firebase/GitHub Actions delivery.
* **[ ERC-721M — NFT Liquidity Standard ]** · [GitHub](https://github.com/Zodomo/ERC721M)
  * Collaborated on an EVM token standard and smart-contract surface for redistributing NFT secondary-market liquidity.

## EDUCATION

* **University of North Texas** — BA, Communications, 2021 · Student Council · Cross-Examination Debate
* **Houston Community College** — AS, Computer Science · EPA Universal Technician (TX), Cert. 102116565

## LANGUAGES

English (native) · Spanish (advanced writing, intermediate speaking)
