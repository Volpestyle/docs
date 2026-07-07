import type { DocsSiteLink, DocsSiteRegistryEntry } from "./types.js";

export function createDocsSiteLinks(
	options: { baseUrl: string; sites: readonly DocsSiteRegistryEntry[] },
): DocsSiteLink[] {
	const base = options.baseUrl.replace(/\/$/, "");
	return options.sites.map((site) => {
		const link: DocsSiteLink = {
			id: site.id,
			label: site.label,
			href: `${base}/${site.slug}/`,
		};
		if (site.description) link.description = site.description;
		if (site.parentId) link.parentId = site.parentId;
		if (site.relationLabel) link.relationLabel = site.relationLabel;
		if (site.metaLabel) link.metaLabel = site.metaLabel;
		return link;
	});
}
