// The registry of complete site designs. site.config.json selects one; every
// script that needs the list reads it here. Adding a design means a sibling in
// artifacts/ with its own embed.json, plus an entry in EMBEDS (worker/og-meta.ts).
export const DESIGNS = ["blackboard", "digital-sea"];

// Design-independent files under shared/public, copied into every design's
// build by shared/vite.mjs. No design may keep its own copy.
export const SHARED_PUBLIC = ["downloads", "robots.txt", "sitemap.xml", "assets/spines"];

export const SITE = "https://www.nuroctane.xyz";
