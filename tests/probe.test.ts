import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { probeCommitMessage } from "../src/core/probe.js";

describe("probeCommitMessage", () => {
  it("accepts conventional subjects and rejects freeform", () => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), "commitprobe-"));
    const ok = probeCommitMessage("feat: add login", out);
    expect(ok.ok).toBe(true);
    const bad = probeCommitMessage("fixed stuff", path.join(out, "b"));
    expect(bad.ok).toBe(false);
    expect(bad.issues.some((i) => i.ruleId === "CONVENTIONAL_FORMAT")).toBe(true);
  });
});
