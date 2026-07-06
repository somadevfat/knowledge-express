import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  NotFoundError,
  getAllTags,
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

/**
 * 記事ごとの`title`/`description`/OGP metadataを生成する。
 * 記事が取得できない場合は「記事が見つかりません」を返す（実際のnotFound判定は本体側で行う）。
 */
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

/**
 * 記事詳細ページ。IDに一致する記事が無ければ`notFound()`（404ページ）を表示する。
 */
export default async function KnowledgeDetailPage({ params }: PageProps) {
  const { id } = await params;
  let article: Awaited<ReturnType<typeof getKnowledge>>;
  let tree: Awaited<ReturnType<typeof getKnowledgeTree>>;
  let siteConfig: Awaited<ReturnType<typeof getSiteConfig>>;
  let tags: Awaited<ReturnType<typeof getAllTags>>;

  try {
    [article, tree, siteConfig, tags] = await Promise.all([
      getKnowledge(id),
      getKnowledgeTree(),
      getSiteConfig(),
      getAllTags(),
    ]);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  return (
    <WikiLayout
      article={article}
      tree={tree}
      logoText={siteConfig.logoText}
      tags={tags}
    />
  );
}

/**
 * ビルド時に静的生成する記事詳細ページのパラメータ一覧。取得に失敗しても
 * ビルド自体は止めず、空配列（＝すべてオンデマンド生成）にフォールバックする。
 */
export async function generateStaticParams() {
  try {
    const articles = await getKnowledgeList();
    return articles.map((article) => ({ id: article.id }));
  } catch {
    return [];
  }
}
