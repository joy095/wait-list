<script lang="ts">
	import { page } from '$app/stores';

	$: status = $page.url.searchParams.get('status');
	$: message = $page.data?.message; // To catch messages from server-side errors
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 p-4"
>
	<div class="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
		{#if status === 'success'}
			<h2 class="mb-4 text-3xl font-extrabold text-green-700">Email Confirmed! 🎉</h2>
			<p class="mb-6 text-lg text-gray-700">
				Thank you for confirming your email. Your subscription is now active.
			</p>
			<a
				href="/"
				class="focus:shadow-outline rounded-lg bg-indigo-600 px-6 py-2 font-bold text-white transition duration-200 hover:bg-indigo-700 focus:outline-none"
			>
				Go to Homepage
			</a>
		{:else if status === 'already_subscribed'}
			<h2 class="mb-4 text-3xl font-extrabold text-blue-700">Already Subscribed!</h2>
			<p class="mb-6 text-lg text-gray-700">
				Your email address has already been confirmed and you're subscribed. Welcome back!
			</p>
			<a
				href="/"
				class="focus:shadow-outline rounded-lg bg-indigo-600 px-6 py-2 font-bold text-white transition duration-200 hover:bg-indigo-700 focus:outline-none"
			>
				Go to Homepage
			</a>
		{:else}
			<h2 class="mb-4 text-3xl font-extrabold text-red-700">Verification Failed 😔</h2>
			<p class="mb-6 text-lg text-gray-700">
				{#if message}
					{message}
				{:else}
					We couldn't verify your email. The link might be invalid, expired, or something else went
					wrong.
				{/if}
			</p>
			<a
				href="/multi-step-form"
				class="focus:shadow-outline rounded-lg bg-gray-600 px-6 py-2 font-bold text-white transition duration-200 hover:bg-gray-700 focus:outline-none"
			>
				Try Signing Up Again
			</a>
		{/if}
	</div>
</div>
