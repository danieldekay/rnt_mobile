import { fireEvent, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import ListFooterNavigation from "./ListFooterNavigation.svelte";
import { renderComponent } from "../../test/render";

describe("ListFooterNavigation", () => {
    it("renders the jump-to-top action for mobile list navigation", () => {
        renderComponent(ListFooterNavigation, {
            onJumpToTop: vi.fn(),
            canLoadMore: false,
        });

        expect(screen.getByRole("button", { name: /nach oben/i })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /naechste 7 tage laden/i })).not.toBeInTheDocument();
    });

    it("wires the jump-to-top callback", async () => {
        const onJumpToTop = vi.fn();
        renderComponent(ListFooterNavigation, {
            onJumpToTop,
            canLoadMore: false,
        });

        await fireEvent.click(screen.getByRole("button", { name: /nach oben/i }));

        expect(onJumpToTop).toHaveBeenCalledTimes(1);
    });

    it("shows the next-period action when forward browsing is supported", async () => {
        const onLoadMore = vi.fn();
        renderComponent(ListFooterNavigation, {
            onJumpToTop: vi.fn(),
            onLoadMore,
            canLoadMore: true,
        });

        const loadMoreButton = screen.getByRole("button", { name: /naechste 7 tage laden/i });
        expect(loadMoreButton).toBeInTheDocument();

        await fireEvent.click(loadMoreButton);

        expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it("renders retry feedback near the next-period action", () => {
        renderComponent(ListFooterNavigation, {
            onJumpToTop: vi.fn(),
            onLoadMore: vi.fn(),
            canLoadMore: true,
            appendError: "Mehr Events konnten nicht geladen werden.",
        });

        expect(screen.getByText("Mehr Events konnten nicht geladen werden.")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /erneut laden/i })).toBeInTheDocument();
    });
});