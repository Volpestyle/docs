#!/usr/bin/env node
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const publishRoot = process.argv[2];
const configPath = process.argv[3];

if (!publishRoot) {
	console.error("Usage: update-pages-index.mjs <publish-root> [config.json]");
	process.exit(1);
}

const config = configPath ? JSON.parse(await readFile(configPath, "utf8")) : {};

const defaultLanding = {
	title: "Documentation",
	heading: "Documentation",
	blurb: "Published documentation.",
	favicon:
		"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23111111'/%3E%3C/svg%3E",
	palette: {
		bg: "#111",
		ink: "#eee",
		muted: "#999",
		border: "#333",
		borderHover: "#555",
		card: "#1a1a1a",
	},
};

const landingConfig = config.landing ?? {};
const landing = {
	...defaultLanding,
	...landingConfig,
	palette: { ...defaultLanding.palette, ...(landingConfig.palette ?? {}) },
};

const knownSites = config.sites ?? [];

const entries = await readdir(publishRoot, { withFileTypes: true });
const publishedSlugs = new Set(
	entries
		.filter((entry) => entry.isDirectory() && isPublicSiteSlug(entry.name))
		.map((entry) => entry.name),
);
const publishedSites = knownSites.filter((site) => publishedSlugs.has(site.slug));
const unknownSites = [...publishedSlugs]
	.filter((slug) => !knownSites.some((site) => site.slug === slug))
	.sort()
	.map((slug) => ({
		slug,
		label: titleFromSlug(slug),
		description: "Published documentation.",
	}));

const sites = [...publishedSites, ...unknownSites];

await writeFile(path.join(publishRoot, "index.html"), renderIndex(sites, landing));

function renderIndex(sites, landing) {
	const cards = sites
		.map(
			(site) => `<a class="site" href="./${escapeHtml(site.slug)}/">
		<span>${escapeHtml(site.label)}</span>
		<small>${escapeHtml(site.description ?? "")}</small>
	</a>`,
		)
		.join("\n");

	const { palette } = landing;

	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>${escapeHtml(landing.title)}</title>
	<link rel="icon" href="${landing.favicon}">
	<style>
		:root {
			color-scheme: dark;
			--bg: ${palette.bg};
			--ink: ${palette.ink};
			--muted: ${palette.muted};
			--border: ${palette.border};
			--border-hover: ${palette.borderHover};
			--card: ${palette.card};
			font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
			background: var(--bg);
			color: var(--ink);
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
			font-family: ui-monospace, Menlo, monospace;
			font-size: clamp(2rem, 5vw, 4rem);
			line-height: 1;
			letter-spacing: -0.02em;
		}
		p {
			max-width: 680px;
			margin: 18px 0 32px;
			color: var(--muted);
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
			border: 1px solid var(--border);
			border-radius: 8px;
			background: var(--card);
			color: inherit;
			text-decoration: none;
		}
		.site:hover {
			border-color: var(--border-hover);
		}
		.site span {
			font-weight: 700;
			font-size: 1.1rem;
		}
		.site small {
			color: var(--muted);
			line-height: 1.45;
		}
	</style>
</head>
<body>
	<main>
		<h1>${escapeHtml(landing.heading)}</h1>
		<p>${escapeHtml(landing.blurb)}</p>
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

function isPublicSiteSlug(slug) {
	return /^[a-z0-9][a-z0-9-]*$/.test(slug);
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
