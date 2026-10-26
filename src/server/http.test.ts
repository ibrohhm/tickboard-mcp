import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, expect, it } from "vitest";
import { createApp } from "./http.js";
import { newService, seed } from "./testutil.js";

let base = "";
let close = () => {};
let ids: ReturnType<typeof seed>;

beforeEach(async () => {
  const svc = newService();
  ids = seed(svc);
  const server = createApp(svc).listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  close = () => server.close();
});

afterEach(() => close());

const post = (body: string, type = "application/json") =>
  fetch(`${base}/api/check`, { method: "POST", headers: { "Content-Type": type }, body });

it("persists a check and reflects it in the tree", async () => {
  expect((await post(JSON.stringify({ id: ids.eggs, checked: true }))).status).toBe(204);
  const tree = await (await fetch(`${base}/api/tree`)).json();
  expect(tree[0].children[0].done).toBe(2);
});

it("refuses non-JSON content types so other web pages cannot tick items via form posts", async () => {
  expect((await post(`id=${ids.eggs}&checked=true`, "application/x-www-form-urlencoded")).status).toBe(415);
});

it("maps errors to 400/404", async () => {
  expect((await post(JSON.stringify({ id: 9999, checked: true }))).status).toBe(404);
  expect((await post(JSON.stringify({ id: ids.project, checked: true }))).status).toBe(400);
  expect((await post(JSON.stringify({ id: "x", checked: true }))).status).toBe(400);
  expect((await post("{not json")).status).toBe(400);
});
