import { describe, it, expect, vi } from 'vitest';

import { renderComponent } from '../../test/render';
import BadgeSlotWrapper from '../../test/fixtures/BadgeSlotWrapper.svelte';
import Badge from './Badge.svelte';

describe('Badge Component', () => {
	it('renders with default props', () => {
		const { component } = renderComponent(Badge);
		const badge = component.querySelector('span');
		expect(badge).toBeTruthy();
		expect(badge?.classList.contains('bg-primary-100')).toBe(true);
		expect(badge?.classList.contains('text-primary-800')).toBe(true);
		expect(badge?.classList.contains('border-primary-200')).toBe(true);
	});

	it('renders with different variants', () => {
		expect(renderComponent(Badge, { variant: 'primary' }).component.querySelector('.bg-primary-100')).toBeTruthy();
		expect(renderComponent(Badge, { variant: 'secondary' }).component.querySelector('.bg-secondary-100')).toBeTruthy();
		expect(renderComponent(Badge, { variant: 'accent' }).component.querySelector('.bg-accent-100')).toBeTruthy();
		expect(renderComponent(Badge, { variant: 'success' }).component.querySelector('.bg-green-100')).toBeTruthy();
		expect(renderComponent(Badge, { variant: 'warning' }).component.querySelector('.bg-yellow-100')).toBeTruthy();
		expect(renderComponent(Badge, { variant: 'error' }).component.querySelector('.bg-red-100')).toBeTruthy();
		expect(renderComponent(Badge, { variant: 'info' }).component.querySelector('.bg-blue-100')).toBeTruthy();
		expect(renderComponent(Badge, { variant: 'muted' }).component.querySelector('.bg-gray-100')).toBeTruthy();
	});

	it('renders with different sizes', () => {
		expect(renderComponent(Badge, { size: 'sm' }).component.querySelector('.text-xs')).toBeTruthy();
		expect(renderComponent(Badge, { size: 'md' }).component.querySelector('.text-sm')).toBeTruthy();
		expect(renderComponent(Badge, { size: 'lg' }).component.querySelector('.text-base')).toBeTruthy();
	});

	it('renders with different shapes', () => {
		expect(renderComponent(Badge, { shape: 'rounded' }).component.querySelector('.rounded-md')).toBeTruthy();
		expect(renderComponent(Badge, { shape: 'pill' }).component.querySelector('.rounded-full')).toBeTruthy();
		expect(renderComponent(Badge, { shape: 'square' }).component.querySelector('.rounded-none')).toBeTruthy();
	});

	it('renders with icon on left', () => {
		const { component } = renderComponent(Badge, { icon: '📌', iconPosition: 'left' });
		expect(component.textContent?.includes('📌')).toBe(true);
		expect(component.querySelector('.mr-1')).toBeTruthy();
	});

	it('renders with icon on right', () => {
		const { component } = renderComponent(Badge, { icon: '📌', iconPosition: 'right' });
		expect(component.textContent?.includes('📌')).toBe(true);
		expect(component.querySelector('.ml-1')).toBeTruthy();
	});

	it('renders with dismissible button classes', () => {
		const { component } = renderComponent(Badge, { dismissible: true });
		const badge = component.querySelector('span');
		expect(badge?.classList.contains('cursor-pointer')).toBe(true);
		expect(badge?.classList.contains('hover:opacity-80')).toBe(true);
	});

	it('dispatches a dismiss event when clicked', () => {
		const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
		const { component } = renderComponent(Badge, { dismissible: true });
		const badge = component.querySelector('span');
		badge?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(dispatchSpy).toHaveBeenCalled();
		expect(dispatchSpy.mock.calls[0]?.[0].type).toBe('dismiss');
	});

	it('renders with custom element type', () => {
		const { component } = renderComponent(Badge, { as: 'div' });
		expect(component.querySelector('div')).toBeTruthy();
	});

	it('renders with accessibility attributes', () => {
		const { component } = renderComponent(Badge, {
			id: 'test-badge',
			role: 'status',
			title: 'Test Badge'
		});
		const badge = component.querySelector('span');
		expect(badge?.getAttribute('id')).toBe('test-badge');
		expect(badge?.getAttribute('role')).toBe('status');
		expect(badge?.getAttribute('title')).toBe('Test Badge');
	});

	it('renders with responsive behavior enabled', () => {
		const { component } = renderComponent(Badge, { responsive: true, size: 'md' });
		expect(component.querySelector('.inline-flex')).toBeTruthy();
	});

	it('renders with responsive behavior disabled', () => {
		const { component } = renderComponent(Badge, { responsive: false, size: 'md' });
		expect(component.querySelector('.inline-flex')).toBeTruthy();
	});

	it('renders with slot content', () => {
		const { component } = renderComponent(BadgeSlotWrapper);
		const badge = component.querySelector('span');
		expect(badge?.textContent?.includes('Test Badge Content')).toBe(true);
	});
});