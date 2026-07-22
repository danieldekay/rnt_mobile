import { building } from "$app/environment";
import { WORDPRESS_ORIGIN } from "$lib/constants";

const API_BASES = {
	posts: {
		client: "/api/posts",
		build: `${WORDPRESS_ORIGIN}/wp-json/wp/v2/posts`,
	},
	announcements: {
		client: "/api/announcements",
		build: `${WORDPRESS_ORIGIN}/wp-json/wp/v2/ankuendigung`,
	},
	events: {
		client: "/api/events",
		build: `${WORDPRESS_ORIGIN}/wp-json/tribe/events/v1/events`,
	},
	organizers: {
		client: "/api/organizers",
		build: `${WORDPRESS_ORIGIN}/wp-json/tribe/events/v1/organizers`,
	},
} as const;

export type ApiBaseKey = keyof typeof API_BASES;

export function apiBase(key: ApiBaseKey): string {
	return building ? API_BASES[key].build : API_BASES[key].client;
}
