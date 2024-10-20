import { writable } from 'svelte/store';
import { env } from '$env/dynamic/public';
import { browser } from '$app/environment';

const initialApiKey = browser
	? localStorage.livecoinwatchApiKey || env.PUBLIC_LIVECOINWATCH_API_KEY
	: env.PUBLIC_LIVECOINWATCH_API_KEY;

const { subscribe, set } = writable(initialApiKey);

subscribe((value) => {
	if (browser) {
		if (value === undefined) localStorage.removeItem('livecoinwatchApiKey');
		else localStorage.livecoinwatchApiKey = value;
	}
});

export const livecoinwatchApiKey = {
	subscribe,
	set
};
