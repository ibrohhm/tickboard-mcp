import { useCallback, useEffect, useState } from "react";
import type { TreeNode } from "../../shared/types";
import { fetchTree, setChecked } from "../api";

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

export function useTree(pollMs = 5000) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setTree(await fetchTree());
      setError(null);
    } catch (e) {
      setError(`Could not load: ${message(e)}`);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(refresh, pollMs);
    return () => clearInterval(timer);
  }, [refresh, pollMs]);

  const toggle = useCallback(
    async (id: number, checked: boolean) => {
      try {
        await setChecked(id, checked);
      } catch (e) {
        setError(`Could not save: ${message(e)}`);
      }
      await refresh();
    },
    [refresh],
  );

  return { tree, error, toggle };
}
