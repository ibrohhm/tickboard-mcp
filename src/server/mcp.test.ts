import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, beforeEach, expect, it } from "vitest";
import { createMcpServer } from "./mcp.js";
import { newService, seed } from "./testutil.js";

let client: Client;
let ids: ReturnType<typeof seed>;

beforeEach(async () => {
  const svc = newService();
  ids = seed(svc);
  const [ct, st] = InMemoryTransport.createLinkedPair();
  await createMcpServer(svc).connect(st);
  client = new Client({ name: "test", version: "0" });
  await client.connect(ct);
});

afterEach(() => client.close());

async function call(name: string, args: Record<string, unknown>) {
  const res = await client.callTool({ name, arguments: args });
  const text = (res.content as { text: string }[]).map((c) => c.text).join("");
  return { text, isError: Boolean(res.isError) };
}

it("exposes the same eight tools as the Go version", async () => {
  const { tools } = await client.listTools();
  expect(tools.map((t) => t.name).sort()).toEqual(
    ["add_checklist", "add_item", "add_project", "delete_item", "list_tree", "move_item", "rename_item", "set_checked"],
  );
});

it("adds and lists with ids", async () => {
  const added = await call("add_item", { title: "bread", checklist_id: ids.list });
  expect(added.text).toMatch(/^added \[\d+\]$/);
  const listed = await call("list_tree", { with_ids: true });
  expect(listed.text).toContain("bread");
  expect(listed.text).toContain("shopping (1/3)");
});

it("returns domain errors as tool errors instead of crashing", async () => {
  const bad = await call("set_checked", { id: ids.project, checked: true });
  expect(bad).toEqual({ text: "only items can be checked", isError: true });
  expect((await call("delete_item", { id: 9999 })).isError).toBe(true);
});

it("moves to top level when new_parent_id is omitted", async () => {
  const sub = (await call("add_project", { title: "sub", parent_id: ids.project })).text.match(/\d+/)![0];
  expect((await call("move_item", { id: Number(sub) })).text).toBe("ok");
});
