<script lang="ts">
	import { resolve } from '$app/paths';
	import { sanitizeHtml } from '$lib/utils/html';
	import type { BlogPost } from '$lib/types';
	import type { PageProps } from './$types';

	type FeaturedMedia = {
		source_url?: string;
		alt_text?: string;
	};

	type TaxonomyTerm = {
		id?: number;
		name?: string;
		taxonomy?: string;
	};

	type BlogDetailPost = BlogPost & {
		content?: {
			rendered?: string;
		};
	};

	const HTML_ENTITY_MAP: Record<string, string> = {
		amp: '&',
		lt: '<',
		gt: '>',
		quot: '"',
		apos: "'",
		nbsp: ' ',
		ndash: '-',
		mdash: '-'
	};

	let { data }: PageProps = $props();

	const post = $derived(data.post as BlogDetailPost | null);

	const title = $derived(post ? toPlainText(post.title.rendered) : 'Blog');
	const excerpt = $derived(post ? toPlainText(post.excerpt.rendered) : '');
	const media = $derived(post ? getFeaturedMedia(post) : null);
	const categories = $derived(post ? getPostCategories(post) : []);
	const safeContent = $derived(post?.content?.rendered ? sanitizeHtml(post.content.rendered) : '');

	function decodeHtmlEntities(value: string): string {
		return value.replace(/&(#x?[\da-f]+|[a-z]+);/gi, (match, entity: string) => {
			if (entity.startsWith('#x') || entity.startsWith('#X')) {
				const codePoint = Number.parseInt(entity.slice(2), 16);
				return toSafeCodePoint(codePoint, match);
			}

			if (entity.startsWith('#')) {
				const codePoint = Number.parseInt(entity.slice(1), 10);
				return toSafeCodePoint(codePoint, match);
			}

			return HTML_ENTITY_MAP[entity] ?? match;
		});
	}

	function toSafeCodePoint(codePoint: number, fallback: string): string {
		if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
			return fallback;
		}

		try {
			return String.fromCodePoint(codePoint);
		} catch {
			return fallback;
		}
	}

	function stripHtml(value: string): string {
		return value
			.replace(/<[^>]*>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	function toPlainText(value: string): string {
		return stripHtml(decodeHtmlEntities(value));
	}

	function getFeaturedMedia(blogPost: BlogPost): FeaturedMedia | null {
		const featuredMedia = blogPost._embedded?.['wp:featuredmedia']?.[0];
		if (!featuredMedia?.source_url) return null;
		return featuredMedia;
	}

	function getPostCategories(blogPost: BlogPost): Array<{ id: number; name: string }> {
		const terms = blogPost._embedded?.['wp:term'] as TaxonomyTerm[][] | undefined;
		if (!terms?.length) return [];

		const categories = terms
			.flat()
			.filter((term) => term.taxonomy === 'category' && typeof term.id === 'number')
			.map((term) => ({
				id: term.id as number,
				name: term.name?.trim() || `Kategorie ${(term.id as number).toString()}`
			}));

		const uniqueCategories = new Map<number, { id: number; name: string }>();
		for (const category of categories) {
			if (!uniqueCategories.has(category.id)) {
				uniqueCategories.set(category.id, category);
			}
		}

		return Array.from(uniqueCategories.values());
	}

	function formatDate(value: string): string {
		const parsed = new Date(value);
		if (Number.isNaN(parsed.getTime())) return value;
		return parsed.toLocaleDateString('de-DE', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{post ? `${title} - Blog - RNT Kalender` : 'Blog - RNT Kalender'}</title>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-6">
	<a
		href={resolve('/blog')}
		class="inline-flex items-center gap-2 text-[0.875rem] font-bold text-action-primary transition-colors hover:text-action-primary-hover"
	>
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
		</svg>
		Zurueck zum Blog
	</a>

	{#if post}
		<article class="space-y-6">
			<header class="space-y-4">
				<p class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted">Blog</p>
				<h1 class="font-display text-[2rem] font-semibold text-text-default sm:text-[2.4rem]">{title}</h1>
				<div class="flex flex-wrap items-center gap-2 text-[0.8125rem] font-bold uppercase tracking-wider text-text-muted">
					<span>{formatDate(post.date)}</span>
					{#if categories.length > 0}
						<span aria-hidden="true">•</span>
						<div class="flex flex-wrap gap-1.5">
							{#each categories as category (category.id)}
								<span class="inline-flex items-center rounded-sm border border-border-default bg-surface-subtle px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-text-muted">
									{category.name}
								</span>
							{/each}
						</div>
					{/if}
				</div>
				{#if excerpt}
					<p class="meta-text max-w-[62ch] text-[1rem] leading-7">{excerpt}</p>
				{/if}
			</header>

			{#if media}
				<div class="overflow-hidden rounded-card border border-border-default bg-surface-subtle shadow-card">
					<img
						src={media.source_url}
						alt={media.alt_text?.trim() || title}
						class="aspect-[16/9] w-full object-cover"
						loading="eager"
						decoding="async"
					/>
				</div>
			{/if}

			<section class="card overflow-hidden p-5 sm:p-7">
				{#if safeContent}
					<div class="blog-detail-content">
						{@html safeContent}
					</div>
				{:else}
					<div class="space-y-3">
						<p class="text-[1rem] font-semibold text-text-default">Der Beitragstext ist gerade nicht verfuegbar.</p>
						{#if excerpt}
							<p class="meta-text">{excerpt}</p>
						{/if}
					</div>
				{/if}
			</section>
		</article>
	{/if}
</div>

<style>
	.blog-detail-content :global(h2),
	.blog-detail-content :global(h3),
	.blog-detail-content :global(h4) {
		margin: 2rem 0 0.75rem;
		font-family: 'IBM Plex Sans Condensed', 'Atkinson Hyperlegible Next', sans-serif;
		font-weight: 600;
		line-height: 1.15;
		color: rgb(var(--text-default) / 1);
	}

	.blog-detail-content :global(h2) {
		font-size: 1.6rem;
	}

	.blog-detail-content :global(h3) {
		font-size: 1.3rem;
	}

	.blog-detail-content :global(p),
	.blog-detail-content :global(li) {
		font-size: 1rem;
		line-height: 1.8;
		color: rgb(var(--text-default) / 0.94);
	}

	.blog-detail-content :global(p + p),
	.blog-detail-content :global(ul),
	.blog-detail-content :global(ol),
	.blog-detail-content :global(blockquote),
	.blog-detail-content :global(figure) {
		margin-top: 1rem;
	}

	.blog-detail-content :global(ul),
	.blog-detail-content :global(ol) {
		padding-left: 1.25rem;
	}

	.blog-detail-content :global(a) {
		color: rgb(var(--text-link) / 1);
		font-weight: 600;
		text-decoration: underline;
		text-decoration-thickness: 0.08em;
		text-underline-offset: 0.16em;
	}

	.blog-detail-content :global(img) {
		margin-top: 1.5rem;
		border-radius: 1rem;
	}

	.blog-detail-content :global(blockquote) {
		border-left: 4px solid rgb(var(--border-accent) / 0.65);
		padding-left: 1rem;
		color: rgb(var(--text-muted) / 1);
	}

	.blog-detail-content :global(hr) {
		margin: 2rem 0;
		border: 0;
		border-top: 1px solid rgb(var(--border-default) / 1);
	}

	.blog-detail-content :global(iframe) {
		margin-top: 1.5rem;
		width: 100%;
		max-width: 100%;
		border: 0;
		border-radius: 1rem;
	}

	.blog-detail-content :global(.wp-block-image figcaption) {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		color: rgb(var(--text-muted) / 1);
	}

	.blog-detail-content :global(:first-child) {
		margin-top: 0;
	}

	.blog-detail-content :global(:last-child) {
		margin-bottom: 0;
	}
</style>