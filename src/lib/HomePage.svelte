<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { TextPlugin } from 'gsap/TextPlugin';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import * as THREE from 'three';
	import { GLTFLoader } from 'three-stdlib';
	import { OrbitControls } from 'three-stdlib';
	import Footer from './components/Footer.svelte';
	import FaqItem from './components/FAQItem.svelte';
	import { isFormOpen } from '$lib/store';

	function openSubscribeForm() {
		isFormOpen.set(true);
	}

	gsap.registerPlugin(TextPlugin, ScrollTrigger);

	// Three.js setup
	let canvas: HTMLCanvasElement;
	let isLoading = true;
	let errorMessage = '';

	onMount(() => {
		// --- GSAP Animations ---
		// Hero Animations
		const heroTl = gsap.timeline({ delay: 0.5 });
		heroTl
			.fromTo(
				'.hero-content',
				{ opacity: 0, y: 50 },
				{ opacity: 1, y: 0, duration: 1.2, ease: 'power4.out' }
			)
			.to(
				'.hero-title-text',
				{
					duration: 2.5,
					text: 'Premium Booking for Elite Barbers & Makeup Artists',
					ease: 'power1.inOut'
				},
				'-=0.8'
			)
			.fromTo(
				'.cta-button',
				{ opacity: 0, y: 20 },
				{
					opacity: 1,
					y: 0,
					duration: 0.8,
					stagger: 0.2,
					ease: 'back.out(1.7)'
				},
				'-=1.5'
			)
			.fromTo(
				'.feature-card-hero', // Target hero cards specifically
				{ opacity: 0, y: 30, scale: 0.95 },
				{
					opacity: 1,
					y: 0,
					scale: 1,
					duration: 0.7,
					stagger: 0.15,
					ease: 'power3.out'
				},
				'-=1.2'
			);

		// Scroll-triggered Animations for subsequent sections
		const sections = [
			'.premium-features-section',
			'.premium-benefits-section',
			'.faq-section',
			'.waitlist-cta-section'
		];
		sections.forEach((section) => {
			const cards = section === '.faq-section' ? '.faq-item' : '.animate-card';
			gsap.fromTo(
				`${section} ${cards}`,
				{ opacity: 0, y: 50 },
				{
					opacity: 1,
					y: 0,
					duration: 0.8,
					stagger: 0.15,
					ease: 'power3.out',
					scrollTrigger: {
						trigger: section,
						start: 'top 80%',
						toggleActions: 'play none none none'
					}
				}
			);
			gsap.fromTo(
				`${section} .section-title, ${section} .section-subtitle`,
				{ opacity: 0, y: 40 },
				{
					opacity: 1,
					y: 0,
					duration: 1,
					stagger: 0.2,
					ease: 'power3.out',
					scrollTrigger: {
						trigger: section,
						start: 'top 85%',
						toggleActions: 'play none none none'
					}
				}
			);
		});

		// --- Three.js Scene ---
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableZoom = false;
		controls.enablePan = false;
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.autoRotate = true;
		controls.autoRotateSpeed = 0.5;

		const loader = new GLTFLoader();
		let model: THREE.Group | null = null;
		loader.load(
			'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
			(gltf) => {
				model = gltf.scene;
				model.scale.set(2.5, 2.5, 2.5);
				model.position.set(0, -0.5, 0);
				scene.add(model);
				isLoading = false;
				gsap.from(model.scale, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power3.out' });
			},
			undefined,
			(error) => {
				console.error('Failed to load model:', error);
				errorMessage = '3D model unavailable. Displaying fallback.';
				isLoading = false;
				const geometry = new THREE.IcosahedronGeometry(1, 0);
				const material = new THREE.MeshStandardMaterial({
					color: 0xd4af37,
					metalness: 0.8,
					roughness: 0.3
				});
				model = new THREE.Mesh(geometry, material);
				scene.add(model);
			}
		);

		// --- Premium Lighting ---
		scene.add(new THREE.AmbientLight(0xffffff, 0.3));
		const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
		hemisphereLight.position.set(0, 20, 0);
		scene.add(hemisphereLight);
		const directionalLight = new THREE.DirectionalLight(0xffd57e, 1.5);
		directionalLight.position.set(8, 10, 5);
		directionalLight.castShadow = true;
		scene.add(directionalLight);
		const pointLight = new THREE.PointLight(0x8e44ad, 2, 100);
		pointLight.position.set(-5, -5, 5);
		scene.add(pointLight);
		camera.position.z = 5;

		const particleCount = 5000;
		const particlesGeometry = new THREE.BufferGeometry();
		const positions = new Float32Array(particleCount * 3);
		for (let i = 0; i < particleCount * 3; i++) {
			positions[i] = (Math.random() - 0.5) * 20;
		}
		particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		const particleMaterial = new THREE.PointsMaterial({
			color: 0xaaaaaa,
			size: 0.015,
			transparent: true,
			opacity: 0.4,
			blending: THREE.AdditiveBlending
		});
		const particles = new THREE.Points(particlesGeometry, particleMaterial);
		scene.add(particles);

		const clock = new THREE.Clock();
		function animate() {
			const elapsedTime = clock.getElapsedTime();
			particles.rotation.y = elapsedTime * 0.05;
			requestAnimationFrame(animate);
			controls.update();
			renderer.render(scene, camera);
		}
		animate();

		function onWindowResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		}
		window.addEventListener('resize', onWindowResize);

		function onMouseMove(event: MouseEvent) {
			if (model) {
				const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
				const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
				gsap.to(camera.position, {
					x: mouseX * 0.5,
					y: -mouseY * 0.5 + camera.position.y,
					duration: 1,
					ease: 'power2.out'
				});
				camera.lookAt(scene.position);
			}
		}
		window.addEventListener('mousemove', onMouseMove);

		return () => {
			window.removeEventListener('resize', onWindowResize);
			window.removeEventListener('mousemove', onMouseMove);
			ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
			renderer.dispose();
		};
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="main-container font-['Inter']">
	<canvas id="three-canvas" bind:this={canvas} />

	<!-- Hero Section -->
	<section
		class="hero-section content-section flex h-screen min-h-[700px] w-full items-center justify-center overflow-hidden"
	>
		<div class="hero-content z-10 container mx-auto max-w-5xl px-6 text-center">
			{#if isLoading}
				<div class="spinner mb-4" />
				<p>Loading Premium Experience...</p>
			{:else if errorMessage}
				<p class="mb-4 text-red-400">{errorMessage}</p>
			{/if}
			<h1 class="section-title mb-4 text-4xl md:text-6xl lg:text-7xl">
				<span class="hero-title-text" />
			</h1>
			<p class="section-subtitle">
				Elevate your business with our exclusive booking platform, crafted for elite barbers and
				makeup artists. Seamless scheduling, premium features, and unmatched elegance.
			</p>
			<div class="mb-12 flex flex-col justify-center gap-4 sm:flex-row md:mb-16">
				<button on:click={openSubscribeForm} class="cta-button cta-button-primary">
					Join The Waitlist
				</button>
				<a href="#features" class="cta-button cta-button-secondary"> Explore Features </a>
			</div>
			<div class="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
				<div class="feature-card-hero glass-card p-6">
					<h3 class="mb-2 text-lg font-semibold">Elite Scheduling</h3>
					<p class="text-sm">Instant booking for high-end clientele.</p>
				</div>
				<div class="feature-card-hero glass-card p-6">
					<h3 class="mb-2 text-lg font-semibold">VIP Notifications</h3>
					<p class="text-sm">Personalized, flawless reminders.</p>
				</div>
				<div class="feature-card-hero glass-card p-6">
					<h3 class="mb-2 text-lg font-semibold">Branded Profiles</h3>
					<p class="text-sm">Custom, luxurious pages for your art.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Premium Features Section -->
	<section id="features" class="premium-features-section content-section py-20 md:py-32">
		<div class="container mx-auto max-w-6xl px-6 text-center">
			<h2 class="section-title mb-4 text-4xl md:text-5xl">Experience The Difference</h2>
			<p class="section-subtitle">
				Our platform is more than a tool—it's a partner in your success, designed with the
				discerning professional in mind.
			</p>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				<div class="animate-card glass-card p-8 text-left">
					<h3 class="mb-2 text-xl font-semibold">Advanced Calendar Sync</h3>
					<p class="text-sm">Two-way sync with Google, Outlook, and iCal.</p>
				</div>
				<div class="animate-card glass-card p-8 text-left">
					<h3 class="mb-2 text-xl font-semibold">Secure Online Payments</h3>
					<p class="text-sm">Accept deposits or full payments with Stripe.</p>
				</div>
				<div class="animate-card glass-card p-8 text-left">
					<h3 class="mb-2 text-xl font-semibold">Client Database & Notes</h3>
					<p class="text-sm">Keep detailed records of client preferences.</p>
				</div>
				<div class="animate-card glass-card p-8 text-left">
					<h3 class="mb-2 text-xl font-semibold">Insightful Analytics</h3>
					<p class="text-sm">Track revenue, retention, and popular services.</p>
				</div>
				<div class="animate-card glass-card p-8 text-left">
					<h3 class="mb-2 text-xl font-semibold">Custom Automations</h3>
					<p class="text-sm">Tailor SMS & Email reminders to your brand.</p>
				</div>
				<div class="animate-card glass-card p-8 text-left">
					<h3 class="mb-2 text-xl font-semibold">Portfolio Galleries</h3>
					<p class="text-sm">Showcase your best work with HD galleries.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Premium Benefits Section -->
	<section class="premium-benefits-section content-section overflow-hidden py-20 md:py-32">
		<div class="container mx-auto max-w-6xl px-6">
			<div class="grid grid-cols-1 items-center gap-12 md:grid-cols-2 lg:gap-20">
				<div class="animate-card text-left">
					<h2 class="section-title mb-6 text-4xl md:text-5xl">Unlock Your Potential</h2>
					<p class="section-subtitle !mx-0 !mb-8 !text-left">
						Focus on your craft while we handle the complexities of your business. Our platform is
						built to elevate your brand and maximize your income.
					</p>
					<div class="space-y-4">
						<div class="flex items-start gap-3">
							<svg
								class="mt-1 h-6 w-6 flex-shrink-0 text-yellow-400"
								fill="currentColor"
								viewBox="0 0 20 20"
								><path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								></path></svg
							>
							<p class="benefit-item">
								<strong>Increase Bookings:</strong> Attract more high-value clients with a professional,
								easy-to-use online presence.
							</p>
						</div>
						<div class="flex items-start gap-3">
							<svg
								class="mt-1 h-6 w-6 flex-shrink-0 text-yellow-400"
								fill="currentColor"
								viewBox="0 0 20 20"
								><path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								></path></svg
							>
							<p class="benefit-item">
								<strong>Save Time:</strong> Automate scheduling, reminders, and payments to free up hours
								every week.
							</p>
						</div>
						<div class="flex items-start gap-3">
							<svg
								class="mt-1 h-6 w-6 flex-shrink-0 text-yellow-400"
								fill="currentColor"
								viewBox="0 0 20 20"
								><path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								></path></svg
							>
							<p class="benefit-item">
								<strong>Elevate Your Brand:</strong> Present a polished, high-end image that matches
								the quality of your services.
							</p>
						</div>
					</div>
				</div>
				<div class="animate-card">
					<img
						src="https://placehold.co/600x700/1a1a1a/ffd700?text=Your+Brand"
						alt="Premium salon setup"
						class="h-auto w-full rounded-2xl object-cover shadow-2xl"
					/>
				</div>
			</div>
		</div>
	</section>

	<!-- FAQ Section -->

	<FaqItem />

	<!-- Waitlist CTA Section -->
	<section id="waitlist" class="waitlist-cta-section content-section py-20 md:py-32">
		<div class="container mx-auto max-w-4xl px-6 text-center">
			<div class="animate-card glass-card p-8 md:p-12 lg:p-16">
				<h2 class="section-title mb-4 text-4xl md:text-5xl">
					Be The First To Experience Excellence
				</h2>
				<p class="section-subtitle">
					Join our exclusive waitlist to secure your spot. Be among the first to gain access and
					receive a special founding member discount for life.
				</p>

				<div class="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<button on:click={openSubscribeForm} class="cta-button-primary w-full sm:w-auto">
						Join Waitlist
					</button>
				</div>
			</div>
		</div>
	</section>

	<!-- Footer Section -->
	<Footer />
</div>

<style>
	.main-container {
		background: #111111;
		background-image: radial-gradient(circle at 50% 50%, #2c2c2c, #111111);
		color: #e5e7eb;
		position: relative;
	}
	.main-container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiGAAAAA1BMVEX///+nxBvIAAAAIElEQVR42mP4z8BQz8DMIADG/38MjP4zMDDwBwA7gQEl9QWmkAAAAABJRU5ErkJggg==');
		opacity: 0.05;
		pointer-events: none;
		z-index: 1;
	}
	#three-canvas {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		z-index: 2;
	}
	.content-section {
		position: relative;
		z-index: 3;
	}
	.section-title {
		font-family: 'Playfair Display', serif;
		background: linear-gradient(135deg, #ffd700, #f0c24a, #e6ac00);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		font-weight: 700;
	}
	.section-subtitle {
		color: #d1d5db;
		max-width: 650px;
		margin: 1rem auto 2.5rem;
		font-size: 1.125rem;
		line-height: 1.75;
	}
	.glass-card {
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 1rem;
		transition:
			background 0.3s ease,
			transform 0.3s ease;
	}
	.glass-card:hover {
		background: rgba(255, 255, 255, 0.1);
		transform: translateY(-8px);
	}
	.glass-card h3 {
		color: #ffd700;
	}
	.glass-card p,
	.benefit-item,
	.faq-answer {
		color: #d1d5db;
	}
	.cta-button-primary {
		background: linear-gradient(135deg, #ffd700, #e6ac00);
		color: #111111;
		font-weight: 600;
		border-radius: 0.5rem;
		padding: 1rem 2rem;
		transition: all 0.3s ease;
		box-shadow: 0 4px 20px rgba(255, 215, 0, 0.2);
	}
	.cta-button-primary:hover {
		transform: scale(1.05);
		box-shadow: 0 6px 25px rgba(255, 215, 0, 0.3);
	}
	.cta-button-secondary {
		background: transparent;
		color: #e5e7eb;
		font-weight: 500;
		border-radius: 0.5rem;
		padding: 1rem 2rem;
		border: 1px solid #e5e7eb;
		transition: all 0.3s ease;
	}
	.cta-button-secondary:hover {
		background: #e5e7eb;
		color: #111111;
		transform: scale(1.05);
	}
	.spinner {
		border: 4px solid rgba(255, 255, 255, 0.2);
		border-left-color: #ffd700;
		border-radius: 50%;
		width: 50px;
		height: 50px;
		animation: spin 1s linear infinite;
		margin: 0 auto;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
