# Night Compiler

Shared React/Vite documentation shell for the Clanky agent ecosystem.

The package owns the reusable docs UI:

- responsive app shell
- sidebar and table of contents
- Markdown rendering
- Mermaid diagrams
- local docs-link routing
- cross-site docs links through `docs://site-id/slug`
- command palette search
- theme persistence
- `llms.txt` and `llms-full.txt` generation

Each consumer repo owns only:

- `apps/docs/src/docs-manifest.ts`
- `apps/docs/src/content.ts`
- `apps/docs/src/main.tsx`
- `apps/docs/scripts/generate-llms.ts`
- repo-specific branding assets
- a thin `.github/workflows/docs-pages.yml` caller

Use `defineDocsConfig` in the consumer app to bind page metadata to raw Markdown imports, then render `<DocsApp config={docsConfig} />`.

Use `createAgentWorkspaceSiteLinks()` for the shared Clanky / AgentRoom /
AgentRoom iOS / ClankVox site registry. The registry lives here so each docs
site does not duplicate labels, hierarchy, URLs, and relationship metadata.

Consumer repos can call the shared Pages workflow instead of copying the full
deploy job:

```yaml
jobs:
  docs-pages:
    uses: Volpestyle/docs/.github/workflows/docs-pages.yml@main
    with:
      docs-base-path: /agent-room/
```

Because the hosted sites live in separate repositories, merge shared framework
changes here first, then run or dispatch each consumer repo's docs workflow so
GitHub Pages rebuilds with the latest framework. A future repository-dispatch
workflow can automate that once a cross-repo deploy token exists.

Cross-site links resolve against `site.siteLinks`:

```md
[AgentRoom Ecosystem](docs://agent-room-docs/ecosystem)
[Clanky Start Here](docs://clanky-docs/start-here)
[ClankVox Overview](docs://clankvox-docs/overview)
[AgentRoom iOS Overview](docs://agent-room-ios-docs/overview)
```

Local dev can override published URLs with env vars such as
`DOCS_AGENT_ROOM_URL`, `DOCS_CLANKY_URL`, `DOCS_AGENT_ROOM_IOS_URL`, and
`DOCS_CLANKVOX_URL`.
