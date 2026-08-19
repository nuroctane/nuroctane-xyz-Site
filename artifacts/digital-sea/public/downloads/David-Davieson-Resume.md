# David Davieson

**Product Engineer | Agentic Systems | Customer Success**

daviddavieson@gmail.com · [nuroctane.xyz](https://nuroctane.xyz) · [github.com/nuroctane](https://github.com/nuroctane) · [linkedin.com/in/david-davieson](https://linkedin.com/in/david-davieson)

## Summary

Product engineer and technical operator who builds and ships agentic systems, local AI infrastructure, 3D web products, native mobile apps, and institutional integrations. Built Rust, TypeScript, and Python products around an agent harness spanning 60+ model providers, local inference, real-time orbital visualization, privacy-first OCR, and manufacturing-oriented configuration. Brings customer success ownership across $1B+ AUM, $1.2M+ ARR retention, $1.7M+ capital deployment, and technical support leadership.

## Selected Projects

### NurCLI — Multi-provider agent harness
[nuroctane.xyz/cli](https://nuroctane.xyz/cli) · [github.com/nuroctane/nur-cli](https://github.com/nuroctane/nur-cli)
- Built a Rust agent harness spanning 60+ providers with a streaming TUI, tool loop, subagents, todos, auto-compaction, session resume, native vision, and manual/plan/auto permission modes that gate side effects before they run.
- Designed the plugin and natural-language skill system, hardened command sandbox, one-command provisioning, and knowledge integrations across Graphify, PLUR, Ruflo, and Executor so every tool call is permissioned, inspectable, and recoverable.

### StarConverter — exFAT ↔ NTFS conversion workbench
[github.com/nuroctane/StarConverter](https://github.com/nuroctane/StarConverter)
- Building a Rust analyze / plan / convert / verify / rollback workbench that keeps file-data extents in place where possible, relocates only conflicts, and constructs new filesystem metadata transactionally.
- Pre-alpha: image inspection, object-graph reconstruction, capability-gated planner, and fuzz targets. Conversion of live volumes stays blocked until the capability model clears it; no current executable writes disks.

### Observatory — 3D web observatory
[nuroctane.xyz/observatory](https://nuroctane.xyz/observatory)
- Multi-mode 3D observatory: Cesium Earth explore, CelesTrak/SGP4 live satellite field, NASA Eyes/Horizons mission hooks, solar system and constellation sky chart, plus Swiss Ephemeris (WASM) with every major house system and ayanamsa.
- Live orbital coverage and footprints with search, constellation filtering, two-hour data refreshes, and time controls for replaying or accelerating the scene, plus progressive globe and rover data panels.

### MODKEYS — 3D keyboard product configurator
[nuroctane.xyz/modkeys](https://nuroctane.xyz/modkeys) · [github.com/nuroctane/nuroctane-xyz-Site](https://github.com/nuroctane/nuroctane-xyz-Site)
- Built a React/Vite configurator for mechanical keyboard plates and keycaps with exact geometry, undo/redo, shareable URL-encoded builds, and dual mobile/desktop shells.
- Connected Express/Vercel and Upstash Redis services and shipped KLE JSON, SVG manufacturing-template, specification-sheet, and PDF export workflows so a configured build leaves the browser as shop-ready geometry and docs.

### SnipOCR — Private cross-platform screenshot OCR
[github.com/nuroctane/snipocr](https://github.com/nuroctane/snipocr)
- Built Windows and macOS tray utilities that watch screenshot folders and the clipboard, run OCR fully on-device, and return editable text without uploading capture content.
- Unified Windows.Media.Ocr, Apple Vision, RapidOCR, and ONNX Runtime behind a shared multi-engine workflow with optional hardware acceleration and no cloud round-trip.

### hermes-local-models — Local multi-model AI router
[github.com/nuroctane/hermes-local-models](https://github.com/nuroctane/hermes-local-models)
- Built an OpenAI-compatible local router over GGUF model inventories so Hermes and other agent CLIs can use local weights as a primary path with configurable cloud fallback when a provider drops.
- Automated cross-platform discovery, llama-server presets, model selection, and fallback routing to keep the agent loop running without a paid-inference hard stop.

## Professional Experience

### Capital One
**Teller | 2025–Present**
- Orchestrate end-to-end commercial financing for SMEs across working-capital, private-credit-aligned, and growth facilities.
- Facilitated $1.7M+ in capital deployment by matching borrower profiles to underwriting constraints and driving discovery through term-fit handoff.
- Use CRM analytics to keep pipeline velocity up without relaxing the quality gate on underwriting.

### Charter Communications
**Customer Solutions | May 2025–Sep 2025**
- Delivered sales and retention solutions for commercial and residential connected services at top-tier performance levels.
- Built a churn-reduction framework that defended $1.2M+ ARR and increased customer LTV approximately 25% through CRM risk signals and proactive field dispatch upgrades.

### Blockdaemon
**Customer Success Manager | Feb 2023–May 2025**
- Owned the lifecycle for $1B+ AUM institutional clients on high-availability blockchain node infrastructure and MPC wallets — uptime and recovery were the product.
- Established Grafana and Amazon Athena KPI cadences and drove MTTR below 24 hours on supported flows.
- Co-led feature rollouts and product launches by reviewing pull requests, deploying previews, and translating live client failures into engineering work across sales, compliance, product, and engineering.
- Diagnosed critical API discrepancies in Postman and delivered engineering-ready reproductions that prevented deployment delays.

### Apple
**Technical Support Lead | 2022–2023**
- Mentored 10–15 specialists to exceed 70% NPS and 85% CSAT while reporting performance trends to senior management.
- Owned escalations, coaching loops, and privacy and device-management standards under high-volume load.

### Coinbase
**Technical Support Lead | 2022**
- Led technical support protocols for teams of 5–7 across DeFi/CeFi operations, rollups, yield farming, and smart-contract interactions.
- Implemented client OpSec practices spanning hardware wallets, TOTP, and encrypted backups so high-volume institutional-adjacent workflows did not skip the safety steps.

## Commercial & Operational Impact

- MTTR below 24 hours on supported infrastructure flows
- 70%+ NPS and 85%+ CSAT team performance
- $1B+ AUM institutional customer lifecycle ownership
- $1.2M+ ARR defended through retention systems
- Approximately 25% customer LTV improvement
- $1.7M+ SME capital deployment

## Skills

- **Languages:** TypeScript/JavaScript, Python, Rust, Swift, Kotlin, Solidity, SQL
- **Agentic & Local AI:** Multi-provider model APIs, tool calling, subagents, plugins, skills, permission systems, Ollama, llama-server, GGUF routing, ONNX Runtime
- **Systems & Safety:** Filesystem conversion pipelines, capability models, fuzzing, sandboxed command execution, permissioned tool use
- **Product & Web:** React, Next.js, Vite, Three.js, CesiumJS, GSAP, Tailwind CSS, design systems, responsive and accessible UI
- **IDEs & Editors:** Zed, VS Code, Cursor, Windsurf, Neovim, JetBrains Suite
- **Mobile:** SwiftUI, Jetpack Compose, Capacitor, AVFoundation, Media3, Core Data, Room, Hilt
- **Backend & Delivery:** Node.js, Express, Python, REST, Vercel, Upstash Redis, Firebase, pnpm monorepos, GitHub Actions
- **Cloud & Operations:** AWS EC2/S3/Lambda/VPC/Athena, Docker, Kubernetes operations, Grafana, Prometheus, Postman
- **FinTech & Blockchain:** Commercial credit, EVM, wagmi/viem, RainbowKit, SIWE, RPC nodes, MPC wallets, DeFi/CeFi operations
- **Customer Systems:** Technical discovery, enterprise onboarding, lifecycle ownership, KPI/SLO reporting, CRM analytics, Salesforce, Jira, Confluence

## Leadership

- **ATX Tunerz Society — Vice President:** Help lead an Austin automotive community focused on car culture, meetups, and member support; drive community impact through events and coordination, and run the club’s public digital presence at tunerzsociety.site.

## Additional Builds

### Blackjack — Odds-first mobile Web3 table
[github.com/nuroctane/blackjack](https://github.com/nuroctane/blackjack)
- Engineered a multi-deck blackjack simulator with full rules, side decisions, recursive dealer outcomes, and exact next-hit bust probability.
- Shipped a Next.js/React/TypeScript shell with RainbowKit, WalletConnect, SIWE, GitHub authentication, and a Capacitor mobile wrapper.

### StarSleep — Dual-native sleep application
[github.com/nuroctane/StarSleep](https://github.com/nuroctane/StarSleep)
- Built iOS and Android applications with SwiftUI/AVFoundation/Core Data and Kotlin/Jetpack Compose/Media3/Room/Hilt.
- Implemented on-device natal calculations, a 12-dimension nightly scoring engine, and layered ambient audio with no shared cross-platform UI shell.

### Milady Derivatives Intelligence
[github.com/nuroctane/milady-derivatives](https://github.com/nuroctane/milady-derivatives)
- NFT collection intelligence pipeline with deterministic enrichment, lineage mapping, optimized imagery, open JSON APIs, and Firebase/GitHub Actions delivery.

### ERC-721M — NFT liquidity standard
[github.com/Zodomo/ERC721M](https://github.com/Zodomo/ERC721M)
- Collaborated on an EVM token standard and smart-contract surface for redistributing NFT secondary-market liquidity.

## Education

- University of North Texas — BA, Communications, 2021; Student Council; Cross-Examination Debate
- Houston Community College — AS, Computer Science; EPA Universal Technician (TX), Cert. 102116565

## Languages

English (native); Spanish (advanced writing, intermediate speaking)
