import { writable } from 'svelte/store';

// This store will hold the visibility state of the form modal.
// true = show the modal, false = hide it.
export const isFormOpen = writable(false);