<script>
	import HomePage from '$lib/HomePage.svelte';

	export let data;
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />

	<!-- Open Graph Meta Tags -->
	<meta property="og:title" content={data.title} />
	<meta property="og:description" content={data.description} />
	<meta property="og:url" content={data.url} />
	<meta property="og:image" content={data.image} />
	<meta property="og:image:type" content="image/jpg" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={data.siteName} />
	<link rel="canonical" href={data.url} />

	<!-- Twitter Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content={data.twitterHandle} />
	<meta name="twitter:creator" content={data.twitterHandle} />
	<meta name="twitter:title" content={data.title} />
	<meta name="twitter:description" content={data.description} />
	<meta name="twitter:image" content={data.image} />

	<!-- Fonts -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<HomePage />
