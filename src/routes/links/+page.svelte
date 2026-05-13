<script lang="ts">
    import type { CuratedLink } from "$lib/api/links";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    let activeCategory = $state<string>("all");
    let searchQuery = $state("");

    const categoryCounts = $derived.by(() => {
        const counts = new Map<string, number>();

        for (const link of data.links) {
            counts.set(link.category, (counts.get(link.category) ?? 0) + 1);
        }

        return counts;
    });

    const filteredLinks = $derived.by(() => {
        const normalizedQuery = searchQuery.trim().toLocaleLowerCase("de");

        return data.links
            .filter((link) => {
                const matchesCategory =
                    activeCategory === "all" ||
                    link.category === activeCategory;
                const matchesQuery =
                    normalizedQuery.length === 0 ||
                    link.title
                        .toLocaleLowerCase("de")
                        .includes(normalizedQuery) ||
                    (link.description ?? "")
                        .toLocaleLowerCase("de")
                        .includes(normalizedQuery) ||
                    getDomain(link.url)
                        .toLocaleLowerCase("de")
                        .includes(normalizedQuery);

                return matchesCategory && matchesQuery;
            })
            .sort((left, right) => {
                const categoryDelta =
                    data.categories.indexOf(left.category) -
                    data.categories.indexOf(right.category);
                if (categoryDelta !== 0) return categoryDelta;
                return left.title.localeCompare(right.title, "de");
            });
    });

    function getDomain(url: string): string {
        try {
            return new URL(url).hostname.replace(/^www\./, "");
        } catch {
            return url;
        }
    }

    function resetFilters(): void {
        activeCategory = "all";
        searchQuery = "";
    }

    function selectCategory(category: string): void {
        activeCategory = activeCategory === category ? "all" : category;
    }
</script>

<svelte:head>
    <title>Links & Ressourcen - RNT Kalender</title>
</svelte:head>

