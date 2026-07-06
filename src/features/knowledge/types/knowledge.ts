/**
 * 画面表示用のナレッジ記事DTO（`updatedAt`はシリアライズ可能なISO文字列）。
 */
export type Knowledge = {
  id: string;
  title: string;
  body: string;
  excerpt: string;
  tags: string[];
  category: string;
  path: string;
  order: number;
  sourceUrl: string;
  updatedAt?: string;
};

/**
 * Wikiサイドバーのカテゴリ/記事ツリーの1ノード。
 * カテゴリノードは`id`が`category:`で始まる。
 */
export type KnowledgeTreeNode = {
  id: string;
  title: string;
  path: string;
  children: KnowledgeTreeNode[];
};
