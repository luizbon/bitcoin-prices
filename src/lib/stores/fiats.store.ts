import { writable } from 'svelte/store';
import { liveCoinWatchApi } from '$lib/sdks/livecoinwatch.api';

export const fiats = writable({});

try {
	const data = await liveCoinWatchApi.getAllFiats(fetch);

	fiats.set(data);
} catch (error) {
	console.error('Failed to fetch fiats', error);
}
