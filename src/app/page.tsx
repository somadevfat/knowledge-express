import { redirect } from "next/navigation";

/**
 * ルート（`/`）は常に記事一覧へリダイレクトする。
 */
export default function HomePage() {
  redirect("/knowledge");
}
