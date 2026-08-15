
<script lang="ts">
    import { resolve } from "$app/paths";
    import type { PageProps } from "./$types";
    import { onMount } from "svelte";
    import { escapeHtml, sanitizeHtml } from "$lib/utils/html";
    import { trackFeatureEvent } from "$lib/matomo";
    import { consentStore } from "$lib/stores/consent.svelte";
    import { format, parseISO } from "date-fns";
    import { de } from "date-fns/locale";
    import {
        extractDjFromDescription,
        extractWorkshopFromDescription,
        formatEventCost,
    } from "$lib/api/tribe";
    import type { DjCptEntry, TribeEvent } from "$lib/types";
    import { getDjSlug, getDjCptSlugByName } from "$lib/utils/djs";
    import {
        getEventShareData,
        getEventCalendarFileName,
    } from "$lib/utils/event-actions";
    import {
        getEventMusicBadgeClass,
        getEventMusicLabel,
        getEventTypeBadgeClass,
        getEventTypeLabel,
    } from "$lib/utils/event-presentation";
    import EventActions from "$lib/components/EventActions.svelte";
    import EventFavoriteControl from "$lib/components/EventFavoriteControl.svelte";
    import EventSidebar from "$lib/components/EventSidebar.svelte";
    import EventQuickInfo from "$lib/components/EventQuickInfo.svelte";
    import EventMap from "$lib/components/EventMap.svelte";
    import SeoHead from "$lib/components/SeoHead.svelte";
    import { isEventExpired, mapEventSeo } from "$lib/seo/from-event";
    import "leaflet/dist/leaflet.css";

    let { data }: PageProps = $props();
    let mapContainer = $state<HTMLDivElement | null>(null);
    let map: any = null;

    const event = $derived(data.event as TribeEvent);
    const eventId = $derived(event.id);
    const cptDjs = $derived((data.cptDjs as DjCptEntry[]) ?? []);
    const seo = $derived(mapEventSeo(event));
    const expired = $derived(isEventExpired(event));

    onMount(() => {
        return () => {
            if (map) {
                map.remove();
                map = null;
            }
        };
    });

    $effect(() => {
        if (event.id === lastTrackedEventId) {
            return;
        }

        lastTrackedEventId = event.id;
        trackFeatureEvent("events", "detail_view", String(event.id));
    });

    $effect(() => {
        if (map && eventId !== currentMapEventId) {
            map.remove();
            map = null;
            currentMapEventId = null;
        }

        if (
            event?.venue?.geo_lat &&
            event?.venue?.geo_lng &&
            mapConsentGranted &&
            mapContainer &&
            !map
        ) {
            currentMapEventId = event.id;
            initMap(
                event.venue.geo_lat,
                event.venue.geo_lng,
                event.venue.venue,
            );
        }

        if (!mapConsentGranted && map) {
            map.remove();
            map = null;
            currentMapEventId = null;
        }
    });

    let lastTrackedEventId = $state<number | null>(null);
    let currentMapEventId = $state<number | null>(null);

    async function initMap(lat: number, lng: number, venueName: string) {
        const L = await import("leaflet");

        map = L.map(mapContainer!).setView([lat, lng], 15);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const customIcon = L.divIcon({
            className: "custom-marker",
            html: `<div style="background: #0ea5e9; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
				<svg style="transform: rotate(45deg); width: 16px; height: 16px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 8 0111.314 0z"/>
				</svg>
			</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
        });

        L.marker([lat, lng], { icon: customIcon })
            .on("click", () =>
                trackFeatureEvent(
                    "events",
                    "map_marker_click",
                    String(eventId ?? "unknown"),
                ),
            )
            .addTo(map)
            .bindPopup(`<strong>${escapeHtml(venueName)}</strong>`)
            .openPopup();
    }

    const startDate = $derived(parseISO(event.start_date));
    const endDate = $derived(parseISO(event.end_date));
    const dj = $derived(extractDjFromDescription(event));
    const workshop = $derived(extractWorkshopFromDescription(event));
    const detailImage = $derived(
        event.image && typeof event.image === "string" ? event.image : null,
    );

    const formattedDate = $derived(
        format(startDate, "EEEE, d. MMMM yyyy", { locale: de }),
    );
    const isoStartDate = $derived(format(startDate, "yyyy-MM-dd"));
    const startTime = $derived(format(startDate, "HH:mm"));
    const endTime = $derived(format(endDate, "HH:mm"));

    const eventTypeLabel = $derived(getEventTypeLabel(event));
    const eventTypeBadgeClass = $derived(getEventTypeBadgeClass(event));
    const musicLabel = $derived(getEventMusicLabel(event));
    const musicBadgeClass = $derived(getEventMusicBadgeClass(event));
    const hasGeo = $derived(event.venue?.geo_lat && event.venue?.geo_lng);
    const mapConsentGranted = $derived(consentStore.hasConsent("maps"));
    const sanitizedDescription = $derived(sanitizeHtml(event.description));
    const shareData = $derived(getEventShareData(event));
    const calendarFileName = $derived(getEventCalendarFileName(event));
    const primaryOrganizer = $derived(event.organizer?.[0] ?? null);
    const organizerProfileLink = $derived(
        primaryOrganizer?.slug
            ? resolve(`/veranstalter/${primaryOrganizer.slug}`)
            : "",
    );
    const djProfileLink = $derived(
        dj
            ? resolve(`/djs/${getDjCptSlugByName(dj, cptDjs) ?? getDjSlug(dj)}`)
            : "",
    );
    const venueProfileLink = $derived(
        event.venue?.slug ? resolve(`/tanzraeume/${event.venue.slug}`) : "",
    );
    const venueMapUrl = $derived.by(() => {
        if (!event.venue?.geo_lat || !event.venue?.geo_lng) {
            return "";
        }

        return `https://www.google.com/maps/search/?api=1&query=${event.venue.geo_lat},${event.venue.geo_lng}`;
    });
    const venueLink = $derived(
        venueProfileLink || (event.venue ? event.venue.website || venueMapUrl : ""),
    );
    const organizerWebsiteLink = $derived(primaryOrganizer?.website || "");

    function handleBackClick() {
        trackFeatureEvent("events", "back_click");
    }
</script>

<SeoHead {seo} />

<article class="space-y-5">
    {#if expired}
        <p class="card p-4 text-sm text-text-muted" role="status">
            Diese Veranstaltung hat bereits stattgefunden.
        </p>
    {/if}
    <div>
            <a
                href={resolve("/")}
                onclick={handleBackClick}
                class="inline-flex min-h-12 items-center gap-2 rounded-control border border-border-default bg-surface-card px-4 py-2 text-sm font-medium text-text-default transition-colors hover:bg-action-secondary"
            >
                <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                Zurück
            </a>
        </div>

        <div
            class="lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]"
        >
            <div class="space-y-5">
                <!-- Event Header -->
                <section class="card overflow-hidden">
                    {#if detailImage}
                        <div
                            class="border-b border-border-default bg-surface-subtle p-4"
                        >
                            <img
                                src={detailImage}
                                alt={event.title}
                                width="1200"
                                height="700"
                                fetchpriority="high"
                                class="h-52 w-full rounded-card object-cover"
                            />
                        </div>
                    {/if}
                    <div class="space-y-4 p-5">
                        <div class="flex flex-wrap gap-2">
                            {#if eventTypeLabel}
                                <span
                                    class="inline-flex min-h-8 items-center rounded-badge border px-3 py-1 text-[0.75rem] font-semibold {eventTypeBadgeClass}"
                                >
                                    {eventTypeLabel}
                                </span>
                            {/if}
                            {#if musicLabel}
                                <span
                                    class="inline-flex min-h-8 items-center rounded-badge border px-3 py-1 text-[0.75rem] font-semibold {musicBadgeClass}"
                                >
                                    {musicLabel}
                                </span>
                            {/if}
                        </div>
                        <div class="flex items-start justify-between gap-3">
                            <h1
                                class="font-display text-[2rem] font-semibold leading-tight text-text-default"
                            >
                                {event.title}
                            </h1>
                            <EventFavoriteControl {event} />
                        </div>
                        <p class="meta-text max-w-[40ch]">
                            Zeit, Ort und Zugang zuerst. Weitere Details folgen
                            darunter in klar getrennten Abschnitten.
                        </p>
                    </div>
                </section>

                <!-- Actions -->
                <EventActions
                    {shareData}
                    {calendarFileName}
                    {event}
                />

                <!-- Mobile Quick Info -->
                <div class="space-y-3 lg:hidden">
                <EventQuickInfo
                    {event}
                    {formattedDate}
                    {isoStartDate}
                    {startTime}
                    {endTime}
                    {primaryOrganizer}
                    {dj}
                    {workshop}
                    {venueProfileLink}
                    cost={event.cost ? formatEventCost(event.cost) : ""}
                />
                </div>

                <!-- Map (inline — bind:this requires local ref) -->
                <div class="space-y-3">
                    {#if hasGeo}
                        <div>
                            <EventMap
                                venueName={event.venue!.venue}
                                lat={event.venue!.geo_lat}
                                lng={event.venue!.geo_lng}
                                {eventId}
                                mapUrl={venueMapUrl}
                            />
                        </div>
                    {/if}

                    {#if event.description}
                        <div class="card p-5">
                            <h2 class="section-title mb-3">Beschreibung</h2>
                            <div
                                class="prose prose-sm max-w-none break-words text-text-default [&_a]:text-text-link [&_a]:underline [&_a]:underline-offset-4 [&_p]:text-[1.0625rem] [&_p]:leading-[1.6]"
                            >
                                {@html sanitizedDescription}
                            </div>
                        </div>
                    {/if}

                    {#if event.url}
                        <div class="pb-2 lg:hidden">
                            <a
                                href={event.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="btn-primary w-full text-center"
                            >
                                <span
                                    class="flex items-center justify-center gap-2"
                                >
                                    <svg
                                        class="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                        />
                                    </svg>
                                    Auf Website ansehen
                                </span>
                            </a>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Desktop Sidebar -->
            <aside class="hidden lg:block">
                <EventSidebar
                    {event}
                    {formattedDate}
                    {isoStartDate}
                    {startTime}
                    {endTime}
                    {eventTypeLabel}
                    {eventTypeBadgeClass}
                    {musicLabel}
                    {musicBadgeClass}
                    {primaryOrganizer}
                    {dj}
                    {venueLink}
                    {venueProfileLink}
                    {organizerProfileLink}
                    {organizerWebsiteLink}
                    {djProfileLink}
                />
            </aside>
        </div>
    </article>

<style>
    :global(.custom-marker) {
        background: transparent !important;
        border: none !important;
    }

    :global(.leaflet-control-attribution) {
        font-size: 10px !important;
    }
</style>
