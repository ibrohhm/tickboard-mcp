import type { TreeNode } from "../shared/types.js";

/** Renders nodes as an indented checklist; withIds prefixes each title with its [id]. */
export function renderText(nodes: TreeNode[], withIds: boolean): string {
  if (nodes.length === 0) return "(empty)";
  const lines: string[] = [];
  const walk = (ns: TreeNode[], depth: number): void => {
    for (const n of ns) {
      const box = n.kind === "item" ? (n.checked ? "[x] " : "[ ] ") : "";
      const id = withIds ? `[${n.id}] ` : "";
      const count = n.kind === "checklist" ? ` (${n.done}/${n.total})` : "";
      lines.push(`${"  ".repeat(depth)}- ${box}${id}${n.title}${count}`);
      walk(n.children, depth + 1);
    }
  };
  walk(nodes, 0);
  return lines.join("\n");
}
