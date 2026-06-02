import type { DocMeta } from "./types.js";

export type PublicDocsInput = {
	docsMeta: readonly DocMeta[];
	markdownBySource?: Record<string, string>;
};

const slugPattern = /^[a-z0-9][a-z0-9-]*$/;

export function validatePublicDocsInput(input: PublicDocsInput): void {
	const errors: string[] = [];
	const slugs = new Set<string>();
	const sources = new Set<string>();

	for (const meta of input.docsMeta) {
		if (!slugPattern.test(meta.slug)) {
			errors.push(`doc "${meta.title}" has unsafe slug "${meta.slug}"`);
		}
		if (slugs.has(meta.slug)) {
			errors.push(`duplicate doc slug "${meta.slug}"`);
		}
		slugs.add(meta.slug);

		const normalizedSource = normalizePublicDocsSource(meta.source);
		if (!normalizedSource) {
			errors.push(`doc "${meta.title}" has unsafe source path "${meta.source}"`);
			continue;
		}
		if (normalizedSource !== meta.source) {
			errors.push(`doc "${meta.title}" source must be normalized as "${normalizedSource}", got "${meta.source}"`);
		}
		if (!isAllowedPublicDocsSource(normalizedSource)) {
			errors.push(
				`doc "${meta.title}" source "${meta.source}" is outside the public docs allowlist; only README.md and non-private docs/**/*.md are publishable`,
			);
		}
		if (sources.has(normalizedSource)) {
			errors.push(`duplicate doc source "${normalizedSource}"`);
		}
		sources.add(normalizedSource);
	}

	if (input.markdownBySource) {
		for (const source of Object.keys(input.markdownBySource)) {
			const normalizedSource = normalizePublicDocsSource(source);
			if (!normalizedSource) {
				errors.push(`markdownBySource has unsafe source path "${source}"`);
				continue;
			}
			if (normalizedSource !== source) {
				errors.push(`markdownBySource key must be normalized as "${normalizedSource}", got "${source}"`);
			}
			if (!isAllowedPublicDocsSource(normalizedSource)) {
				errors.push(`markdownBySource key "${source}" is outside the public docs allowlist`);
			}
			if (!sources.has(normalizedSource)) {
				errors.push(`markdownBySource includes "${source}", but docsMeta does not publish that source`);
			}
		}

		for (const source of sources) {
			if (input.markdownBySource[source] === undefined) {
				errors.push(`docsMeta publishes "${source}", but markdownBySource does not register it`);
			}
		}
	}

	if (errors.length > 0) {
		throw new Error(`Public docs guard failed:\n${errors.map((error) => `- ${error}`).join("\n")}`);
	}
}

export function assertPublicDocsSource(source: string): string {
	const normalizedSource = normalizePublicDocsSource(source);
	if (!normalizedSource || !isAllowedPublicDocsSource(normalizedSource)) {
		throw new Error(
			`Public docs guard rejected source "${source}". Only README.md and non-private docs/**/*.md are publishable.`,
		);
	}
	return normalizedSource;
}

export function normalizePublicDocsSource(source: string): string | undefined {
	if (!source || source.trim() !== source) {
		return undefined;
	}
	if (source.includes("\\") || source.includes("\0") || source.includes("?") || source.includes("#")) {
		return undefined;
	}
	if (source.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(source)) {
		return undefined;
	}

	const parts = source.split("/");
	if (parts.some((part) => part === "" || part === "." || part === "..")) {
		return undefined;
	}
	return parts.join("/");
}

export function isAllowedPublicDocsSource(source: string): boolean {
	if (source === "README.md") {
		return true;
	}
	return (
		source.startsWith("docs/") &&
		source.endsWith(".md") &&
		!source.startsWith("docs/private/") &&
		!source.split("/").some((part) => part.startsWith("."))
	);
}
