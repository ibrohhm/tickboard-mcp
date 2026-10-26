import type { TreeNode } from "../../../shared/types";
import { ChecklistItem } from "../ChecklistItem/ChecklistItem";
import styles from "./ChecklistCard.module.css";

interface Props {
  node: TreeNode;
  onToggle: (id: number, checked: boolean) => void;
}

export function ChecklistCard({ node, onToggle }: Props) {
  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>{node.title}</h2>
        <span className={styles.count}>
          {node.done}/{node.total}
        </span>
      </div>
      <ul className={styles.list}>
        {node.children.map((item) => (
          <ChecklistItem key={item.id} item={item} onToggle={onToggle} />
        ))}
      </ul>
    </section>
  );
}
