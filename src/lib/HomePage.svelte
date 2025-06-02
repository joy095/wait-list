<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	const currentYear = new Date().getFullYear();
</script>

<div class="homepage-container">
	<header class="hero-section" in:fly={{ y: -50, duration: 800, easing: quintOut }}>
		<h1>Welcome to Our Awesome Site!</h1>
		<p>Your one-stop destination for everything you need to know and more.</p>
		<a href="/mailing-list" class="cta-button">Join Our Mailing List!</a>
	</header>

	<section class="features-section">
		<div class="feature-card" in:fly={{ x: -50, duration: 600, delay: 200 }}>
			<h2>🚀 Fast & Modern</h2>
			<p>Built with SvelteKit for a blazing-fast user experience.</p>
		</div>
		<div class="feature-card" in:fly={{ y: 50, duration: 600, delay: 400 }}>
			<h2>📧 Stay Updated</h2>
			<p>Subscribe to our mailing list for the latest news and offers.</p>
		</div>
		<div class="feature-card" in:fly={{ x: 50, duration: 600, delay: 600 }}>
			<h2>✨ Simple & Clean</h2>
			<p>A focus on usability and a sleek design.</p>
		</div>
	</section>

	<!-- Add more content to test scroll behavior -->
	<section class="demo-content">
		<h2>Scroll Down to Test Navbar</h2>
		<p>The navbar will hide when scrolling down and show when scrolling up!</p>

		{#each Array(10) as _, i}
			<div class="demo-section">
				<h3>Demo Section {i + 1}</h3>
				<p>
					This is demo content to create scrollable height. Lorem ipsum dolor sit amet, consectetur
					adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
					enim ad minim veniam, quis nostrud exercitation ullamco laboris.
				</p>
			</div>
		{/each}
	</section>

	<footer class="mt-12 bg-gray-800 p-8 text-white">
		<div
			class="mx-auto flex max-w-6xl flex-col items-center justify-between text-center md:flex-row md:text-left"
		>
			<div class="mb-4 md:mb-0">
				<p class="text-sm">&copy; {currentYear} Your Company Name. All rights reserved.</p>
				<p class="text-xs text-gray-400">Made with ❤️ in India.</p>
			</div>

			<nav class="space-x-4">
				<a href="/terms" class="text-sm text-gray-300 hover:text-white hover:underline"
					>Terms and Conditions</a
				>
				<a href="/privacy" class="text-sm text-gray-300 hover:text-white hover:underline"
					>Privacy Policy</a
				>
				<a href="/shipping" class="text-sm text-gray-300 hover:text-white hover:underline"
					>Shipping Policy</a
				>
				<a href="/contact" class="text-sm text-gray-300 hover:text-white hover:underline"
					>Contact Us</a
				>
				<a href="/cancellation" class="text-sm text-gray-300 hover:text-white hover:underline"
					>Cancellation and Refunds</a
				>
			</nav>
		</div>
	</footer>
</div>

<style>
	.homepage-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		align-items: center;
		text-align: center;
		padding: 20px;
		box-sizing: border-box;
	}

	.hero-section {
		background-color: #007bff;
		color: white;
		padding: 80px 20px;
		width: 100%;
		max-width: 1000px;
		border-radius: 12px;
		margin-bottom: 40px;
		box-shadow: 0 8px 20px rgba(0, 123, 255, 0.2);
	}

	.hero-section h1 {
		font-size: 3.5em;
		margin-bottom: 15px;
		line-height: 1.2;
	}

	.hero-section p {
		font-size: 1.3em;
		margin-bottom: 30px;
		opacity: 0.9;
	}

	.cta-button {
		display: inline-block;
		background-color: #28a745;
		color: white;
		padding: 15px 30px;
		border-radius: 8px;
		text-decoration: none;
		font-size: 1.1em;
		font-weight: bold;
		transition:
			background-color 0.3s ease,
			transform 0.2s ease;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
	}

	.cta-button:hover {
		background-color: #218838;
		transform: translateY(-3px);
	}

	.features-section {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 30px;
		margin-bottom: 60px;
		max-width: 1200px;
	}

	.feature-card {
		background-color: white;
		padding: 30px;
		border-radius: 10px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
		flex: 1;
		min-width: 280px;
		max-width: 350px;
		text-align: center;
		transition: transform 0.3s ease;
	}

	.feature-card:hover {
		transform: translateY(-8px);
	}

	.feature-card h2 {
		font-size: 1.8em;
		margin-bottom: 15px;
		color: #333;
	}

	.feature-card p {
		color: #666;
		line-height: 1.6;
	}

	/* Demo content styles */
	.demo-content {
		max-width: 800px;
		margin: 40px 0;
		padding: 20px;
	}

	.demo-content h2 {
		font-size: 2.5em;
		margin-bottom: 20px;
		color: #333;
	}

	.demo-section {
		background: white;
		padding: 30px;
		margin: 20px 0;
		border-radius: 10px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		text-align: left;
	}

	.demo-section h3 {
		color: #007bff;
		margin-bottom: 15px;
	}

	.demo-section p {
		color: #666;
		line-height: 1.6;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.hero-section h1 {
			font-size: 2.5em;
		}

		.hero-section p {
			font-size: 1.1em;
		}

		.features-section {
			flex-direction: column;
			align-items: center;
		}

		.feature-card {
			max-width: 100%;
		}
	}
</style>
