<script lang="ts">
	import Icon from '@iconify/svelte';
	import { quintOut } from 'svelte/easing';
	import { fly, fade } from 'svelte/transition';
	import { inView } from '$lib/actions/inView'; // Adjust path if needed

	const values = [
		{
			icon: 'mage:light-bulb',
			title: 'Innovation',
			description: 'Pushing boundaries and creating new possibilities'
		},
		{
			icon: 'ph:handshake-duotone',
			title: 'Collaboration',
			description: 'Working together to achieve excellence'
		},
		{
			icon: 'healthicons:chart-line',
			title: 'Growth',
			description: 'Continuous improvement and development'
		},
		{
			icon: 'line-md:heart-filled',
			title: 'Passion',
			description: 'Dedication to creating meaningful impact'
		}
	];

	const galleryImages = ['img/1.webp', 'img/2.webp', 'img/4.webp'];

	const banner = 'img/2.webp';

	// State variables to control animations - only set to true when in view, no reset needed
	let storyVisible = false;
	let missionVisible = false;
	let valuesVisible: boolean[] = Array(values.length).fill(false);
	let galleryVisible = false; // New state for the gallery section
</script>

<div
	class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
>
	<div class="relative h-[60vh] bg-[url({banner})] bg-cover bg-center bg-no-repeat">
		<div class="bg-opacity-50 absolute inset-0 flex items-center justify-center">
			<div class="p-8 text-center text-white" in:fly={{ y: -50, duration: 800, easing: quintOut }}>
				<h1 class="mb-4 text-4xl font-bold md:text-6xl">Nature Meets Style</h1>
				<p class="text-xl md:text-2xl">
					Discover the perfect blend of outdoor adventure and fashion
				</p>
			</div>
		</div>
	</div>

	<div
		class="container mx-auto px-4 py-16"
		use:inView={{ threshold: 0.3 }}
		on:inview={() => (storyVisible = true)}
	>
		<div class="grid items-center gap-12 md:grid-cols-2">
			{#if storyVisible}
				<div class="relative" in:fly={{ x: -50, duration: 600, delay: 200 }}>
					<img
						src="img/3.webp"
						alt="Our Team"
						class="rounded-lg shadow-xl transition-shadow duration-300 hover:shadow-2xl"
						loading="lazy"
					/>
				</div>
				<div in:fly={{ x: 50, duration: 600, delay: 400 }}>
					<h2 class="mb-6 text-3xl font-bold text-gray-800 dark:text-white">Our Story</h2>
					<p class="mb-6 text-gray-600 dark:text-gray-300">
						Founded in 2010, we've been at the forefront of digital innovation, creating solutions
						that transform businesses and enrich lives. Our journey began with a simple vision: to
						make technology accessible and impactful for everyone.
					</p>
					<p class="text-gray-600 dark:text-gray-300">
						Today, we're a global team of passionate individuals, working together to push the
						boundaries of what's possible in the digital world.
					</p>
				</div>
			{/if}
		</div>
	</div>

	<div
		class="bg-white py-16 dark:bg-gray-800"
		use:inView={{ threshold: 0.5 }}
		on:inview={() => (missionVisible = true)}
	>
		<div class="container mx-auto px-4 text-center">
			{#if missionVisible}
				<div in:fly={{ y: 50, duration: 800, easing: quintOut }}>
					<h2 class="mb-8 text-4xl font-bold text-gray-800 dark:text-white">Our Mission</h2>
					<p class="mx-auto max-w-3xl text-xl text-gray-600 italic dark:text-gray-300">
						"To empower businesses and individuals through innovative technology solutions while
						maintaining the highest standards of excellence and integrity."
					</p>
				</div>
			{/if}
		</div>
	</div>

	<div class="container mx-auto px-4 py-16">
		<h2 class="mb-12 text-center text-3xl font-bold text-gray-800 dark:text-white">Our Values</h2>
		<div class="grid gap-8 md:grid-cols-4">
			{#each values as value, i}
				<div use:inView={{ threshold: 0.7 }} on:inview={() => (valuesVisible[i] = true)}>
					{#if valuesVisible[i]}
						<div
							class="rounded-lg bg-white p-6 text-center shadow-lg dark:bg-gray-700"
							in:fly={{ x: -20, duration: 600, delay: 100 * i }}
						>
							<div class="mb-4 flex justify-center text-4xl text-blue-600 dark:text-blue-400">
								<Icon icon={value.icon} width="50" height="50" />
							</div>
							<h3 class="mb-2 text-xl font-bold text-gray-800 dark:text-white">
								{value.title}
							</h3>
							<p class="text-gray-600 dark:text-gray-300">{value.description}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<div
		class="container mx-auto px-4 py-16"
		use:inView={{ threshold: 0.2 }}
		on:inview={() => (galleryVisible = true)}
	>
		<h2 class="mb-12 text-center text-3xl font-bold text-gray-800 dark:text-white">
			Life at Our Company
		</h2>
		<div class="grid gap-6 md:grid-cols-3">
			{#each galleryImages as image, index}
				{#if galleryVisible}
					<div
						class="relative overflow-hidden rounded-lg"
						in:fly={{ y: 50, duration: 600, delay: 150 * index, easing: quintOut }}
					>
						<img
							src={image}
							alt={`Gallery Image ${index + 1}`}
							class="h-64 w-full transform object-cover transition-transform duration-300 hover:scale-105"
							loading="lazy"
						/>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</div>
