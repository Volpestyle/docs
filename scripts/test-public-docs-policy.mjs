import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { checkDocsInputs, isAllowedPublicDocsSource as scriptAllows } from "../packages/night-compiler/scripts/guard-docs-inputs.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceFile = path.join(repoRoot, "packages", "night-compiler", "src", "public-docs-guard.ts");
const tempDir = await mkdtemp(path.join(tmpdir(), "night-compiler-public-docs-policy-"));
const require = createRequire(import.meta.url);
const typescriptPath = require.resolve("typescript", {
	paths: [path.join(repoRoot, "packages", "night-compiler")],
});
const ts = await import(pathToFileURL(typescriptPath).href);

try {
	const source = await readFile(sourceFile, "utf8");
	const transpiled = ts.transpileModule(source, {
		compilerOptions: {
			module: ts.ModuleKind.ES2022,
			target: ts.ScriptTarget.ES2022,
			verbatimModuleSyntax: true,
		},
		fileName: "public-docs-guard.ts",
	}).outputText;
	const moduleFile = path.join(tempDir, "public-docs-guard.mjs");
	await writeFile(moduleFile, transpiled, "utf8");
	const packageGuard = await import(pathToFileURL(moduleFile).href);
	const packageAllows = packageGuard.isAllowedPublicDocsSource;

	const cases = [
		["README.md", true],
		["docs/start.md", true],
		["docs/nested/topic.md", true],
		["docs/private/topic.md", false],
		["docs/.draft/topic.md", false],
		["docs/topic.mdx", false],
		["src/index.ts", false],
		["../README.md", false],
	];

	for (const [sourcePath, expected] of cases) {
		assertEqual(scriptAllows(sourcePath), expected, `script policy ${sourcePath}`);
		assertEqual(packageAllows(sourcePath), expected, `package policy ${sourcePath}`);
		assertEqual(scriptAllows(sourcePath), packageAllows(sourcePath), `policy parity ${sourcePath}`);
	}

	await assertRawImportRejected("../secret.md?raw");
	await assertRawImportRejected("../../outside.md?raw");
	await assertRawImportRejected("../docs/private/secret.md?raw");

	console.log(`Public docs policy test passed: ${cases.length} predicate cases plus raw-import rejections.`);
} finally {
	await rm(tempDir, { recursive: true, force: true });
}

function assertEqual(actual, expected, label) {
	if (actual !== expected) {
		throw new Error(`${label}: expected ${String(expected)}, got ${String(actual)}`);
	}
}

async function assertRawImportRejected(specifier) {
	const fixtureRoot = await mkdtemp(path.join(tempDir, "fixture-"));
	await writeFile(path.join(fixtureRoot, "README.md"), "# Fixture\n", "utf8");
	await writeFile(path.join(fixtureRoot, "docs.md"), "# Outside\n", "utf8");
	await writeFile(path.join(fixtureRoot, "secret.md"), "# Secret\n", "utf8");
	await writeFile(path.join(fixtureRoot, "outside.md"), "# Outside\n", "utf8");
	await writeFile(path.join(fixtureRoot, "docs-private.md"), "# Secret\n", "utf8");
	await writeFile(path.join(fixtureRoot, "package.json"), "{\"type\":\"module\"}\n", "utf8");
	await mkdir(path.join(fixtureRoot, "docs", "private"), { recursive: true });
	await writeFile(path.join(fixtureRoot, "docs", "private", "secret.md"), "# Private\n", "utf8");
	const appSrc = path.join(fixtureRoot, "apps", "docs", "src");
	await mkdir(appSrc, { recursive: true });
	await writeFile(path.join(appSrc, "content.ts"), `import bad from "${specifier}";\nvoid bad;\n`, "utf8");

	const result = await checkDocsInputs(fixtureRoot, "apps/docs");
	if (result.errors.length === 0) {
		throw new Error(`expected raw import "${specifier}" to be rejected`);
	}
}
