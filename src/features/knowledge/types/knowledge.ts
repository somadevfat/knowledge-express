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

export type KnowledgeTreeNode = {
  id: string;
  title: string;
  path: string;
  children: KnowledgeTreeNode[];
};
