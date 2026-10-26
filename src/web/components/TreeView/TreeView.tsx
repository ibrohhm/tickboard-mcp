import type { TreeNode } from "../../../shared/types";
import { CardGrid } from "../CardGrid/CardGrid";
import { ChecklistCard } from "../ChecklistCard/ChecklistCard";
import { ProjectGroup } from "../ProjectGroup/ProjectGroup";

interface Props {
  nodes: TreeNode[];
  onToggle: (id: number, checked: boolean) => void;
}

export function TreeView({ nodes, onToggle }: Props) {
  const lists = nodes.filter((n) => n.kind === "checklist");
  const projects = nodes.filter((n) => n.kind === "project");
  return (
    <>
      {lists.length > 0 && (
        <CardGrid>
          {lists.map((n) => (
            <ChecklistCard key={n.id} node={n} onToggle={onToggle} />
          ))}
        </CardGrid>
      )}
      {projects.map((n) => (
        <ProjectGroup key={n.id} title={n.title}>
          <TreeView nodes={n.children} onToggle={onToggle} />
        </ProjectGroup>
      ))}
    </>
  );
}
