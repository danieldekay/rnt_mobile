import { describe, it, expect } from 'vitest';

import { renderComponent } from '../../test/render';
import Divider from './Divider.svelte';

describe('Divider Component', () => {
	it('renders with default props', () => {
		const { component } = renderComponent(Divider);
		const divider = component.querySelector('hr');
		expect(divider).toBeTruthy();
		expect(divider?.classList.contains('w-full')).toBe(true);
		expect(divider?.classList.contains('border-t')).toBe(true);
		expect(divider?.classList.contains('border-t-2')).toBe(true);
		expect(divider?.classList.contains('border-gray-300')).toBe(true);
	});

	it('renders with horizontal orientation', () => {
		const { component } = renderComponent(Divider, { orientation: 'horizontal' });
		const divider = component.querySelector('hr');
		expect(divider?.classList.contains('w-full')).toBe(true);
		expect(divider?.classList.contains('border-t')).toBe(true);
		expect(divider?.classList.contains('border-l')).toBe(false);
		expect(divider?.getAttribute('aria-orientation')).toBe('horizontal');
	});

	it('renders with vertical orientation', () => {
		const { component } = renderComponent(Divider, { orientation: 'vertical' });
		const divider = component.querySelector('hr');
		expect(divider?.classList.contains('h-full')).toBe(true);
		expect(divider?.classList.contains('border-l')).toBe(true);
		expect(divider?.classList.contains('border-t')).toBe(false);
		expect(divider?.getAttribute('aria-orientation')).toBe('vertical');
	});

	it('renders with different variants', () => {
		const { component: solid } = renderComponent(Divider, { variant: 'solid' });
		const { component: dashed } = renderComponent(Divider, { variant: 'dashed' });
		const { component: dotted } = renderComponent(Divider, { variant: 'dotted' });
		const { component: double } = renderComponent(Divider, { variant: 'double' });

		expect(solid.querySelector('hr')?.classList.contains('border-dashed')).toBe(false);
		expect(dashed.querySelector('hr')?.classList.contains('border-dashed')).toBe(true);
		expect(dotted.querySelector('hr')?.classList.contains('border-dotted')).toBe(true);
		expect(double.querySelector('hr')?.classList.contains('border-double')).toBe(true);
	});

	it('renders with different thickness levels', () => {
		const { component: sm } = renderComponent(Divider, { thickness: 'sm' });
		const { component: md } = renderComponent(Divider, { thickness: 'md' });
		const { component: lg } = renderComponent(Divider, { thickness: 'lg' });

		expect(sm.querySelector('hr')?.classList.contains('border-t-1')).toBe(true);
		expect(md.querySelector('hr')?.classList.contains('border-t-2')).toBe(true);
		expect(lg.querySelector('hr')?.classList.contains('border-t-4')).toBe(true);
	});

	it('renders with different spacing levels', () => {
		const { component: none } = renderComponent(Divider, { spacing: 'none' });
		const { component: sm } = renderComponent(Divider, { spacing: 'sm' });
		const { component: md } = renderComponent(Divider, { spacing: 'md' });
		const { component: lg } = renderComponent(Divider, { spacing: 'lg' });

		expect(none.querySelector('hr')?.className.includes('my-')).toBe(false);
		expect(sm.querySelector('hr')?.classList.contains('my-2')).toBe(true);
		expect(md.querySelector('hr')?.classList.contains('my-4')).toBe(true);
		expect(lg.querySelector('hr')?.classList.contains('my-6')).toBe(true);
	});

	it('renders with spacing for vertical orientation', () => {
		const { component } = renderComponent(Divider, {
			orientation: 'vertical',
			spacing: 'sm'
		});
		const divider = component.querySelector('hr');
		expect(divider?.classList.contains('mx-2')).toBe(true);
		expect(divider?.className.includes('my-')).toBe(false);
	});

	it('renders with different colors', () => {
		const { component: defaultColor } = renderComponent(Divider, { color: 'default' });
		const { component: muted } = renderComponent(Divider, { color: 'muted' });
		const { component: subtle } = renderComponent(Divider, { color: 'subtle' });
		const { component: inverse } = renderComponent(Divider, { color: 'inverse' });

		expect(defaultColor.querySelector('hr')?.classList.contains('border-gray-300')).toBe(true);
		expect(muted.querySelector('hr')?.classList.contains('border-gray-200')).toBe(true);
		expect(subtle.querySelector('hr')?.classList.contains('border-gray-100')).toBe(true);
		expect(inverse.querySelector('hr')?.classList.contains('border-gray-600')).toBe(true);
	});

	it('renders with custom element type', () => {
		const { component } = renderComponent(Divider, { as: 'div' });
		const divider = component.querySelector('div');
		expect(divider).toBeTruthy();
	});

	it('renders with accessibility attributes', () => {
		const { component } = renderComponent(Divider, {
			id: 'test-divider',
			role: 'separator',
			title: 'Test Divider'
		});
		const divider = component.querySelector('hr');
		expect(divider?.getAttribute('id')).toBe('test-divider');
		expect(divider?.getAttribute('role')).toBe('separator');
		expect(divider?.getAttribute('title')).toBe('Test Divider');
	});

	it('renders with horizontal divider and role separator', () => {
		const { component } = renderComponent(Divider, {
			orientation: 'horizontal',
			role: 'separator'
		});
		const divider = component.querySelector('hr');
		expect(divider?.getAttribute('role')).toBe('separator');
		expect(divider?.getAttribute('aria-orientation')).toBe('horizontal');
	});

	it('renders with vertical divider and automatic role', () => {
		const { component } = renderComponent(Divider, { orientation: 'vertical' });
		const divider = component.querySelector('hr');
		expect(divider?.getAttribute('role')).toBe('separator');
		expect(divider?.getAttribute('aria-orientation')).toBe('vertical');
	});

	it('renders with responsive behavior enabled', () => {
		const { component } = renderComponent(Divider, { responsive: true });
		const divider = component.querySelector('hr');
		expect(divider?.classList.contains('w-full')).toBe(true);
	});

	it('renders with responsive behavior disabled', () => {
		const { component } = renderComponent(Divider, { responsive: false });
		const divider = component.querySelector('hr');
		expect(divider?.classList.contains('w-full')).toBe(true);
	});

	it('combines multiple styling properties correctly', () => {
		const { component } = renderComponent(Divider, {
			orientation: 'horizontal',
			variant: 'dashed',
			thickness: 'lg',
			spacing: 'md',
			color: 'inverse'
		});
		const divider = component.querySelector('hr');
		expect(divider?.classList.contains('w-full')).toBe(true);
		expect(divider?.classList.contains('border-t')).toBe(true);
		expect(divider?.classList.contains('border-dashed')).toBe(true);
		expect(divider?.classList.contains('border-t-4')).toBe(true);
		expect(divider?.classList.contains('my-4')).toBe(true);
		expect(divider?.classList.contains('border-gray-600')).toBe(true);
	});
});