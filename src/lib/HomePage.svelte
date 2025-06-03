<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { inView } from '$lib/actions/inView'; // Ensure this path is correct for your inView action
	import Icon from '@iconify/svelte'; // For icons in feature cards

	const currentYear = new Date().getFullYear();

	// State variables for section visibility and triggering animations
	let heroVisible = false;
	let featuresVisible = false;
	let demoContentVisible: boolean[] = Array(10).fill(false); // For individual demo sections
	let footerVisible = false;

	// Data for feature cards
	const features = [
		{
			icon: 'ph:rocket-launch-duotone',
			title: 'Blazing Fast',
			description: 'Optimized for speed and performance, ensuring a seamless user experience.'
		},
		{
			icon: 'ph:envelope-simple-duotone',
			title: 'Stay Updated',
			description: 'Subscribe to our mailing list for the latest news and exclusive offers.'
		},
		{
			icon: 'ph:sparkle-duotone',
			title: 'Simple & Clean',
			description: 'A focus on intuitive usability and a sleek, minimalist design.'
		}
	];
</script>

<div class="font-inter min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
	<section
		class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 p-4 text-white"
		use:inView={{ threshold: 0.1 }}
		on:inview={() => (heroVisible = true)}
	>
		{#if heroVisible}
			<div class="z-10 text-center" in:fly={{ y: 50, duration: 1000, easing: quintOut }}>
				<h1 class="mb-4 text-5xl leading-tight font-extrabold drop-shadow-lg md:text-7xl">
					Welcome to Our Awesome Site!
				</h1>
				<p class="mx-auto mb-8 max-w-3xl text-xl opacity-90 md:text-2xl">
					Your one-stop destination for everything you need to know and more.
				</p>
				<a
					href="/mailing-list"
					class="inline-block rounded-full bg-white px-8 py-3 font-bold text-purple-700 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-100"
				>
					Join Our Mailing List!
				</a>
			</div>
		{/if}
		<div class="absolute inset-0 z-0 opacity-10">
			<svg class="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
				<circle cx="10" cy="90" r="15" fill="currentColor" class="text-blue-500"></circle>
				<circle cx="90" cy="10" r="10" fill="currentColor" class="text-purple-500"></circle>
				<rect
					x="30"
					y="70"
					width="25"
					height="25"
					fill="currentColor"
					class="rotate-45 text-blue-400"
				></rect>
				<polygon points="70,30 80,40 60,40" fill="currentColor" class="text-purple-400"></polygon>
			</svg>
		</div>
	</section>

	<section
		class="bg-white px-4 py-20 md:px-8 lg:px-16 dark:bg-gray-800"
		use:inView={{ threshold: 0.2 }}
		on:inview={() => (featuresVisible = true)}
	>
		<div class="container mx-auto text-center">
			<h2 class="mb-4 text-4xl font-bold text-gray-800 dark:text-white">Key Features</h2>
			<p class="mx-auto mb-12 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
				Discover what makes our platform stand out from the rest.
			</p>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each features as feature, i}
					{#if featuresVisible}
						<div
							class="flex flex-col items-center rounded-xl bg-gray-100 p-6 text-center shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg dark:bg-gray-700"
							in:fly={{ y: 50, duration: 700, delay: i * 150, easing: quintOut }}
						>
							<div class="mb-4 text-5xl text-blue-600 dark:text-blue-400">
								<Icon icon={feature.icon} width="50" height="50" />
							</div>
							<h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
								{feature.title}
							</h3>
							<p class="text-gray-600 dark:text-gray-300">{feature.description}</p>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</section>

	<section class="bg-gray-50 px-4 py-20 md:px-8 lg:px-16 dark:bg-gray-900">
		<div class="container mx-auto text-center">
			<h2 class="mb-8 text-4xl font-bold text-gray-800 dark:text-white">
				Scroll Down to See More!
			</h2>
			<p class="mx-auto mb-12 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
				This content is here to demonstrate scroll behavior and animations.
			</p>

			{#each Array(5) as _, i}
				<div
					class="mb-8 rounded-xl bg-white p-8 text-left shadow-md dark:bg-gray-700"
					use:inView={{ threshold: 0.3 }}
					on:inview={() => (demoContentVisible[i] = true)}
				>
					{#if demoContentVisible[i]}
						<div in:fly={{ y: 30, duration: 600, delay: 50, easing: quintOut }}>
							<h3 class="mb-4 text-2xl font-semibold text-blue-600 dark:text-blue-400">
								Demo Section {i + 1}
							</h3>
							<p class="text-gray-700 dark:text-gray-300">
								This is demo content to create scrollable height. Lorem ipsum dolor sit amet,
								consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
								magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
								nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
								voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
								cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
								laborum.
							</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</section>

	<footer
		class="bg-gray-800 p-8 text-white dark:bg-gray-900"
		use:inView={{ threshold: 0.1 }}
		on:inview={() => (footerVisible = true)}
	>
		{#if footerVisible}
			<div
				class="mx-auto flex max-w-6xl flex-col items-center justify-between text-center md:flex-row md:text-left"
				in:fly={{ y: 20, duration: 500, easing: quintOut }}
			>
				<div class="mb-4 md:mb-0">
					<p class="text-sm">&copy; {currentYear} Your Company Name. All rights reserved.</p>
					<p class="text-xs text-gray-400">Made with ❤️ in India.</p>
				</div>

				<nav class="flex flex-wrap justify-center space-x-4">
					<a
						href="/terms"
						class="text-sm text-gray-300 transition-colors hover:text-white hover:underline"
						>Terms and Conditions</a
					>
					<a
						href="/privacy"
						class="text-sm text-gray-300 transition-colors hover:text-white hover:underline"
						>Privacy Policy</a
					>
					<a
						href="/shipping"
						class="text-sm text-gray-300 transition-colors hover:text-white hover:underline"
						>Shipping Policy</a
					>
					<a
						href="/contact"
						class="text-sm text-gray-300 transition-colors hover:text-white hover:underline"
						>Contact Us</a
					>
					<a
						href="/cancellation"
						class="text-sm text-gray-300 transition-colors hover:text-white hover:underline"
						>Cancellation and Refunds</a
					>
				</nav>
			</div>
		{/if}
	</footer>
</div>

<style>
	/* Custom font import (if not using global CSS) */
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');

	.font-inter {
		font-family: 'Inter', sans-serif;
	}

	/* Ensure the body or root element has min-h-screen for full height */
	html,
	body {
		height: 100%;
	}
</style>
