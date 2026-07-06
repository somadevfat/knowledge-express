// Stub for the `server-only` package under Vitest.
// The real package throws when resolved outside a bundler that understands
// the "react-server" export condition (i.e. Next.js). Vitest runs plain
// Node, so it would hit that throw on every import; this empty module lets
// `import "server-only"` be a no-op in tests instead.
export {};
