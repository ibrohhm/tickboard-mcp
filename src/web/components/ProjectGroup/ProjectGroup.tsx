import type { ReactNode } from "react";
import styles from "./ProjectGroup.module.css";

interface Props {
  title: string;
  children: ReactNode;
}

export function ProjectGroup({ title, children }: Props) {
  return (
    <div className={styles.group}>
      <div className={styles.title}>{title}</div>
      {children}
    </div>
  );
}
