<script>
	import HomePage from '$lib/HomePage.svelte';

	export let data;
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />

	<!-- Open Graph -->
	<meta property="og:title" content={data.title} />
	<meta property="og:description" content={data.description} />
	<meta property="og:url" content={data.url} />
	<meta property="og:image" content={data.image} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={data.siteName} />
	<link rel="canonical" href={data.url} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content={data.twitterHandle} />
	<meta name="twitter:creator" content={data.twitterHandle} />
	<meta name="twitter:title" content={data.title} />
	<meta name="twitter:description" content={data.description} />
	<meta name="twitter:image" content={data.image} />
</svelte:head>

<HomePage />
