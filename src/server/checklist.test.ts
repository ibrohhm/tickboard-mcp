import { describe, expect, it } from "vitest";
import { CycleError, InvalidParentError, InvalidTitleError, NotCheckableError, NotFoundError } from "./errors.js";
import { newService, seed } from "./testutil.js";

describe("parent rules", () => {
  it("keeps the hierarchy project > checklist > item", () => {
    const svc = newService();
    const { project, list, milk } = seed(svc);
    expect(() => svc.add("item", "x", project)).toThrow(InvalidParentError);
    expect(() => svc.add("checklist", "x", null)).toThrow(InvalidParentError);
    expect(() => svc.add("checklist", "x", list)).toThrow(InvalidParentError);
    expect(() => svc.add("project", "x", milk)).toThrow(InvalidParentError);
    expect(() => svc.add("item", "x", 9999)).toThrow(NotFoundError);
  });

  it("rejects blank and multi-line titles so the text tree stays one line per node", () => {
    const svc = newService();
    expect(() => svc.add("project", "  ", null)).toThrow(InvalidTitleError);
    expect(() => svc.add("project", "a\nb", null)).toThrow(InvalidTitleError);
  });
});

describe("tree", () => {
  it("counts done/total on checklists only", () => {
    const svc = newService();
    const { project } = seed(svc);
    const [p] = svc.tree();
    const [c] = p!.children;
    expect(p!.id).toBe(project);
    expect([c!.done, c!.total]).toEqual([1, 2]);
    expect([p!.done, p!.total]).toEqual([0, 0]);
  });

  it("returns only the requested subtree", () => {
    const svc = newService();
    const { list } = seed(svc);
    const [c] = svc.tree(list);
    expect(c!.title).toBe("shopping");
    expect(() => svc.tree(9999)).toThrow(NotFoundError);
  });
});

describe("setChecked", () => {
  it("only checks items", () => {
    const svc = newService();
    const { project, list, eggs } = seed(svc);
    expect(() => svc.setChecked(project, true)).toThrow(NotCheckableError);
    expect(() => svc.setChecked(list, true)).toThrow(NotCheckableError);
    svc.setChecked(eggs, true);
    expect(svc.tree()[0]!.children[0]!.done).toBe(2);
    svc.setChecked(eggs, false);
    expect(svc.tree()[0]!.children[0]!.done).toBe(1);
  });
});

describe("move", () => {
  it("rejects cycles and invalid parents", () => {
    const svc = newService();
    const { project, list } = seed(svc);
    const sub = svc.add("project", "sub", project);
    expect(() => svc.move(project, project)).toThrow(CycleError);
    expect(() => svc.move(project, sub)).toThrow(CycleError);
    expect(() => svc.move(list, null)).toThrow(InvalidParentError);
  });

  it("moves a checklist with its children to another project", () => {
    const svc = newService();
    const { project, list } = seed(svc);
    const other = svc.add("project", "other", null);
    svc.move(list, other);
    const tree = svc.tree();
    expect(tree.find((n) => n.id === project)!.children).toHaveLength(0);
    expect(tree.find((n) => n.id === other)!.children[0]!.total).toBe(2);
  });
});

describe("delete", () => {
  it("removes everything under the node", () => {
    const svc = newService();
    const { project, milk } = seed(svc);
    svc.delete(project);
    expect(svc.tree()).toEqual([]);
    expect(() => svc.setChecked(milk, true)).toThrow(NotFoundError);
  });
});

describe("rename", () => {
  it("changes the title and rejects unknown ids", () => {
    const svc = newService();
    const { list } = seed(svc);
    svc.rename(list, "weekly shop");
    expect(svc.tree(list)[0]!.title).toBe("weekly shop");
    expect(() => svc.rename(9999, "x")).toThrow(NotFoundError);
  });
});
