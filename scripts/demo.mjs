import path from "node:path";
import { probeCommitMessage } from "../dist/index.js";

const out = path.resolve("examples/out-demo");
const bad = probeCommitMessage("updated files", out);
console.log(JSON.stringify({ ok: bad.ok, issues: bad.issues.length, out }, null, 2));
