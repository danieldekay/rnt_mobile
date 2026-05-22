import { flushSync } from 'svelte';
import { describe, it, expect } from 'vitest';

import { renderComponent } from '../../test/render';
import Avatar from './Avatar.svelte';

describe('Avatar Component', () => {
	it('renders with default props', () => {
		const { component } = renderComponent(Avatar);
		const avatar = component.querySelector('div');
		expect(avatar).toBeTruthy();
		expect(avatar?.classList.contains('w-10')).toBe(true);
		expect(avatar?.classList.contains('h-10')).toBe(true);
		expect(avatar?.classList.contains('rounded-full')).toBe(true);
	});

	it('renders with different sizes', () => {
		const { component: xs } = renderComponent(Avatar, { size: 'xs' });
		const { component: sm } = renderComponent(Avatar, { size: 'sm' });
		const { component: md } = renderComponent(Avatar, { size: 'md' });
		const { component: lg } = renderComponent(Avatar, { size: 'lg' });
		const { component: xl } = renderComponent(Avatar, { size: 'xl' });

		expect(xs.querySelector('div')?.classList.contains('w-6')).toBe(true);
		expect(sm.querySelector('div')?.classList.contains('w-8')).toBe(true);
		expect(md.querySelector('div')?.classList.contains('w-10')).toBe(true);
		expect(lg.querySelector('div')?.classList.contains('w-12')).toBe(true);
		expect(xl.querySelector('div')?.classList.contains('w-16')).toBe(true);
	});

	it('renders with different shapes', () => {
		const { component: circle } = renderComponent(Avatar, { shape: 'circle' });
		const { component: square } = renderComponent(Avatar, { shape: 'square' });

		expect(circle.querySelector('div')?.classList.contains('rounded-full')).toBe(true);
		expect(square.querySelector('div')?.classList.contains('rounded-md')).toBe(true);
	});

	it('renders with image variant', () => {
		const { component } = renderComponent(Avatar, {
			src: 'test.jpg',
			variant: 'image',
			alt: 'Test Avatar'
		});
		const img = component.querySelector('img');
		expect(img).toBeTruthy();
		expect(img?.getAttribute('src')).toBe('test.jpg');
		expect(img?.getAttribute('alt')).toBe('Test Avatar');
	});

	it('renders with initials variant', () => {
		const { component } = renderComponent(Avatar, {
			name: 'John Doe',
			variant: 'initials'
		});
		expect(component.textContent?.trim()).toContain('JD');
	});

	it('renders with icon variant', () => {
		const { component } = renderComponent(Avatar, {
			icon: '👤',
			variant: 'icon'
		});
		expect(component.textContent?.includes('👤')).toBe(true);
	});

	it('renders with status indicator', () => {
		const { component } = renderComponent(Avatar, {
			status: 'online',
			statusPosition: 'bottom-right'
		});
		const status = component.querySelector('.bg-green-500');
		expect(status).toBeTruthy();
		expect(status?.classList.contains('bottom-0')).toBe(true);
		expect(status?.classList.contains('right-0')).toBe(true);
	});

	it('renders with different status colors', () => {
		expect(renderComponent(Avatar, { status: 'online' }).component.querySelector('.bg-green-500')).toBeTruthy();
		expect(renderComponent(Avatar, { status: 'offline' }).component.querySelector('.bg-gray-400')).toBeTruthy();
		expect(renderComponent(Avatar, { status: 'busy' }).component.querySelector('.bg-red-500')).toBeTruthy();
		expect(renderComponent(Avatar, { status: 'away' }).component.querySelector('.bg-yellow-500')).toBeTruthy();
	});

	it('renders with different status positions', () => {
		expect(renderComponent(Avatar, { status: 'online', statusPosition: 'bottom-right' }).component.querySelector('.right-0.bottom-0')).toBeTruthy();
		expect(renderComponent(Avatar, { status: 'online', statusPosition: 'bottom-left' }).component.querySelector('.left-0.bottom-0')).toBeTruthy();
		expect(renderComponent(Avatar, { status: 'online', statusPosition: 'top-right' }).component.querySelector('.right-0.top-0')).toBeTruthy();
		expect(renderComponent(Avatar, { status: 'online', statusPosition: 'top-left' }).component.querySelector('.left-0.top-0')).toBeTruthy();
	});

	it('renders with skeleton fallback', () => {
		const { component } = renderComponent(Avatar, { fallback: 'skeleton' });
		expect(component.querySelector('.animate-pulse')).toBeTruthy();
	});

	it('handles image error gracefully', () => {
		const { component } = renderComponent(Avatar, {
			src: 'invalid.jpg',
			variant: 'image',
			name: 'John Doe'
		});
		const img = component.querySelector('img');
		img?.dispatchEvent(new Event('error'));
		flushSync();
		expect(component.textContent?.trim()).toContain('JD');
	});

	it('renders with custom element type', () => {
		const { component } = renderComponent(Avatar, { as: 'span' });
		expect(component.querySelector('span')).toBeTruthy();
	});

	it('renders with accessibility attributes', () => {
		const { component } = renderComponent(Avatar, {
			id: 'test-avatar',
			role: 'img',
			title: 'Test Avatar'
		});
		const avatar = component.querySelector('div');
		expect(avatar?.getAttribute('id')).toBe('test-avatar');
		expect(avatar?.getAttribute('role')).toBe('img');
		expect(avatar?.getAttribute('title')).toBe('Test Avatar');
	});

	it('renders with responsive behavior enabled', () => {
		const { component } = renderComponent(Avatar, { responsive: true, size: 'md' });
		const avatar = component.querySelector('div');
		expect(avatar?.classList.contains('w-10')).toBe(true);
		expect(avatar?.classList.contains('h-10')).toBe(true);
	});

	it('renders with responsive behavior disabled', () => {
		const { component } = renderComponent(Avatar, { responsive: false, size: 'md' });
		const avatar = component.querySelector('div');
		expect(avatar?.classList.contains('w-10')).toBe(true);
		expect(avatar?.classList.contains('h-10')).toBe(true);
	});

	it('generates correct initials from name', () => {
		const { component } = renderComponent(Avatar, { name: 'Jane Smith', variant: 'initials' });
		expect(component.textContent?.trim()).toContain('JS');
	});

	it('handles empty name gracefully', () => {
		const { component } = renderComponent(Avatar, { name: '', variant: 'initials' });
		expect(component.textContent?.trim()).toBe('');
	});
});