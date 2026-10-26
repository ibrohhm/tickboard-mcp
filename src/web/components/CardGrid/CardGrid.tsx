import type { ReactNode } from "react";
import styles from "./CardGrid.module.css";

export function CardGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}
