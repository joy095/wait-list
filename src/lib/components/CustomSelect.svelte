<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	export let name: string;
	export let label: string;
	export let options: Array<{ value: string; label: string }>;
	export let selected: string = '';
	export let required = false;

	interface I18nContext {
		t: (namespace: string, key: string, options?: Record<string, unknown>) => string;
		changeLanguage: (lang: string) => void;
		currentLanguage: Writable<string>;
	}
	const { t } = getContext<I18nContext>('i18n');

	let isOpen = false;
	let buttonText: string;
	let selectElement: HTMLSelectElement;

	$: {
		const selectedOption = options.find((opt) => opt.value === selected);
		buttonText = selectedOption ? t('form', selectedOption.label) : t('form', 'features_0');
	}

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function selectOption(value: string) {
		selected = value;
		isOpen = false;
		if (selectElement) {
			selectElement.value = value;
			selectElement.dispatchEvent(new Event('change'));
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggleDropdown();
		} else if (event.key === 'Escape') {
			isOpen = false;
		}
	}

	function handleOptionKeydown(event: KeyboardEvent, value: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			selectOption(value);
		}
	}

	onMount(() => {
		if (selectElement) {
			selectElement.value = selected;
		}
		console.log(`[PremiumGlassSelect] Initial value for ${name}:`, selected);
		return () => {
			selectElement = null;
		};
	});
</script>

<div class="relative">
	<label for="{name}-select" class="block text-sm font-medium" aria-required={required}>
		{@html t('form', label) + (required ? ' <span class="text-red-500">*</span>' : '')}
	</label>
	<div class="mt-1">
		<button
			type="button"
			class="w-full rounded-lg bg-[rgba(59,130,246,0.1)] px-2.5 py-2 text-left text-sm text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-[rgba(59,130,246,0.2)] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
			on:click={toggleDropdown}
			on:keydown={handleKeydown}
			aria-expanded={isOpen}
			aria-controls="{name}-options"
			aria-label={t('form', label)}
		>
			<span class="text-subtitle block truncate">{buttonText}</span>
			<span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pt-5 pr-2">
				<svg
					class="h-5 w-5 text-gray-400"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						fill-rule="evenodd"
						d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
						clip-rule="evenodd"
					/>
				</svg>
			</span>
		</button>
		<select
			bind:this={selectElement}
			id="{name}-select"
			{name}
			{required}
			bind:value={selected}
			class="absolute h-0 w-full opacity-0"
		>
			<option value="" disabled>{t('form', 'features_0')}</option>
			{#each options as opt}
				<option value={opt.value}>{t('form', opt.label)}</option>
			{/each}
		</select>
	</div>
	{#if isOpen}
		<ul
			id="{name}-options"
			class="ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-[rgb(63,63,63)] py-1 text-base shadow-lg ring-1 focus:outline-none sm:text-sm"
			in:fly={{ y: 10, duration: 200, easing: quintOut }}
			out:fly={{ y: 10, duration: 200, easing: quintOut }}
			role="listbox"
			aria-labelledby="{name}-select"
		>
			{#each options as opt}
				<li
					class="relative cursor-pointer py-2 pr-9 pl-3 text-gray-900 select-none hover:bg-indigo-600 hover:text-white"
					on:click={() => selectOption(opt.value)}
					on:keydown={(e) => handleOptionKeydown(e, opt.value)}
					role="option"
					aria-selected={selected === opt.value}
					tabindex="0"
				>
					<span
						class="text-subtitle block truncate {selected === opt.value
							? 'font-semibold'
							: 'font-normal'}"
					>
						{t('form', opt.label)}
					</span>
					{#if selected === opt.value}
						<span
							class="absolute inset-y-0 right-0 flex items-center pr-4 {selected === opt.value
								? 'text-white'
								: 'text-indigo-600'}"
						>
							<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"
								/>
							</svg>
						</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.absolute.opacity-0 {
		position: absolute;
		opacity: 0;
		width: 100%;
		height: 0;
		pointer-events: none;
	}
</style>
