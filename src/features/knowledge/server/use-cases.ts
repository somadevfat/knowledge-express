import { Knowledge, type KnowledgeId } from "./knowledge-entity";
import type { FetchKnowledgeSourcePort } from "./knowledge-source";
import { NotFoundError } from "./errors";

export type KnowledgeTreeNode = {
  id: string;
  title: string;
  path: string;
  children: KnowledgeTreeNode[];
};

export type KnowledgeSearchQuery = {
  q?: string;
  tag?: string;
};

/**
 * GitHub由来のナレッジ記事を一覧取得する。
 */
export async function listKnowledge(source: FetchKnowledgeSourcePort): Promise<Knowledge[]> {
  const documents = await source.fetchAll();
  return documents
    .map((document) => Knowledge.fromSourceDocument(document))
    .sort((current, next) => {
      const currentProps = current.toProps();
      const nextProps = next.toProps();
      return currentProps.order - nextProps.order || currentProps.title.localeCompare(nextProps.title);
    });
}

/**
 * GitHub由来のナレッジ記事を1件取得する。
 *
 * @throws {NotFoundError} IDに一致する記事が存在しない場合。
 */
export async function getKnowledge(source: FetchKnowledgeSourcePort, id: KnowledgeId): Promise<Knowledge> {
  const knowledge = (await listKnowledge(source)).find((article) => article.toProps().id === id);
  if (knowledge === undefined) {
    throw new NotFoundError("Knowledge article was not found.");
  }
  return knowledge;
}

/**
 * GitHub由来のナレッジ記事をキーワードとタグで検索する。
 */
export async function searchKnowledge(
  source: FetchKnowledgeSourcePort,
  query: KnowledgeSearchQuery
): Promise<Knowledge[]> {
  const keyword = query.q?.trim().toLowerCase();
  const tag = query.tag?.trim().toLowerCase();

  return (await listKnowledge(source)).filter((knowledge) => {
    const props = knowledge.toProps();
    const matchesKeyword =
      keyword === undefined ||
      [props.title, props.body, props.excerpt, props.category].some((value) => value.toLowerCase().includes(keyword));
    const matchesTag = tag === undefined || props.tags.includes(tag);

    return matchesKeyword && matchesTag;
  });
}

/**
 * Azure DevOps Wikiの左サイドバーで使う記事ツリーを生成する。
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
