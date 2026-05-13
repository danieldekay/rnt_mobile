<script lang="ts">
	import { resolve } from '$app/paths';
	import { sanitizeHtml, sanitizeText } from '$lib/utils/html';
	import type { BlogPost, TribeEvent, TribeOrganizer } from '$lib/types';
	import type { PageProps } from './$types';

	type AnnouncementPost = BlogPost & {
		meta?: {
			rnt_termin?: string | null;
		};
		content?: {
			rendered?: string;
		};
	};

	type FeaturedMedia = {
		source_url?: string | null;
		alt_text?: string | null;
		media_details?: {
			sizes?: Record<string, { source_url?: string }>;
		};
	};

	let { data }: PageProps = $props();

	const post = $derived(data.post as AnnouncementPost);
	const relatedEvent = $derived((data.relatedEvent as TribeEvent | null) ?? null);
	const relatedOrganizer = $derived((data.relatedOrganizer as TribeOrganizer | null) ?? null);
	const backendUrl = $derived((data.backendUrl as string | null) ?? null);
	const title = $derived(post ? sanitizeText(post.title.rendered) : 'Ankuendigung');
	const excerpt = $derived(post ? sanitizeText(post.excerpt.rendered) : '');
	const content = $derived(post?.content?.rendered ? sanitizeHtml(post.content.rendered) : '');
	const media = $derived(post ? getFeaturedMedia(post) : null);
	const imageUrl = $derived(getLandscapeImageUrl(media));
	const formattedDate = $derived(post ? getRelevantDateLabel(post) : '');
	const listHref = resolve('/ankuendigungen');
	const relatedEventHref = $derived(relatedEvent ? resolve(`/event/${relatedEvent.id}`) : '');
	const relatedOrganizerHref = $derived(relatedOrganizer?.slug ? resolve(`/veranstalter/${relatedOrganizer.slug}`) : '');

	function getFeaturedMedia(currentPost: AnnouncementPost): FeaturedMedia | null {
		const embeddedMedia = currentPost._embedded?.['wp:featuredmedia']?.[0];
		if (!embeddedMedia?.source_url) return null;
		return embeddedMedia;
	}

	function getLandscapeImageUrl(currentMedia: FeaturedMedia | null): string | null {
		if (!currentMedia) return null;

		return (
			currentMedia.media_details?.sizes?.large?.source_url ??
			currentMedia.media_details?.sizes?.medium_large?.source_url ??
			currentMedia.media_details?.sizes?.full?.source_url ??
			currentMedia.source_url ??
			null
		);
	}

	function parseDateValue(value: string | null | undefined): Date | null {
		if (!value) return null;

		if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
			const [year, month, day] = value.split('-').map(Number);
			const parsed = new Date(year, month - 1, day);
			return Number.isNaN(parsed.getTime()) ? null : parsed;
		}

		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	}

	function getRelevantDate(currentPost: AnnouncementPost): Date | null {
		const eventDate = currentPost.meta?.rnt_termin?.trim();
		return parseDateValue(eventDate) ?? parseDateValue(currentPost.date);
	}

	function getRelevantDateLabel(currentPost: AnnouncementPost): string {
		const parsed = getRelevantDate(currentPost);
		const fallback = currentPost.meta?.rnt_termin?.trim() || currentPost.date;

		if (!parsed) {
			return fallback;
		}

		return parsed.toLocaleDateString('de-DE', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{title} - Ankuendigungen - RNT Kalender</title>
	<meta name="description" content={excerpt || `${title} auf dem RNT Kalender`} />
</svelte:head>

<article class="space-y-6">
	<a
		href={listHref}
		class="inline-flex min-h-10 items-center text-[0.95rem] font-semibold text-text-link underline decoration-border-default underline-offset-4 transition-colors hover:text-text-default"
	>
		Zurueck zu den Ankuendigungen
	</a>

	<header class="space-y-3">
		<p class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted">Community News</p>
		{#if formattedDate}
			<p class="meta-text">{formattedDate}</p>
		{/if}
		<h1 class="font-display text-[2rem] font-semibold tracking-tight text-text-default lg:text-[2.5rem]">{title}</h1>
		{#if excerpt}
			<p class="meta-text max-w-[72ch] text-[1rem] leading-relaxed">{excerpt}</p>
		{/if}
	</header>

	{#if media}
		<figure class="overflow-hidden rounded-card bg-surface-subtle shadow-sm">
			<div class="aspect-[16/9] w-full lg:aspect-[21/9]">
				<img
					src={imageUrl ?? media.source_url ?? ''}
					alt={media.alt_text?.trim() || title}
					class="h-full w-full object-cover object-center"
					loading="eager"
					decoding="async"
				/>
			</div>
		</figure>
	{/if}

	{#if content}
		<section class="card p-6 announcement-content">
			{@html content}
		</section>
	{/if}

	<div class="flex flex-wrap gap-3">
		<a href={listHref} class="btn-secondary">Zur Uebersicht</a>
		{#if relatedEvent && relatedEventHref}
			<a href={relatedEventHref} data-sveltekit-preload-data="hover" class="btn-secondary">
				Zum Termin
			</a>
		{/if}
		{#if relatedOrganizer && relatedOrganizerHref}
			<a href={relatedOrganizerHref} data-sveltekit-preload-data="hover" class="btn-secondary">
				Veranstalterprofil
			</a>
		{/if}
		<a
			href={post.link}
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex min-h-10 items-center text-[0.95rem] font-semibold text-text-link underline decoration-border-default underline-offset-4 transition-colors hover:text-text-default"
		>
			Originalseite oeffnen
		</a>
		{#if backendUrl}
			<a
				href={backendUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex min-h-10 items-center text-[0.95rem] font-semibold text-text-link underline decoration-border-default underline-offset-4 transition-colors hover:text-text-default"
			>
				WP Backend
			</a>
		{/if}
	</div>
</article>

<style>
	.announcement-content {
		line-height: 1.7;
	}

	.announcement-content :global(h2),
	.announcement-content :global(h3),
	.announcement-content :global(h4) {
		font-family: var(--font-display, inherit);
		font-weight: 600;
		line-height: 1.2;
		color: var(--color-text-default, inherit);
		margin: 1.5rem 0 0.75rem;
	}

	.announcement-content :global(p),
	.announcement-content :global(ul),
	.announcement-content :global(ol) {
		margin: 0 0 1rem;
	}

	.announcement-content :global(ul),
	.announcement-content :global(ol) {
		padding-left: 1.25rem;
	}

	.announcement-content :global(li + li) {
		margin-top: 0.35rem;
	}

	.announcement-content :global(a) {
		text-decoration: underline;
		text-underline-offset: 0.2rem;
	}

	.announcement-content :global(img) {
		display: block;
		max-width: 100%;
		height: auto;
		border-radius: 1rem;
		margin: 1.5rem 0;
	}

	.announcement-content :global(figure) {
		margin: 1.5rem 0;
	}

	.announcement-content :global(blockquote) {
		margin: 1.5rem 0;
		padding-left: 1rem;
		border-left: 3px solid var(--color-border-default, currentColor);
		color: var(--color-text-muted, inherit);
	}

	.announcement-content :global(iframe) {
		max-width: 100%;
	}
</style>