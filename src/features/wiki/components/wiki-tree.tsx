import Link from "next/link";
import { BookOpen, ChevronRight, FolderClosed } from "lucide-react";
import type { KnowledgeTreeNode } from "@/features/knowledge/types/knowledge";

type WikiTreeProps = {
  nodes: KnowledgeTreeNode[];
  activeId?: string;
};

export function WikiTree({ nodes, activeId }: WikiTreeProps) {
  if (nodes.length === 0) {
    return <p className="px-2 text-sm text-slate-500">記事がありません。</p>;
  }

  return (
    <nav aria-label="記事ツリー" className="space-y-1">
      {nodes.map((node) => (
        <WikiTreeItem key={node.id} node={node} activeId={activeId} />
      ))}
    </nav>
  );
}

function WikiTreeItem({
  node,
  activeId,
}: {
  node: KnowledgeTreeNode;
  activeId?: string;
}) {
  const isCategory = node.id.startsWith("category:");
  const isActive = node.id === activeId;

  if (isCategory) {
    const containsActive =
      activeId !== undefined && containsNodeId(node, activeId);

    return (
      <details className="group" open={containsActive}>
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded px-2 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 transition group-open:rotate-90" />
          <FolderClosed className="h-4 w-4 text-slate-500" />
          <span className="truncate">{node.title}</span>
        </summary>
        <div className="ml-4 border-l border-slate-200 pl-2">
          {node.children.map((child) => (
            <WikiTreeItem key={child.id} node={child} activeId={activeId} />
          ))}
        </div>
      </details>
    );
  }

  return (
    <Link
      href={`/knowledge/${node.id}`}
      className={[
        "flex items-center gap-2 rounded px-2 py-1.5 text-sm",
        isActive
          ? "bg-sky-100 font-semibold text-sky-900"
          : "text-slate-700 hover:bg-slate-100",
      ].join(" ")}
    >
      <BookOpen className="h-4 w-4 shrink-0 text-slate-500" />
      <span className="truncate">{node.title}</span>
    </Link>
  );
}

function containsNodeId(node: KnowledgeTreeNode, targetId: string): boolean {
  return node.children.some(
    (child) => child.id === targetId || containsNodeId(child, targetId),
  );
}
