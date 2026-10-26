import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { Kind } from "../shared/types.js";
import { NotFoundError } from "./errors.js";

export interface Item {
  id: number;
  parentId: number | null;
  kind: Kind;
  title: string;
  checked: boolean;
}

interface Row {
  id: number;
  parent_id: number | null;
  kind: Kind;
  title: string;
  checked: number;
}

const PRAGMAS = "PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL;";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS items (
  id         INTEGER PRIMARY KEY,
  parent_id  INTEGER REFERENCES items(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL CHECK (kind IN ('project','checklist','item')),
  title      TEXT NOT NULL,
  checked    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS items_parent_idx ON items(parent_id);`;

const toItem = (r: Row): Item => ({
  id: r.id,
  parentId: r.parent_id,
  kind: r.kind,
  title: r.title,
  checked: r.checked !== 0,
});

export class Store {
  private constructor(private readonly db: DatabaseSync) {}

  /** Opens or creates the SQLite database at path; ":memory:" gives a private in-memory DB. */
  static open(path: string): Store {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    const db = new DatabaseSync(path);
    db.exec(PRAGMAS);
    db.exec(SCHEMA);
    return new Store(db);
  }

  close(): void {
    this.db.close();
  }

  /** Adds a node under parentId (null for top level) and returns its id. */
  insert(kind: Kind, title: string, parentId: number | null): number {
    const res = this.db.prepare("INSERT INTO items (parent_id, kind, title) VALUES (?, ?, ?)").run(parentId, kind, title);
    return Number(res.lastInsertRowid);
  }

  /** Returns one item or throws NotFoundError. */
  get(id: number): Item {
    const row = this.db
      .prepare("SELECT id, parent_id, kind, title, checked FROM items WHERE id = ?")
      .get(id) as unknown as Row | undefined;
    if (!row) throw new NotFoundError();
    return toItem(row);
  }

  setChecked(id: number, checked: boolean): void {
    this.mustAffect("UPDATE items SET checked = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", checked ? 1 : 0, id);
  }

  setTitle(id: number, title: string): void {
    this.mustAffect("UPDATE items SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", title, id);
  }

  setParent(id: number, parentId: number | null): void {
    this.mustAffect("UPDATE items SET parent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", parentId, id);
  }

  /** Removes an item and all its descendants. */
  remove(id: number): void {
    this.mustAffect("DELETE FROM items WHERE id = ?", id);
  }

  /** Returns all items when rootId is null, else rootId and its descendants, ordered by id. */
  subtree(rootId: number | null): Item[] {
    const rows = this.db
      .prepare(
        `WITH RECURSIVE t(id, parent_id, kind, title, checked) AS (
           SELECT id, parent_id, kind, title, checked FROM items
           WHERE (? IS NULL AND parent_id IS NULL) OR id = ?
           UNION
           SELECT i.id, i.parent_id, i.kind, i.title, i.checked FROM items i JOIN t ON i.parent_id = t.id
         )
         SELECT id, parent_id, kind, title, checked FROM t ORDER BY id`,
      )
      .all(rootId, rootId) as unknown as Row[];
    return rows.map(toItem);
  }

  /** Reports whether candidateId sits anywhere below ancestorId. */
  isDescendant(ancestorId: number, candidateId: number): boolean {
    const row = this.db
      .prepare(
        `WITH RECURSIVE t(id) AS (
           SELECT id FROM items WHERE parent_id = ?
           UNION
           SELECT i.id FROM items i JOIN t ON i.parent_id = t.id
         )
         SELECT EXISTS(SELECT 1 FROM t WHERE id = ?) AS found`,
      )
      .get(ancestorId, candidateId) as unknown as { found: number };
    return row.found !== 0;
  }

  private mustAffect(sql: string, ...args: (string | number | null)[]): void {
    if (this.db.prepare(sql).run(...args).changes === 0) throw new NotFoundError();
  }
}
