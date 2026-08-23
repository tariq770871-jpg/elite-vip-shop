#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const trackedFiles = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const patterns = [
  { name: "private key", regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
  { name: "OpenAI key", regex: /\bsk-[A-Za-z0-9]{20,}\b/ },
  { name: "GitHub token", regex: /\b(?:ghp|gho|ghs|ghr)_[A-Za-z0-9_]{20,}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b/ },
  { name: "Slack token", regex: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/ },
  { name: "non-empty service secret assignment", regex: /^(?:export\s+)?(?:SUPABASE_SERVICE_ROLE_KEY|SUPABASE_DB_PASSWORD)\s*=\s*(?!#|['"]?\s*$).+/m },
];

const findings = [];
for (const file of trackedFiles) {
  if (/\.(?:png|jpe?g|gif|webp|svg|ico|woff2?|ttf|pdf|zip|gz|lock)$/i.test(file)) continue;
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const pattern of patterns) {
    if (pattern.regex.test(content)) findings.push(`${file}: ${pattern.name}`);
  }
}

if (findings.length > 0) {
  console.error("Potential secrets detected in tracked files:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`Secret scan passed (${trackedFiles.length} tracked files checked).`);
