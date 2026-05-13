<script lang="ts">
	import { resolve } from '$app/paths';
	import { navigating } from '$app/state';
	import { onMount } from 'svelte';
	import SkeletonCard from '$lib/components/SkeletonCard.svelte';
	import { fetchBlogPosts } from '$lib/api/posts';
	import { stripHtml, truncate } from '$lib/utils/text';
	import { formatDate } from '$lib/utils/date-formatting';
	import type { BlogPost, CategoryStat, FeaturedMedia } from '$lib/types';
	import type { PageProps } from './$types';

	type TaxonomyTerm = {
		id?: number;
		name?: string;
		taxonomy?: string;
	};

	let { data }: PageProps = $props();
	let activeCategory = $state<number | null>(null);
	let localPosts = $state<BlogPost[]>([]);
	let localLoadError = $state(false);
	let retrying = $state(false);

	const routePosts = $derived(data.posts);
	const routeLoadError = $derived(Boolean(data.loadError));
	const posts = $derived(localPosts);

	$effect(() => {
		localPosts = routePosts;
		localLoadError = routeLoadError;
	});

	const showLoading = $derived(
		Boolean(
			retrying ||
			navigating.to &&
			navigating.to.url.pathname === resolve('/blog') &&
			!localLoadError &&
			posts.length === 0
		)
	);

	onMount(() => {
		if (!localLoadError || posts.length > 0 || retrying) {
			return;
		}

		void retryLoad();
	});

	async function retryLoad(): Promise<void> {
		retrying = true;

		try {
			localPosts = await fetchBlogPosts(globalThis.fetch);
			localLoadError = false;
		} catch (error) {
			console.error('Failed to recover blog posts:', error);
			localLoadError = true;
		} finally {
			retrying = false;
		}
	}

	const categoryStats = $derived.by(() => {
		const categoryMap = new Map<number, CategoryStat>();

		for (const post of posts) {
			for (const category of getPostCategories(post)) {
				const existing = categoryMap.get(category.id);
				if (existing) {
					existing.count += 1;
				} else {
					categoryMap.set(category.id, {
						...category,
						count: 1
					});
				}
			}
		}

		return Array.from(categoryMap.values()).sort((left, right) => {
			if (left.count !== right.count) {
				return right.count - left.count;
			}

			return left.name.localeCompare(right.name, 'de');
		});
	});

	const filteredPosts = $derived.by(() => {
		if (activeCategory === null) return posts;
		return posts.filter((post) => getPostCategories(post).some((category) => category.id === activeCategory));
	});

	const visibleCount = $derived(filteredPosts.length);

	function getFeaturedMedia(post: BlogPost): FeaturedMedia | null {
		const media = post._embedded?.['wp:featuredmedia']?.[0];
		if (!media?.source_url) return null;
		return media;
	}

	function getPostCategories(post: BlogPost): Array<{ id: number; name: string }> {
		const terms = post._embedded?.['wp:term'] as TaxonomyTerm[][] | undefined;
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

	function toggleCategory(categoryId: number | null): void {
		activeCategory = activeCategory === categoryId ? null : categoryId;
	}

</script>

<svelte:head>
	<title>Blog - RNT Kalender</title>
</svelte:head>

{#snippet categoryFilterPanel()}
	<section class="card space-y-4 p-5">
		<div>
			<p class="meta-text">Kategorien</p>
			<div class="mt-3 flex flex-wrap gap-2">
				<button
					type="button"
					onclick={() => toggleCategory(null)}
					aria-pressed={activeCategory === null}
					class={`filter-chip ${
						activeCategory === null ? 'filter-chip-active' : 'filter-chip-inactive'
					}`}
				>
					Alle
				</button>
				{#each categoryStats as category (category.id)}
					<button
						type="button"
						onclick={() => toggleCategory(category.id)}
						aria-pressed={activeCategory === category.id}
						class={`filter-chip ${
							activeCategory === category.id ? 'filter-chip-active' : 'filter-chip-inactive'
						}`}
					>
						<span>{category.name}</span>
						{#if activeCategory !== category.id}
							<span class="rounded-full bg-current/15 px-1.5 py-0.5 text-[0.6875rem] font-semibold leading-none">
								{category.count}
							</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>

		<hr class="border-border-default" />

		<div class="space-y-1">
			<p class="text-sm font-medium text-text-default">{visibleCount} Beitraege</p>
			{#if activeCategory !== null}
				{@const activeCategoryName = categoryStats.find((category) => category.id === activeCategory)?.name}
				{#if activeCategoryName}
					<p class="meta-text">Gefiltert nach {activeCategoryName}</p>
				{/if}
			{/if}
		</div>
	</section>
{/snippet}

<div class="space-y-6">
	<div class="space-y-6">
		<section class="space-y-3">
			<p class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted">Neuigkeiten</p>
			<h1 class="font-display text-[2rem] font-semibold text-text-default">Blog</h1>
			<p class="meta-text max-w-[58ch]">
				Aktuelle Berichte, Hintergrundbeitraege und Updates aus der Rhein-Neckar-Tango-Community.
			</p>
		</section>

		<div>
			{@render categoryFilterPanel()}
		</div>

		{#if showLoading}
			<div class="space-y-4" role="status" aria-live="polite">
				<p class="sr-only">Blogbeitraege laden</p>
				{#each Array.from({ length: 4 }) as _, index (index)}
					<SkeletonCard variant="horizontal" imageSize="md" lines={2} />
				{/each}
			</div>
		{:else if localLoadError}
			<section class="card space-y-2 p-6 text-center" role="alert">
				<p class="text-[1rem] font-semibold text-text-default">Beitraege konnten nicht geladen werden</p>
				<p class="meta-text">Bitte versuche es spaeter erneut.</p>
				<div class="pt-2">
					<button type="button" class="btn-secondary" onclick={() => void retryLoad()} disabled={retrying}>
						{retrying ? 'Laedt...' : 'Erneut versuchen'}
					</button>
				</div>
			</section>
		{:else if posts.length === 0}
			<section class="card space-y-2 p-6 text-center">
				<p class="text-[1rem] font-semibold text-text-default">Keine Beitraege gefunden</p>
				<p class="meta-text">Sobald neue Blogposts verfuegbar sind, erscheinen sie hier.</p>
			</section>
		{:else if filteredPosts.length === 0}
			<section class="card space-y-2 p-6 text-center">
				<p class="text-[1rem] font-semibold text-text-default">Keine Beitraege in dieser Kategorie</p>
				<p class="meta-text">Waehle eine andere Kategorie oder zeige alle Beitraege an.</p>
			</section>
		{:else}
			<div class="space-y-4">
				{#each filteredPosts as post (post.id)}
					{@const media = getFeaturedMedia(post)}
					{@const title = stripHtml(post.title.rendered)}
					{@const excerpt = truncate(stripHtml(post.excerpt.rendered), 220)}
					{@const categories = getPostCategories(post)}
					<article class="card group overflow-hidden transition-all duration-200 hover:border-border-accent hover:shadow-card-hover">
						<div class="p-4 sm:p-5">
							<div class="flex flex-col gap-4 sm:flex-row">
								<div class="h-24 w-24 shrink-0 overflow-hidden rounded-card bg-surface-subtle ring-1 ring-inset ring-border-default/40 sm:h-32 sm:w-32">
									{#if media}
										<img
											src={media.source_url}
											alt={media.alt_text?.trim() || title}
											class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
											loading="lazy"
											decoding="async"
										/>
									{:else}
										<div class="flex h-full w-full items-center justify-center bg-surface-subtle p-3">
											<img
												src="/rnt-logo.png"
												alt=""
												class="h-full w-full object-contain opacity-55 transition-transform duration-500 group-hover:scale-105"
												loading="lazy"
												decoding="async"
											/>
										</div>
									{/if}
								</div>

								<div class="min-w-0 flex-1 space-y-2 pt-0.5">
									<div class="flex flex-wrap items-center gap-x-3 gap-y-2">
										<p class="text-[0.6875rem] font-bold uppercase tracking-wider text-text-muted">{formatDate(post.date)}</p>
										{#if categories.length > 0}
											<div class="flex flex-wrap gap-1.5">
												{#each categories as category (category.id)}
													<button
														type="button"
														onclick={() => toggleCategory(category.id)}
														aria-pressed={activeCategory === category.id}
														class="relative z-10 rounded-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring/25"
													>
														<span class={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider transition-colors ${
															activeCategory === category.id
																? 'border-action-primary bg-action-primary text-text-inverse'
																: 'border-border-default bg-surface-subtle text-text-muted hover:border-action-primary hover:text-action-primary'
														}`}>
															{category.name}
														</span>
													</button>
												{/each}
											</div>
										{/if}
									</div>

									<h2 class="line-clamp-2 text-[1.125rem] font-bold leading-snug text-text-default transition-colors group-hover:text-action-primary sm:text-[1.1875rem]">
										<a
											href={resolve(`/blog/${post.slug}`)}
											data-sveltekit-preload-data="hover"
											class="focus-visible:outline-none"
										>
											{title}
										</a>
									</h2>

									<p class="blog-excerpt meta-text">{excerpt}</p>

									<div class="pt-1">
										<a
											href={resolve(`/blog/${post.slug}`)}
											data-sveltekit-preload-data="hover"
											class="inline-flex items-center gap-1 text-[0.875rem] font-bold text-action-primary transition-colors group-hover:text-action-primary-hover focus-visible:outline-none"
										>
											Weiterlesen
											<svg class="h-4 w-4 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
											</svg>
										</a>
									</div>
								</div>

								<div class="hidden self-center text-text-muted/40 transition-all duration-200 group-hover:translate-x-1 group-hover:text-action-primary sm:block">
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
									</svg>
								</div>
							</div>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.blog-excerpt {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}
</style>