<div class="space-y-6">
    <section class="space-y-3">
        <p
            class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted"
        >
            Community
        </p>
        <h1 class="font-display text-[2rem] font-semibold text-text-default">
            Links & Ressourcen
        </h1>
        <p class="meta-text">
            Kuratierte Verweise auf Musik, Lernmaterial, Community-Angebote,
            Veranstaltungsportale und Tools rund um Tango.
        </p>
    </section>

    <section class="card space-y-4 p-4 sm:p-5">
        <div class="space-y-4">
            <div
                class="flex flex-wrap gap-1 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [&::-moz-scrollbar]:hidden"
            >
                <button
                    type="button"
                    onclick={() => selectCategory("all")}
                    class="inline-flex items-center rounded-full border border-border-default bg-surface-card px-[0.875rem] py-2 text-[0.875rem] font-medium text-text-default transition-all hover:border-action-primary hover:bg-action-secondary/40 {activeCategory ===
                    'all'
                        ? 'bg-action-primary border-action-primary text-white'
                        : ''}"
                >
                    Alle ({data.links.length})
                </button>
                {#each data.categories as category (category)}
                    <button
                        type="button"
                        onclick={() => selectCategory(category)}
                        class="inline-flex items-center rounded-full border border-border-default bg-surface-card px-[0.875rem] py-2 text-[0.875rem] font-medium text-text-default transition-all hover:border-action-primary hover:bg-action-secondary/40 {activeCategory ===
                        category
                            ? 'bg-action-primary border-action-primary text-white'
                            : ''}"
                    >
                        {category} ({categoryCounts.get(category) ?? 0})
                    </button>
                {/each}
            </div>

            <div
                class="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_auto] lg:items-end"
            >
                <label class="block min-w-0">
                    <span
                        class="mb-1.5 block text-sm font-medium text-text-default"
                        >Suche</span
                    >
                    <input
                        type="search"
                        bind:value={searchQuery}
                        placeholder="Nach Name, Beschreibung oder Quelle suchen"
                        class="min-h-12 w-full rounded-control border border-border-default bg-surface-card px-4 py-2 text-[0.95rem] text-text-default outline-none transition-colors placeholder:text-text-muted focus:border-action-primary"
                    />
                </label>

                <button
                    type="button"
                    onclick={resetFilters}
                    class="btn-secondary min-h-12"
                >
                    Zuruecksetzen
                </button>
            </div>
        </div>

        <div
            class="flex flex-col gap-1 border-t border-border-default pt-3 lg:flex-row lg:items-center lg:justify-between"
        >
            <p class="text-sm font-medium text-text-default">
                {filteredLinks.length} von {data.links.length} Links sichtbar
            </p>
        </div>
    </section>

    {#if data.links.length === 0}
        <section class="card p-4 text-center">
            <p class="text-[1rem] font-medium text-text-default">
                Keine Links vorhanden
            </p>
        </section>
    {:else if filteredLinks.length === 0}
        <section class="card p-4 text-center">
            <p class="text-[1rem] font-medium text-text-default">
                Keine passenden Links gefunden
            </p>
            <p class="meta-text mt-2">
                Passe Suche oder Typfilter an, um weitere Eintraege zu sehen.
            </p>
        </section>
    {:else}
        <div class="card overflow-hidden">
            <div class="hidden overflow-x-auto md:block">
                <table
                    class="min-w-full border-collapse"
                    aria-label="Linktabelle"
                >
                    <thead class="bg-surface-subtle">
                        <tr
                            class="text-left text-[0.75rem] font-bold uppercase tracking-[0.08em] text-text-muted"
                        >
                            <th scope="col" class="w-[18%] px-4 py-3">Typ</th>
                            <th scope="col" class="w-[24%] px-4 py-3">Name</th>
                            <th scope="col" class="w-[32%] px-4 py-3"
                                >Beschreibung</th
                            >
                            <th scope="col" class="w-[14%] px-4 py-3">Quelle</th
                            >
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border-default">
                        {#each filteredLinks as link (link.url)}
                            <tr
                                class="align-top transition-colors hover:bg-action-secondary/60"
                            >
                                <td class="px-4 py-3 align-top">
                                    <span
                                        class="rounded-full bg-surface-subtle px-2.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.05em] text-text-muted"
                                        >{link.category}</span
                                    >
                                </td>
                                <th
                                    scope="row"
                                    class="px-4 py-3 text-left align-top"
                                >
                                    <p
                                        class="text-[1rem] font-semibold text-text-default"
                                    >
                                        {link.title}
                                    </p>
                                </th>
                                <td class="px-4 py-3 align-top">
                                    <p class="meta-text leading-6">
                                        {link.description ??
                                            "Keine Beschreibung vorhanden."}
                                    </p>
                                </td>
                                <td class="px-4 py-3 align-top">
                                    <p
                                        class="text-[0.9375rem] font-medium text-text-default"
                                    >
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="btn-secondary min-h-10 px-3 py-2 text-[0.9375rem]"
                                        >
                                            {getDomain(link.url)}
                                        </a>
                                    </p>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <ul class="divide-y divide-border-default md:hidden">
                {#each filteredLinks as link (link.url)}
                    <li class="space-y-3 px-4 py-4">
                        <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0 space-y-1">
                                <span
                                    class="rounded-full bg-surface-subtle px-2.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.05em] text-text-muted"
                                    >{link.category}</span
                                >
                                <h3
                                    class="text-[1rem] font-semibold text-text-default"
                                >
                                    {link.title}
                                </h3>
                                <p
                                    class="text-[0.8125rem] uppercase tracking-[0.08em] text-text-subtle"
                                >
                                    {getDomain(link.url)}
                                </p>
                            </div>
                            <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="btn-secondary min-h-10 shrink-0 px-3 py-2 text-[0.9375rem]"
                            >
                                Oeffnen
                            </a>
                        </div>

                        <p class="meta-text leading-6">
                            {link.description ??
                                "Keine Beschreibung vorhanden."}
                        </p>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</div>
