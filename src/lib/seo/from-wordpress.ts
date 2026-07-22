import he from "he";
import type { BlogPost, YoastHeadJson } from "$lib/types";

export type WordPressSeoMeta = {
	title: string;
	description: string | null;
	canonical: string | null;
	robots: string | null;
	jsonLdScript: string | null;
};

function stripHtml(value: string): string {
	return value
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function toPlainText(value: string): string {
	return stripHtml(he.decode(value));
}

function formatRobotsDirective(robots: YoastHeadJson["robots"]): string | null {
	if (!robots) return null;

	const parts = Object.values(robots).filter(
		(part): part is string => typeof part === "string" && part.length > 0,
	);

	return parts.length > 0 ? parts.join(", ") : null;
}

function buildJsonLdScript(schema: YoastHeadJson["schema"]): string | null {
	if (!schema || typeof schema !== "object") return null;

	return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

function getDescriptionFromPost(post: BlogPost): string | null {
	const excerpt = post.excerpt?.rendered?.trim();
	if (excerpt) {
		const plain = toPlainText(excerpt);
		if (plain) return plain;
	}

	const content = post.content?.rendered?.trim();
	if (content) {
		const plain = toPlainText(content);
		if (plain) return plain.slice(0, 160);
	}

	return null;
}

export function mapWordPressSeo(
	post: BlogPost,
	fallbackTitle: string,
): WordPressSeoMeta {
	const yoast = post.yoast_head_json;
	const title = yoast?.title
		? toPlainText(yoast.title)
		: post.title?.rendered
			? toPlainText(post.title.rendered)
			: fallbackTitle;

	return {
		title,
		description: getDescriptionFromPost(post),
		canonical: yoast?.canonical?.trim() || post.link?.trim() || null,
		robots: formatRobotsDirective(yoast?.robots),
		jsonLdScript: buildJsonLdScript(yoast?.schema),
	};
}
