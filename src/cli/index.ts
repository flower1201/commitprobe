#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import { probeCommitMessage } from "../core/probe.js";
import { ENGINE_VERSION } from "../version.js";

const program = new Command();
program
  .name("commitprobe")
  .description("Local conventional-commit probe with agent fix checklists")
  .version(ENGINE_VERSION)
  .argument("[message]", "commit message text")
  .option("--file <path>", "read message from file (e.g. .git/COMMIT_EDITMSG)")
  .option("--out <dir>", "output directory", "./commitprobe-report")
  .option("--fail", "exit 10 on error-severity issues", false)
  .action((message: string | undefined, opts: { file?: string; out: string; fail?: boolean }) => {
    let msg = message ?? "";
    if (opts.file) msg = fs.readFileSync(path.resolve(opts.file), "utf8");
    if (!msg && fs.existsSync(".git/COMMIT_EDITMSG")) {
      msg = fs.readFileSync(".git/COMMIT_EDITMSG", "utf8");
    }
    const result = probeCommitMessage(msg, path.resolve(opts.out));
    process.stdout.write(
      `${JSON.stringify({ ok: result.ok, issues: result.issues.length, out: opts.out }, null, 2)}\n`,
    );
    if (opts.fail && !result.ok) process.exitCode = 10;
  });

program.parseAsync(process.argv).catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exitCode = 1;
});
