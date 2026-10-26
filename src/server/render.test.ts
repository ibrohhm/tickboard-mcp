import { expect, it } from "vitest";
import { renderText } from "./render.js";
import { newService, seed } from "./testutil.js";

it("renders checkboxes, counts and ids so Claude can pick ids for other tools", () => {
  const svc = newService();
  const { project, list, milk, eggs } = seed(svc);
  expect(renderText(svc.tree(), true)).toBe(
    [
      `- [${project}] groceries`,
      `  - [${list}] shopping (1/2)`,
      `    - [x] [${milk}] milk`,
      `    - [ ] [${eggs}] eggs`,
    ].join("\n"),
  );
  expect(renderText(svc.tree(), false)).toContain("- [x] milk");
});

it("says (empty) for an empty tree", () => {
  expect(renderText([], false)).toBe("(empty)");
});
