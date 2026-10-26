#!/usr/bin/env node
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Service } from "./checklist.js";
import { createApp } from "./http.js";
import { createMcpServer } from "./mcp.js";
import { Store } from "./store.js";

const here = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.CHECKLIST_DB || join(homedir(), ".checklist-mcp", "checklist.db");
const svc = new Service(Store.open(dbPath));

if (process.argv[2] === "ui") {
  const [host = "127.0.0.1", port = "8787"] = (process.env.CHECKLIST_UI_ADDR || "127.0.0.1:8787").split(":");
  const webDir = here.endsWith(join("dist", "server")) ? join(here, "..", "web") : undefined;
  createApp(svc, webDir).listen(Number(port), host, () => {
    console.error(`tickboard-mcp: ui on http://${host}:${port}`);
  });
} else {
  await createMcpServer(svc).connect(new StdioServerTransport());
}
