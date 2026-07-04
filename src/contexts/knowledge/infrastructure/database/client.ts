import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

/**
 * PostgreSQLに接続するDrizzleクライアントを生成する。
 *
 * @param databaseUrl PostgreSQLの接続文字列。
 * @returns Drizzleクライアントと内部の接続プール。
 */
export function createDatabase(databaseUrl: string): {
  db: ReturnType<typeof drizzle<typeof schema>>;
  pool: pg.Pool;
} {
  const pool = new pg.Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });

  return { db, pool };
}
