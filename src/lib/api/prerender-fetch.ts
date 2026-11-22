const MAX_ATTEMPTS = 3;

export function createPrerenderFetch(fetcher: typeof fetch = globalThis.fetch): typeof fetch {
  return async (input, init) => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const timeout = AbortSignal.timeout(20_000);
        const signal = init?.signal
          ? AbortSignal.any([init.signal, timeout])
          : timeout;
        const response = await fetcher(input, { ...init, signal });

        if (response.status >= 500 && response.status <= 504 && attempt < MAX_ATTEMPTS) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 250));
          continue;
        }

        // A connection can close while the body is still streaming.
        if (response.ok) await response.clone().arrayBuffer();
        return response;
      } catch (error) {
        if (attempt === MAX_ATTEMPTS) throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, attempt * 250));
    }

    throw new Error("Prerender fetch exhausted its retries");
  };
}

export const prerenderFetch = createPrerenderFetch();
