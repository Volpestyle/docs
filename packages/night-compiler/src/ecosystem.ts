import type { DocsSiteLink } from "./types.js";

export type AgentWorkspaceDocsSiteId =
	| "clanky-docs"
	| "agent-room-docs"
	| "agent-room-ios-docs"
	| "clankvox-docs";

export function createAgentWorkspaceSiteLinks(): DocsSiteLink[] {
	return [
		{
			id: "clanky-docs",
			label: "Clanky",
			href: "https://volpestyle.github.io/clanky/",
			description: "Personal agent docs, setup, operations, and Clanky's AgentRoom integration.",
		},
		{
			id: "agent-room-docs",
			label: "AgentRoom",
			href: "https://volpestyle.github.io/agent-room/",
			description: "Coordination plane docs for rooms, runtimes, gateways, and protocols.",
		},
		{
			id: "agent-room-ios-docs",
			label: "AgentRoom iOS",
			href: "https://volpestyle.github.io/agent-room-ios/",
			description: "Native iOS client docs for checking and steering AgentRoom from a phone.",
			parentId: "agent-room-docs",
			relationLabel: "mobile client",
			metaLabel: "AgentRoom client",
		},
		{
			id: "clankvox-docs",
			label: "ClankVox",
			href: "https://volpestyle.github.io/clankvox/",
			description: "Rust media-plane submodule docs for Clanky's Discord voice and Go Live transport.",
			parentId: "clanky-docs",
			relationLabel: "voice/media module",
			metaLabel: "Clanky submodule",
		},
	];
}
