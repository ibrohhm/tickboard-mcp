import type { TreeNode } from "../shared/types";

async function failIfNotOk(res: Response): Promise<Response> {
  if (!res.ok) throw new Error((await res.text()) || res.statusText);
  return res;
}

export async function fetchTree(): Promise<TreeNode[]> {
  const res = await failIfNotOk(await fetch("/api/tree"));
  return res.json();
}

export async function setChecked(id: number, checked: boolean): Promise<void> {
  await failIfNotOk(
    await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, checked }),
    }),
  );
}
