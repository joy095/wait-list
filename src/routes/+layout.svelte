<script lang="ts">
	import '../app.css';
	import 'lenis/dist/lenis.css';
	import { onMount, onDestroy, setContext } from 'svelte';
	import Lenis from 'lenis';
	import { browser } from '$app/environment';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { get } from 'svelte/store';
	import i18n, { initI18n, supportedLngs, currentLanguage, i18nContext } from '$lib/i18n';
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation'; // Ensure invalidateAll is imported
	import Form from '$lib/components/Form.svelte';

	interface LayoutData {
		i18n: {
			lng: string;
			resources: Record<string, Record<string, string>>; // Correctly typed for namespaces
		};
	}

	let { data, children }: { data: LayoutData; children: any } = $props();

	let initialized = $state(false);

	onMount(async () => {
		// console.log('--- +layout.svelte onMount START ---');
		// console.log('+layout.svelte: onMount - Initializing i18n with data.i18n.lng:', data.i18n.lng);

		// Pass the pre-loaded resources directly to initI18n
		await initI18n(data.i18n.lng, data.i18n.resources);
		initialized = true;
		// console.log(
		// 	'+layout.svelte: i18n initialized on client, current language:',
		// 	get(i18nContext.currentLanguage)
		// );
		// console.log('--- +layout.svelte onMount END ---');
	});

	setContext('i18n', {
		...i18nContext,
		changeLanguage: async (lng: string) => {
			// console.log('--- +layout.svelte changeLanguage START ---');
			// console.log('+layout.svelte: changeLanguage called for:', lng);

			// 1. Update i18next's internal language and the Svelte store
			await i18n.changeLanguage(lng); // This updates i18n's internal language and the Svelte store
			// console.log('+layout.svelte: i18n language changed to:', i18n.language);

			// 2. Update the URL query parameter
			const url = new URL(get(page).url);
			url.searchParams.set('lang', lng);
			const newUrl = url.toString();
			// console.log('+layout.svelte: Attempting to goto new URL:', newUrl);

			// Use goto to update the URL in the address bar without reloading the page
			// This is crucial for the URL parameter to appear immediately
			await goto(newUrl, { replaceState: true, noScroll: true });
			// console.log('+layout.svelte: goto completed.');

			// 3. Invalidate all data loaders to force a re-render of the current page
			// This will cause +layout.ts (and any +page.ts) load functions to re-run
			// console.log('+layout.svelte: Invalidating all data to force re-render.');
			await invalidateAll();
			// console.log('--- +layout.svelte changeLanguage END ---');
		},
		currentLanguage: currentLanguage // Provide the store itself
	});

	let lenisInstance: Lenis | null = null;

	onMount(() => {
		if (browser) {
			lenisInstance = new Lenis({
				duration: 1.2,
				easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
				smoothWheel: true,
				wheelMultiplier: 1,
				touchMultiplier: 2,
				syncTouch: false,
				infinite: false,
				autoResize: true
			});

			lenisInstance.on('scroll', (e: any) => {
				// console.log('Lenis scroll event:', e);
			});

			function raf(time: DOMHighResTimeStamp) {
				lenisInstance?.raf(time);
				requestAnimationFrame(raf);
			}
			requestAnimationFrame(raf);
		}
	});

	onDestroy(() => {
		if (lenisInstance) {
			lenisInstance.destroy();
		}
	});
</script>

<Navbar />

<main class="min-h-screen pt-[64px]">
	{#if initialized}
		{@render children()}
		<Form />
	{:else}
		<div class="flex min-h-screen items-center justify-center bg-gray-100 text-gray-700">
			Loading translations...
		</div>
	{/if}
</main>

<style global>
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

	body {
		margin: 0;
		padding: 0;
		font-family: 'Inter', sans-serif;
	}
</style>
