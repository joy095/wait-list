<script lang="ts">
	import Icon from '@iconify/svelte';
	import { fly, fade } from 'svelte/transition'; // Import fly and fade for Svelte transitions
	import { quintOut } from 'svelte/easing'; // For easing functions
	import { inView } from '$lib/actions/inView'; // Import the inView Svelte action

	// Data for service cards
	const services = [
		{
			icon: 'ph:code-block-duotone',
			title: 'Web Development',
			description:
				'Crafting responsive, high-performance websites and web applications with modern technologies.'
		},
		{
			icon: 'ph:app-window-duotone',
			title: 'Mobile App Development',
			description:
				'Building intuitive and powerful mobile applications for iOS and Android platforms.'
		},
		{
			icon: 'ph:palette-duotone',
			title: 'UI/UX Design',
			description:
				'Designing engaging and user-friendly interfaces that provide exceptional user experiences.'
		},
		{
			icon: 'ph:cloud-arrow-up-duotone',
			title: 'Cloud Solutions',
			description:
				'Implementing scalable and secure cloud infrastructure and services for your business.'
		},
		{
			icon: 'ph:megaphone-duotone',
			title: 'Digital Marketing',
			description:
				'Driving online growth through SEO, social media, content marketing, and paid advertising.'
		},
		{
			icon: 'ph:chart-bar-duotone',
			title: 'Data Analytics',
			description:
				'Transforming raw data into actionable insights to inform strategic business decisions.'
		}
	];

	// State variables to control section visibility and trigger animations
	let heroVisible = false; // For the hero section
	let servicesGridVisible = false; // For the services grid section
	let ctaVisible = false; // For the Call to Action section
</script>

<div class="font-inter min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
	<section
		class="relative flex h-[50vh] items-center justify-center overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-700 text-white"
		use:inView={{ threshold: 0.1 }}
		on:inview={() => (heroVisible = true)}
	>
		{#if heroVisible}
			<div class="p-4 text-center" in:fly={{ y: 50, duration: 1000, easing: quintOut }}>
				<h1 class="mb-4 text-4xl font-extrabold drop-shadow-lg md:text-6xl">Our Services</h1>
				<p class="mx-auto max-w-2xl text-lg md:text-xl">
					Innovating and delivering cutting-edge solutions to empower your business.
				</p>
			</div>
		{/if}
		<div class="absolute inset-0 z-0 opacity-10">
			<svg class="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
				<circle cx="20" cy="80" r="15" fill="currentColor" class="text-purple-500"></circle>
				<circle cx="80" cy="20" r="10" fill="currentColor" class="text-indigo-500"></circle>
				<rect
					x="50"
					y="50"
					width="20"
					height="20"
					fill="currentColor"
					class="rotate-45 text-purple-400"
				></rect>
			</svg>
		</div>
	</section>

	<section
		class="px-4 py-16 md:px-8 lg:px-16"
		use:inView={{ threshold: 0.2 }}
		on:inview={() => (servicesGridVisible = true)}
	>
		<div class="container mx-auto">
			<h2 class="mb-12 text-center text-4xl font-bold text-gray-800 dark:text-white">
				What We Offer
			</h2>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each services as service, i}
					{#if servicesGridVisible}
						<div
							class="flex transform cursor-pointer flex-col items-center rounded-xl bg-white p-8 text-center shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800"
							in:fly={{ y: 100, duration: 800, delay: i * 150, easing: quintOut }}
						>
							<div class="mb-6 text-5xl text-purple-600 dark:text-purple-400">
								<Icon icon={service.icon} width="60" height="60" />
							</div>
							<h3 class="mb-3 text-2xl font-semibold text-gray-800 dark:text-white">
								{service.title}
							</h3>
							<p class="text-gray-600 dark:text-gray-300">{service.description}</p>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</section>

	<section
		class="bg-purple-100 py-16 text-center dark:bg-gray-800"
		use:inView={{ threshold: 0.3 }}
		on:inview={() => (ctaVisible = true)}
	>
		{#if ctaVisible}
			<div class="container mx-auto px-4" in:fly={{ y: 50, duration: 800, easing: quintOut }}>
				<h2 class="mb-6 text-3xl font-bold text-purple-800 md:text-4xl dark:text-purple-200">
					Ready to Start Your Project?
				</h2>
				<p class="mx-auto mb-8 max-w-2xl text-lg text-gray-700 dark:text-gray-300">
					Let's discuss how our expertise can help you achieve your goals.
				</p>
				<a
					href="/contact"
					class="inline-block transform rounded-full bg-purple-600 px-8 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-purple-700"
				>
					Get in Touch
				</a>
			</div>
		{/if}
	</section>
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
