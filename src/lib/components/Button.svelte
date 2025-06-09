<script lang="ts">
	export let type: 'button' | 'reset' | 'submit' = 'button';
	export let disabled = false;
	export let onClick: ((event: MouseEvent) => void) | undefined = undefined;
</script>

<button
	{type}
	{disabled}
	on:click={onClick}
	class="rounded-full bg-purple-600 px-6 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:bg-purple-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
>
	<slot />
</button>
