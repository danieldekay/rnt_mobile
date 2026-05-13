<!--
  OrganizerCard component using design tokens and enhanced organizer data
  
  Features:
  - Profile image display with fallbacks
  - Organizer information and bio
  - Next 2 events preview (like DJ cards)
  - Social media links
  - Verification status
  - Responsive design
  - Accessibility features
-->

<script lang="ts">
    import { onMount } from "svelte";
    import Card from "./Card.svelte";
    import Heading from "./Heading.svelte";
    import Text from "./Text.svelte";
    import Badge from "./Badge.svelte";
    import Button from "./Button.svelte";
    import { resolve } from "$app/paths";
    import type {
        EnhancedOrganizer,
        OrganizerNextEventSummary,
    } from "$lib/types";

    let {
        organizer,
        nextEvents = [],
        showVerification = true,
        showSocialLinks = true,
        showContactInfo = false,
        showDescription = true,
        maxDescriptionLength = 150,
        showStatistics = false,
    }: {
        organizer: EnhancedOrganizer;
        nextEvents?: OrganizerNextEventSummary[];
        showVerification?: boolean;
        showSocialLinks?: boolean;
        showContactInfo?: boolean;
        showDescription?: boolean;
        maxDescriptionLength?: number;
        showStatistics?: boolean;
    } = $props();

    let imageUrl: string | null = $state(null);
    let isLoading = $state(true);

    // Load image with error handling
    onMount(async () => {
        try {
            if (organizer.image && organizer.image !== "false") {
                const img = new Image();
                img.onload = () => {
                    imageUrl = organizer.image || null;
                    isLoading = false;
                };
                img.onerror = () => {
                    imageUrl = null;
                    isLoading = false;
                };
                img.src = organizer.image || "";
            } else {
                imageUrl = null;
                isLoading = false;
            }
        } catch (err) {
            console.error("Error loading organizer image:", err);
            imageUrl = null;
            isLoading = false;
        }
    });

    // Get initials for avatar fallback
    function getInitials(): string {
        if (!organizer.organizer) return "";
        return organizer.organizer
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .substring(0, 2);
    }

    // Generate a colorful background color based on initials
    function getAvatarColor(initials: string): string {
        const colors = [
            "#3B82F6",
            "#8B5CF6",
            "#EC4899",
            "#F59E0B",
            "#10B981",
            "#F97316",
            "#6366F1",
            "#84CC16",
            "#06B6D4",
            "#D94600",
        ];
        let hash = 0;
        for (let i = 0; i < initials.length; i++) {
            hash = initials.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    // Truncate description
    function truncateDescription(text: string, maxLength: number): string {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    }

    // Format phone number
    function formatPhone(phone: string): string {
        if (!phone) return "";
        return phone.replace(/\s/g, "").replace(/^(\+49|0)/, "+49 ");
    }

    // Get social media platforms
    function getSocialPlatforms(): string[] {
        if (!organizer.socialMedia) return [];
        return Object.keys(organizer.socialMedia).filter(
            (platform) =>
                organizer.socialMedia?.[
                    platform as keyof typeof organizer.socialMedia
                ],
        );
    }

    // Handle social media link click
    function handleSocialClick(platform: string, url: string) {
        window.open(url, "_blank", "noopener,noreferrer");
    }

    // Handle contact action
    function handleContactAction(type: "phone" | "email" | "website") {
        const contactInfo = {
            phone: organizer.phone,
            email: organizer.email,
            website: organizer.website,
        }[type];

        if (!contactInfo) return;

        if (type === "phone") {
            window.location.href = `tel:${formatPhone(contactInfo)}`;
        } else if (type === "email") {
            window.location.href = `mailto:${contactInfo}`;
        } else if (type === "website") {
            window.open(contactInfo, "_blank", "noopener,noreferrer");
        }
    }

    // Handle organizer profile view
    function handleViewProfile() {
        if (organizer.slug) {
            window.location.href = resolve(`/veranstalter/${organizer.slug}`);
        }
    }

    // Format event meta line
    function getEventMeta(event: OrganizerNextEventSummary): string {
        return event.city
            ? `${event.dateLabel} · ${event.city}`
            : event.dateLabel;
    }
</script>

<Card variant="outlined" padding="md" responsive={true} role="article">
    <div class="organizer-card-content">
        <!-- Left: Avatar/Image -->
        <div class="organizer-avatar">
            {#if isLoading}
                <div class="avatar-loading">
                    <div class="skeleton"></div>
                </div>
            {:else if imageUrl}
                <img
                    src={imageUrl}
                    alt="{organizer.organizer} logo"
                    loading="lazy"
                    width={120}
                    height={120}
                    class="organizer-image"
                    onerror={() => (imageUrl = null)}
                />
            {:else}
                <div
                    class="organizer-avatar-initials"
                    style="background-color: {getAvatarColor(getInitials())}"
                >
                    <span class="organizer-initials-text">{getInitials()}</span>
                </div>
            {/if}

            {#if showVerification && organizer.verification?.isVerified}
                <Badge variant="success" size="sm">Verified</Badge>
            {/if}
        </div>

        <!-- Right: Organizer Information -->
        <div class="organizer-info">
            <!-- Name and Title -->
            <div class="organizer-header">
                <Heading
                    level={3}
                    size="base"
                    weight="semibold"
                    id="organizer-name"
                >
                    <a
                        href={organizer.slug
                            ? resolve(`/veranstalter/${organizer.slug}`)
                            : undefined}
                        data-sveltekit-preload-data="hover"
                        class="transition-colors hover:text-action-primary"
                    >
                        {organizer.organizer}
                    </a>
                </Heading>

                {#if organizer.details?.organizationType}
                    <Badge variant="muted" size="sm">
                        {organizer.details.organizationType}
                    </Badge>
                {/if}
            </div>

            <!-- Description/Bio -->
            {#if showDescription && organizer.details?.description}
                <Text size="sm" color="muted">
                    {truncateDescription(
                        organizer.details.description,
                        maxDescriptionLength,
                    )}
                </Text>
            {/if}

            <!-- Next Events -->
            {#if nextEvents.length > 0}
                <div class="next-events">
                    <div
                        class="space-y-2.5 pt-1 border-t border-border-default/50"
                    >
                        {#each nextEvents as event}
                            <a
                                href={event.internalPath
                                    ? resolve(event.internalPath)
                                    : event.externalUrl}
                                data-sveltekit-preload-data="hover"
                                target={event.externalUrl && !event.internalPath
                                    ? "_blank"
                                    : undefined}
                                rel={event.externalUrl && !event.internalPath
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
                                            {event.title}
                                        </p>
                                        <p
                                            class="text-xs text-text-muted mt-0.5"
                                        >
                                            {getEventMeta(event)}
                                        </p>
                                    </div>
                                </div>
                            </a>
                        {/each}
                    </div>
                </div>
            {:else}
                <div class="space-y-2.5 pt-1 border-t border-amber-200/30">
                    <div class="flex items-start gap-2">
                        <svg
                            class="h-4 w-4 text-amber-600/80 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0 1 1 0 002 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        <p class="text-sm text-amber-800/80">
                            Keine Termine im gewählten Zeitraum
                        </p>
                    </div>
                </div>
            {/if}

            <!-- Action Buttons -->
            <div class="organizer-actions">
                <a
                    href={resolve(`/veranstalter/${organizer.slug}`)}
                    data-sveltekit-preload-data="hover"
                    class="min-h-4 px-4 py-2 text-sm font-medium text-text-default bg-white border border-border-default hover:bg-surface-subtle hover:shadow-md transition-all duration-200 rounded-badge min-w-[60px] justify-center"
                >
                    Profil ansehen
                </a>
            </div>
        </div>
    </div>

    <!-- Tags -->
    {#if organizer.details?.tags && organizer.details.tags.length > 0}
        <div class="organizer-tags">
            {#each organizer.details.tags as tag}
                <Badge variant="muted" size="sm">
                    {tag}
                </Badge>
            {/each}
        </div>
    {/if}
</Card>

<style>
    .organizer-card-content {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
    }

    .organizer-avatar {
        flex-shrink: 0;
        position: relative;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .avatar-loading {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .skeleton {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
        );
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
    }

    @keyframes loading {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }

    .organizer-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
        border: 3px solid var(--border-default);
    }

    .organizer-avatar-initials {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid var(--border-default);
    }

    .organizer-initials-text {
        font-size: 2.5rem;
        font-weight: 700;
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .organizer-info {
        flex: 1;
        min-width: 0;
    }

    .organizer-header {
        margin-bottom: 0.75rem;
        min-height: 2.5rem;
    }

    .organizer-header a {
        color: inherit;
        text-decoration: none;
    }

    .organizer-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 1rem;

        bottom: 1rem;
    }

    .organizer-tags {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 1rem;
    }

    @media (max-width: 768px) {
        .organizer-card-content {
            flex-direction: column;
            text-align: center;
        }

        .organizer-avatar {
            width: 100px;
            height: 100px;
            margin: 0 auto;
        }

        .organizer-actions {
            justify-content: center;
        }
    }

    @media (max-width: 480px) {
        .organizer-avatar {
            width: 80px;
            height: 80px;
        }
    }
</style>
