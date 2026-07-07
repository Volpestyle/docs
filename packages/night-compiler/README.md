# Night Compiler

Shared React/Vite documentation design system. The theme owns the reusable docs
UI and generic transforms; a consumer supplies the site registry, base URL,
branding, and deploy.

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

- a docs app with `src/docs-manifest.ts`, `src/content.ts`, and `src/main.tsx`
- repo-specific branding assets
- its own site registry and deploy pipeline

Use `defineDocsConfig` in the consumer app to bind page metadata to raw Markdown imports, then render `<DocsApp config={docsConfig} />`.

## Site registry

Use `createDocsSiteLinks({ baseUrl, sites })` to turn a consumer-owned registry
of `DocsSiteRegistryEntry` values into the `DocsSiteLink[]` the shell renders for
cross-site navigation. The theme owns the transform; the consumer owns the data,
so labels, hierarchy, URLs, and relationship metadata live in one place per
consumer.

```ts
import { createDocsSiteLinks } from "@volpestyle/night-compiler";

const siteLinks = createDocsSiteLinks({
	baseUrl: "https://docs.example.com",
	sites: [
		{ id: "core-docs", slug: "core", label: "Core", description: "Core docs." },
		{
			id: "plugin-docs",
			slug: "plugin",
			label: "Plugin",
			description: "Plugin module docs.",
			parentId: "core-docs",
			relationLabel: "module",
			metaLabel: "Core submodule",
		},
	],
});
```

Cross-site links resolve against `site.siteLinks`:

```md
[Core Ecosystem](docs://core-docs/ecosystem)
[Core Start Here](docs://core-docs/start-here)
[Plugin Overview](docs://plugin-docs/overview)
```

Local Vite dev can override published URLs with env vars.

## Deploy

The theme provides the shell components, the public-docs guard scripts, and the
`scripts/update-pages-index.mjs` root-landing generator. The consumer owns its
site config and deploy.

`update-pages-index.mjs` takes the publish root and an optional consumer config
JSON:

```bash
node scripts/update-pages-index.mjs <publish-root> [config.json]
```

The config supplies `baseUrl`, the known `sites` (each a `DocsSiteRegistryEntry`
with `slug`, `title`, and `description`), and a `landing` block for the
root-index branding (`title`, `heading`, `blurb`, `favicon`, and a `palette`).
With no config the generator emits a valid index with neutral dark defaults.

The public-docs guard enforces the publish boundary:

- docs apps may raw-import only `README.md` and Markdown files under `docs/`
- manifests may publish only `README.md` and non-private `docs/**/*.md`
- generated artifacts fail if they contain source maps, source-code files,
  repository metadata, dependency locks, env files, or high-confidence secrets
