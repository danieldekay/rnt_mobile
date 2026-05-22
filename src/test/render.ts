import { render } from "@testing-library/svelte";

type RenderOptions = {
	slots?: Record<string, string>;
};

export function renderComponent(component: any, props: Record<string, unknown> = {}, options: RenderOptions = {}) {
	const result = render(component, {
		props,
		...options,
	});

	return {
		...result,
		component: result.container,
		target: result.container,
	};
}