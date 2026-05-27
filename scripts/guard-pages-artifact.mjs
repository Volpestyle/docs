import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const artifactRootInput = process.argv[2];
const siteSlug = process.argv[3];

if (!artifactRootInput || !siteSlug) {
	console.error("Usage: guard-pages-artifact.mjs <artifact-root> <site-slug>");
	process.exit(1);
}

if (!/^[a-z0-9][a-z0-9-]*$/.test(siteSlug)) {
	console.error(`Invalid site slug: ${siteSlug}`);
	process.exit(1);
}

const artifactRoot = path.resolve(artifactRootInput);
const errors = [];
let fileCount = 0;

const forbiddenDirectoryNames = new Set([
	".git",
	".github",
	".turbo",
	".vite",
	"coverage",
	"node_modules",
	"src",
	"test",
	"tests",
]);

const forbiddenFileNames = new Set([
	".env",
	".env.local",
	".env.production",
	".npmrc",
	"Cargo.lock",
	"Cargo.toml",
	"Package.resolved",
	"Package.swift",
	"bun.lock",
	"bun.lockb",
	"go.mod",
	"go.sum",
	"package-lock.json",
	"package.json",
	"pnpm-lock.yaml",
	"project.pbxproj",
	"yarn.lock",
]);

const forbiddenSourceExtensions = new Set([
	".astro",
	".bash",
	".c",
	".cc",
	".cpp",
	".cs",
	".cts",
	".cxx",
	".env",
	".erl",
	".ex",
	".exs",
	".go",
	".h",
	".hh",
	".hpp",
	".hrl",
	".java",
	".jsx",
	".kt",
	".kts",
	".lua",
	".m",
	".mm",
	".mts",
	".php",
	".pl",
	".pm",
	".py",
	".rb",
	".rs",
	".scala",
	".sh",
	".swift",
	".svelte",
	".ts",
	".tsx",
	".vue",
	".zsh",
]);

const textExtensions = new Set([
	".css",
	".html",
	".js",
	".json",
	".md",
	".svg",
	".txt",
	".webmanifest",
	".xml",
]);

const forbiddenTextPatterns = [
	{
		name: "source map reference",
		pattern: /sourceMappingURL=/,
	},
	{
		name: "embedded source map content",
		pattern: /"sourcesContent"\s*:/,
	},
	{
		name: "private key material",
		pattern: /-----BEGIN (?:OPENSSH |RSA |DSA |EC |)PRIVATE KEY-----/,
	},
	{
		name: "GitHub token",
		pattern: /\b(?:github_pat|gh[opsu])_[A-Za-z0-9_]{20,}\b/,
	},
	{
		name: "OpenAI-style API key",
		pattern: /\bsk-[A-Za-z0-9_-]{32,}\b/,
	},
	{
		name: "AWS access key id",
		pattern: /\bAKIA[0-9A-Z]{16}\b/,
	},
	{
		name: "Slack token",
		pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
	},
];

try {
	const rootStat = await stat(artifactRoot);
	if (!rootStat.isDirectory()) {
		throw new Error(`Artifact path is not a directory: ${artifactRootInput}`);
	}
	await walk(artifactRoot, "");
} catch (error) {
	const message = error instanceof Error ? error.message : String(error);
	errors.push(message);
}

if (errors.length > 0) {
	console.error("Docs artifact guard failed. Refusing to publish generated docs:");
	for (const error of errors) {
		console.error(`- ${error}`);
	}
	process.exit(1);
}

console.log(`Docs artifact guard passed for ${siteSlug}: checked ${fileCount} files.`);

async function walk(directory, relativeDirectory) {
	const entries = await readdir(directory, { withFileTypes: true });
	for (const entry of entries) {
		const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
		const fullPath = path.join(directory, entry.name);

		if (entry.isDirectory()) {
			if (forbiddenDirectoryNames.has(entry.name)) {
				errors.push(`${relativePath}/ is not allowed in a public docs artifact`);
				continue;
			}
			await walk(fullPath, relativePath);
			continue;
		}

		if (!entry.isFile()) {
			errors.push(`${relativePath} is not a regular file`);
			continue;
		}

		fileCount += 1;
		await checkFile(fullPath, relativePath);
	}
}

async function checkFile(fullPath, relativePath) {
	const extension = path.extname(relativePath).toLowerCase();
	const fileName = path.basename(relativePath);

	if (relativePath.includes("\\") || relativePath.split("/").some((part) => part === "." || part === "..")) {
		errors.push(`${relativePath} has an unsafe path`);
	}
	if (fileName.endsWith(".map") || extension === ".map") {
		errors.push(`${relativePath} is a source map`);
	}
	if (forbiddenFileNames.has(fileName)) {
		errors.push(`${relativePath} looks like repository metadata, not generated docs`);
	}
	if (forbiddenSourceExtensions.has(extension)) {
		errors.push(`${relativePath} looks like source code, not generated docs`);
	}

	const fileStat = await stat(fullPath);
	if (fileStat.size > 25 * 1024 * 1024) {
		errors.push(`${relativePath} is unexpectedly large for a docs artifact (${fileStat.size} bytes)`);
		return;
	}

	if (!shouldScanText(extension, fileName)) {
		return;
	}

	const content = await readFile(fullPath, "utf8");
	for (const { name, pattern } of forbiddenTextPatterns) {
		if (pattern.test(content)) {
			errors.push(`${relativePath} contains ${name}`);
		}
	}
}

function shouldScanText(extension, fileName) {
	return textExtensions.has(extension) || fileName === "CNAME";
}
