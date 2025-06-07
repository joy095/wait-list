<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicOut, quintOut } from 'svelte/easing';
	import { enhance } from '$app/forms';
	import { fly, fade, scale } from 'svelte/transition';
	import { onMount, tick } from 'svelte';

	// Import the store (assuming $lib/store.ts exports a writable `isFormOpen`)
	import { isFormOpen } from '$lib/store';

	// Define the shape of your form data
	type FormData = {
		firstName: string;
		lastName: string;
		email: string;
		favoriteColor: string;
		satisfactionLevel: number;
		feedbackNotes: string;
	};

	// Reactive state for the form
	let currentStep = 1;
	const totalSteps = 4; // Total steps in the multi-step form
	let formData: FormData = {
		firstName: '',
		lastName: '',
		email: '',
		favoriteColor: '',
		satisfactionLevel: 5, // Default satisfaction level
		feedbackNotes: ''
	};

	// Tweened progress bar for visual feedback
	const progress = tweened(0, {
		duration: 500,
		easing: quintOut
	});

	// Automatically update progress based on current step
	$: $progress = (currentStep - 1) / (totalSteps - 1);

	// State for form submission and errors
	let submitting = false;
	let formError: string | null = null;
	let showConfirmation = false; // Controls the confirmation modal state
	let formContainer: HTMLElement; // Used to bind to the main form div for potential focus management

	// Determine if the modal (form or confirmation) should be active
	$: isModalActive = $isFormOpen || showConfirmation;

	// --- Form Validation Logic ---
	function validateCurrentStep(): boolean {
		formError = null; // Clear previous errors on each validation attempt
		switch (currentStep) {
			case 1:
				// Validate personal information fields
				if (!formData.firstName || !formData.lastName || !formData.email) {
					formError = 'Please fill in all personal information fields.';
					return false;
				}
				// Basic email format validation
				if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
					formError = 'Please enter a valid email address.';
					return false;
				}
				return true;
			case 2:
				// Validate favorite color selection
				if (!formData.favoriteColor) {
					formError = 'Please select your favorite color.';
					return false;
				}
				return true;
			case 3:
				// No specific validation for satisfaction/feedback on this step,
				// as they might be optional or have default values.
				return true;
			case 4:
				// Final review step validation before actual submission
				// Add any final checks here if needed (e.g., agreeing to terms)
				return true;
			default:
				return true; // Should not happen if currentStep is managed correctly
		}
	}

	// --- Navigation Functions ---
	function nextStep() {
		if (validateCurrentStep() && currentStep < totalSteps) {
			currentStep++;
		}
	}

	function prevStep() {
		formError = null; // Clear error when going back
		if (currentStep > 1) {
			currentStep--;
		}
	}

	// --- Form State Management ---
	function resetFormState() {
		formData = {
			firstName: '',
			lastName: '',
			email: '',
			favoriteColor: '',
			satisfactionLevel: 5,
			feedbackNotes: ''
		};
		currentStep = 1;
		formError = null;
		submitting = false;
	}

	function closeAllModals() {
		isFormOpen.set(false); // Close the form
		showConfirmation = false; // Hide the confirmation
		// Wait for the modal close animation to complete before resetting form data
		setTimeout(() => {
			resetFormState();
		}, 300); // Matches the 'fade' transition duration
	}

	function handleBackdropClick(event: MouseEvent) {
		// Close modal only if the click is directly on the backdrop, not on the modal content itself
		if (event.target === event.currentTarget) {
			closeAllModals();
		}
	}

	// --- SvelteKit Form `enhance` Action ---
	const submitAction = () => {
		// Perform final validation before submission
		if (!validateCurrentStep()) {
			return; // Abort submission if validation fails
		}

		submitting = true; // Set submitting state
		formError = null; // Clear previous errors

		// This function is returned to `use:enhance` and handles the result of the form submission
		return async ({ result, update }) => {
			submitting = false; // Submission finished

			if (result.type === 'success') {
				isFormOpen.set(false); // Hide the form modal
				showConfirmation = true; // Show the thank you message modal
			} else if (result.type === 'failure') {
				// Handle validation errors or other failures from the server
				formError = result.data?.message || 'Submission failed. Please check your inputs.';
			} else if (result.type === 'error') {
				// Handle unexpected server errors
				formError = result.error.message || 'An unexpected server error occurred.';
			}

			// Tells SvelteKit not to reset page focus, allowing us to manage focus manually if needed.
			await update({ reset: false });
		};
	};
</script>

