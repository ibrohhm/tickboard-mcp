import type { TreeNode } from "../../../shared/types";
import styles from "./ProjectSelect.module.css";

interface Props {
  projects: TreeNode[];
  selectedId: number;
  onChange: (id: number) => void;
}

export function ProjectSelect({ projects, selectedId, onChange }: Props) {
  return (
    <select
      className={styles.select}
      aria-label="Project"
      value={selectedId}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.title}
        </option>
      ))}
    </select>
  );
}
