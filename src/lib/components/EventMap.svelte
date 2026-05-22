<script lang="ts">
    import { escapeHtml } from "$lib/utils/html";
    import { trackFeatureEvent } from "$lib/matomo";
    import ConsentPlaceholder from "$lib/components/ConsentPlaceholder.svelte";
    import { consentStore } from "$lib/stores/consent.svelte";
    import { onMount } from "svelte";
    import "leaflet/dist/leaflet.css";

    let {
        venueName,
        lat,
        lng,
        eventId,
        mapUrl,
    }: {
        venueName: string;
        lat: number;
        lng: number;
        eventId: number | null;
        mapUrl: string;
    } = $props();

    let mapContainer = $state<HTMLDivElement | null>(null);
    let map: any = null;
    let mapConsentGranted = $derived(consentStore.hasConsent("maps"));

    onMount(() => {
        return () => {
            if (map) {
                map.remove();
                map = null;
            }
        };
    });

    $effect(() => {
        if (mapConsentGranted && mapContainer && !map) {
            initMap();
        }

        if (!mapConsentGranted && map) {
            map.remove();
            map = null;
        }
    });

    function enableMaps() {
        consentStore.savePreferences({ maps: true });
        trackFeatureEvent("event-map", "enable");
    }

    // Cache the leaflet module import to avoid repeated dynamic imports
    let leafletModule: Promise<any> | null = null;
    async function getLeaflet(): Promise<any> {
        if (!leafletModule) {
            leafletModule = import("leaflet");
        }
        return leafletModule;
    }

    async function initMap() {
        const L = await getLeaflet();

        map = L.map(mapContainer!).setView([lat, lng], 15);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const customIcon = L.divIcon({
            className: "custom-marker",
            html: `<div style="background: #0ea5e9; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
				<svg style="transform: rotate(45deg); width: 16px; height: 16px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 8 0111.314 0z"/>
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
                    String(eventId),
                ),
            )
            .addTo(map)
            .bindPopup(`<strong>${escapeHtml(venueName)}</strong>`)
            .openPopup();
    }
</script>

<div class="space-y-3">
    <div class="card overflow-hidden">
        {#if mapConsentGranted}
            <div
                bind:this={mapContainer}
                class="h-48 w-full"
                role="img"
                aria-label="Karte mit Standort von {venueName}"
            ></div>
        {:else}
            <ConsentPlaceholder
                title="Eingebettete Karte nur nach Zustimmung"
                description="Die Veranstaltungsansicht laedt externe OpenStreetMap-Kacheln erst, wenn du Karten für die App aktivierst."
                actionLabel="Karten aktivieren"
                onEnable={enableMaps}
            />
        {/if}
    </div>
    <div class="sr-only">
        <p>Kartenansicht für {venueName}. Standort ist auf der Karte markiert.
            <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
            >
                In externen Karten-App öffnen</a></p>
    </div>
    <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex min-h-12 items-center justify-center gap-2 rounded-control border border-border-default bg-surface-card px-4 py-2 text-sm font-medium text-text-default transition-colors hover:bg-action-secondary"
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
                width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
        </svg>
        In Maps öffnen
    </a>
</div>

<style>
    :global(.custom-marker) {
        background: transparent !important;
        border: none !important;
    }

    :global(.leaflet-control-attribution) {
        font-size: 10px !important;
    }
</style>
