<script lang="ts">
    import { resolve } from "$app/paths";
    import type { DjProfileSummary } from "$lib/types";
    import type { EntityDateFilter } from "$lib/types";
    import {
        getInitials,
        getAvatarTone,
        getNextEvent,
        getNextEventMeta,
        getUpcomingCount,
    } from "$lib/utils/dj-presentation";
    import { MUSIC_TYPE_NAMES, MUSIC_TYPE_BADGE_CLASSES } from "$lib/constants";
    import type { MusicType } from "$lib/types";

    let {
        dj,
        activeDateFilter,
    }: {
        dj: DjProfileSummary;
        activeDateFilter: EntityDateFilter;
    } = $props();

    const nextEvent = $derived(getNextEvent(dj, activeDateFilter));
</script>

<article class="card flex h-full flex-col gap-4 p-5 transition-all duration-200 hover:shadow-lg">
    <div class="flex items-start gap-4">
        <div class="relative">
            {#if dj.image}
                <div
                    class="relative aspect-square h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-border-default shadow-sm flex items-center justify-center"
                >
                    <img
                        src={dj.image}
                        alt={dj.name}
                        class="absolute inset-0 h-full w-full object-cover object-top"
                        loading="lazy"
                        decoding="async"
                    />
                </div>
            {:else}
                <div
                    class={`aspect-square h-14 w-14 shrink-0 flex items-center justify-center rounded-full border-2 text-lg font-bold ${getAvatarTone(
                        dj.style,
                    )} shadow-sm`}
                >
                    {getInitials(dj.name)}
                </div>
            {/if}

            <span
                class={`absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/80 text-[0.625rem] font-medium shadow-sm ${
                    MUSIC_TYPE_BADGE_CLASSES[
                        dj.style as MusicType
                    ] ?? ""
                }`}
            >
                {MUSIC_TYPE_NAMES[
                    dj.style as MusicType
                ].charAt(0)}
            </span>
        </div>

        <div class="flex-1 min-w-0">
            <h2
                class="text-lg font-bold leading-tight text-text-default truncate"
            >
                <a
                    href={resolve(`/djs/${dj.slug}`)}
                    data-sveltekit-preload-data="hover"
                    class="transition-colors hover:text-action-primary"
                >
                    {dj.name}
                </a>
            </h2>
        </div>
    </div>

    {#if nextEvent}
        <div
            class="space-y-2.5 pt-1 border-t border-border-default/50"
        >
            <a
                href={nextEvent.internalPath
                    ? resolve(nextEvent.internalPath)
                    : nextEvent.externalUrl}
                data-sveltekit-preload-data="hover"
                target={nextEvent.externalUrl
                    ? "_blank"
                    : undefined}
                rel={nextEvent.externalUrl
                    ? "noopener noreferrer"
                    : undefined}
                class="block hover:opacity-90 transition-opacity"
            >
                <div class="flex items-start gap-2">
                    <svg
                        class="h-4 w-4 text-action-primary flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clip-rule="evenodd"
                        />
                    </svg>
                    <div class="flex-1 min-w-0">
                        <p
                            class="text-sm font-medium leading-snug text-text-default line-clamp-2"
                        >
                            {nextEvent.title}
                        </p>
                        <p
                            class="text-xs text-text-muted mt-0.5"
                        >
                            {getNextEventMeta(dj, activeDateFilter)}
                        </p>
                    </div>
                </div>
            </a>
        </div>
    {:else}
        <div
            class="space-y-2.5 pt-1 border-t border-amber-200/30"
        >
            <div class="flex items-start gap-2">
                <svg
                    class="h-4 w-4 text-amber-600/80 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clip-rule="evenodd"
                    />
                </svg>
                <div class="flex-1 min-w-0">
                    <p
                        class="text-sm text-amber-800/80 line-clamp-2"
                    >
                        Keine Termine im Zeitraum
                    </p>
                </div>
            </div>
        </div>
    {/if}

    <div class="mt-auto flex justify-end pt-3">
        <a
            href={resolve(`/djs/${dj.slug}`)}
            data-sveltekit-preload-data="hover"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-text-default bg-white border border-border-default hover:bg-surface-subtle hover:shadow-md transition-all duration-200 rounded-badge"
            >DJ-Profil ansehen</a
        >
    </div>
</article>
