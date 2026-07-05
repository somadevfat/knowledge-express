import type {
  ApiResponse,
  Knowledge,
  KnowledgeTreeNode,
} from "../types/knowledge";

const apiBaseUrl =
  process.env.BACKEND_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Backend API request failed. status=${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function getKnowledgeList(): Promise<Knowledge[]> {
  const response = await fetchJson<ApiResponse<Knowledge[]>>("/knowledge");
  return response.data;
}

export async function getKnowledge(id: string): Promise<Knowledge> {
  const response = await fetchJson<ApiResponse<Knowledge>>(
    `/knowledge/${encodeURIComponent(id)}`,
  );
  return response.data;
}

export async function getKnowledgeTree(): Promise<KnowledgeTreeNode[]> {
  const response =
    await fetchJson<ApiResponse<KnowledgeTreeNode[]>>("/knowledge/tree");
  return response.data;
}

export async function searchKnowledge(params: {
  q?: string;
  tag?: string;
}): Promise<Knowledge[]> {
  const searchParams = new URLSearchParams();
  if (params.q !== undefined && params.q.trim().length > 0) {
    searchParams.set("q", params.q.trim());
  }
  if (params.tag !== undefined && params.tag.trim().length > 0) {
    searchParams.set("tag", params.tag.trim());
  }

  const query = searchParams.toString();
  const response = await fetchJson<ApiResponse<Knowledge[]>>(
    `/knowledge/search${query.length > 0 ? `?${query}` : ""}`,
  );
  return response.data;
}
