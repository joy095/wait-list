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
	import { browser } from '$app/environment';

	const pageTitle = 'Wait list';

	function openSubscribeForm() {
		isFormOpen.set(true);
	}

	$: baseUrl = browser
		? `${window.location.protocol}//${window.location.host}`
		: 'https://yourdomain.com'; // Fallback for SSR

	// --- Social Sharing Links ---
	$: shareUrl = browser ? encodeURIComponent(baseUrl) : '';
	$: shareText = encodeURIComponent(pageTitle);
	$: socialLinks = {
		whatsapp: `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`,
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
		x: `https://x.com/intent/tweet?url=${shareUrl}&text=${shareText}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`
	};

	function copyToClipboard() {
		if (browser) {
			navigator.clipboard.writeText(baseUrl).then(() => {
				showCopyNotification = true;
				setTimeout(() => {
					showCopyNotification = false;
				}, 2000);
			});
		}
	}

	gsap.registerPlugin(TextPlugin, ScrollTrigger);

	// Three.js setup
	let canvas: HTMLCanvasElement;
	let isLoading = true;
	let errorMessage = '';
	let showCopyNotification = false;

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
					text: 'Premium Booking for Barbers & Makeup Artists',
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
				Elevate your business with our exclusive booking platform, crafted for barbers and makeup
				artists. Seamless scheduling, premium features, and unmatched elegance.
			</p>
			<div class="mb-12 flex flex-col justify-center gap-4 sm:flex-row md:mb-16">
				<button on:click={openSubscribeForm} class="cta-button cta-button-primary">
					Join The Waitlist
				</button>
				<a href="#features" class="cta-button cta-button-secondary"> Explore Features </a>
			</div>
			<div class="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
				<div class="feature-card-hero glass-card p-6">
					<h3 class="mb-2 text-lg font-semibold">Scheduling</h3>
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
						src="/img/standing.webp"
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
					<button on:click={openSubscribeForm} class="cta-button-primary w-full sm:w-auto"
						>Join Waitlist</button
					>
				</div>
				<div class="mt-10 border-t border-gray-700/50 pt-8">
					<h4 class="mb-4 text-lg font-semibold text-gray-300">Share with your network</h4>
					<div class="flex items-center justify-center gap-4">
						<a
							href={socialLinks.x}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Share on X"
							class="share-button"
							><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 16 16"
								><path
									d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.6.75Zm-1.7 12.95h1.949L4.162 2.16h-2.15l8.352 11.54Z"
								/></svg
							></a
						>
						<a
							href={socialLinks.facebook}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Share on Facebook"
							class="share-button"
							><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 16 16"
								><path
									d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"
								/></svg
							></a
						>
						<a
							href={socialLinks.linkedin}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Share on LinkedIn"
							class="share-button"
							><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 16 16"
								><path
									d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"
								/></svg
							></a
						>
						<a
							href={socialLinks.whatsapp}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Share on WhatsApp"
							class="share-button"
							><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 16 16"
								><path
									d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"
								/></svg
							></a
						>
						<button on:click={copyToClipboard} aria-label="Copy link" class="share-button"
							><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
								></path></svg
							></button
						>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Footer Section -->
	<Footer />

	<!-- Copy Notification -->
	<div class="copy-notification" class:visible={showCopyNotification}>Copied!</div>
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

	.share-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		color: #e5e7eb;
		transition: all 0.3s ease;
	}
	.share-button:hover {
		background: rgba(255, 255, 255, 0.2);
		color: #fff;
		transform: translateY(-2px);
	}

	.copy-notification {
		position: fixed;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		background-color: #22c55e;
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		z-index: 100;
		opacity: 0;
		transition:
			opacity 0.3s ease-in-out,
			transform 0.3s ease-in-out;
		pointer-events: none;
	}
	.copy-notification.visible {
		opacity: 1;
		transform: translateX(-50%) translateY(-10px);
	}
</style>
