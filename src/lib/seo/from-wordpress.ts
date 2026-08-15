import he from "he";
import type { BlogPost, YoastHeadJson } from "$lib/types";

import { DEFAULT_ROBOTS, type SeoMetadata } from "./metadata";

function stripHtml(value: string): string {
	return value
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function toPlainText(value: string): string {
	return stripHtml(he.decode(value));
}

function formatRobotsDirective(robots: YoastHeadJson["robots"]): string {
	if (!robots) return DEFAULT_ROBOTS;

	const parts = Object.values(robots).filter(
		(part): part is string => typeof part === "string" && part.length > 0,
	);

	return parts.length > 0 ? parts.join(", ") : DEFAULT_ROBOTS;
}

function getDescriptionFromPost(post: BlogPost, yoast?: YoastHeadJson): string {
	const yoastDescription = yoast?.description?.trim();
	if (yoastDescription) {
		return toPlainText(yoastDescription).slice(0, 160);
	}

	const excerpt = post.excerpt?.rendered?.trim();
	if (excerpt) {
		const plain = toPlainText(excerpt);
		if (plain) return plain.slice(0, 160);
	}

	const content = post.content?.rendered?.trim();
	if (content) {
		const plain = toPlainText(content);
		if (plain) return plain.slice(0, 160);
	}

	return "";
}

function getOgImage(yoast?: YoastHeadJson, post?: BlogPost): string | undefined {
	const ogImage = yoast?.og_image?.[0]?.url;
	if (ogImage) return ogImage;

	const featured = post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
	return featured;
}

export function mapWordPressSeo(
	post: BlogPost,
	fallbackTitle: string,
): SeoMetadata {
	const yoast = post.yoast_head_json;
	const title = yoast?.title
		? toPlainText(yoast.title)
		: post.title?.rendered
			? toPlainText(post.title.rendered)
			: fallbackTitle;

	const description =
		getDescriptionFromPost(post, yoast) ||
		`${title} – Rhein-Neckar-Tango Community.`;

	return {
		title,
		description,
		canonical: yoast?.canonical?.trim() || post.link?.trim() || "",
		robots: formatRobotsDirective(yoast?.robots),
		image: getOgImage(yoast, post),
		jsonLd: yoast?.schema,
	};
}
