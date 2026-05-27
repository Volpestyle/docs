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

Consumer repos call the shared workflow instead of copying deploy logic. The
workflow builds docs inside the private source repo, then publishes only the
generated static site into the public `Volpestyle/docs` Pages host:

```yaml
jobs:
  docs-pages:
    uses: Volpestyle/docs/.github/workflows/docs-pages.yml@main
    with:
      docs-base-path: /docs/agent-room/
      site-slug: agent-room
    secrets:
      docs-publish-token: ${{ secrets.DOCS_PUBLISH_TOKEN }}
```

`DOCS_PUBLISH_TOKEN` must be a fine-grained token that can write contents to the
public `Volpestyle/docs` repository. This keeps the agent repositories private
while still hosting one public docs website at `https://volpestyle.github.io/docs/`.

Merge shared framework changes here first, then run or dispatch each consumer
repo's docs workflow so the public docs host rebuilds with the latest framework.

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
