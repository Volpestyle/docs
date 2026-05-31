import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRootInput = process.argv[2] ?? ".";
const docsAppInput = process.argv[3] ?? "apps/docs";

const repoRoot = path.resolve(repoRootInput);
const docsAppRoot = path.resolve(repoRoot, docsAppInput);
const sourceRoots = [path.join(docsAppRoot, "src"), path.join(docsAppRoot, "scripts")];
const errors = [];
let rawImportCount = 0;

try {
	const docsAppRootStat = await stat(docsAppRoot).catch((error) => {
		if (error && error.code === "ENOENT") {
			throw new Error(`Docs app path does not exist: ${path.relative(repoRoot, docsAppRoot)}`);
		}
		throw error;
	});
	if (!docsAppRootStat.isDirectory()) {
		throw new Error(`Docs app path is not a directory: ${path.relative(repoRoot, docsAppRoot)}`);
	}
	for (const sourceRoot of sourceRoots) {
		const sourceRootStat = await stat(sourceRoot).catch((error) => {
			if (error && error.code === "ENOENT") {
				return undefined;
			}
			throw error;
		});
		if (!sourceRootStat) {
			continue;
		}
		if (!sourceRootStat.isDirectory()) {
			throw new Error(`Docs source path is not a directory: ${path.relative(repoRoot, sourceRoot)}`);
		}
		await walk(sourceRoot);
	}
} catch (error) {
	const message = error instanceof Error ? error.message : String(error);
	errors.push(message);
}

if (errors.length > 0) {
	console.error("Docs input guard failed. Refusing to build public docs from unsafe source inputs:");
	for (const error of errors) {
		console.error(`- ${error}`);
	}
	process.exit(1);
}

console.log(`Docs input guard passed: checked ${rawImportCount} raw imports.`);

async function walk(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			await walk(fullPath);
			continue;
		}
		if (!entry.isFile()) {
			continue;
		}
		if (/\.[cm]?[jt]sx?$/.test(entry.name)) {
			await checkSourceFile(fullPath);
		}
	}
}

async function checkSourceFile(filePath) {
	const content = await readFile(filePath, "utf8");
	const rawImportPattern = /(?:from\s+|import\s*\(\s*)["']([^"']+\?raw(?:&[^"']*)?)["']/g;
	for (const match of content.matchAll(rawImportPattern)) {
		rawImportCount += 1;
		const specifier = match[1];
		if (!specifier) {
			continue;
		}
		const sourceSpecifier = specifier.split("?")[0];
		if (!sourceSpecifier.startsWith(".")) {
			errors.push(`${formatPath(filePath)} imports non-relative raw content "${specifier}"`);
			continue;
		}

		const resolvedPath = fileURLToPath(new URL(sourceSpecifier, pathToFileURL(filePath)));
		const repoRelativePath = normalizeRelativePath(path.relative(repoRoot, resolvedPath));
		if (repoRelativePath.startsWith("../") || path.isAbsolute(repoRelativePath)) {
			errors.push(`${formatPath(filePath)} imports raw content outside the repository: "${specifier}"`);
			continue;
		}
		if (!isAllowedPublicDocsSource(repoRelativePath)) {
			errors.push(
				`${formatPath(filePath)} imports raw content "${repoRelativePath}", but public docs may only import README.md and docs/**/*.md`,
			);
		}
	}
}

function isAllowedPublicDocsSource(source) {
	if (source === "README.md") {
		return true;
	}
	return source.startsWith("docs/") && source.endsWith(".md") && !source.split("/").some((part) => part.startsWith("."));
}

function formatPath(filePath) {
	return normalizeRelativePath(path.relative(repoRoot, filePath));
}

function normalizeRelativePath(value) {
	return value.split(path.sep).join("/");
}
