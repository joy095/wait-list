<script lang="ts">
  import { page } from '$app/stores';

  $: status = $page.url.searchParams.get('status');
  $: message = $page.data?.message; // To catch messages from server-side errors
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4">
  <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
    {#if status === 'success'}
      <h2 class="text-3xl font-extrabold text-green-700 mb-4">Email Confirmed! 🎉</h2>
      <p class="text-gray-700 text-lg mb-6">Thank you for confirming your email. Your subscription is now active.</p>
      <a href="/" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-200">
        Go to Homepage
      </a>
    {:else if status === 'already_subscribed'}
      <h2 class="text-3xl font-extrabold text-blue-700 mb-4">Already Subscribed!</h2>
      <p class="text-gray-700 text-lg mb-6">Your email address has already been confirmed and you're subscribed. Welcome back!</p>
      <a href="/" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-200">
        Go to Homepage
      </a>
    {:else}
      <h2 class="text-3xl font-extrabold text-red-700 mb-4">Verification Failed 😔</h2>
      <p class="text-gray-700 text-lg mb-6">
        {#if message}
          {message}
        {:else}
          We couldn't verify your email. The link might be invalid, expired, or something else went wrong.
        {/if}
      </p>
      <a href="/multi-step-form" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-200">
        Try Signing Up Again
      </a>
    {/if}
  </div>
</div>