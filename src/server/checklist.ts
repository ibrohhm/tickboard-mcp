import type { Kind, TreeNode } from "../shared/types.js";
import { CycleError, InvalidParentError, InvalidTitleError, NotCheckableError } from "./errors.js";
import type { Item, Store } from "./store.js";

const cleanTitle = (title: string): string => {
  const t = title.trim();
  if (t === "" || /[\r\n]/.test(t)) throw new InvalidTitleError();
  return t;
};

const parentAllowed = (kind: Kind, parent: Item | null): boolean => {
  switch (kind) {
    case "project":
      return parent === null || parent.kind === "project";
    case "checklist":
      return parent?.kind === "project";
    case "item":
      return parent?.kind === "checklist";
  }
};

export class Service {
  constructor(private readonly store: Store) {}

  private loadParent(id: number | null): Item | null {
    return id === null ? null : this.store.get(id);
  }

  /** Creates a node of the given kind under parentId (null for top level) and returns its id. */
  add(kind: Kind, title: string, parentId: number | null): number {
    const t = cleanTitle(title);
    if (!parentAllowed(kind, this.loadParent(parentId))) throw new InvalidParentError();
    return this.store.insert(kind, t, parentId);
  }

  /** Returns all top-level nodes with children, or just rootId's subtree when rootId is set. */
  tree(rootId: number | null = null): TreeNode[] {
    if (rootId !== null) this.store.get(rootId);
    const nodes = new Map<number, TreeNode>();
    const items = this.store.subtree(rootId);
    for (const it of items) {
      nodes.set(it.id, { id: it.id, kind: it.kind, title: it.title, checked: it.checked, done: 0, total: 0, children: [] });
    }
    const top: TreeNode[] = [];
    for (const it of items) {
      const node = nodes.get(it.id)!;
      const parent = it.parentId === null ? undefined : nodes.get(it.parentId);
      if (!parent) {
        top.push(node);
        continue;
      }
      parent.children.push(node);
      if (parent.kind === "checklist") {
        parent.total++;
        if (node.checked) parent.done++;
      }
    }
    return top;
  }

  /** Sets an item's checked flag; projects and checklists cannot be checked. */
  setChecked(id: number, checked: boolean): void {
    if (this.store.get(id).kind !== "item") throw new NotCheckableError();
    this.store.setChecked(id, checked);
  }

  rename(id: number, title: string): void {
    this.store.setTitle(id, cleanTitle(title));
  }

  /** Reparents a node (null for top level), enforcing the parent rules and rejecting cycles. */
  move(id: number, newParentId: number | null): void {
    const it = this.store.get(id);
    const parent = this.loadParent(newParentId);
    if (!parentAllowed(it.kind, parent)) throw new InvalidParentError();
    if (newParentId !== null && (newParentId === id || this.store.isDescendant(id, newParentId))) throw new CycleError();
    this.store.setParent(id, newParentId);
  }

  /** Removes an item and all its descendants. */
  delete(id: number): void {
    this.store.remove(id);
  }
}
