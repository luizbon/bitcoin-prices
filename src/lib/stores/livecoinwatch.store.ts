import { writable } from 'svelte/store';
import { PUBLIC_LIVECOINWATCH_API_KEY } from '$env/static/public';
import { browser } from '$app/environment';

const initialApiKey = browser
	? localStorage.livecoinwatchApiKey || PUBLIC_LIVECOINWATCH_API_KEY
	: PUBLIC_LIVECOINWATCH_API_KEY;

const { subscribe, set } = writable(initialApiKey);

subscribe((value) => {
	if (browser) localStorage.livecoinwatchApiKey = value;
});

export const livecoinwatchApiKey = {
	subscribe,
	set
};
