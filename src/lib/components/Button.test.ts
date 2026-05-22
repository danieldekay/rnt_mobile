import { describe, it, expect } from 'vitest';

import { renderComponent } from '../../test/render';
import Button from './Button.svelte';

describe('Button Component', () => {
	it('renders with default props', () => {
		const { component } = renderComponent(Button);
		const button = component.querySelector('button');
		expect(button).toBeTruthy();
		expect(button?.classList.contains('bg-primary-500')).toBe(true);
		expect(button?.classList.contains('text-white')).toBe(true);
	});

	it('renders with primary variant', () => {
		const { component } = renderComponent(Button, { variant: 'primary' });
		const button = component.querySelector('button');
		expect(button?.classList.contains('bg-primary-500')).toBe(true);
		expect(button?.classList.contains('text-white')).toBe(true);
	});

	it('renders with secondary variant', () => {
		const { component } = renderComponent(Button, { variant: 'secondary' });
		const button = component.querySelector('button');
		expect(button?.classList.contains('bg-secondary-500')).toBe(true);
		expect(button?.classList.contains('text-white')).toBe(true);
	});

	it('renders with accent variant', () => {
		const { component } = renderComponent(Button, { variant: 'accent' });
		const button = component.querySelector('button');
		expect(button?.classList.contains('bg-accent-500')).toBe(true);
		expect(button?.classList.contains('text-white')).toBe(true);
	});

	it('renders with outline variant', () => {
		const { component } = renderComponent(Button, { variant: 'outline' });
		const button = component.querySelector('button');
		expect(button?.classList.contains('border')).toBe(true);
		expect(button?.classList.contains('border-border-default')).toBe(true);
		expect(button?.classList.contains('bg-transparent')).toBe(true);
	});

	it('renders with ghost variant', () => {
		const { component } = renderComponent(Button, { variant: 'ghost' });
		const button = component.querySelector('button');
		expect(button?.classList.contains('bg-transparent')).toBe(true);
	});

	it('renders with link variant', () => {
		const { component } = renderComponent(Button, { variant: 'link' });
		const button = component.querySelector('button');
		expect(button?.classList.contains('bg-transparent')).toBe(true);
		expect(button?.classList.contains('text-text-link')).toBe(true);
	});

	it('renders with different sizes', () => {
		const { component: sm } = renderComponent(Button, { size: 'sm' });
		const { component: md } = renderComponent(Button, { size: 'md' });
		const { component: lg } = renderComponent(Button, { size: 'lg' });
		const { component: xl } = renderComponent(Button, { size: 'xl' });

		expect(sm.querySelector('button')?.classList.contains('h-9')).toBe(true);
		expect(md.querySelector('button')?.classList.contains('h-10')).toBe(true);
		expect(lg.querySelector('button')?.classList.contains('h-11')).toBe(true);
		expect(xl.querySelector('button')?.classList.contains('h-12')).toBe(true);
	});

	it('renders with disabled state', () => {
		const { component } = renderComponent(Button, { disabled: true });
		const button = component.querySelector('button');
		expect(button?.disabled).toBe(true);
		expect(button?.classList.contains('disabled:opacity-50')).toBe(true);
	});

	it('renders with loading state', () => {
		const { component } = renderComponent(Button, { loading: true });
		const button = component.querySelector('button');
		expect(button?.disabled).toBe(true);
		const spinner = button?.querySelector('svg');
		expect(spinner).toBeTruthy();
	});

	it('renders with full width', () => {
		const { component } = renderComponent(Button, { fullWidth: true });
		const button = component.querySelector('button');
		expect(button?.classList.contains('w-full')).toBe(true);
	});

	it('renders with custom type', () => {
		const { component } = renderComponent(Button, { type: 'submit' });
		const button = component.querySelector('button');
		expect(button?.getAttribute('type')).toBe('submit');
	});

	it('renders with left icon', () => {
		const { component } = renderComponent(Button, { leftIcon: '←' });
		const button = component.querySelector('button');
		expect(button?.textContent?.includes('←')).toBe(true);
	});

	it('renders with right icon', () => {
		const { component } = renderComponent(Button, { rightIcon: '→' });
		const button = component.querySelector('button');
		expect(button?.textContent?.includes('→')).toBe(true);
	});

	it('renders with custom element type', () => {
		const { component } = renderComponent(Button, { as: 'a' });
		const button = component.querySelector('a');
		expect(button).toBeTruthy();
	});

	it('renders with accessibility attributes', () => {
		const { component } = renderComponent(Button, {
			ariaLabel: 'Test Button',
			id: 'test-button',
			role: 'button',
			title: 'Test Title'
		});
		const button = component.querySelector('button');
		expect(button?.getAttribute('aria-label')).toBe('Test Button');
		expect(button?.getAttribute('id')).toBe('test-button');
		expect(button?.getAttribute('role')).toBe('button');
		expect(button?.getAttribute('title')).toBe('Test Title');
	});

	it('renders with responsive behavior enabled', () => {
		const { component } = renderComponent(Button, { responsive: true, size: 'md' });
		const button = component.querySelector('button');
		expect(button?.classList.contains('sm:h-11')).toBe(true);
	});

	it('renders with responsive behavior disabled', () => {
		const { component } = renderComponent(Button, { responsive: false, size: 'md' });
		const button = component.querySelector('button');
		expect(button?.classList.contains('sm:h-11')).toBe(false);
	});

	it('passes props through the shared render helper', () => {
		const { component } = renderComponent(Button, { id: 'shared-helper-button', variant: 'secondary' });
		const button = component.querySelector('#shared-helper-button');
		expect(button).toBeTruthy();
		expect(button?.classList.contains('bg-secondary-500')).toBe(true);
	});

	it('starts from a clean DOM state between tests', () => {
		expect(document.querySelector('#shared-helper-button')).toBeNull();
		const { component } = renderComponent(Button, { id: 'clean-dom-button' });
		expect(component.querySelector('#clean-dom-button')).toBeTruthy();
	});
});