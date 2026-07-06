import { Knowledge, type KnowledgeId } from "./knowledge-entity";
import type { FetchKnowledgeSourcePort } from "./knowledge-source";
import { NotFoundError } from "./errors";

/**
 * Wikiサイドバーで使うカテゴリ/記事ツリーの1ノード。
 * カテゴリノードは`id`が`category:`で始まる。
 */
export type KnowledgeTreeNode = {
  id: string;
  title: string;
  path: string;
  children: KnowledgeTreeNode[];
};

/**
 * {@link searchKnowledge}の検索条件。
 */
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
 *
 * @param query キーワード（タイトル・本文・抜粋・カテゴリを部分一致）とタグ（完全一致）。
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
 * 記事の`category`（`/`区切り）をもとにカテゴリノードを階層化する。
 */
export async function getKnowledgeTree(source: FetchKnowledgeSourcePort): Promise<KnowledgeTreeNode[]> {
  const root: KnowledgeTreeNode[] = [];

  for (const knowledge of await listKnowledge(source)) {
    insertKnowledge(root, knowledge);
  }

  return sortTree(root);
}

/**
 * 1件の記事を、そのcategoryパスに沿ってツリーへ挿入する。
 * 途中のカテゴリノードが無ければその場で作る（破壊的に`root`を更新する）。
 */
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

/**
 * ツリーの各階層をタイトルの辞書順に並べ替える（再帰的に子ノードも整列する）。
 */
function sortTree(nodes: KnowledgeTreeNode[]): KnowledgeTreeNode[] {
  return nodes
    .map((node) => ({
      ...node,
      children: sortTree(node.children)
    }))
    .sort((current, next) => current.title.localeCompare(next.title));
}
