import { describe, expect, it } from "vitest";
import { GitHubKnowledgeSource } from "./github-knowledge-source.js";
import { InMemoryKnowledgeSource } from "./in-memory-knowledge-source.js";
import { createKnowledgeSourceFromEnv } from "./create-knowledge-source.js";

describe("createKnowledgeSourceFromEnv", () => {
  it("正常系: GitHub設定がない場合はサンプルソースを返す", () => {
    const source = createKnowledgeSourceFromEnv({});

    expect(source).toBeInstanceOf(InMemoryKnowledgeSource);
  });

  it("境界値: GitHub設定が空文字の場合は未設定として扱う", () => {
    const source = createKnowledgeSourceFromEnv({
      GITHUB_OWNER: "",
      GITHUB_REPOSITORY: " "
    });

    expect(source).toBeInstanceOf(InMemoryKnowledgeSource);
  });

  it("正常系: GitHub設定がある場合はGitHubソースを返す", () => {
    const source = createKnowledgeSourceFromEnv({
      GITHUB_OWNER: "owner",
      GITHUB_REPOSITORY: "repo",
      GITHUB_BRANCH: "main",
      GITHUB_KNOWLEDGE_PATH: "docs"
    });

    expect(source).toBeInstanceOf(GitHubKnowledgeSource);
  });

  it("正常系: repositoryにGitHub URLを書いてもGitHubソースを返す", () => {
    const source = createKnowledgeSourceFromEnv({
      GITHUB_OWNER: "owner",
      GITHUB_REPOSITORY: "git@github.com:owner/knowledge-wiki.git"
    });

    expect(source).toBeInstanceOf(GitHubKnowledgeSource);
  });
});
