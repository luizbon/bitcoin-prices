import { writable } from 'svelte/store';
import { liveCoinWatchApi } from '$lib/sdks/livecoinwatch.api';

const store = writable({});

const refresh = async () => {
	try {
		const data = await liveCoinWatchApi.getAllFiats(fetch);

		store.set(data);
	} catch (error) {
		store.set({});
		console.error('Failed to fetch fiats', error);
	}
};

export const fiats = {
	subscribe: store.subscribe,
	refresh
};

await refresh();
