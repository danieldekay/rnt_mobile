#!/usr/bin/env node
/**
 * Bundle analysis script for rnt_mobile.
 * Runs vite-bundle-visualizer if available, otherwise falls back to
 * a manual listing of build artifacts.
 *
 * Usage: npm run bundle-analysis
 */

import { execSync } from "child_process";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const BUILD_DIR = "build";
const PKG_JSON = "package.json";

function getDeps() {
	const pkg = JSON.parse(readFileSync(PKG_JSON, "utf-8"));
	const deps = { ...pkg.dependencies, ...pkg.devDependencies };
	return Object.entries(deps)
		.map(([name, version]) => ({ name, version }))
		.sort((a, b) => a.name.localeCompare(b.name));
}

function listBuildArtifacts() {
	const artifacts = [];
	try {
		const files = readdirSync(BUILD_DIR, { recursive: true });
		for (const file of files) {
			const fullPath = join(BUILD_DIR, file);
			const st = statSync(fullPath);
			if (st.isFile()) {
				const size = st.size;
				const sizeStr =
					size > 1024 * 1024
						? `${(size / 1024 / 1024).toFixed(2)}MB`
						: size > 1024
							? `${(size / 1024).toFixed(1)}KB`
							: `${size}B`;
				artifacts.push({ path: file, size, sizeStr });
			}
		}
	} catch {
		// Build dir may not exist yet
	}
	return artifacts.sort((a, b) => b.size - a.size);
}

function main() {
	console.log("=== rnt_mobile Bundle Analysis ===\n");

	// Dependencies
	const deps = getDeps();
	console.log("Dependencies (" + deps.length + "):");
	console.log(deps.map((d) => `  ${d.name}@${d.version}`).join("\n"));
	console.log();

	// Build artifacts
	const artifacts = listBuildArtifacts();
	if (artifacts.length > 0) {
		console.log("Build artifacts by size:");
		artifacts.slice(0, 20).forEach((a) => {
			console.log(`  ${a.sizeStr.padEnd(10)} ${a.path}`);
		});
		const total = artifacts.reduce((sum, a) => sum + a.size, 0);
		console.log(`  ${"─".repeat(40)}`);
		console.log(`  Total: ${(total / 1024 / 1024).toFixed(2)}MB\n`);
	} else {
		console.log("No build artifacts found. Run `npm run build` first.\n");
	}

	// Try vite-bundle-visualizer
	try {
		console.log("Running vite-bundle-visualizer...");
		execSync(
			"npx vite-bundle-visualizer --output build/bundle-report.html",
			{ stdio: "inherit", cwd: process.cwd() },
		);
		console.log("\nReport written to build/bundle-report.html");
	} catch (e) {
		console.log(
			"\nvite-bundle-visualizer not found. Install with:",
		);
		console.log("  npm install -D vite-bundle-visualizer");
	}
}

main();
