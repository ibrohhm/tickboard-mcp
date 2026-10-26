import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import type { Service } from "./checklist.js";
import { renderText } from "./render.js";

const text = (s: string): CallToolResult => ({ content: [{ type: "text", text: s }] });

const run = (fn: () => string): CallToolResult => {
  try {
    return text(fn());
  } catch (err) {
    return { isError: true, content: [{ type: "text", text: err instanceof Error ? err.message : String(err) }] };
  }
};

const id = z.number().int().describe("item id");
const title = (what: string) => z.string().describe(`${what}, single line`);

/** Builds the MCP server exposing the checklist tools backed by svc. */
export function createMcpServer(svc: Service): McpServer {
  const srv = new McpServer({ name: "tickboard-mcp", version: "0.2.0" });

  srv.registerTool(
    "add_project",
    {
      description: "Add a project at top level or under another project. Projects hold sub-projects and checklists. Returns the new id.",
      inputSchema: {
        title: title("project title"),
        parent_id: z.number().int().nullish().describe("parent project id; omit for top level"),
      },
    },
    ({ title, parent_id }) => run(() => `added [${svc.add("project", title, parent_id ?? null)}]`),
  );

  srv.registerTool(
    "add_checklist",
    {
      description: "Add a checklist under a project. Checklists hold items and cannot be nested. Returns the new id.",
      inputSchema: {
        title: title("checklist title"),
        project_id: z.number().int().describe("id of the project that will hold this checklist"),
      },
    },
    ({ title, project_id }) => run(() => `added [${svc.add("checklist", title, project_id)}]`),
  );

  srv.registerTool(
    "add_item",
    {
      description: "Add a checkable item to a checklist. Returns the new id.",
      inputSchema: {
        title: title("item title"),
        checklist_id: z.number().int().describe("id of the checklist that will hold this item"),
      },
    },
    ({ title, checklist_id }) => run(() => `added [${svc.add("item", title, checklist_id)}]`),
  );

  srv.registerTool(
    "list_tree",
    {
      description:
        "Show projects, checklists and items as an indented tree. Checklists show (done/total); items show [ ] or [x]. Set with_ids to see ids.",
      inputSchema: {
        root_id: z.number().int().nullish().describe("show only this node and its descendants; omit for everything"),
        with_ids: z.boolean().optional().describe("prefix each line with [id]; set true before calling a tool that needs an id"),
      },
      annotations: { readOnlyHint: true },
    },
    ({ root_id, with_ids }) => run(() => renderText(svc.tree(root_id ?? null), with_ids ?? false)),
  );

  srv.registerTool(
    "set_checked",
    {
      description: "Check or uncheck one item. Only items can be checked, not projects or checklists.",
      inputSchema: { id, checked: z.boolean().describe("true to check, false to uncheck") },
    },
    (args) =>
      run(() => {
        svc.setChecked(args.id, args.checked);
        return "ok";
      }),
  );

  srv.registerTool(
    "rename_item",
    {
      description: "Change the title of a project, checklist or item.",
      inputSchema: { id, title: title("new title") },
    },
    (args) =>
      run(() => {
        svc.rename(args.id, args.title);
        return "ok";
      }),
  );

  srv.registerTool(
    "move_item",
    {
      description:
        "Move a node (with its children) to a new parent, following the same parent rules as adding. Rejects moves into itself or its own descendants.",
      inputSchema: { id, new_parent_id: z.number().int().nullish().describe("new parent item id; omit for top level") },
    },
    (args) =>
      run(() => {
        svc.move(args.id, args.new_parent_id ?? null);
        return "ok";
      }),
  );

  srv.registerTool(
    "delete_item",
    {
      description: "Permanently delete a node AND everything under it. Confirm with the user before calling.",
      inputSchema: { id },
      annotations: { destructiveHint: true },
    },
    (args) =>
      run(() => {
        svc.delete(args.id);
        return "deleted";
      }),
  );

  return srv;
}
