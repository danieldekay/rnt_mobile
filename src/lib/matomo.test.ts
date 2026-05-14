import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("$env/dynamic/public", () => ({
  env: {
    PUBLIC_MATOMO_URL: "https://analytics.example.com",
    PUBLIC_MATOMO_SITE_ID: "7",
  },
}));

vi.mock("$app/environment", () => ({
  browser: true,
}));

const matomoModule = await import("./matomo");

function getTrackPageViewCount(): number {
  const queue = window._paq ?? [];
  return queue.filter((entry) => entry[0] === "trackPageView").length;
}

describe("Matomo consent flow", () => {
  beforeEach(() => {
    vi.stubGlobal("__APP_VERSION__", "test-version");
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation(() => ({
        matches: false,
        media: "",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    localStorage.clear();
    window._paq = [];
    document.title = "Startseite";
    matomoModule.cleanup();
  });

  afterEach(() => {
    matomoModule.syncMatomoConsent(false);
    matomoModule.cleanup();
    localStorage.clear();
    window._paq = [];
  });

  it("tracks an initial pageview on first consent-enabled view", () => {
    const started = matomoModule.syncMatomoConsent(true, "/", "Startseite");

    expect(started).toBe(true);
    expect(getTrackPageViewCount()).toBe(1);
    expect(window._paq).toEqual(
      expect.arrayContaining([
        ["setCustomUrl", "/"],
        ["setDocumentTitle", "Startseite"],
      ]),
    );
  });

  it("prevents duplicate pageviews for same URL after initial sync", () => {
    matomoModule.syncMatomoConsent(true, "/veranstaltungen", "Veranstaltungen");
    matomoModule.trackPageView("/veranstaltungen", "Veranstaltungen");

    expect(getTrackPageViewCount()).toBe(1);
  });

  it("does not track when consent is absent or withdrawn", () => {
    const startedWithoutConsent = matomoModule.syncMatomoConsent(false, "/", "Startseite");

    expect(startedWithoutConsent).toBe(false);
    expect(getTrackPageViewCount()).toBe(0);

    matomoModule.syncMatomoConsent(true, "/", "Startseite");
    expect(getTrackPageViewCount()).toBe(1);

    matomoModule.syncMatomoConsent(false);
    matomoModule.trackPageView("/nach-consent-ende", "Nach Consent Ende");

    expect(getTrackPageViewCount()).toBe(1);
  });
});