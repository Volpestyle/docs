# Night Compiler Docs Shell

Shared React/Vite documentation shell for the Clanky agent ecosystem.

The shell exists so each repo can focus on three kinds of content:

1. what powerful things the user can do
2. what the user should let agents handle
3. diagrams that make the system understandable

## Package

- `@volpestyle/night-compiler`: responsive docs app shell with sidebar, table of
  contents, Mermaid diagrams, search palette, local page routing, cross-site
  docs links, theme persistence, and `llms.txt` generation.

## Cross-Site Links

Markdown can link across docs sites with the `docs://` scheme:

```md
[AgentRoom Ecosystem](docs://agent-room-docs/ecosystem)
[Clanky Start Here](docs://clanky-docs/start-here)
[ClankVox Overview](docs://clankvox-docs/overview)
```

The shell resolves those links through each site's `siteLinks` config. Published
docs use the shared GitHub Pages host at `https://volpestyle.github.io/docs/`;
local docs can override them with env vars such as `DOCS_AGENT_ROOM_URL`,
`DOCS_CLANKY_URL`, and `DOCS_CLANKVOX_URL`.

## Hosting

Agent repos stay private. Their docs workflows build from private Markdown and
publish only generated static output into this public repo's Pages branch under
paths such as `/docs/clanky/` and `/docs/agent-room/`.

The publish workflow treats the public boundary as a hard gate. Project docs may
only be built from `README.md` and Markdown files under `docs/`; raw imports from
source directories are rejected. The generated artifact is also scanned before
publish for source maps, source-code files, repo metadata, dependency locks, env
files, and high-confidence credentials.
