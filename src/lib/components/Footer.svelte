<script lang="ts">
	import { inView } from '$lib/actions/inView';
	import { quintOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	const currentYear = new Date().getFullYear();

	let footerVisible = false;
</script>

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
			<p class="text-sm">&copy; {currentYear} Your Company Name. All rights reserved.</p>
			<p class="text-xs text-gray-400">Made with ❤️ in India.</p>
		</div>
	{/if}
</footer>
