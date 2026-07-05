import type { Knowledge } from "../../domain/entities/knowledge.js";
import type { FetchKnowledgeSourcePort } from "../ports/fetch-knowledge-source-port.js";
import { listKnowledge } from "./list-knowledge.js";

export type KnowledgeTreeNode = {
  id: string;
  title: string;
  path: string;
  children: KnowledgeTreeNode[];
};

/**
 * Azure DevOps Wikiの左サイドバーで使う記事ツリーを生成する。
 *
 * @param source ナレッジソース取得Port。
 * @returns カテゴリ階層と記事を表すツリー。
 */
export async function getKnowledgeTree(source: FetchKnowledgeSourcePort): Promise<KnowledgeTreeNode[]> {
  const root: KnowledgeTreeNode[] = [];

  for (const knowledge of await listKnowledge(source)) {
    insertKnowledge(root, knowledge);
  }

  return sortTree(root);
}

function insertKnowledge(root: KnowledgeTreeNode[], knowledge: Knowledge): void {
  const props = knowledge.toProps();
  const categoryParts = props.category.split("/").map((part) => part.trim()).filter(Boolean);
  let currentLevel = root;
  let currentPath = "";

  for (const part of categoryParts) {
    currentPath = currentPath.length === 0 ? part : `${currentPath}/${part}`;
    let categoryNode = currentLevel.find((node) => node.id === `category:${currentPath}`);
    if (categoryNode === undefined) {
      categoryNode = {
        id: `category:${currentPath}`,
        title: part,
        path: currentPath,
        children: []
      };
      currentLevel.push(categoryNode);
    }
    currentLevel = categoryNode.children;
  }

  currentLevel.push({
    id: props.id,
    title: props.title,
    path: props.path,
    children: []
  });
}

function sortTree(nodes: KnowledgeTreeNode[]): KnowledgeTreeNode[] {
  return nodes
    .map((node) => ({
      ...node,
      children: sortTree(node.children)
    }))
    .sort((current, next) => current.title.localeCompare(next.title));
}

