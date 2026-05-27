import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const publishRoot = process.argv[2];

if (!publishRoot) {
	console.error("Usage: update-pages-index.mjs <publish-root>");
	process.exit(1);
}

const knownSites = [
	{
		slug: "clanky",
		title: "Clanky",
		description: "Personal Pi agent docs for setup, operations, memory, Discord, voice, and AgentRoom participation.",
	},
	{
		slug: "agent-room",
		title: "AgentRoom",
		description: "Coordination plane docs for rooms, runtimes, gateways, protocols, and local-first agent work.",
	},
	{
		slug: "agent-room-ios",
		title: "AgentRoom iOS",
		description: "Native iOS client docs for checking and steering AgentRoom from a phone.",
	},
	{
		slug: "clankvox",
		title: "ClankVox",
		description: "Rust media-plane docs for Discord voice, Go Live transport, audio, video, and IPC.",
	},
];

const entries = await readdir(publishRoot, { withFileTypes: true });
const publishedSlugs = new Set(entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name));
const publishedSites = knownSites.filter((site) => publishedSlugs.has(site.slug));
const unknownSites = [...publishedSlugs]
	.filter((slug) => !knownSites.some((site) => site.slug === slug))
	.sort()
	.map((slug) => ({
		slug,
		title: titleFromSlug(slug),
		description: "Published documentation.",
	}));

const sites = [...publishedSites, ...unknownSites];

await writeFile(path.join(publishRoot, "index.html"), renderIndex(sites));

function renderIndex(sites) {
	const cards = sites
		.map(
			(site) => `<a class="site" href="./${escapeHtml(site.slug)}/">
		<span>${escapeHtml(site.title)}</span>
		<small>${escapeHtml(site.description)}</small>
	</a>`,
		)
		.join("\n");

	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Agent Workspace Docs</title>
	<style>
		:root {
			color-scheme: light dark;
			font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
			background: #f7f7f4;
			color: #181917;
		}
		body {
			margin: 0;
			min-height: 100vh;
		}
		main {
			box-sizing: border-box;
			width: min(960px, 100%);
			margin: 0 auto;
			padding: 56px 20px;
		}
		h1 {
			margin: 0;
			font-size: clamp(2rem, 5vw, 4rem);
			line-height: 1;
			letter-spacing: 0;
		}
		p {
			max-width: 680px;
			margin: 18px 0 32px;
			color: #5a5d55;
			font-size: 1.05rem;
			line-height: 1.6;
		}
		.grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
			gap: 12px;
		}
		.site {
			display: flex;
			min-height: 128px;
			flex-direction: column;
			gap: 12px;
			justify-content: space-between;
			padding: 18px;
			border: 1px solid #d9dbd2;
			border-radius: 8px;
			background: #ffffff;
			color: inherit;
			text-decoration: none;
		}
		.site:hover {
			border-color: #8a8f7e;
		}
		.site span {
			font-weight: 700;
			font-size: 1.1rem;
		}
		.site small {
			color: #66695f;
			line-height: 1.45;
		}
		@media (prefers-color-scheme: dark) {
			:root {
				background: #11130f;
				color: #f4f5ee;
			}
			p {
				color: #b7baad;
			}
			.site {
				background: #181a15;
				border-color: #34372e;
			}
			.site:hover {
				border-color: #8f967d;
			}
			.site small {
				color: #b7baad;
			}
		}
	</style>
</head>
<body>
	<main>
		<h1>Agent Workspace Docs</h1>
		<p>Unified documentation for the agent workspace, generated from the source docs in each repository.</p>
		<div class="grid">
${cards || "			<p>No docs have been published yet.</p>"}
		</div>
	</main>
</body>
</html>
`;
}

function titleFromSlug(slug) {
	return slug
		.split("-")
		.filter(Boolean)
		.map((part) => part[0].toUpperCase() + part.slice(1))
		.join(" ");
}

function escapeHtml(value) {
	return value.replace(/[&<>"']/g, (char) => {
		switch (char) {
			case "&":
				return "&amp;";
			case "<":
				return "&lt;";
			case ">":
				return "&gt;";
			case '"':
				return "&quot;";
			case "'":
				return "&#39;";
			default:
				return char;
		}
	});
}
