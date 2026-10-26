import type { TreeNode } from "../../shared/types";

export function topProjects(tree: TreeNode[]): TreeNode[] {
  return tree.filter((n) => n.kind === "project");
}

/** Returns the project with the given id, falling back to the first one when it is unset or was deleted. */
export function pickProject(projects: TreeNode[], id: number | null): TreeNode | undefined {
  return projects.find((p) => p.id === id) ?? projects[0];
}
