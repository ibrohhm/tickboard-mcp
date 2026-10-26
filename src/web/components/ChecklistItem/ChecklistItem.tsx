import type { TreeNode } from "../../../shared/types";
import { ItemIcon } from "../ItemIcon/ItemIcon";
import styles from "./ChecklistItem.module.css";

interface Props {
  item: TreeNode;
  onToggle: (id: number, checked: boolean) => void;
}

export function ChecklistItem({ item, onToggle }: Props) {
  return (
    <li>
      <label className={`${styles.label} ${item.checked ? styles.done : ""}`}>
        <span className={styles.icon}>
          <ItemIcon />
        </span>
        <span className={styles.text}>{item.title}</span>
        <input
          className={styles.box}
          type="checkbox"
          checked={item.checked}
          onChange={(e) => onToggle(item.id, e.target.checked)}
        />
      </label>
    </li>
  );
}
