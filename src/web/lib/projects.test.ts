import { describe, expect, it } from "vitest";
import type { TreeNode } from "../../shared/types";
import { pickProject, topProjects } from "./projects";

const node = (id: number, kind: TreeNode["kind"]): TreeNode => ({
  id, kind, title: `n${id}`, checked: false, done: 0, total: 0, children: [],
});

const projects = [node(1, "project"), node(2, "project")];

it("lists only top-level projects", () => {
  expect(topProjects([node(1, "project"), node(2, "checklist")]).map((p) => p.id)).toEqual([1]);
});

describe("pickProject", () => {
  it("returns the selected project", () => {
    expect(pickProject(projects, 2)?.id).toBe(2);
  });

  it("falls back to the first when nothing is selected or the selection was deleted", () => {
    expect(pickProject(projects, null)?.id).toBe(1);
    expect(pickProject(projects, 99)?.id).toBe(1);
  });

  it("is undefined when there are no projects", () => {
    expect(pickProject([], null)).toBeUndefined();
  });
});
