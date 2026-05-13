import { readFileSync } from "node:fs";
import { Buffer } from "node:buffer";
import type { ServerResponse } from "node:http";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, type Plugin } from "vite";

const WORDPRESS_ORIGIN = "https://www.rhein-neckar-tango.de";
const WORDPRESS_ADMIN_URL = `${WORDPRESS_ORIGIN}/wp-admin/`;
const WORDPRESS_PROFILE_URL = `${WORDPRESS_ADMIN_URL}profile.php`;
const WORDPRESS_STATUS_PATH = "/api/wp-auth-status";
const WORDPRESS_LOGIN_URL = `${WORDPRESS_ORIGIN}/wp-login.php?redirect_to=${encodeURIComponent(WORDPRESS_ADMIN_URL)}`;

const pkg = JSON.parse(
	readFileSync(new URL("./package.json", import.meta.url), "utf8"),
) as {
	version: string;
};
const DJ_API_BASE = `${WORDPRESS_ORIGIN}/wp-json/wp/v2/dj`;

const DEV_API_TARGETS: Record<string, string> = {
	"/api/posts": "https://www.rhein-neckar-tango.de/wp-json/wp/v2/posts",
	"/api/announcements":
		"https://www.rhein-neckar-tango.de/wp-json/wp/v2/ankuendigung",
	"/api/events":
		"https://www.rhein-neckar-tango.de/wp-json/tribe/events/v1/events",
	"/api/venues":
		"https://www.rhein-neckar-tango.de/wp-json/tribe/events/v1/venues",
	"/api/organizers":
		"https://www.rhein-neckar-tango.de/wp-json/tribe/events/v1/organizers",
	"/api/dj-cpt": "https://www.rhein-neckar-tango.de/wp-json/wp/v2/dj",
	"/api/links": "http://localhost:8787/api/links",
};

function rntApiDevProxy(): Plugin {
	return {
		name: "rnt-api-dev-proxy",
		configureServer(server) {
			server.middlewares.use(async (req, res, next) => {
				const url = req.url;
				const incoming = url ? new URL(url, "http://localhost") : null;

				if (!url || req.method !== "GET" || !incoming) {
					next();
					return;
				}

				if (incoming.pathname === WORDPRESS_STATUS_PATH) {
					const cookieHeader =
						typeof req.headers.cookie === "string" ? req.headers.cookie : "";

					if (!cookieHeader) {
						writeJson(res, 200, {
							ok: true,
							loggedIn: false,
							available: true,
							message: "Keine WordPress-Session gefunden.",
							loginUrl: WORDPRESS_LOGIN_URL,
							adminUrl: WORDPRESS_ADMIN_URL,
						});
						return;
					}

					try {
						const response = await fetch(WORDPRESS_PROFILE_URL, {
							method: "GET",
							redirect: "manual",
							headers: {
								accept: "text/html",
								cookie: cookieHeader,
								"user-agent":
									req.headers["user-agent"] ?? "rnt-mobile-dev-proxy/1.0",
							},
						});

						const location = response.headers.get("location") ?? "";
						const loggedIn =
							response.status === 200 && !location.includes("wp-login.php");

						writeJson(res, 200, {
							ok: true,
							loggedIn,
							available: true,
							message: loggedIn
								? "WordPress-Session erkannt."
								: "Nicht bei WordPress eingeloggt.",
							loginUrl: WORDPRESS_LOGIN_URL,
							adminUrl: WORDPRESS_ADMIN_URL,
						});
					} catch (error) {
						server.config.logger.error(
							`WP status proxy failed: ${String(error)}`,
						);
						writeJson(res, 502, {
							ok: false,
							loggedIn: false,
							available: false,
							message: "Der WordPress-Status ist derzeit nicht verfuegbar.",
							loginUrl: WORDPRESS_LOGIN_URL,
							adminUrl: WORDPRESS_ADMIN_URL,
						});
					}

					return;
				}

				const match = Object.entries(DEV_API_TARGETS).find(
					([path]) =>
						url === path ||
						url.startsWith(`${path}?`) ||
						url.startsWith(`${path}/`),
				);

				if (!match) {
					next();
					return;
				}

				const [path, targetBase] = match;
				const target = new URL(targetBase);

				if (incoming.pathname.length > path.length) {
					target.pathname = `${target.pathname}${incoming.pathname.slice(path.length)}`;
				}

				target.search = incoming.search;

				try {
					const response = await fetch(target, {
						headers: {
							accept: req.headers.accept ?? "application/json",
							"user-agent": "rnt-mobile-dev-proxy/1.0",
						},
					});

					const body = Buffer.from(await response.arrayBuffer());
					res.statusCode = response.status;
					res.setHeader("cache-control", "no-store");
					res.setHeader(
						"content-type",
						response.headers.get("content-type") ??
							"application/json; charset=utf-8",
					);
					res.end(body);
				} catch (error) {
					server.config.logger.error(
						`API proxy failed for ${target.toString()}: ${String(error)}`,
					);
					res.statusCode = 502;
					res.setHeader("content-type", "application/json; charset=utf-8");
					res.end(
						JSON.stringify({ ok: false, message: "Proxy request failed." }),
					);
				}
			});
		},
	};
}

function writeJson(
	res: ServerResponse,
	statusCode: number,
	body: unknown,
): void {
	res.statusCode = statusCode;
	res.setHeader("cache-control", "no-store");
	res.setHeader("content-type", "application/json; charset=utf-8");
	res.end(JSON.stringify(body));
}

export default defineConfig({
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version),
	},
	plugins: [tailwindcss(), rntApiDevProxy(), sveltekit()],
});
