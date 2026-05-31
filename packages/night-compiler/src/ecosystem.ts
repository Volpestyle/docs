import type { DocsSiteLink } from "./types.js";
import agentWorkspaceSites from "./agent-workspace-sites.json";

export type AgentWorkspaceDocsSiteId = (typeof agentWorkspaceSites)[number]["id"];

export const agentWorkspaceDocsBaseUrl = "https://volpestyle.github.io/docs";

function agentWorkspaceDocsHref(slug: string): string {
	return `${agentWorkspaceDocsBaseUrl}/${slug}/`;
}

export function createAgentWorkspaceSiteLinks(): DocsSiteLink[] {
	return agentWorkspaceSites.map((site) => {
		const link: DocsSiteLink = {
			id: site.id,
			label: site.label,
			href: agentWorkspaceDocsHref(site.slug),
			description: site.description,
		};
		if (site.parentId) link.parentId = site.parentId;
		if (site.relationLabel) link.relationLabel = site.relationLabel;
		if (site.metaLabel) link.metaLabel = site.metaLabel;
		return link;
	});
}
