<script>
	import HomePage from '$lib/HomePage.svelte';
</script>

<svelte:head>
	<title>Welcome to Our Site!</title>
	<meta name="description" content="Your friendly hub for amazing content and updates." />
</svelte:head>

<HomePage />

<style>
	:global(body) {
		margin: 0;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		background-color: #f8f9fa;
		color: #333;
		line-height: 1.6;
	}
</style>
