import type { DocsSiteLink } from "./types.js";

export type AgentWorkspaceDocsSiteId = "clanky-docs" | "agent-room-docs" | "agent-room-ios-docs" | "clankvox-docs";

export const agentWorkspaceDocsBaseUrl = "https://volpestyle.github.io/docs";

function agentWorkspaceDocsHref(slug: string): string {
	return `${agentWorkspaceDocsBaseUrl}/${slug}/`;
}

export function createAgentWorkspaceSiteLinks(): DocsSiteLink[] {
	return [
		{
			id: "clanky-docs",
			label: "Clanky",
			href: agentWorkspaceDocsHref("clanky"),
			description:
				"Personal Pi agent docs for profiles, memory, Discord, voice, media, skills, and AgentRoom participation.",
		},
		{
			id: "agent-room-docs",
			label: "AgentRoom",
			href: agentWorkspaceDocsHref("agent-room"),
			description:
				"Terminal control room docs for seeing, launching, steering, and auditing long-running coding agents.",
		},
		{
			id: "agent-room-ios-docs",
			label: "AgentRoom iOS",
			href: agentWorkspaceDocsHref("agent-room-ios"),
			description: "Native iOS client docs for checking and steering AgentRoom from a phone.",
			parentId: "agent-room-docs",
			relationLabel: "mobile client",
			metaLabel: "AgentRoom client",
		},
		{
			id: "clankvox-docs",
			label: "ClankVox",
			href: agentWorkspaceDocsHref("clankvox"),
			description: "Rust media-plane submodule docs for Clanky's Discord voice and Go Live transport.",
			parentId: "clanky-docs",
			relationLabel: "voice/media module",
			metaLabel: "Clanky submodule",
		},
	];
}
