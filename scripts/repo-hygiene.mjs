import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const trackedFiles = execFileSync("git", ["ls-files", "-z"])
  .toString("utf8")
  .split("\0")
  .filter(Boolean);

const forbiddenPaths = [
  { label: "local agent cache", pattern: /^\.nur\// },
  { label: "pasted intake artifact", pattern: /^attached_assets\// },
  { label: "machine monitor configuration", pattern: /^\d+_Disk.*\.ini$/i },
  { label: "local environment file", pattern: /(^|\/)\.env(?:\.[^/]+)?$/i, allow: /\.env\.example$/i },
  { label: "local Worker secrets", pattern: /(^|\/)\.dev\.vars$/i },
  { label: "private certificate", pattern: /\.(?:pem|p12|pfx)$/i },
  { label: "SSH private key", pattern: /(^|\/)id_(?:rsa|dsa|ecdsa|ed25519)(?:\..*)?$/i },
];

const secretPatterns = [
  { label: "private key", pattern: /-----BEGIN [A-Z0-9 ]{1,40}PRIVATE KEY-----/ },
  { label: "AWS access key", pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/ },
  { label: "GitHub token", pattern: /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/ },
  { label: "OpenAI API key", pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/ },
  { label: "Slack token", pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  {
    label: "Cloudflare API token assignment",
    pattern: /(?:CF_API_TOKEN|CLOUDFLARE_API_TOKEN)\s*(?:=|:)\s*["']?[A-Za-z0-9_-]{20,}/,
  },
];

const findings = [];

for (const file of trackedFiles) {
  for (const rule of forbiddenPaths) {
    if (rule.pattern.test(file) && !rule.allow?.test(file)) {
      findings.push(`${file}: ${rule.label}`);
    }
  }

  if (!existsSync(file)) continue;
  const bytes = readFileSync(file);
  if (bytes.includes(0)) continue;
  const text = bytes.toString("utf8");
  for (const rule of secretPatterns) {
    if (rule.pattern.test(text)) {
      findings.push(`${file}: possible ${rule.label}`);
    }
  }
}

if (findings.length) {
  console.error("Repository hygiene check failed. Remove these from Git before shipping:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`Repository hygiene check passed (${trackedFiles.length} tracked files scanned).`);
