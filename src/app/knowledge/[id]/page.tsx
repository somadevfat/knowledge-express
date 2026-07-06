import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  NotFoundError,
  getKnowledge,
  getKnowledgeList,
  getKnowledgeTree,
  getSiteConfig,
} from "@/features/knowledge/api/knowledge-api";
import { WikiLayout } from "@/features/wiki/components/wiki-layout";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const article = await getKnowledge(id);
    return {
      title: article.title,
      description: article.excerpt,
      openGraph: {
        title: article.title,
        description: article.excerpt,
        type: "article",
      },
    };
  } catch {
    return {
      title: "記事が見つかりません",
    };
  }
}

export default async function KnowledgeDetailPage({ params }: PageProps) {
  const { id } = await params;
  let article: Awaited<ReturnType<typeof getKnowledge>>;
  let tree: Awaited<ReturnType<typeof getKnowledgeTree>>;
  let siteConfig: Awaited<ReturnType<typeof getSiteConfig>>;

  try {
    [article, tree, siteConfig] = await Promise.all([
      getKnowledge(id),
      getKnowledgeTree(),
      getSiteConfig(),
    ]);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  return (
    <WikiLayout article={article} tree={tree} logoText={siteConfig.logoText} />
  );
}

export async function generateStaticParams() {
  try {
    const articles = await getKnowledgeList();
    return articles.map((article) => ({ id: article.id }));
  } catch {
    return [];
  }
}