{#if isModalActive}
	<div
		class="backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm transition-all duration-300"
		on:click={handleBackdropClick}
		transition:fade={{ duration: 300 }}
	>
		{#if $isFormOpen}
			<div
				bind:this={formContainer}
				class="form-container relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl"
				in:fly={{ y: 40, duration: 400, easing: quintOut }}
				out:fly={{ y: 40, duration: 300 }}
			>
				<button
					on:click={closeAllModals}
					class="absolute top-4 right-4 z-10 p-2 text-gray-400 transition-colors hover:text-gray-600"
					aria-label="Close form"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				<div class="p-8">
					<h2 class="mb-6 text-center text-3xl font-bold text-gray-800">Get Started</h2>

					<div class="mb-8">
						<div class="h-1.5 overflow-hidden rounded-full bg-gray-100">
							<div
								class="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
								style={`width: ${$progress * 100}%`}
							></div>
						</div>
						<p class="mt-2 text-right text-xs text-gray-500">Step {currentStep} of {totalSteps}</p>
					</div>

					<form method="POST" action="?/submitForm" use:enhance={submitAction}>
						<div class:hidden={currentStep !== 1} class="space-y-4">
							<h3 class="mb-4 text-xl font-semibold text-gray-800">Your Details</h3>
							<div class="mb-4">
								<label for="firstName" class="block text-sm font-medium text-gray-700"
									>First Name</label
								>
								<input
									type="text"
									id="firstName"
									name="firstName"
									bind:value={formData.firstName}
									class="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
									placeholder="John"
								/>
							</div>
							<div class="mb-4">
								<label for="lastName" class="block text-sm font-medium text-gray-700"
									>Last Name</label
								>
								<input
									type="text"
									id="lastName"
									name="lastName"
									bind:value={formData.lastName}
									class="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
									placeholder="Doe"
								/>
							</div>
							<div class="mb-4">
								<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
								<input
									type="email"
									id="email"
									name="email"
									bind:value={formData.email}
									class="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
									placeholder="john.doe@example.com"
								/>
							</div>
						</div>

						<div class:hidden={currentStep !== 2} class="space-y-4">
							<h3 class="mb-4 text-xl font-semibold text-gray-800">Your Preferences</h3>
							<div class="mb-4">
								<label for="favoriteColor" class="block text-sm font-medium text-gray-700"
									>Favorite Color</label
								>
								<select
									id="favoriteColor"
									name="favoriteColor"
									bind:value={formData.favoriteColor}
									class="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
								>
									<option value="">Select a color</option>
									<option value="red">Red</option>
									<option value="blue">Blue</option>
									<option value="green">Green</option>
									<option value="yellow">Yellow</option>
									<option value="other">Other</option>
								</select>
							</div>
						</div>

						<div class:hidden={currentStep !== 3} class="space-y-4">
							<h3 class="mb-4 text-xl font-semibold text-gray-800">Your Feedback</h3>
							<div class="mb-4">
								<label for="satisfactionLevel" class="block text-sm font-medium text-gray-700"
									>Satisfaction Level: {formData.satisfactionLevel}</label
								>
								<input
									type="range"
									id="satisfactionLevel"
									name="satisfactionLevel"
									min="1"
									max="10"
									bind:value={formData.satisfactionLevel}
									class="mt-1 block h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 outline-none"
								/>
							</div>
							<div class="mb-4">
								<label for="feedbackNotes" class="block text-sm font-medium text-gray-700"
									>Feedback Notes (Optional)</label
								>
								<textarea
									id="feedbackNotes"
									name="feedbackNotes"
									rows="4"
									bind:value={formData.feedbackNotes}
									class="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
									placeholder="Any additional comments?"
								></textarea>
							</div>
						</div>

						<div class:hidden={currentStep !== 4} class="space-y-4">
							<h3 class="mb-4 text-xl font-semibold text-gray-800">Review Your Information</h3>
							<div class="space-y-2 text-gray-700">
								<p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
								<p><strong>Email:</strong> {formData.email}</p>
								<p><strong>Favorite Color:</strong> {formData.favoriteColor || 'Not specified'}</p>
								<p><strong>Satisfaction Level:</strong> {formData.satisfactionLevel}</p>
								<p><strong>Feedback Notes:</strong> {formData.feedbackNotes || 'None'}</p>
							</div>
							<p class="mt-6 text-sm text-gray-600">
								Please review your details before submitting. You can go back to make changes.
							</p>
						</div>

						{#if formError}
							<div class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" transition:fade>
								{formError}
							</div>
						{/if}

						<div class="mt-8 flex justify-between border-t border-gray-100 pt-5">
							{#if currentStep > 1}
								<button
									type="button"
									on:click={prevStep}
									class="rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-800 shadow-sm transition-colors duration-200 ease-in-out hover:bg-gray-300"
								>
									Back
								</button>
							{:else}
								<div />
							{/if}

							{#if currentStep < totalSteps}
								<button
									type="button"
									on:click={nextStep}
									class="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-colors duration-200 ease-in-out hover:bg-blue-700"
								>
									Continue
								</button>
							{:else}
								<button
									type="submit"
									class="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white shadow-md transition-colors duration-200 ease-in-out hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
									disabled={submitting}
								>
									{#if submitting}
										Processing...
									{:else}
										Submit
									{/if}
								</button>
							{/if}
						</div>
					</form>
				</div>
			</div>
		{:else if showConfirmation}
			<div
				class="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 text-center shadow-2xl"
				transition:scale={{ duration: 400, easing: quintOut, start: 0.9 }}
			>
				<div
					class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-10 w-10 text-green-600"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>
				<h3 class="mb-3 text-2xl font-bold text-gray-800">Thank You!</h3>
				<p class="mb-6 text-gray-600">
					We've sent a confirmation email to <span class="font-medium text-blue-600"
						>{formData.email}</span
					>. Please check your inbox!
				</p>
				<button
					on:click={closeAllModals}
					class="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-colors duration-200 ease-in-out hover:bg-blue-700"
				>
					Close
				</button>
			</div>
		{/if}
	</div>
{/if}
