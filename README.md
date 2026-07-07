# Night Compiler Docs Shell

Shared React/Vite documentation shell for the Clanky agent ecosystem.

The shell exists so each repo can focus on three kinds of content:

1. what powerful things the user can do
2. what the user should let agents handle
3. diagrams that make the system understandable

Public docs should also surface the protocols and skills that explain how the
system works behind the scenes. The goal is not a hard user-docs/agent-docs
split; it is concise docs with one source of truth for each kind of detail:
mental models in guides, exact procedures in skills or references, and local
session evidence in private docs.

## Package

- `@volpestyle/night-compiler`: responsive docs app shell with sidebar, table of
  contents, Mermaid diagrams, search palette, local page routing, cross-site
  docs links, theme persistence, and `llms.txt` generation.

## Cross-Site Links

Markdown can link across docs sites with the `docs://` scheme:

```md
[Clanky Ecosystem](docs://clanky-docs/ecosystem)
[Clanky Start Here](docs://clanky-docs/start-here)
[ClankVox Overview](docs://clankvox-docs/overview)
```

The shell resolves those links through each site's `siteLinks` config. Published
docs use the shared host at `https://docs.clankie.bot/`;
local Vite docs can override them with env vars such as
`VITE_DOCS_CLANKY_URL` and `VITE_DOCS_CLANKVOX_URL`.

## Hosting

Agent repos stay private. Their docs workflows build from private Markdown and
publish only generated static output into this public repo's Pages branch under
paths such as `/docs/clanky/` and `/docs/clankvox/`.

By default, `README.md` and Markdown under `docs/` are candidates for public
documentation, except `docs/private/**`, which is always rejected by the public
docs guard. Put maintainer-only material under `docs/private/` when it contains
local paths, session logs, restore points, credential-adjacent notes, or noisy
implementation evidence that should not be part of the public product story.

The publish workflow treats the public boundary as a hard gate. Project docs may
only be built from explicit docs manifests; raw imports from source directories
are rejected. The generated artifact is also scanned before publish for source
maps, source-code files, repo metadata, dependency locks, env files, and
high-confidence credentials.
