export type RateLimitBinding = {
    limit(input: { key: string }): Promise<{ success: boolean }>;
};

function getTrustedClientIp(request: Request): string | null {
    return request.headers.get("cf-connecting-ip");
}

export async function enforceRateLimit(
    request: Request,
    binding: RateLimitBinding | undefined,
    scope: string,
): Promise<Response | null> {
    if (!binding) return null;

    const clientIp = getTrustedClientIp(request);
    if (!clientIp) return null;

    const { success } = await binding.limit({
        key: `${scope}:${clientIp}`,
    });

    if (success) return null;

    return Response.json(
        {
            ok: false,
            message: "Zu viele Anfragen. Bitte warte einen Moment.",
        },
        {
            status: 429,
            headers: {
                "cache-control": "no-store",
                "retry-after": "60",
            },
        },
    );
}
