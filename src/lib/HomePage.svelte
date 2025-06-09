<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import Button from './components/Button.svelte';
	import { isFormOpen } from '$lib/store'; // Assuming your store path is correct

	gsap.registerPlugin(ScrollTrigger);

	// Function to open the form by setting the store value to true
	function openSubscribeForm() {
		isFormOpen.set(true);
	}

	onMount(() => {
		// Hero section animation
		gsap.fromTo(
			'.hero',
			{ opacity: 0, y: 50 },
			{ opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
		);

		// General section animations with ScrollTrigger
		gsap.utils.toArray<HTMLElement>('.section').forEach((section) => {
			gsap.fromTo(
				section,
				{ opacity: 0, y: 30 },
				{
					opacity: 1,
					y: 0,
					duration: 1,
					ease: 'power3.out',
					stagger: 0.2,
					scrollTrigger: {
						trigger: section,
						start: 'top 85%', // Start animation when top of section is 85% in viewport
						toggleActions: 'play none none none' // Play animation once
					}
				}
			);
		});

		// Background gradient animation
		gsap.fromTo(
			'.background-gradient',
			{ opacity: 0 },
			{ opacity: 0.3, duration: 2, ease: 'power2.inOut' }
		);
	});
</script>

<div class="bg-background text-text relative min-h-screen overflow-hidden">
	<div class="background-gradient absolute inset-0 bg-gray-50 bg-gradient-to-br"></div>

	<section class="hero relative z-10 flex min-h-screen items-center justify-center px-4">
		<div class="max-w-4xl text-center">
			<h1 class="mb-6 text-4xl font-bold tracking-tight md:text-6xl">Step Into the Future</h1>
			<p class="text-muted mx-auto mb-8 max-w-2xl text-lg md:text-xl">
				Join our exclusive waitlist to experience a platform designed to inspire and innovate.
			</p>
			<Button onClick={openSubscribeForm}>Join the Waitlist</Button>
		</div>
	</section>

	<section class="section px-4 py-16">
		<div class="mx-auto max-w-6xl">
			<h2 class="mb-12 text-center text-3xl font-bold md:text-4xl">Why Choose Us?</h2>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				<div class="bg-card shadow-soft rounded-lg p-6">
					<h3 class="mb-4 text-xl font-semibold">Cutting-Edge Innovation</h3>
					<p class="text-muted">Experience technology that pushes boundaries.</p>
				</div>
				<div class="bg-card shadow-soft rounded-lg p-6">
					<h3 class="mb-4 text-xl font-semibold">Early Access</h3>
					<p class="text-muted">Be the first to explore premium features.</p>
				</div>
				<div class="bg-card shadow-soft rounded-lg p-6">
					<h3 class="mb-4 text-xl font-semibold">Vibrant Community</h3>
					<p class="text-muted">Connect with innovators like you.</p>
				</div>
			</div>
			<div class="mt-12 text-center">
				<Button onClick={openSubscribeForm}>Get Started</Button>
			</div>
		</div>
	</section>

	<section class="section bg-background/50 px-4 py-16">
		<div class="mx-auto max-w-6xl">
			<h2 class="mb-12 text-center text-3xl font-bold md:text-4xl">How It Works</h2>
			<div class="mx-auto max-w-2xl space-y-8">
				<div class="flex items-start gap-4">
					<span class="text-2xl font-bold text-purple-600">01</span>
					<div>
						<h3 class="text-xl font-semibold">Sign Up</h3>
						<p class="text-muted">Join the waitlist with your email.</p>
					</div>
				</div>
				<div class="flex items-start gap-4">
					<span class="text-2xl font-bold text-purple-600">02</span>
					<div>
						<h3 class="text-xl font-semibold">Stay Updated</h3>
						<p class="text-muted">Receive exclusive launch updates.</p>
					</div>
				</div>
				<div class="flex items-start gap-4">
					<span class="text-2xl font-bold text-purple-600">03</span>
					<div>
						<h3 class="text-xl font-semibold">Launch & Explore</h3>
						<p class="text-muted">Dive into our platform first.</p>
					</div>
				</div>
			</div>
			<div class="mt-12 text-center">
				<Button onClick={openSubscribeForm}>Join Today</Button>
			</div>
		</div>
	</section>

	<section class="section px-4 py-16">
		<div class="mx-auto max-w-6xl">
			<h2 class="mb-12 text-center text-3xl font-bold md:text-4xl">What Our Community Says</h2>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div class="bg-card shadow-soft rounded-lg p-6">
					<p class="text-muted mb-4 italic">
						"This platform is a game-changer. Excited to be part of it!"
					</p>
					<p class="text-text font-semibold">— Jamie, Innovator</p>
				</div>
				<div class="bg-card shadow-soft rounded-lg p-6">
					<p class="text-muted mb-4 italic">"The future looks bright with this technology."</p>
					<p class="text-text font-semibold">— Taylor, Developer</p>
				</div>
			</div>
			<div class="mt-12 text-center">
				<Button onClick={openSubscribeForm}>Join Our Community</Button>
			</div>
		</div>
	</section>

	<section class="section bg-background/50 px-4 py-16">
		<div class="mx-auto max-w-6xl">
			<h2 class="mb-12 text-center text-3xl font-bold md:text-4xl">Frequently Asked Questions</h2>
			<div class="mx-auto max-w-2xl space-y-6">
				<div>
					<h3 class="mb-2 text-xl font-semibold">When is the launch?</h3>
					<p class="text-muted">We’re targeting Q2 2025. Join the waitlist for updates!</p>
				</div>
				<div>
					<h3 class="mb-2 text-xl font-semibold">Is it free to join?</h3>
					<p class="text-muted">Yes, the waitlist is free. Pricing details will come later.</p>
				</div>
			</div>
			<div class="mt-12 text-center">
				<Button onClick={openSubscribeForm}>Have More Questions?</Button>
			</div>
		</div>
	</section>

	<section id="waitlist-form" class="section hidden px-4 py-16">
		<div class="mx-auto max-w-md text-center">
			<h2 class="mb-6 text-3xl font-bold md:text-4xl">Join the Waitlist</h2>
			<p class="text-muted mb-8">Secure your spot with your email.</p>
			<form class="flex flex-col gap-4 sm:flex-row">
				<input
					type="email"
					placeholder="Enter your email"
					class="bg-card text-text flex-1 rounded-full border border-gray-200 px-4 py-3 shadow-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
					required
				/>
				<Button type="submit">Submit</Button>
			</form>
		</div>
	</section>
</div>
