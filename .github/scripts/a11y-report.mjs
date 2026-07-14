#!/usr/bin/env node
/**
 * Turns the Storybook test-runner output into a human-readable, grouped
 * accessibility summary (Markdown), with two sections:
 *  - Blocking violations (stories at `a11y.test: 'error'` that failed) — from JUnit.
 *  - Known issues (stories at `a11y.test: 'todo'` that warned) — from the run log.
 *
 * Usage: node a11y-report.mjs <junit.xml> <run.log> <outFile>
 * Any path may be omitted/missing; missing sources are simply skipped.
 * Also appends the Markdown to $GITHUB_STEP_SUMMARY when set.
 */
import fs from "fs";

const junitPath = process.argv[2] ?? "a11y-report/junit.xml";
const logPath = process.argv[3] ?? "a11y-report/output.log";
const outFile = process.argv[4] ?? "a11y-report/summary.md";

const stripAnsi = (s) => s.replace(/\x1b?\[[0-9;]*m/g, "");
const unescapeXml = (s) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#10;/g, "\n")
    .replace(/&#13;/g, "\r")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

// --- Blocking violations, from JUnit (native failures, with rule ids) ---
// component -> { rules: Map<ruleId, count>, stories: Set<story> }
const blocking = new Map();
let blockingStories = 0;

if (fs.existsSync(junitPath)) {
  const xml = fs.readFileSync(junitPath, "utf8");
  const suiteRe =
    /<testsuite\b[^>]*\bname="([^"]*)"[^>]*\bfailures="(\d+)"[^>]*>([\s\S]*?)<\/testsuite>/g;
  for (const [, suiteName, failStr, body] of xml.matchAll(suiteRe)) {
    if (Number(failStr) === 0) continue;
    const component = unescapeXml(suiteName);
    const caseRe = /<testcase\b[^>]*\bname="([^"]*)"[^>]*>([\s\S]*?)<\/testcase>/g;
    for (const [, caseName, caseBody] of body.matchAll(caseRe)) {
      const failMatch = caseBody.match(/<failure\b[^>]*>([\s\S]*?)<\/failure>/);
      if (!failMatch) continue;
      blockingStories++;
      const failure = stripAnsi(unescapeXml(failMatch[1]));
      const rules = new Set();
      for (const [, id] of failure.matchAll(
        /dequeuniversity\.com\/rules\/axe\/[\d.]+\/([a-z0-9-]+)/g,
      )) {
        rules.add(id);
      }
      if (rules.size === 0) {
        for (const [, id] of failure.matchAll(/\(([a-z][a-z0-9-]{2,})\)/g)) rules.add(id);
      }
      if (rules.size === 0) rules.add("unknown");
      let story = unescapeXml(caseName);
      if (story.startsWith(component + " ")) story = story.slice(component.length + 1);
      story = story.replace(/\s+smoke-test$/, "").trim();
      if (!blocking.has(component)) blocking.set(component, { rules: new Map(), stories: new Set() });
      const e = blocking.get(component);
      e.stories.add(story);
      for (const r of rules) e.rules.set(r, (e.rules.get(r) ?? 0) + 1);
    }
  }
}

// --- Known issues, from the run log (a11y.test: 'todo' warnings) ---
// component -> Map<story, violationCount>
const todos = new Map();
let todoStories = 0;

if (fs.existsSync(logPath)) {
  const lines = stripAnsi(fs.readFileSync(logPath, "utf8")).split("\n");
  const titleRe = /((?:TEDI-Ready|Community)\/\S[^>]*?)\s+>\s+(.+?)\s*$/;
  const warnRe = /Found\s+(\d+)\s+a11y violations,\s+run the test with 'a11y: \{ test: 'error' \}'/;
  let last = null;
  for (const raw of lines) {
    const line = raw.replace(/^\[A11Y\]\s?/, "").trim();
    if (line.includes("http") || line.startsWith("Click")) continue;
    const t = line.match(titleRe);
    if (t) {
      last = { component: t[1].trim(), story: t[2].trim() };
      continue;
    }
    const w = line.match(warnRe);
    if (w && last) {
      if (!todos.has(last.component)) todos.set(last.component, new Map());
      const m = todos.get(last.component);
      if (!m.has(last.story)) todoStories++;
      m.set(last.story, Number(w[1]));
      last = null;
    }
  }
}

// --- Render ---
const out = [];

if (blockingStories === 0) {
  out.push(`## ♿ Accessibility — ✅ no blocking violations`);
  out.push("");
  out.push(`All TEDI-Ready stories pass automated axe checks${todoStories ? " (known issues tracked below)" : ""}.`);
} else {
  const comps = blocking.size;
  const ruleTotals = new Map();
  for (const { rules } of blocking.values())
    for (const [r, c] of rules) ruleTotals.set(r, (ruleTotals.get(r) ?? 0) + c);
  out.push(`## ♿ Accessibility — ❌ ${blockingStories} blocking violation${blockingStories === 1 ? "" : "s"} across ${comps} component${comps === 1 ? "" : "s"}`);
  out.push("");
  out.push("Fix these, or mark a known issue with `parameters: { a11y: { test: 'todo' } }`.");
  out.push("");
  out.push("**By rule:** " + [...ruleTotals.entries()].sort((a, b) => b[1] - a[1]).map(([r, c]) => `\`${r}\` ×${c}`).join(" · "));
  out.push("");
  out.push("| Component | Rules | Stories |");
  out.push("|---|---|---|");
  for (const [component, { rules, stories }] of [...blocking.entries()].sort()) {
    const ruleStr = [...rules.entries()].sort((a, b) => b[1] - a[1]).map(([r, c]) => `\`${r}\`${c > 1 ? ` ×${c}` : ""}`).join(", ");
    out.push(`| ${component} | ${ruleStr} | ${stories.size} |`);
  }
  out.push("");
  out.push("<details><summary>Failing stories</summary>\n");
  for (const [component, { stories }] of [...blocking.entries()].sort())
    out.push(`- **${component}** — ${[...stories].sort().join(", ")}`);
  out.push("\n</details>");
}

if (todoStories > 0) {
  out.push("");
  out.push(`### ⚠️ Known issues — ${todoStories} ${todoStories === 1 ? "story" : "stories"} marked \`todo\` (warn only, not blocking)`);
  out.push("");
  out.push("| Component | Stories | Violations |");
  out.push("|---|---|---|");
  for (const [component, stories] of [...todos.entries()].sort()) {
    const total = [...stories.values()].reduce((a, b) => a + b, 0);
    out.push(`| ${component} | ${stories.size} | ${total} |`);
  }
  out.push("");
  out.push("_These are deliberately deferred (e.g. pending a design/token decision or another migration). Open the story's a11y panel in Storybook for details._");
}

const md = out.join("\n") + "\n";
fs.mkdirSync(outFile.replace(/\/[^/]*$/, "") || ".", { recursive: true });
fs.writeFileSync(outFile, md);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
console.log(md);
