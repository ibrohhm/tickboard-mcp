import { useState } from "react";
import { useTree } from "../../hooks/useTree";
import { pickProject, topProjects } from "../../lib/projects";
import { EmptyState } from "../EmptyState/EmptyState";
import { ErrorBanner } from "../ErrorBanner/ErrorBanner";
import { ProjectSelect } from "../ProjectSelect/ProjectSelect";
import { TreeView } from "../TreeView/TreeView";
import styles from "./App.module.css";

export function App() {
  const { tree, error, toggle } = useTree();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const projects = topProjects(tree);
  const project = pickProject(projects, selectedId);

  return (
    <main className={styles.page}>
      {project && <ProjectSelect projects={projects} selectedId={project.id} onChange={setSelectedId} />}
      {error && <ErrorBanner message={error} />}
      {project ? <TreeView nodes={project.children} onToggle={toggle} /> : !error && <EmptyState />}
    </main>
  );
}
