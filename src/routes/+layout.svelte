<script lang="ts">
	import '../app.css';
	import 'lenis/dist/lenis.css';
	import { onMount, onDestroy, setContext } from 'svelte';
	import Lenis from 'lenis';
	import { browser } from '$app/environment';
	import Navbar from '$lib/components/Navbar.svelte';
	import { get } from 'svelte/store';
	import i18n, { initI18n, currentLanguage, i18nContext } from '$lib/i18n';
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import Form from '$lib/components/Form.svelte';
	import gsap from 'gsap';

	interface LayoutData {
		i18n: {
			lng: string;
			resources: Record<string, Record<string, string>>;
		};
	}

	let { data, children }: { data: LayoutData; children: any } = $props();
	let initialized = $state(!browser); // true for SSR so children render

	// i18n Initialization (client only)
	onMount(async () => {
		await initI18n(data.i18n.lng, data.i18n.resources);
		initialized = true;
	});

	// Provide i18n context
	setContext('i18n', {
		...i18nContext,
		changeLanguage: async (lng: string) => {
			await i18n.changeLanguage(lng);
			const url = new URL(get(page).url);
			url.searchParams.set('lang', lng);
			await goto(url.toString(), { replaceState: true, noScroll: true });
			await invalidateAll();
		},
		currentLanguage: currentLanguage
	});

	// Lenis Scroll Setup
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
			function raf(time: DOMHighResTimeStamp) {
				lenisInstance?.raf(time);
				requestAnimationFrame(raf);
			}
			requestAnimationFrame(raf);
		}
	});

	onDestroy(() => {
		lenisInstance?.destroy();
	});

	onMount(() => {
		const heroTl = gsap.timeline({ delay: 0.5 });
		heroTl.fromTo(
			'.cta-button',
			{ opacity: 0, y: 20 },
			{
				opacity: 1,
				y: 0,
				duration: 0.8,
				stagger: 0.2,
				ease: 'back.out(1.7)'
			},
			'-=1.5'
		);
	});
</script>

<svelte:head>
	<!-- Fonts -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<Navbar />

<main class="min-h-screen pt-[64px]">
	<!-- Always render children to ensure metadata is available for SSR -->
	{@render children()}

	{#if initialized}
		<Form />
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
