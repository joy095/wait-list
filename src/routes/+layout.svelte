<script lang="ts">
	import '../app.css';
	import 'lenis/dist/lenis.css';
	import { onMount, onDestroy } from 'svelte';
	import Lenis from 'lenis';
	import { browser } from '$app/environment';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();

	let lenisInstance: Lenis | null = null;

	onMount(() => {
		// Ensure Lenis only runs on the client-side
		if (browser) {
			lenisInstance = new Lenis({
				duration: 1.2,
				easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard easing
				smoothWheel: true,
				wheelMultiplier: 1,
				touchMultiplier: 2,
				syncTouch: false,
				infinite: false,
				autoResize: true
			});

			// Optional: Log scroll events
			lenisInstance.on('scroll', (e: any) => {
				// console.log('Lenis scroll event:', e);
			});

			// Start the RAF loop
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

<!-- Add Navbar -->
<Navbar />

<!-- Main Content with top padding to account for fixed navbar -->
<main class="main-content">
	{@render children()}
</main>

<style>
	.main-content {
		padding-top: 70px; /* Height of navbar */
		min-height: 100vh;
	}

	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
