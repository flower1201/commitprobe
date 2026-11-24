# commitprobe

**Local conventional-commit probe with agent-readable fix checklists.**

Inspired by [commitlint#5003](https://github.com/conventional-changelog/commitlint/issues/5003) (LLM/convention introspection) — a tiny offline checker that writes JSON + Markdown hints coding agents can apply.

```bash
npm install && npm run build
npx commitprobe "feat: add login" --out ./commitprobe-report --fail
```

## License

MIT
