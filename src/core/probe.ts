import fs from "node:fs";
import path from "node:path";
import { ENGINE_VERSION } from "../version.js";

const TYPES =
  "feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert";

export type Issue = {
  ruleId: string;
  message: string;
  fixHint: string;
  severity: "error" | "warn";
};

export type ProbeResult = {
  schemaVersion: "1.0";
  engineVersion: string;
  message: string;
  ok: boolean;
  issues: Issue[];
  artifacts: { json: string; markdown: string };
};

export function probeCommitMessage(message: string, outDir: string): ProbeResult {
  const issues: Issue[] = [];
  const subject = message.trim().split(/\r?\n/)[0] ?? "";
  const re = new RegExp(`^(${TYPES})(\\([a-z0-9._/-]+\\))?!?: .+`);

  if (!subject) {
    issues.push({
      ruleId: "EMPTY",
      message: "commit message is empty",
      fixHint: "Use e.g. feat: add login button",
      severity: "error",
    });
  } else if (!re.test(subject)) {
    issues.push({
      ruleId: "CONVENTIONAL_FORMAT",
      message: `subject does not match conventional commits: "${subject}"`,
      fixHint: `Start with one of [${TYPES}] then optional (scope): then description`,
      severity: "error",
    });
  }
  if (subject.length > 72) {
    issues.push({
      ruleId: "SUBJECT_TOO_LONG",
      message: `subject length ${subject.length} > 72`,
      fixHint: "Shorten the first line; put details in the body",
      severity: "warn",
    });
  }
  if (/^[A-Z]/.test(subject.split(": ").slice(1).join(": "))) {
    issues.push({
      ruleId: "SUBJECT_CAPITALIZED",
      message: "description after type should usually be lowercase",
      fixHint: "Prefer feat: add x over feat: Add x",
      severity: "warn",
    });
  }
  if (/\.\s*$/.test(subject)) {
    issues.push({
      ruleId: "TRAILING_PERIOD",
      message: "subject ends with a period",
      fixHint: "Remove the trailing period on the subject line",
      severity: "warn",
    });
  }

  fs.mkdirSync(outDir, { recursive: true });
  const result: ProbeResult = {
    schemaVersion: "1.0",
    engineVersion: ENGINE_VERSION,
    message: subject,
    ok: !issues.some((i) => i.severity === "error"),
    issues,
    artifacts: { json: "report.json", markdown: "summary.md" },
  };
  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(result, null, 2));
  fs.writeFileSync(
    path.join(outDir, "summary.md"),
    [
      "# CommitProbe report",
      "",
      `Message: \`${subject || "(empty)"}\``,
      `OK: ${result.ok}`,
      "",
      "## Issues",
      ...issues.map((i) => `- **${i.severity}** \`${i.ruleId}\` — ${i.message}`),
      "",
      "## Agent checklist",
      ...issues.map((i) => `- ${i.fixHint}`),
    ].join("\n"),
  );
  return result;
}
