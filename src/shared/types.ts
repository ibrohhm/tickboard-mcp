export type Kind = "project" | "checklist" | "item";

export interface TreeNode {
  id: number;
  kind: Kind;
  title: string;
  checked: boolean;
  done: number;
  total: number;
  children: TreeNode[];
}
