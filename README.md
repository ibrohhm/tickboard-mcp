# tickboard-mcp

Nested checklist stored in SQLite, exposed to Claude through an MCP server over stdio, with a React UI.

Node 24+ (uses built-in `node:sqlite`). Same DB file, schema and tool names as the Go version.

## Install

```bash
npm install && npm run build
claude mcp add checklist -- node "$PWD/dist/server/cli.js"
```

## UI

```bash
node dist/server/cli.js ui   # http://127.0.0.1:8787
```

Shows the tree, lets you tick items, refreshes every 5s so MCP changes appear.

## Tools

`add_project`, `add_checklist`, `add_item`, `list_tree`, `set_checked`, `rename_item`, `move_item`, `delete_item`.

## Config

| Env | Default | |
|-----|---------|---|
| `CHECKLIST_DB` | `~/.checklist-mcp/checklist.db` | SQLite file path |
| `CHECKLIST_UI_ADDR` | `127.0.0.1:8787` | listen address for `ui` |

## Development

```bash
npm run dev:api   # API on :8787
npm run dev:web   # Vite on :5173, proxies /api to :8787
npm run typecheck && npm test
```

Layout: `src/server` (`store` SQL → `checklist` rules → `mcp` tools / `http` API), `src/shared` (types), `src/web` (React: one folder per component, CSS modules, `hooks/`, `lib/`).
