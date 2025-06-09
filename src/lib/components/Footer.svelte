<script lang="ts">
	import { inView } from '$lib/actions/inView';
	import { quintOut } from 'svelte/easing';
	import { fly, fade } from 'svelte/transition';

	const currentYear = new Date().getFullYear();
	let footerVisible = false;
</script>

<footer
	class="bg-gradient-to-r from-gray-100 to-gray-200 p-8 text-gray-900"
	use:inView={{ threshold: 0.2 }}
	on:inview={() => (footerVisible = true)}
>
	{#if footerVisible}
		<div
			class="mx-auto grid max-w-6xl grid-cols-3 gap-6 text-center md:flex-row md:text-left"
			in:fly={{ y: 30, duration: 600, easing: quintOut }}
		>
			<!-- Copyright and Name (Left) -->
			<div class="flex flex-col items-center md:items-start md:justify-self-start">
				<div class="flex items-center gap-4 text-sm font-semibold">
					<p aria-label="Copyright information">
						© {currentYear} All rights reserved.
					</p>
					<a
						class="btn-text group relative tracking-tight focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						href="https://joykarmakar.vercel.app"
						aria-label="Visit Joy Karmakar's portfolio"
					>
						<div class="name-wrapper">
							<span class="name">joykarmakar</span>
							<span class="name text-yellow-500">joykarmakar</span>
						</div>
					</a>
				</div>
			</div>

			<!-- Social Links (Center) -->
			<div
				class="flex justify-center gap-4 md:justify-self-center"
				in:fade={{ duration: 400, delay: 200 }}
			>
				<!-- <a
					href="https://twitter.com"
					aria-label="Twitter profile"
					class="transition-colors hover:text-yellow-500"
				>
					<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
						<path
							d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"
						/>
					</svg>
				</a> -->
				<a
					href="https://www.linkedin.com/in/joy-karmakar-cooch-behar/"
					aria-label="LinkedIn profile"
					class="transition-colors hover:text-yellow-500"
				>
					<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
						<path
							d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"
						/>
					</svg>
				</a>
			</div>

			<!-- Scroll to Top (Right) -->
			<div class="md:justify-self-end">
				<button
					on:click={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
					aria-label="Scroll to top"
					class="cursor-pointer rounded-full p-2 hover:bg-gray-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					in:fade={{ duration: 400, delay: 400 }}
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 10l7-7m0 0l7 7m-7-7v18"
						/>
					</svg>
				</button>
			</div>
		</div>
	{/if}
</footer>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}

	.btn-text {
		display: inline-block;
		position: relative;
		height: 1.5rem;
		overflow: hidden;
		text-transform: lowercase;
		font-family: 'Inter', system-ui, sans-serif;
	}

	.name-wrapper {
		display: flex;
		flex-direction: column;
	}

	.name {
		display: inline-block;
		transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}

	.group:hover .name,
	.group:focus .name {
		transform: translateY(-100%);
	}

	/* Responsive grid for mobile */
	@media (max-width: 768px) {
		.grid {
			grid-template-columns: 1fr;
			place-items: center;
		}
		.grid > div {
			justify-self: center;
		}
	}
</style>
